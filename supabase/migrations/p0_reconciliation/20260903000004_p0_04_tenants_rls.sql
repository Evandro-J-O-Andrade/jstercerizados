-- =============================================================================
-- P0-04 — TENANTS RLS (adiciona policy aberta para authenticated)
-- =============================================================================
-- Data:    2026-09-03
-- Origem:  Blocker P0-04 do PREFLIGHT-20260902.md
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Problema: a única policy de leitura em `tenants` é
-- `tenants_member_read` (USING is_tenant_member(id)).
-- Os 6 people sem membership ativo + 3 candidates sem membership
-- não conseguem ler NENHUM tenant → fluxo de login/dashboard quebra.
--
-- Solução: adicionar `tenants_authenticated_read` com USING (true).
-- Postgres combina múltiplas policies do mesmo cmd via OR:
--   SELECT permitido se QUALQUER policy USING for true para a linha.
-- A policy restritiva continua valendo para quem tem membership
-- (camada extra), mas authenticated sem membership passa pela aberta.
--
-- A ESCRITA continua restrita (não há policy de INSERT/UPDATE/DELETE
-- além de service_role). Isso é o comportamento correto.
-- =============================================================================
-- Rollback:
--   DROP POLICY IF EXISTS tenants_authenticated_read ON public.tenants;
-- =============================================================================

BEGIN;

DROP POLICY IF EXISTS tenants_authenticated_read ON public.tenants;
CREATE POLICY tenants_authenticated_read
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY tenants_authenticated_read ON public.tenants IS
  'Adicionada em P0-04: SELECT aberto para authenticated. Necessária para que pessoas sem tenant_membership (ex: candidatos em primeiro acesso, ou pessoas com cadeia quebrada) possam ler pelo menos o nome do tenant. Combina via OR com tenants_member_read.';

COMMIT;
