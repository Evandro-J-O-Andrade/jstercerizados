-- =============================================================================
-- FASE 3 — Audit: alinhar `activity_logs` ao contrato canônico
-- =============================================================================
-- Cria tabela de logs de atividade para rastreabilidade.
-- =============================================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  user_id           uuid,
  action            text NOT NULL,
  entity_type       text NOT NULL,
  entity_id         uuid NOT NULL,
  changes           jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address        text,
  user_agent        text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_id
  ON public.activity_logs (tenant_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id
  ON public.activity_logs (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type_entity_id
  ON public.activity_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
  ON public.activity_logs (created_at DESC);

-- 3. RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activity_logs_read ON public.activity_logs;
CREATE POLICY activity_logs_read
  ON public.activity_logs
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
      AND tm.tenant_id = activity_logs.tenant_id
    )
  );

DROP POLICY IF EXISTS activity_logs_insert ON public.activity_logs;
CREATE POLICY activity_logs_insert
  ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_master()
    OR EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      WHERE tm.person_id = (
        SELECT p.id FROM public.people p
        WHERE p.auth_user_id = auth.uid()
      )
      AND tm.status = 'active'
      AND tm.tenant_id = activity_logs.tenant_id
    )
  );

-- 4. Comentários
COMMENT ON TABLE public.activity_logs IS
  'Logs de atividade e auditoria. Registra ações de usuários autenticados por tenant.';

COMMENT ON COLUMN public.activity_logs.user_id IS
  'ID do usuário autenticado que executou a ação. NULL para ações do sistema.';

COMMENT ON COLUMN public.activity_logs.action IS
  'Ação executada (ex: create, update, delete, login, send).';

COMMENT ON COLUMN public.activity_logs.entity_type IS
  'Tipo da entidade afetada (ex: candidate, job, recruitment_demand).';

COMMENT ON COLUMN public.activity_logs.entity_id IS
  'ID da entidade afetada.';

COMMENT ON COLUMN public.activity_logs.changes IS
  'Detalhes das mudanças realizadas (jsonb livre).';

COMMENT ON COLUMN public.activity_logs.metadata IS
  'Metadados adicionais (jsonb livre).';

COMMENT ON COLUMN public.activity_logs.ip_address IS
  'Endereço IP de origem da requisição.';

COMMENT ON COLUMN public.activity_logs.user_agent IS
  'User-Agent do navegador/cliente.';
