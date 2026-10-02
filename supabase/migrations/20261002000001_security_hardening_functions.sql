-- =============================================================================
-- J&S Empregos LTDA
-- Migration: 20261002000001_security_hardening_functions.sql
--
-- OBJETIVO:
--   Restringir funções SECURITY DEFINER de escrita que estão expostas
--   para 'authenticated' ou 'anon'. Estas funções aceitam parâmetros
--   arbitrários e podem provocar escalada de privilégios.
--
-- FUNÇÕES AFETADAS:
--   1. bootstrap_candidate_identity()  — grant REVOKE de authenticated
--      Esta função aceita (p_person_id, p_full_name, p_email, p_tenant_id, p_role_id)
--      e cria tenant_memberships, role_assignments, candidates, first_login_state.
--      NÃO deve ser chamada diretamente por usuários autenticados.
--      O gatilhador trg_bootstrap_candidate_from_auth_user chama a versão
--      sem parâmetros (bootstrap_candidate_from_auth_user()), que é diferente.
--
--   2. bootstrap_company_from_auth_user() — verificar grant
--      Esta função provisiona empresas a partir de auth.users.
--      Deve ser restrita a 'service_role' e 'postgres'.
--
--   3. set_primary_media() — já restrita (conferir)
--      Esta função já foi restringida em 20260902000003_03_cms_media.sql.
--
--   4. repair_candidate_chain() — já restrita (conferir)
--      Utilitária manual, já restringida a service_role.
--
-- PRESERVADO:
--   - Funções de leitura (is_admin_master, user_has_permission, etc.) mantêm
--     grants existentes para 'authenticated' pois são read-only utilities.
--   - Schema, tabelas, RLS, roles, permissions: inalterados.
--
-- SEGURANÇA:
--   Após esta migration, apenas service_role e postgres podem executar
--   funções de provisionamento/escrita. Usuários autenticados continuam
--   com acesso às funções de leitura via RLS e grants existentes.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. Restringir bootstrap_candidate_identity() — revogar de authenticated
--    Esta é uma função de provisionamento manual com parâmetros arbitrários.
--    A trigger AFTER INSERT em auth.users usa
--    bootstrap_candidate_from_auth_user() (sem parâmetros), que NÃO é afetada.
-- =============================================================================

REVOKE ALL ON FUNCTION public.bootstrap_candidate_identity(
  uuid, text, text, uuid, uuid
) FROM authenticated;

REVOKE ALL ON FUNCTION public.bootstrap_candidate_identity(
  uuid, text, text, text, uuid, uuid
) FROM authenticated;

-- Garantir que service_role e postgres mantenham acesso
GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(
  uuid, text, text, uuid, uuid
) TO service_role;

GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(
  uuid, text, text, text, uuid, uuid
) TO service_role;

GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(
  uuid, text, text, uuid, uuid
) TO postgres;

GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(
  uuid, text, text, text, uuid, uuid
) TO postgres;

-- =============================================================================
-- 2. Verificar bootstrap_company_from_auth_user() — restringir se necessário
--    Esta função é chamada via trigger, não deve ser chmada diretamente.
-- =============================================================================

REVOKE ALL ON FUNCTION public.bootstrap_company_from_auth_user() FROM authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_company_from_auth_user() FROM anon;

GRANT EXECUTE ON FUNCTION public.bootstrap_company_from_auth_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.bootstrap_company_from_auth_user() TO postgres;

-- =============================================================================
-- 3. Conferir set_primary_media() — restrita a service_role
--    (já foi restrita em migration anterior, reforçando)
-- =============================================================================

REVOKE ALL ON FUNCTION public.set_primary_media(text, uuid, uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.set_primary_media(text, uuid, uuid) FROM anon;

GRANT EXECUTE ON FUNCTION public.set_primary_media(text, uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_primary_media(text, uuid, uuid) TO postgres;

-- =============================================================================
-- 4. Conferir repair_candidate_chain() — restrita a service_role
--    (já foi restrita em migration anterior, reforçando)
-- =============================================================================

REVOKE ALL ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) FROM anon;

GRANT EXECUTE ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) TO postgres;

-- =============================================================================
-- 5. AUDIT: Verificar search_path em funções SECURITY DEFINER
--    O search_path deve incluir 'public' para acesso a tabelas do schema
--    público. Funções definidas com search_path default podem ter
--    comportamento imprevisível.
-- =============================================================================

-- Forçar search_path em funções de provisioning
ALTER FUNCTION public.bootstrap_candidate_from_auth_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.bootstrap_company_from_auth_user() SET search_path = public, pg_temp;

-- =============================================================================
-- ASSERTION: Verificar que as funções de leitura ainda estão disponíveis
-- para authenticated (não devemos bloquear is_admin_master, user_has_permission, etc.)
-- =============================================================================

-- is_admin_master: mantição GRANT (read-only)
-- user_has_permission: mantição GRANT (read-only)
-- has_permission: mantição GRANT (read-only)

COMMIT;
