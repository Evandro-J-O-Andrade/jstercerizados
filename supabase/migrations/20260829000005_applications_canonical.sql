-- =============================================================================
-- FASE 3 — Recrutamento: alinhar `applications` ao contrato canônico
-- =============================================================================
-- Expande `applications` sem destruir dados existentes.
-- Mantém colunas atuais e adiciona apenas o que está ausente no banco real.
-- =============================================================================

-- 1. Colunas adicionais em `applications`
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS tenant_id           uuid,
  ADD COLUMN IF NOT EXISTS applied_at          timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS current_stage       text,
  ADD COLUMN IF NOT EXISTS source              text,
  ADD COLUMN IF NOT EXISTS profile_snapshot    jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS match_score         numeric,
  ADD COLUMN IF NOT EXISTS match_details       jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notes               text,
  ADD COLUMN IF NOT EXISTS created_by          uuid,
  ADD COLUMN IF NOT EXISTS updated_at          timestamptz NOT NULL DEFAULT now();

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_applications_tenant_id
  ON public.applications (tenant_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
  ON public.applications (status);

CREATE INDEX IF NOT EXISTS idx_applications_source
  ON public.applications (source)
  WHERE source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_applied_at
  ON public.applications (applied_at);

-- 3. RLS em applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS applications_read ON public.applications;
CREATE POLICY applications_read
  ON public.applications
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
      AND tm.tenant_id = applications.tenant_id
    )
  );

DROP POLICY IF EXISTS applications_admin ON public.applications;
CREATE POLICY applications_admin
  ON public.applications
  FOR ALL
  TO authenticated
  USING (is_admin_master())
  WITH CHECK (is_admin_master());

-- 4. Trigger de updated_at
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 5. Comentários
COMMENT ON TABLE public.applications IS
  'Candidaturas de candidatos a vagas. Mantém vínculo com candidate e job. Campos expandidos para histórico, matching e origem da candidatura.';

COMMENT ON COLUMN public.applications.tenant_id IS
  'Tenant onde a candidatura foi registrada.';

COMMENT ON COLUMN public.applications.applied_at IS
  'Data/hora da candidatura.';

COMMENT ON COLUMN public.applications.current_stage IS
  'Etapa atual do processo seletivo (para compatibilidade com legado).';

COMMENT ON COLUMN public.applications.source IS
  'Origem da candidatura (site, indicação, rede social, etc).';

COMMENT ON COLUMN public.applications.profile_snapshot IS
  'Snapshot do perfil do candidato no momento da candidatura.';

COMMENT ON COLUMN public.applications.match_score IS
  'Score de compatibilidade candidato x vaga.';
