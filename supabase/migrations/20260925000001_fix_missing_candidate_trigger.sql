-- =============================================================================
-- J&S Empregos LTDA
-- Migration: 20260925000001_fix_missing_candidate_trigger.sql
--
-- OBJETIVO:
--   Criar o trigger faltando trg_bootstrap_candidate_from_auth_user na tabela
--   auth.users AFTER INSERT.
--
-- CONTEXTO:
--   A migration 20260910000002_unify_first_login_state.sql redefini a função
--   bootstrap_candidate_from_auth_user() com a lógica correta (signup_origin,
--   role 'candidato', ON CONFLICT DO NOTHING idempotente).
--
--   A migration 20260918000001_empresa_bootstrap.sql redefiniu a função novamente
--   adicionando o guard para pular signup_context='empresa', e criou o trigger
--   trg_bootstrap_company_from_auth_user. MAS esqueceu de (re)criar o trigger
--   trg_bootstrap_candidate_from_auth_user.
--
--   Resultado: quando um candidato faz signUp via frontend, a função nunca é
--   chamada → tenant_memberships, candidates, role_assignments e
--   first_login_state nunca são provisionados → candidato não consegue acessar
--   /candidato/* e CandidateContext retorna null.
--
-- ESTA MIGRAÇÃO:
--   - DROP TRIGGER IF EXISTS trg_bootstrap_candidate_from_auth_user
--   - CREATE TRIGGER trg_bootstrap_candidate_from_auth_user
--     AFTER INSERT ON auth.users
--     EXECUTE FUNCTION public.bootstrap_candidate_from_auth_user()
--   - Re-grant da função para authenticated + service_role (idempotente)
--
-- PRESERVADO:
--   - Nada sobre a função em si (já correta em 20260918000001)
--   - Nada sobre bootstrap_company_from_auth_user (trigger já existe)
--   - Nada sobre handle_new_auth_user (já existe)
--   - Schema, tabelas, constraints, RLS, roles, permissions: inalterados
--
-- SEGURANÇA:
--   A função já tem guard: IF signup_context = 'empresa' → RETURN NEW
--   Então empresa signups não criam candidate records.
--   A função usa SET LOCAL row_security = off (SECURITY DEFINER).
--   ON CONFLICT DO NOTHING garante idempotência.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. (Re)criar trigger trg_bootstrap_candidate_from_auth_user
--    Garante que candidate provisioning aconteça em auth.users AFTER INSERT
--    para todo signup_context que NÃO seja 'empresa'
-- =============================================================================

DROP TRIGGER IF EXISTS trg_bootstrap_candidate_from_auth_user ON auth.users;

CREATE TRIGGER trg_bootstrap_candidate_from_auth_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.bootstrap_candidate_from_auth_user();

-- =============================================================================
-- 2. Re-grant da função para garantir permissão de execução
--    (idempotente — já estava concedido, reforçando)
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_from_auth_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_from_auth_user() TO service_role;

COMMIT;
