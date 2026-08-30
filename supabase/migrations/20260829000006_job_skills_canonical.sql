-- =============================================================================
-- FASE 3 — Recrutamento: alinhar `job_skills` ao contrato canônico
-- =============================================================================
-- Expande `job_skills` sem destruir dados existentes.
-- Mantém colunas atuais e adiciona apenas o que está ausente no banco real.
-- =============================================================================

-- 1. Colunas adicionais em `job_skills`
ALTER TABLE public.job_skills
  ADD COLUMN IF NOT EXISTS tenant_id     uuid,
  ADD COLUMN IF NOT EXISTS created_at    timestamptz NOT NULL DEFAULT now();

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_job_skills_job_id
  ON public.job_skills (job_id);

CREATE INDEX IF NOT EXISTS idx_job_skills_skill_id
  ON public.job_skills (skill_id);

CREATE INDEX IF NOT EXISTS idx_job_skills_tenant_id
  ON public.job_skills (tenant_id);

-- 3. Unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'job_skills_job_id_skill_id_key'
      AND table_name = 'job_skills'
  ) THEN
    ALTER TABLE public.job_skills
      ADD CONSTRAINT job_skills_job_id_skill_id_key UNIQUE (job_id, skill_id);
  END IF;
END $$;

-- 4. RLS em job_skills
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_skills_read ON public.job_skills;
CREATE POLICY job_skills_read
  ON public.job_skills
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
      AND tm.tenant_id = job_skills.tenant_id
    )
  );

DROP POLICY IF EXISTS job_skills_admin ON public.job_skills;
CREATE POLICY job_skills_admin
  ON public.job_skills
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 5. Comentários
COMMENT ON TABLE public.job_skills IS
  'Habilidades associadas a uma vaga. Mantém vínculo com jobs e skills. tenant_id garante isolamento multi-tenant.';

COMMENT ON COLUMN public.job_skills.tenant_id IS
  'Tenant da vaga.';

COMMENT ON COLUMN public.job_skills.created_at IS
  'Data de associação da habilidade à vaga.';
