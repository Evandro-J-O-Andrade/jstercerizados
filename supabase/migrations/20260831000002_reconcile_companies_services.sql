-- =============================================================================
-- RECONCILIATION: Companies + Services + Operations
-- Date: 2026-08-31
-- Purpose: Reconcile existing schema with canonical model WITHOUT destroying data
-- =============================================================================
-- SAFETY: Fully idempotent. Uses IF NOT EXISTS everywhere.
-- PRESERVES: All existing data in companies, jobs, applications, etc.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COMPANIES — Add missing canonical columns
-- -----------------------------------------------------------------------------

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS short_description VARCHAR(280),
  ADD COLUMN IF NOT EXISTS company_segment VARCHAR(100);

-- -----------------------------------------------------------------------------
-- 2. COMPANIES — Reconcile document → cnpj
-- -----------------------------------------------------------------------------
-- Only copies when cnpj IS NULL AND document looks like a CNPJ (14 digits)
-- Preserves document column for backward compatibility

UPDATE public.companies
SET cnpj = REGEXP_REPLACE(document, '[^0-9]', '', 'g')
WHERE cnpj IS NULL
  AND document IS NOT NULL
  AND REGEXP_REPLACE(document, '[^0-9]', '', 'g') ~ '^\d{14}$';

-- Set cnpj_root from cnpj where cnpj_root is NULL
UPDATE public.companies
SET cnpj_left = LEFT(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g'), 8)
WHERE cnpj_root IS NULL
  AND cnpj IS NOT NULL
  AND REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g') ~ '^\d{14}$';

-- -----------------------------------------------------------------------------
-- 3. COMPANIES — CNPJ validation constraint
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_cnpj_format_check'
  ) THEN
    ALTER TABLE public.companies
      ADD CONSTRAINT companies_cnpj_format_check
      CHECK (cnpj IS NULL OR REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g') ~ '^\d{14}$');
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. COMPANIES — Indexes for new columns
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_companies_cnpj
  ON public.companies (cnpj)
  WHERE cnpj IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_website
  ON public.companies (website)
  WHERE website IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 5. SERVICES — Institutional catalog (what J&S offers)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.services (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Content
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL,
  category             TEXT,
  short_description    VARCHAR(280),
  description          TEXT,

  -- Media
  card_image_url       TEXT,
  hero_image_url       TEXT,
  hero_title           TEXT,
  hero_subtitle        TEXT,

  -- Details
  icon                 TEXT,
  benefits             JSONB NOT NULL DEFAULT '[]'::jsonb,
  process_steps        JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- CTA
  cta_title            TEXT,
  cta_description      TEXT,
  cta_button_text      TEXT,
  cta_button_url       TEXT,

  -- SEO
  seo_title            VARCHAR(70),
  seo_description      VARCHAR(160),
  seo_keywords         TEXT[],

  -- Publishing
  status               TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'published', 'archived')),
  published_at         TIMESTAMPTZ,
  display_order        INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by           UUID REFERENCES public.people(id),

  CONSTRAINT uq_services_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON public.services (tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services (status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services (display_order);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services (category) WHERE category IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 6. SERVICES — RLS
-- -----------------------------------------------------------------------------

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS services_public_read ON public.services;
CREATE POLICY services_public_read
  ON public.services
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS services_member_read ON public.services;
CREATE POLICY services_member_read
  ON public.services
  FOR SELECT
  USING (is_tenant_member(tenant_id));

DROP POLICY IF EXISTS services_member_write ON public.services;
CREATE POLICY services_member_write
  ON public.services
  FOR ALL
  USING (
    is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.role_permissions rp ON rp.role_id = ra.role_id
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE ra.person_id = public.current_person_id()
        AND p.code IN ('services.create', 'services.update', 'services.delete')
    )
  );

-- -----------------------------------------------------------------------------
-- 7. SERVICES — updated_at trigger
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 8. COMPANY_SERVICES — Link services to companies (with canonical FK)
-- -----------------------------------------------------------------------------

ALTER TABLE public.company_services
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_company_services_service_id
  ON public.company_services (service_id)
  WHERE service_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 9. SERVICE_ORDERS — Operational orders
-- -----------------------------------------------------------------------------

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS company_relationship_id UUID REFERENCES public.company_relationships(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_service_orders_company_relationship_id
  ON public.service_orders (company_relationship_id)
  WHERE company_relationship_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 10. RECRUITMENT_DEMANDS — Service link
-- -----------------------------------------------------------------------------

ALTER TABLE public.recruitment_demands
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) NOT NULL DEFAULT 'normal'
                       CHECK (urgency IN ('low', 'normal', 'high', 'critical'));

CREATE INDEX IF NOT EXISTS idx_recruitment_demands_service_id
  ON public.recruitment_demands (service_id)
  WHERE service_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 11. STORAGE — Buckets for company logos and service images
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('company-logos', 'company-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-logos bucket
DROP POLICY IF EXISTS company_logos_public_read ON storage.objects;
CREATE POLICY company_logos_public_read
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS company_logos_authenticated_insert ON storage.objects;
CREATE POLICY company_logos_authenticated_insert
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS company_logos_authenticated_update ON storage.objects;
CREATE POLICY company_logos_authenticated_update
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'company-logos'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS company_logos_authenticated_delete ON storage.objects;
CREATE POLICY company_logos_authenticated_delete
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'company-logos'
    AND auth.role() = 'authenticated'
  );

-- Storage policies for service-images bucket
DROP POLICY IF EXISTS service_images_public_read ON storage.objects;
CREATE POLICY service_images_public_read
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'service-images');

DROP POLICY IF EXISTS service_images_authenticated_insert ON storage.objects;
CREATE POLICY service_images_authenticated_insert
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'service-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS service_images_authenticated_update ON storage.objects;
CREATE POLICY service_images_authenticated_update
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'service-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS service_images_authenticated_delete ON storage.objects;
CREATE POLICY service_images_authenticated_delete
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'service-images'
    AND auth.role() = 'authenticated'
  );
