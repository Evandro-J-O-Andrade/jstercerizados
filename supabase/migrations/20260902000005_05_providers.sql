-- =============================================================================
-- 05 — PROVIDERS (catálogo + config por provider)
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Tabela de providers suportados e contrato de configuração
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Princípios:
--   - O banco NÃO chama providers externos. Apenas registra o catálogo.
--   - n8n / Edge Functions consultam esta tabela para descobrir
--     credenciais/endpoints e fazer a chamada.
--   - Nenhum segredo aqui. Apenas referências.
-- =============================================================================
-- Rollback:
--   DROP TABLE IF EXISTS public.provider_configs CASCADE;
--   DROP TABLE IF EXISTS public.providers        CASCADE;
-- =============================================================================

BEGIN;

-- 5.1 — providers (catálogo read-only de providers suportados)
CREATE TABLE IF NOT EXISTS public.providers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text NOT NULL UNIQUE,
  category        text NOT NULL CHECK (category IN (
                    'messaging','email','calendar','meeting',
                    'spreadsheet','collaboration','video','storage','other'
                  )),
  display_name    text NOT NULL,
  description     text,
  api_base_url    text,
  docs_url        text,
  is_active       boolean NOT NULL DEFAULT true,
  config_schema   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_providers_category
  ON public.providers (category) WHERE is_active = true;

-- 5.2 — provider_configs (config por tenant por provider)
--       Ex: Google Calendar habilitado, mas só sync de entrevistas;
--           WhatsApp principal vs WhatsApp de suporte, etc.
CREATE TABLE IF NOT EXISTS public.provider_configs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider_id     uuid NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT,
  connection_id   uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL,
  is_enabled      boolean NOT NULL DEFAULT true,
  settings        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_provider_configs_tenant UNIQUE (tenant_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_configs_tenant
  ON public.provider_configs (tenant_id) WHERE is_enabled = true;

-- 5.3 — seed mínimo: catálogo vazio será populado por migration posterior
--       dedicada quando o cliente habilitar cada provider (decisão por tenant)

-- 5.4 — triggers
DROP TRIGGER IF EXISTS update_providers_updated_at ON public.providers;
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_provider_configs_updated_at ON public.provider_configs;
CREATE TRIGGER update_provider_configs_updated_at
  BEFORE UPDATE ON public.provider_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5.5 — RLS
ALTER TABLE public.providers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS providers_authenticated_read ON public.providers;
CREATE POLICY providers_authenticated_read
  ON public.providers FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS provider_configs_tenant_read ON public.provider_configs;
CREATE POLICY provider_configs_tenant_read
  ON public.provider_configs FOR SELECT
  TO authenticated
  USING (public.is_tenant_member(tenant_id));

COMMIT;
