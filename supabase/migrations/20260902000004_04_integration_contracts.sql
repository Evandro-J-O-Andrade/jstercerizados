-- =============================================================================
-- 04 — INTEGRATION CONTRACTS
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Tabelas para registrar conexões, webhooks, sync, erros e credenciais
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Princípios:
--   - SEGREDOS NUNCA em coluna pública. Apenas referências (ciphertext/URI).
--   - Tudo passa por domain_events → event_outbox → consumer (n8n).
--   - Idempotência garantida por UNIQUE constraint.
-- =============================================================================
-- Rollback (rodar manualmente, se necessário):
--   DROP TABLE IF EXISTS public.integration_errors      CASCADE;
--   DROP TABLE IF EXISTS public.integration_sync_runs   CASCADE;
--   DROP TABLE IF EXISTS public.integration_webhooks    CASCADE;
--   DROP TABLE IF EXISTS public.integration_events      CASCADE;
--   DROP TABLE IF EXISTS public.integration_credentials CASCADE;
--   DROP TABLE IF EXISTS public.integration_connections CASCADE;
-- =============================================================================

BEGIN;

-- 4.1 — integration_connections (registro de conexões por provider/tenant)
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider_code       text NOT NULL,
  display_name        text NOT NULL,
  status              text NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','paused','error','revoked')),
  external_account_id text,
  config              jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at      timestamptz,
  last_error_at       timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_integration_connections UNIQUE (tenant_id, provider_code)
);

CREATE INDEX IF NOT EXISTS idx_integration_connections_tenant
  ON public.integration_connections (tenant_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_provider
  ON public.integration_connections (provider_code);

-- 4.2 — integration_credentials (REFERÊNCIA, nunca segredo em plain text)
--       A coluna ciphertext deve ser populada por Edge Functions com KMS.
CREATE TABLE IF NOT EXISTS public.integration_credentials (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   uuid NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE,
  credential_type text NOT NULL,
  ciphertext      text NOT NULL,
  key_uri         text NOT NULL,
  expires_at      timestamptz,
  rotated_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_credentials_connection
  ON public.integration_credentials (connection_id);

-- 4.3 — integration_events (rastreabilidade de eventos de integração)
CREATE TABLE IF NOT EXISTS public.integration_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL,
  domain_event_id uuid REFERENCES public.domain_events(id) ON DELETE SET NULL,
  provider_code   text NOT NULL,
  event_type      text NOT NULL,
  idempotency_key text NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','sent','delivered','failed','retrying')),
  attempts        integer NOT NULL DEFAULT 0,
  last_error      text,
  sent_at         timestamptz,
  delivered_at    timestamptz,
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  response        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_integration_events_idempotency UNIQUE (provider_code, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_integration_events_status
  ON public.integration_events (status, created_at);
CREATE INDEX IF NOT EXISTS idx_integration_events_connection
  ON public.integration_events (connection_id);

-- 4.4 — integration_webhooks (inbound de providers)
CREATE TABLE IF NOT EXISTS public.integration_webhooks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL,
  provider_code   text NOT NULL,
  external_id     text NOT NULL,
  event_type      text NOT NULL,
  payload         jsonb NOT NULL,
  signature_valid boolean,
  processed       boolean NOT NULL DEFAULT false,
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz,
  CONSTRAINT uq_integration_webhooks UNIQUE (provider_code, external_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_integration_webhooks_unprocessed
  ON public.integration_webhooks (received_at) WHERE processed = false;

-- 4.5 — integration_sync_runs (histórico de sincronizações)
CREATE TABLE IF NOT EXISTS public.integration_sync_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   uuid NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE,
  direction       text NOT NULL CHECK (direction IN ('inbound','outbound','bidirectional')),
  started_at      timestamptz NOT NULL DEFAULT now(),
  finished_at     timestamptz,
  status          text NOT NULL DEFAULT 'running'
                   CHECK (status IN ('running','success','partial','failed')),
  records_total   integer,
  records_ok      integer,
  records_failed  integer,
  error_summary   text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_integration_sync_runs_connection
  ON public.integration_sync_runs (connection_id, started_at DESC);

-- 4.6 — integration_errors (log de erros por provider)
CREATE TABLE IF NOT EXISTS public.integration_errors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL,
  provider_code   text NOT NULL,
  error_code      text,
  error_message   text NOT NULL,
  context         jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  resolved_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_integration_errors_occurred
  ON public.integration_errors (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_errors_unresolved
  ON public.integration_errors (occurred_at DESC) WHERE resolved_at IS NULL;

-- 4.7 — updated_at triggers
DROP TRIGGER IF EXISTS update_integration_connections_updated_at ON public.integration_connections;
CREATE TRIGGER update_integration_connections_updated_at
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_integration_events_updated_at ON public.integration_events;
CREATE TRIGGER update_integration_events_updated_at
  BEFORE UPDATE ON public.integration_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4.8 — RLS conservador: members do tenant leem, service_role escreve
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_webhooks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_runs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_errors      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS integration_connections_tenant_read ON public.integration_connections;
CREATE POLICY integration_connections_tenant_read
  ON public.integration_connections FOR SELECT
  TO authenticated
  USING (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS integration_events_tenant_read ON public.integration_events;
CREATE POLICY integration_events_tenant_read
  ON public.integration_events FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.integration_connections c
    WHERE c.id = integration_events.connection_id
      AND public.is_tenant_member(c.tenant_id)
  ));

DROP POLICY IF EXISTS integration_webhooks_tenant_read ON public.integration_webhooks;
CREATE POLICY integration_webhooks_tenant_read
  ON public.integration_webhooks FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.integration_connections c
    WHERE c.id = integration_webhooks.connection_id
      AND public.is_tenant_member(c.tenant_id)
  ));

DROP POLICY IF EXISTS integration_sync_runs_tenant_read ON public.integration_sync_runs;
CREATE POLICY integration_sync_runs_tenant_read
  ON public.integration_sync_runs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.integration_connections c
    WHERE c.id = integration_sync_runs.connection_id
      AND public.is_tenant_member(c.tenant_id)
  ));

DROP POLICY IF EXISTS integration_errors_tenant_read ON public.integration_errors;
CREATE POLICY integration_errors_tenant_read
  ON public.integration_errors FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.integration_connections c
    WHERE c.id = integration_errors.connection_id
      AND public.is_tenant_member(c.tenant_id)
  ));

-- credentials: NUNCA leitura direta por authenticated (service_role only).
DROP POLICY IF EXISTS integration_credentials_deny_all ON public.integration_credentials;
CREATE POLICY integration_credentials_deny_all
  ON public.integration_credentials FOR ALL
  TO authenticated
  USING (false) WITH CHECK (false);

COMMIT;
