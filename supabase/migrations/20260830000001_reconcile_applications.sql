-- =============================================================================
-- FASE 3 — Reconciliação: `applications`
-- =============================================================================
-- Adiciona colunas ausentes sem alterar políticas RLS existentes.
-- =============================================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS tenant_id    uuid,
  ADD COLUMN IF NOT EXISTS metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by   uuid;

CREATE INDEX IF NOT EXISTS idx_applications_tenant_id
  ON public.applications (tenant_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
  ON public.applications (status);

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

COMMENT ON COLUMN public.applications.tenant_id IS
  'Tenant proprietário da aplicação (reconciliado).';

COMMENT ON COLUMN public.applications.metadata IS
  'Metadados adicionais da aplicação (reconciliado).';

COMMENT ON COLUMN public.applications.created_by IS
  'Pessoa que registrou a aplicação (reconciliado).';
