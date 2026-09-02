-- =============================================================================
-- 07 — EVENTS / OUTBOX
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  emit_domain_event + índice em event_outbox
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Estratégia:
--   - domain_events é canônico (vide 20260816000900).
--   - Esta seção só cria a função utilitária emit_domain_event
--     e otimiza o consumer (event_outbox) com índice parcial.
--   - NENHUM webhook/segredo aqui. Apenas o registro de "algo aconteceu".
-- =============================================================================
-- Rollback:
--   DROP FUNCTION IF EXISTS public.emit_domain_event(text, text, uuid, uuid, jsonb, text);
--   DROP INDEX  IF EXISTS public.idx_event_outbox_processed_created;
-- =============================================================================

BEGIN;

-- 7.1 — emit_domain_event
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
  INSERT INTO public.domain_events (
    event_name, event_version, aggregate_type, aggregate_id,
    tenant_id, payload, idempotency_key, occurred_at
  ) VALUES (
    p_event_name, 1, p_aggregate_type, p_aggregate_id,
    p_tenant_id, p_payload, p_idempotency_key, now()
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) TO service_role;
GRANT EXECUTE ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) TO authenticated;

COMMENT ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) IS
  'Emite evento de domínio gravando em public.domain_events. Use para acionar automações (n8n) via event_outbox/consumer. NÃO armazene webhooks/segredos nesta função.';

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
