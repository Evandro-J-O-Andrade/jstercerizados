-- =============================================================================
-- FASE 3 — Recrutamento: alinhar `jobs` ao contrato canônico
-- =============================================================================
-- Expande `jobs` sem destruir dados existentes.
-- Mantém colunas atuais e adiciona apenas o que está ausente no banco real.
-- =============================================================================

-- 1. Colunas adicionais em `jobs`
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS slug                  text,
  ADD COLUMN IF NOT EXISTS responsibilities     text,
  ADD COLUMN IF NOT EXISTS benefits             text,
  ADD COLUMN IF NOT EXISTS salary_min           numeric,
  ADD COLUMN IF NOT EXISTS salary_max           numeric,
  ADD COLUMN IF NOT EXISTS salary_type          text,
  ADD COLUMN IF NOT EXISTS contract_type        text,
  ADD COLUMN IF NOT EXISTS seniority            text,
  ADD COLUMN IF NOT EXISTS work_hours           text,
  ADD COLUMN IF NOT EXISTS work_mode            text,
  ADD COLUMN IF NOT EXISTS city                 text,
  ADD COLUMN IF NOT EXISTS state                text,
  ADD COLUMN IF NOT EXISTS location_detail      text,
  ADD COLUMN IF NOT EXISTS views_count          integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applications_count   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expires_at           timestamptz,
  ADD COLUMN IF NOT EXISTS metadata             jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by           uuid,
  ADD COLUMN IF NOT EXISTS updated_at           timestamptz NOT NULL DEFAULT now();

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_id
  ON public.jobs (tenant_id);

CREATE INDEX IF NOT EXISTS idx_jobs_status
  ON public.jobs (status);

CREATE INDEX IF NOT EXISTS idx_jobs_slug
  ON public.jobs (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_expires_at
  ON public.jobs (expires_at)
  WHERE expires_at IS NOT NULL;

-- 3. Unique constraint para slug por tenant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'jobs_slug_tenant_id_key'
      AND table_name = 'jobs'
  ) THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_slug_tenant_id_key UNIQUE (tenant_id, slug);
  END IF;
END $$;

-- 4. RLS em jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jobs_read ON public.jobs;
CREATE POLICY jobs_read
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (
    is_admin_master()
    OR EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      WHERE tm.person_id = (
        SELECT p.id FROM public.people p
        WHERE p.auth_user_id = auth.uid()
      )
      AND tm.status = 'active'
      AND tm.tenant_id = jobs.tenant_id
    )
  );

DROP POLICY IF EXISTS jobs_admin ON public.jobs;
CREATE POLICY jobs_admin
  ON public.jobs
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 5. Trigger de updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 6. Comentários
COMMENT ON TABLE public.jobs IS
  'Vagas/oportunidades de trabalho. Mantém tenant_id para isolamento multi-tenant. Campos expandidos para publicação completa no portal.';

COMMENT ON COLUMN public.jobs.slug IS
  'Slug amigável para rotas SEO do portal público. Único por tenant.';

COMMENT ON COLUMN public.jobs.salary_min IS
  'Faixa salarial mínima (numérica) para filtros do portal.';

COMMENT ON COLUMN public.jobs.salary_max IS
  'Faixa salarial máxima (numérica) para filtros do portal.';

COMMENT ON COLUMN public.jobs.expires_at IS
  'Data de fechamento automático da vaga.';
