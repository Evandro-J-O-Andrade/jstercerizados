-- =============================================================================
-- FASE 3 — Reconciliação: `notifications`
-- =============================================================================
-- Adiciona colunas ausentes sem alterar políticas RLS existentes.
-- Banco atual usa `recipient_person_id`; canônico usa `user_id`.
-- Mantemos ambos para compatibilidade e reconciliamos o canônico.
-- =============================================================================

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id    uuid,
  ADD COLUMN IF NOT EXISTS title      text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS message    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS read_at    timestamptz;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_read_at
  ON public.notifications (read_at);

COMMENT ON COLUMN public.notifications.user_id IS
  'Usuário autenticado destinatário (reconciliado). O banco também mantém recipient_person_id para compatibilidade.';

COMMENT ON COLUMN public.notifications.title IS
  'Título curto da notificação (reconciliado).';

COMMENT ON COLUMN public.notifications.message IS
  'Mensagem detalhada (reconciliado).';

COMMENT ON COLUMN public.notifications.read_at IS
  'Data/hora de leitura (reconciliado). NULL = não lida.';
