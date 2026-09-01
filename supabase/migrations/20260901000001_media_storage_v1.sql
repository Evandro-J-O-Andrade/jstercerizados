-- =============================================================================
-- MEDIA / STORAGE v1 — Canonical Baseline
-- =============================================================================
-- Date: 2026-09-01
-- Purpose: Centralized media catalog and storage architecture
-- =============================================================================
-- Replaces: service-images, company-logos (legacy buckets)
-- Introduces: media_assets table + public-media, avatars, private-documents buckets
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. HELPER: current_person_id()
-- -----------------------------------------------------------------------------
-- Returns the current person's UUID from app context or auth.uid() join.
-- Required by RLS policies below. Matches pattern in specs/sql/21_functions_triggers.sql.

CREATE OR REPLACE FUNCTION public.current_person_id()
RETURNS uuid
LANGUAGE sql
AS $$
  SELECT coalesce(
    current_setting('app.current_person_id', true)::uuid,
    (select p.id from public.people p where p.auth_user_id = auth.uid())
  )
$$;

-- -----------------------------------------------------------------------------
-- 1. MEDIA_ASSETS — Central media catalog
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.media_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Storage reference
  bucket_id       TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  file_url        TEXT NOT NULL,

  -- File metadata
  file_name       TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  file_size_bytes INTEGER,
  width           INTEGER,
  height          INTEGER,

  -- Ownership
  entity_type     TEXT NOT NULL,  -- 'service', 'company', 'job', 'blog_post', 'page', 'avatar', 'document'
  entity_id       UUID,            -- nullable for general uploads
  uploaded_by     UUID REFERENCES public.people(id),

  -- Metadata
  alt_text        TEXT,
  title           TEXT,
  description     TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Status
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_media_assets_storage UNIQUE (bucket_id, storage_path)
);

CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_id ON public.media_assets (tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_entity ON public.media_assets (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_bucket ON public.media_assets (bucket_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON public.media_assets (uploaded_by);

-- -----------------------------------------------------------------------------
-- 2. MEDIA_ASSETS — RLS
-- -----------------------------------------------------------------------------

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS media_assets_tenant_read ON public.media_assets;
CREATE POLICY media_assets_tenant_read
  ON public.media_assets
  FOR SELECT
  USING (is_tenant_member(tenant_id));

DROP POLICY IF EXISTS media_assets_tenant_insert ON public.media_assets;
CREATE POLICY media_assets_tenant_insert
  ON public.media_assets
  FOR INSERT
  WITH CHECK (
    is_tenant_member(tenant_id)
    AND uploaded_by = current_person_id()
  );

DROP POLICY IF EXISTS media_assets_tenant_update ON public.media_assets;
CREATE POLICY media_assets_tenant_update
  ON public.media_assets
  FOR UPDATE
  USING (
    is_tenant_member(tenant_id)
    AND uploaded_by = current_person_id()
  );

DROP POLICY IF EXISTS media_assets_tenant_delete ON public.media_assets;
CREATE POLICY media_assets_tenant_delete
  ON public.media_assets
  FOR DELETE
  USING (
    is_tenant_member(tenant_id)
    AND uploaded_by = current_person_id()
  );

-- -----------------------------------------------------------------------------
-- 3. MEDIA_ASSETS — updated_at trigger
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS update_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 4. STORAGE BUCKETS — Canonical buckets
-- -----------------------------------------------------------------------------

-- Public media (service images, company logos, blog covers, page images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-media',
  'public-media',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- User avatars (profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Private documents (contracts, candidate docs, invoices)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'private-documents',
  'private-documents',
  false,  -- private
  20971520,  -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. STORAGE POLICIES — public-media bucket
-- -----------------------------------------------------------------------------

-- Public read
DROP POLICY IF EXISTS public_media_read ON storage.objects;
CREATE POLICY public_media_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'public-media');

-- Authenticated upload
DROP POLICY IF EXISTS public_media_insert ON storage.objects;
CREATE POLICY public_media_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public-media'
    AND auth.role() = 'authenticated'
  );

-- Owner update/delete
DROP POLICY IF EXISTS public_media_update ON storage.objects;
CREATE POLICY public_media_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public-media'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS public_media_delete ON storage.objects;
CREATE POLICY public_media_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public-media'
    AND auth.role() = 'authenticated'
  );

-- -----------------------------------------------------------------------------
-- 6. STORAGE POLICIES — avatars bucket
-- -----------------------------------------------------------------------------

-- Public read
DROP POLICY IF EXISTS avatars_read ON storage.objects;
CREATE POLICY avatars_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Authenticated upload
DROP POLICY IF EXISTS avatars_insert ON storage.objects;
CREATE POLICY avatars_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

-- Owner update/delete
DROP POLICY IF EXISTS avatars_update ON storage.objects;
CREATE POLICY avatars_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS avatars_delete ON storage.objects;
CREATE POLICY avatars_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

-- -----------------------------------------------------------------------------
-- 7. STORAGE POLICIES — private-documents bucket
-- -----------------------------------------------------------------------------

-- Tenant members read
DROP POLICY IF EXISTS private_documents_read ON storage.objects;
CREATE POLICY private_documents_read
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'private-documents'
    AND auth.role() = 'authenticated'
  );

-- Authenticated upload
DROP POLICY IF EXISTS private_documents_insert ON storage.objects;
CREATE POLICY private_documents_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'private-documents'
    AND auth.role() = 'authenticated'
  );

