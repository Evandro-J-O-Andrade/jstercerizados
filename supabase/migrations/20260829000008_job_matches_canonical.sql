-- =============================================================================
-- FASE 3 — Recrutamento: alinhar `job_matches` ao contrato canônico
-- =============================================================================
-- Cria/expande `job_matches` sem destruir dados existentes.
-- Representa o matching entre candidatos e vagas.
-- =============================================================================

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.job_matches (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  candidate_id      uuid NOT NULL,
  job_id            uuid NOT NULL,
  match_score       numeric,
  match_details     jsonb NOT NULL DEFAULT '{}'::jsonb,
  status            text NOT NULL DEFAULT 'pending',
  notified_at       timestamptz,
  applied_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_job_matches_tenant_id
  ON public.job_matches (tenant_id);

CREATE INDEX IF NOT EXISTS idx_job_matches_candidate_id
  ON public.job_matches (candidate_id);

CREATE INDEX IF NOT EXISTS idx_job_matches_job_id
  ON public.job_matches (job_id);

CREATE INDEX IF NOT EXISTS idx_job_matches_status
  ON public.job_matches (status);

-- 3. Unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'job_matches_tenant_id_candidate_id_job_id_key'
      AND table_name = 'job_matches'
  ) THEN
    ALTER TABLE public.job_matches
      ADD CONSTRAINT job_matches_tenant_id_candidate_id_job_id_key UNIQUE (tenant_id, candidate_id, job_id);
  END IF;
END $$;

-- 4. FKs (idempotentes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'job_matches_candidate_id_fkey'
      AND table_name = 'job_matches'
  ) THEN
    ALTER TABLE public.job_matches
      ADD CONSTRAINT job_matches_candidate_id_fkey
      FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'job_matches_job_id_fkey'
      AND table_name = 'job_matches'
  ) THEN
    ALTER TABLE public.job_matches
      ADD CONSTRAINT job_matches_job_id_fkey
      FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. RLS em job_matches
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_matches_read ON public.job_matches;
CREATE POLICY job_matches_read
  ON public.job_matches
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
      AND tm.tenant_id = job_matches.tenant_id
    )
  );

DROP POLICY IF EXISTS job_matches_admin ON public.job_matches;
CREATE POLICY job_matches_admin
  ON public.job_matches
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 6. Trigger de updated_at
DROP TRIGGER IF EXISTS update_job_matches_updated_at ON public.job_matches;
CREATE TRIGGER update_job_matches_updated_at
  BEFORE UPDATE ON public.job_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 7. Comentários
COMMENT ON TABLE public.job_matches IS
  'Matching entre candidatos e vagas. Registra score, detalhes e status da compatibilidade.';

COMMENT ON COLUMN public.job_matches.match_score IS
  'Score de compatibilidade candidato x vaga (0-100).';

COMMENT ON COLUMN public.job_matches.match_details IS
  'Detalhes do matching (jsonb livre).';

COMMENT ON COLUMN public.job_matches.status IS
  'Status do match (pending, notified, applied, rejected, expired).';

COMMENT ON COLUMN public.job_matches.notified_at IS
  'Data/hora em que o candidato foi notificado do match.';

COMMENT ON COLUMN public.job_matches.applied_at IS
  'Data/hora em que o candidato se candidatou à vaga.';
