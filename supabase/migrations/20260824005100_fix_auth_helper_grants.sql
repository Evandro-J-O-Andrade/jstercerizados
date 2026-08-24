-- =============================================================================
-- V2.1 — Security Fix: Restore EXECUTE grants for authorization helpers
-- Data: 2026-08-24
-- Empresa: J&S Empregos LTDA
-- Escopo: Correção de regressão de segurança após hardening
-- Ordem: 51
-- Dependencies: 20260824_*_security_hardening (revogou EXECUTE de authenticated)
-- =============================================================================
-- Propósito:
--   Restaurar GRANT EXECUTE para authenticated nas funções de autorização
--   que são usadas pelo AuthContext/RLS, sem reverter o hardening completo.
--
-- Contexto:
--   O checkpoint de segurança revogou EXECUTE de authenticated para:
--   - is_admin_master()
--   - is_tenant_member(uuid)
--   - user_tenant_ids()
--   - user_has_permission(...)
--   - user_permissions(...)
--
--   Isso quebrou o carregamento do AuthContext no frontend:
--   loadAuthData() → 403 permission denied for function is_admin_master
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. GRANT EXECUTE para authenticated nas funções de autorização
-- =============================================================================
-- Nota: GRANT EXECUTE ON FUNCTION exige a assinatura EXATA.

GRANT EXECUTE ON FUNCTION public.is_admin_master() TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.user_tenant_ids() TO authenticated;

GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text, uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.user_permissions(uuid, uuid) TO authenticated;

-- =============================================================================
-- 2. VALIDAÇÃO
-- =============================================================================
-- Verifica que authenticated consegue executar as funções.
-- Não expõe dados sensíveis.

DO $$
BEGIN
  -- Validar que as funções são executáveis por authenticated
  ASSERT (
    SELECT count(*) FROM information_schema.routine_privileges
    WHERE routine_schema = 'public'
      AND routine_name IN (
        'is_admin_master',
        'is_tenant_member',
        'user_tenant_ids',
        'user_has_permission',
        'user_permissions'
      )
      AND grantee = 'authenticated'
      AND privilege_type = 'EXECUTE'
  ) >= 5, 'Nem todas as funções de autorização estão acessíveis para authenticated';

  -- Validar que as funções continuam SECURITY DEFINER
  ASSERT (
    SELECT count(*) FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN (
        'is_admin_master',
        'is_tenant_member',
        'user_tenant_ids',
        'user_has_permission',
        'user_permissions'
      )
      AND security_type = 'DEFINER'
  ) >= 5, 'Alguma função de autorização perdeu SECURITY DEFINER';
END $$;

-- =============================================================================
-- 3. COMENTÁRIOS
-- =============================================================================

COMMENT ON FUNCTION public.is_admin_master() IS 'Função de autorização: retorna true se auth.uid() for admin_master. Acessível por authenticated via GRANT EXECUTE.';
COMMENT ON FUNCTION public.is_tenant_member(uuid) IS 'Função de autorização: retorna true se auth.uid() for membro do tenant. Acessível por authenticated via GRANT EXECUTE.';
COMMENT ON FUNCTION public.user_tenant_ids() IS 'Função de autorização: retorna tenant_ids do usuário autenticado. Acessível por authenticated via GRANT EXECUTE.';
COMMENT ON FUNCTION public.user_has_permission(uuid, text, text, uuid) IS 'Função de autorização: verifica permissão do usuário. Acessível por authenticated via GRANT EXECUTE.';
COMMENT ON FUNCTION public.user_permissions(uuid, uuid, text, text, text) IS 'Função de autorização: lista permissões do usuário. Acessível por authenticated via GRANT EXECUTE.';

-- =============================================================================
-- 4. MARCAÇÃO DE AUDITORIA
-- =============================================================================
-- Esta migration é idempotente e não destrutiva.
-- Apenas restaura GRANTs removidos pelo hardening de segurança.
-- Não altera lógica, tabelas ou dados.
-- Referência: docs/V21-RBAC-RECRUITMENT-AUDIT.md

COMMIT;