-- Owner update/delete
DROP POLICY IF EXISTS private_documents_update ON storage.objects;
CREATE POLICY private_documents_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'private-documents'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS private_documents_delete ON storage.objects;
CREATE POLICY private_documents_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'private-documents'
    AND auth.role() = 'authenticated'
  );

-- -----------------------------------------------------------------------------
-- 8. COMPANIES — Ensure description columns exist (from reconciliation)
-- -----------------------------------------------------------------------------

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS short_description VARCHAR(280),
  ADD COLUMN IF NOT EXISTS company_segment VARCHAR(100);

-- -----------------------------------------------------------------------------
-- 9. COMPANIES — Reconcile document → cnpj (preserves document)
-- -----------------------------------------------------------------------------

UPDATE public.companies
SET cnpj = REGEXP_REPLACE(document, '[^0-9]', '', 'g')
WHERE cnpj IS NULL
  AND document IS NOT NULL
  AND REGEXP_REPLACE(document, '[^0-9]', '', 'g') ~ '^\d{14}$';

UPDATE public.companies
SET cnpj_root = LEFT(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g'), 8)
WHERE cnpj_root IS NULL
  AND cnpj IS NOT NULL
  AND REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g') ~ '^\d{14}$';

-- -----------------------------------------------------------------------------
-- 10. COMPANIES — CNPJ validation constraint
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
-- 11. COMPANIES — Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_companies_cnpj
  ON public.companies (cnpj)
  WHERE cnpj IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_website
  ON public.companies (website)
  WHERE website IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 12. COMPANY_SERVICES — Ensure service_id FK exists
-- -----------------------------------------------------------------------------

ALTER TABLE public.company_services
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_company_services_service_id
  ON public.company_services (service_id)
  WHERE service_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 13. SERVICE_ORDERS — Ensure company_relationship_id FK exists
-- -----------------------------------------------------------------------------

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS company_relationship_id UUID REFERENCES public.company_relationships(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_service_orders_company_relationship_id
  ON public.service_orders (company_relationship_id)
  WHERE company_relationship_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 14. RECRUITMENT_DEMANDS — Ensure service_id FK exists
-- -----------------------------------------------------------------------------

ALTER TABLE public.recruitment_demands
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) NOT NULL DEFAULT 'normal'
                       CHECK (urgency IN ('low', 'normal', 'high', 'critical'));

CREATE INDEX IF NOT EXISTS idx_recruitment_demands_service_id
  ON public.recruitment_demands (service_id)
  WHERE service_id IS NOT NULL;
