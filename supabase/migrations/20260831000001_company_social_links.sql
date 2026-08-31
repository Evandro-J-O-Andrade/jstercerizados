-- =============================================================================
-- FASE 1 — COMPANY SOCIAL LINKS
-- =============================================================================
-- Tabela reconciliatória para armazenar links de redes sociais por empresa.
-- Não altera RLS/policies existentes de `companies` ou outras tabelas.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.company_social_links (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  company_id      uuid NOT NULL,
  platform        text NOT NULL,
  url             text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. CONSTRAINTS (idempotent)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'company_social_links_tenant_id_fkey') THEN
    ALTER TABLE public.company_social_links
      ADD CONSTRAINT company_social_links_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'company_social_links_company_id_fkey') THEN
    ALTER TABLE public.company_social_links
      ADD CONSTRAINT company_social_links_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'company_social_links_platform_check') THEN
    ALTER TABLE public.company_social_links
      ADD CONSTRAINT company_social_links_platform_check
      CHECK (platform IN (
        'instagram', 'facebook', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'other'
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'company_social_links_url_check') THEN
    ALTER TABLE public.company_social_links
      ADD CONSTRAINT company_social_links_url_check
      CHECK (url ~* '^https?://');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'company_social_links_company_platform_unique') THEN
    ALTER TABLE public.company_social_links
      ADD CONSTRAINT company_social_links_company_platform_unique
      UNIQUE (company_id, platform);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. INDEXES
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_company_social_links_tenant_id
  ON public.company_social_links (tenant_id);

CREATE INDEX IF NOT EXISTS idx_company_social_links_company_id
  ON public.company_social_links (company_id);

-- -----------------------------------------------------------------------------
-- 4. RLS (idempotent policies)
-- -----------------------------------------------------------------------------

ALTER TABLE public.company_social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_social_links_member_read ON public.company_social_links;
CREATE POLICY company_social_links_member_read
  ON public.company_social_links
  FOR SELECT
  USING (
    is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_social_links.company_id
        AND is_tenant_member(c.tenant_id)
    )
  );

DROP POLICY IF EXISTS company_social_links_member_write ON public.company_social_links;
CREATE POLICY company_social_links_member_write
  ON public.company_social_links
  FOR INSERT
  WITH CHECK (
    is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_social_links.company_id
        AND is_tenant_member(c.tenant_id)
    )
  );

DROP POLICY IF EXISTS company_social_links_member_update ON public.company_social_links;
CREATE POLICY company_social_links_member_update
  ON public.company_social_links
  FOR UPDATE
  USING (
    is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_social_links.company_id
        AND is_tenant_member(c.tenant_id)
    )
  )
  WITH CHECK (
    is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_social_links.company_id
        AND is_tenant_member(c.tenant_id)
    )
  );

DROP POLICY IF EXISTS company_social_links_member_delete ON public.company_social_links;
CREATE POLICY company_social_links_member_delete
  ON public.company_social_links
  FOR DELETE
  USING (
    is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_social_links.company_id
        AND is_tenant_member(c.tenant_id)
    )
  );

-- -----------------------------------------------------------------------------
-- 5. TRIGGER — updated_at (idempotent)
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS update_company_social_links_updated_at ON public.company_social_links;
CREATE TRIGGER update_company_social_links_updated_at
  BEFORE UPDATE ON public.company_social_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
