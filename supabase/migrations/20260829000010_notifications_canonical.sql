-- =============================================================================
-- FASE 3 — Notificações: alinhar `notifications` ao contrato canônico
-- =============================================================================
-- Cria tabela de notificações para usuários autenticados.
-- =============================================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS public.notifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  user_id           uuid NOT NULL,
  type              text NOT NULL,
  title             text NOT NULL,
  message           text NOT NULL,
  data              jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id
  ON public.notifications (tenant_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read_at
  ON public.notifications (read_at);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications (created_at DESC);

-- 3. RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_read ON public.notifications;
CREATE POLICY notifications_read
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND (
      is_admin_master()
      OR EXISTS (
        SELECT 1 FROM public.tenant_memberships tm
        WHERE tm.person_id = (
          SELECT p.id FROM public.people p
          WHERE p.auth_user_id = auth.uid()
        )
        AND tm.status = 'active'
        AND tm.tenant_id = notifications.tenant_id
      )
    )
  );

DROP POLICY IF EXISTS notifications_update ON public.notifications;
CREATE POLICY notifications_update
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Comentários
COMMENT ON TABLE public.notifications IS
  'Notificações de usuários autenticados por tenant.';

COMMENT ON COLUMN public.notifications.type IS
  'Tipo da notificação (ex: job_match, interview_scheduled, recruitment_demand).';

COMMENT ON COLUMN public.notifications.title IS
  'Título curto da notificação.';

COMMENT ON COLUMN public.notifications.message IS
  'Mensagem detalhada da notificação.';

COMMENT ON COLUMN public.notifications.data IS
  'Dados adicionais serializados em jsonb.';

COMMENT ON COLUMN public.notifications.read_at IS
  'Data/hora em que a notificação foi lida. NULL = não lida.';
