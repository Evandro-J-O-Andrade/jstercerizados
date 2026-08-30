-- =============================================================================
-- FASE 3 — Reconciliação: `job_matches`
-- =============================================================================
-- Adiciona colunas ausentes sem alterar políticas RLS existentes.
-- Banco atual usa `demand_id`; canônico usa `job_id`.
-- Mantemos ambos para compatibilidade e reconciliamos o canônico.
-- =============================================================================

ALTER TABLE public.job_matches
  ADD COLUMN IF NOT EXISTS job_id          uuid,
  ADD COLUMN IF NOT EXISTS match_details   jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notified_at     timestamptz,
  ADD COLUMN IF NOT EXISTS applied_at      timestamptz;

CREATE INDEX IF NOT EXISTS idx_job_matches_job_id
  ON public.job_matches (job_id)
  WHERE job_id IS NOT NULL;

COMMENT ON COLUMN public.job_matches.job_id IS
  'Vaga associada ao match (reconciliado). O banco também mantém demand_id para compatibilidade.';

COMMENT ON COLUMN public.job_matches.match_details IS
  'Detalhes do matching em jsonb (reconciliado).';

COMMENT ON COLUMN public.job_matches.notified_at IS
  'Data/hora da notificação do match (reconciliado).';

COMMENT ON COLUMN public.job_matches.applied_at IS
  'Data/hora da candidatura (reconciliado).';
