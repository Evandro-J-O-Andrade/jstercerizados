-- =============================================================================
-- 07 — EVENTS / OUTBOX
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  emit_domain_event + índice em event_outbox
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Estratégia:
--   - domain_events é canônico (vide 20260816000900).
--   - emit_domain_event é um WRAPPER sobre domain_event_emit, que é a
--     implementação canônica compatível com o schema real de domain_events
--     (event_type, idempotency_key text, sem event_version/occurred_at).
--   - Esta migration também cria o índice parcial em event_outbox.
--   - NENHUM webhook/segredo aqui. Apenas o registro de "algo aconteceu".
-- =============================================================================
-- Rollback:
--   DROP FUNCTION IF EXISTS public.emit_domain_event(text, text, uuid, uuid, jsonb, text);
--   DROP INDEX  IF EXISTS public.idx_event_outbox_processed_created;
-- =============================================================================

BEGIN;

-- 7.1 — emit_domain_event (wrapper sobre domain_event_emit)
--
-- NOTA DE RECONCILIAÇÃO:
-- O schema remoto de domain_events usa:
--   - column event_type  (não event_name)
--   - idempotency_key AS text (não uuid)
--   - sem event_version, sem occurred_at
--
-- A função domain_event_emit já está aplicada no Supabase e é compatível.
-- Esta migration transforma emit_domain_event em um wrapper que delega
-- a domain_event_emit, preservando a assinatura existente e evitando
-- duplicação de lógica.
CREATE OR REPLACE FUNCTION public.emit_domain_event(
  p_event_name      text,
  p_aggregate_type  text,
  p_aggregate_id    uuid,
  p_tenant_id       uuid,
  p_payload         jsonb DEFAULT '{}'::jsonb,
  p_idempotency_key text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  -- Delegate to canonical implementation. Preserva assinatura pública.
  v_event_id := public.domain_event_emit(
    p_tenant_id,
    p_event_name,      -- p_event_type
    p_aggregate_type,
    p_aggregate_id,
    p_payload,
    p_idempotency_key
  );

  RETURN v_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) TO service_role;
GRANT EXECUTE ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) TO authenticated;

-- P0-03.1 — Revogar grants indevidos (anon, PUBLIC)
REVOKE ALL ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) FROM anon;
REVOKE ALL ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) FROM PUBLIC;

COMMENT ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) IS
  'Emite evento de domínio gravando em public.domain_events. Wrapper sobre domain_event_emit (canonical). NÃO armazene webhooks/segredos nesta função.';

-- 7.2 — event_outbox: índice parcial (se a tabela existir)
DO $$
BEGIN
  IF to_regclass('public.event_outbox') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname='public' AND tablename='event_outbox'
        AND indexname='idx_event_outbox_processed_created'
    ) THEN
      EXECUTE '
        CREATE INDEX idx_event_outbox_processed_created
          ON public.event_outbox (processed_at, created_at)
          WHERE processed_at IS NULL
      ';
    END IF;
  END IF;
END $$;

COMMIT;
