-- =============================================================================
-- P0-03 — EMIT_DOMAIN_EVENT (corrige schema incompatível)
-- =============================================================================
-- Data:    2026-09-03
-- Origem:  Blocker P0-03 do PREFLIGHT-20260902.md
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Problema: a função original (migration 07) tenta inserir em colunas
-- inexistentes em domain_events:
--   event_name (real: event_type)
--   event_version (não existe)
--   occurred_at (não existe; existe created_at)
--
-- Solução: CREATE OR REPLACE FUNCTION usando o schema real.
-- A função domain_event_emit (existente, funciona) NÃO é tocada.
-- As duas coexistem. Você pode consolidar em migration futura.
--
-- Também restringe GRANTs: remove anon e PUBLIC.
-- =============================================================================
-- Rollback:
--   DROP FUNCTION IF EXISTS public.emit_domain_event(text, text, uuid, uuid, jsonb, text);
-- =============================================================================

BEGIN;

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
    event_type, aggregate_type, aggregate_id,
    tenant_id, payload, idempotency_key
  ) VALUES (
    p_event_name, p_aggregate_type, p_aggregate_id,
    p_tenant_id, p_payload, p_idempotency_key
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- GRANTs corretos (somente authenticated + service_role)
REVOKE ALL ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) FROM anon;

GRANT EXECUTE ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) TO service_role;
GRANT EXECUTE ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) TO authenticated;

COMMENT ON FUNCTION public.emit_domain_event(
  text, text, uuid, uuid, jsonb, text
) IS
  'Emite evento de domínio gravando em public.domain_events. CORRIGIDA em P0-03: usa event_type (não event_name), sem event_version/occurred_at. Use para acionar automações (n8n) via event_outbox/consumer. NÃO armazene webhooks/segredos nesta função. Convivência com domain_event_emit é intencional.';

COMMIT;
