-- =============================================================================
-- P0-B.1 — Job Slug Redirects (histórico de slugs de vagas)
-- Data: 2026-10-30
-- Escopo: Tabela para preservar URLs antigas de vagas quando o slug é alterado.
-- Aditivo: não altera dados existentes, não quebra consultas atuais.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.job_slug_redirects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id      UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  old_slug    TEXT NOT NULL,
  new_slug    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_job_slug_redirects_old_slug UNIQUE (tenant_id, old_slug),
  CONSTRAINT chk_job_slug_redirects_different CHECK (old_slug <> new_slug)
);

CREATE INDEX IF NOT EXISTS idx_job_slug_redirects_tenant_job
  ON public.job_slug_redirects (tenant_id, job_id);
CREATE INDEX IF NOT EXISTS idx_job_slug_redirects_old_slug
  ON public.job_slug_redirects (tenant_id, old_slug);

-- RLS
ALTER TABLE public.job_slug_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_slug_redirects_tenant_read ON public.job_slug_redirects;
CREATE POLICY job_slug_redirects_tenant_read
  ON public.job_slug_redirects
  FOR SELECT
  USING (is_tenant_member(tenant_id));

DROP POLICY IF EXISTS job_slug_redirects_tenant_insert ON public.job_slug_redirects;
CREATE POLICY job_slug_redirects_tenant_insert
  ON public.job_slug_redirects
  FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id));

DROP POLICY IF EXISTS job_slug_redirects_tenant_update ON public.job_slug_redirects;
CREATE POLICY job_slug_redirects_tenant_update
  ON public.job_slug_redirects
  FOR UPDATE
  USING (is_tenant_member(tenant_id));

DROP POLICY IF EXISTS job_slug_redirects_tenant_delete ON public.job_slug_redirects;
CREATE POLICY job_slug_redirects_tenant_delete
  ON public.job_slug_redirects
  FOR DELETE
  USING (is_tenant_member(tenant_id));

COMMENT ON TABLE public.job_slug_redirects IS 'Histórico de slugs de vagas para redirecionamento seguro quando o slug é alterado após publicação.';
COMMENT ON COLUMN public.job_slug_redirects.old_slug IS 'Slug anterior da vaga.';
COMMENT ON COLUMN public.job_slug_redirects.new_slug IS 'Slug atual da vaga.';
