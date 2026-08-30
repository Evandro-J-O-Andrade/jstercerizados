-- =============================================================================
-- FASE 2 — RH: alinhar `candidates` ao contrato canônico
-- =============================================================================
-- Expande `candidates` sem destruir dados existentes.
-- Mantém `person_id`/`tenant_id` e adiciona colunas de perfil profissional.
-- =============================================================================

-- 1. Colunas adicionais em `candidates`
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS headline              text,
  ADD COLUMN IF NOT EXISTS salary_expectation_min numeric,
  ADD COLUMN IF NOT EXISTS salary_expectation_max numeric,
  ADD COLUMN IF NOT EXISTS salary_type           text,
  ADD COLUMN IF NOT EXISTS availability          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source                text,
  ADD COLUMN IF NOT EXISTS metadata              jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by            uuid,
  ADD COLUMN IF NOT EXISTS updated_at            timestamptz NOT NULL DEFAULT now();

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_candidates_tenant_id
  ON public.candidates (tenant_id);

CREATE INDEX IF NOT EXISTS idx_candidates_status
  ON public.candidates (status);

CREATE INDEX IF NOT EXISTS idx_candidates_source
  ON public.candidates (source)
  WHERE source IS NOT NULL;

-- 3. RLS em candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS candidates_read ON public.candidates;
CREATE POLICY candidates_read
  ON public.candidates
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
      AND tm.tenant_id = candidates.tenant_id
    )
  );

DROP POLICY IF EXISTS candidates_admin ON public.candidates;
CREATE POLICY candidates_admin
  ON public.candidates
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 4. Trigger de updated_at
DROP TRIGGER IF EXISTS update_candidates_updated_at ON public.candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 5. Comentários
COMMENT ON TABLE public.candidates IS
  'Perfil profissional do candidato. Dados pessoais básicos ficam em people. Campos de perfil (headline, pretensão, disponibilidade, source) são expandidos aqui conforme contrato canônico.';

COMMENT ON COLUMN public.candidates.headline IS
  'Título/resumo profissional exibido no portal do candidato.';

COMMENT ON COLUMN public.candidates.salary_expectation_min IS
  'Pretensão salarial mínima.';

COMMENT ON COLUMN public.candidates.salary_expectation_max IS
  'Pretensão salarial máxima.';

COMMENT ON COLUMN public.candidates.salary_type IS
  'Tipo de salário esperado (monthly, yearly, etc).';

COMMENT ON COLUMN public.candidates.availability IS
  'Disponibilidade do candidato (jsonb livre).';

COMMENT ON COLUMN public.candidates.source IS
  'Origem do cadastro do candidato (manual, import, landing_page, etc).';
