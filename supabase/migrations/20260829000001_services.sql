-- =============================================================================
-- SERVICES — Canonical catalog table
-- =============================================================================
-- Creates the `services` table used by the institutional catalog and
-- operational links (`company_services`, `service_orders`, `recruitment_demands`).
-- Idempotent and non-destructive.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Content
  name                 text NOT NULL,
  slug                 text NOT NULL,
  category             text,
  short_description    varchar(280),
  description          text,

  -- Media
  card_image_url       text,
  hero_image_url       text,
  hero_title           text,
  hero_subtitle        text,

  -- Details
  icon                 text,
  benefits             jsonb NOT NULL DEFAULT '[]'::jsonb,
  process_steps        jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- CTA
  cta_title            text,
  cta_description      text,
  cta_button_text      text,
  cta_button_url       text,

  -- SEO
  seo_title            varchar(70),
  seo_description      varchar(160),
  seo_keywords         text[],

  -- Publishing
  status               text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'published', 'archived')),
  published_at         timestamptz,
  display_order        integer NOT NULL DEFAULT 0,

  -- Audit
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid REFERENCES public.people(id),

  CONSTRAINT uq_services_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_services_tenant_id
  ON public.services (tenant_id);

CREATE INDEX IF NOT EXISTS idx_services_status
  ON public.services (status)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_services_display_order
  ON public.services (display_order);

CREATE INDEX IF NOT EXISTS idx_services_category
  ON public.services (category)
  WHERE category IS NOT NULL;

-- RLS
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
      JOIN public.people pe ON pe.id = ra.person_id
      WHERE pe.auth_user_id = auth.uid()
        AND (p.resource, p.action) IN (
          ('services', 'create'),
          ('services', 'update'),
          ('services', 'delete')
        )
    )
  );

-- updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
