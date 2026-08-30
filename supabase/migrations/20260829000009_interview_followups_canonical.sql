-- =============================================================================
-- FASE 3 — Recrutamento: alinhar `interview_followups` ao contrato canônico
-- =============================================================================
-- Cria tabela de follow-up de entrevistas (check-in pós-entrevista).
-- =============================================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS public.interview_followups (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  candidate_id      uuid NOT NULL,
  job_id            uuid NOT NULL,
  interview_date    timestamptz,
  status            text NOT NULL DEFAULT 'pending',
  feedback          text,
  rating            integer,
  next_steps        text,
  notified_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_interview_followups_tenant_id
  ON public.interview_followups (tenant_id);

CREATE INDEX IF NOT EXISTS idx_interview_followups_candidate_id
  ON public.interview_followups (candidate_id);

CREATE INDEX IF NOT EXISTS idx_interview_followups_job_id
  ON public.interview_followups (job_id);

CREATE INDEX IF NOT EXISTS idx_interview_followups_status
  ON public.interview_followups (status);

-- 3. FKs (idempotentes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'interview_followups_candidate_id_fkey'
      AND table_name = 'interview_followups'
  ) THEN
    ALTER TABLE public.interview_followups
      ADD CONSTRAINT interview_followups_candidate_id_fkey
      FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'interview_followups_job_id_fkey'
      AND table_name = 'interview_followups'
  ) THEN
    ALTER TABLE public.interview_followups
      ADD CONSTRAINT interview_followups_job_id_fkey
      FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. RLS
ALTER TABLE public.interview_followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS interview_followups_read ON public.interview_followups;
CREATE POLICY interview_followups_read
  ON public.interview_followups
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
      AND tm.tenant_id = interview_followups.tenant_id
    )
  );

DROP POLICY IF EXISTS interview_followups_admin ON public.interview_followups;
CREATE POLICY interview_followups_admin
  ON public.interview_followups
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 5. Trigger de updated_at
DROP TRIGGER IF EXISTS update_interview_followups_updated_at ON public.interview_followups;
CREATE TRIGGER update_interview_followups_updated_at
  BEFORE UPDATE ON public.interview_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 6. Comentários
COMMENT ON TABLE public.interview_followups IS
  'Follow-up de entrevistas. Registra feedback, avaliação e próximos passos após entrevista.';

COMMENT ON COLUMN public.interview_followups.interview_date IS
  'Data/hora da entrevista realizada.';

COMMENT ON COLUMN public.interview_followups.status IS
  'Status do follow-up (pending, completed, no_show, rescheduled).';

COMMENT ON COLUMN public.interview_followups.feedback IS
  'Feedback textual da entrevista.';

COMMENT ON COLUMN public.interview_followups.rating IS
  'Avaliação numérica da entrevista (ex: 1-5).';

COMMENT ON COLUMN public.interview_followups.next_steps IS
  'Próximos passos acordados na entrevista.';
