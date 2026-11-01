-- =============================================================================
-- TESTES DE REVISÃO — GATE-SEC-001 (SOMENTE DOCUMENTAÇÃO, NÃO EXECUTAR)
-- =============================================================================
-- Estes testes documentam o comportamento esperado das políticas RLS criadas
-- pela migration 20261031000001_block_self_role_management.sql.
--
-- NÃO EXECUTAR no banco remoto sem ambiente de teste isolado e autorização.
-- Cada caso deve ser validado em um tenant de teste com usuários separados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CENÁRIO 1: Usuário comum não consegue se promover
-- -----------------------------------------------------------------------------
-- Usuário comum (não admin_master) tenta INSERT de atribuição admin_master
-- para si mesmo.
-- Esperado: NEGADO pela política role_assignments_no_self_insert
--   WITH CHECK: person_id IS DISTINCT FROM current_auth_person_id() → false

-- Usuário comum tenta UPDATE na própria atribuição para mudar role
-- Esperado: NEGADO pelas políticas role_assignments_no_self_update
--   USING: person_id (antigo) = current_auth_person_id() → false (bloqueado)

-- -----------------------------------------------------------------------------
-- CENÁRIO 2: Usuário não consegue alterar ou excluir a própria atribuição
-- -----------------------------------------------------------------------------
-- Usuário qualquer tenta DELETE na própria atribuição
-- Esperado: NEGADO pela política role_assignments_no_self_delete
--   USING: person_id = current_auth_person_id() → false (bloqueado)

-- Usuário qualquer tenta UPDATE na própria atribuição
-- Esperado: NEGADO pela política role_assignments_no_self_update
--   USING + WITH CHECK: ambos bloqueiam

-- -----------------------------------------------------------------------------
-- CENÁRIO 3: admin_master pode administrar terceiros conforme seu escopo
-- -----------------------------------------------------------------------------
-- admin_master (global) tenta INSERT de atribuição para outra pessoa
-- Esperado: PERMITIDO (não é self-management, não é último ROOT sendo removido)

-- admin_master (global) tenta UPDATE de atribuição de outro usuário
-- Esperado: PERMITIDO (políticas permissivas existentes + não é self-management)

-- admin_master (global) tenta DELETE de atribuição de outro usuário (não ROOT)
-- Esperado: PERMITIDO (não é último ROOT)

-- -----------------------------------------------------------------------------
-- CENÁRIO 4: Administrador de tenant não consegue atribuir ROOT global
-- -----------------------------------------------------------------------------
-- tenant_admin tenta INSERT de atribuição admin_master com scope global
-- Esperado: NEGADO (políticas existentes de roles_manage ou role_assignments
--   não permitem tenant_admin criar atribuições global)

-- tenant_admin tenta UPDATE para mudar role de usuário para admin_master global
-- Esperado: NEGADO

-- -----------------------------------------------------------------------------
-- CENÁRIO 5: O último ROOT não pode ser removido nem rebaixado
-- -----------------------------------------------------------------------------
-- Quando existe exatamente 1 admin_master global ativo:
--   DELETE dessa atribuição → NEGADO por role_assignments_protect_last_root_delete
--     USING: guard_last_root_operation(...) → false (v_root_count <= 1)
--
--   UPDATE para mudar role_id dessa atribuição → NEGADO por
--     role_assignments_protect_last_root_update
--     USING: linha antiga é último ROOT → guard → false
--     WITH CHECK: nova linha não é mais ROOT global, mas a linha antiga era
--       último ROOT → bloqueado pelo USING
--
--   UPDATE para mudar tenant_id de NULL para um tenant → NEGADO
--     (mesma lógica acima)
--
--   UPDATE para definir expires_at no passado → NEGADO
--     (mesma lógica acima)

-- -----------------------------------------------------------------------------
-- CENÁRIO 6: Operações concorrentes não removem todos os ROOTs
-- -----------------------------------------------------------------------------
-- Quando existem exatamente 2 admin_master globais ativos:
--   Transação A: DELETE do ROOT 1 → verifica count = 2, permite (ainda resta 1)
--   Transação B: DELETE do ROOT 2 → verifica count = 2, permite (ainda resta 1)
--   
-- Com advisory lock (pg_advisory_xact_lock):
--   A adquire lock, verifica count = 2, inicia DELETE, libera lock no commit
--   B espera o lock, após A commitar, verifica count = 1, BLOQUEIA o DELETE
--   Resultado: pelo menos 1 ROOT permanece
--
-- Esperado: pelo menos um ROOT permanece após operações concorrentes

-- -----------------------------------------------------------------------------
-- CENÁRIO 7: Leitura do próprio perfil continua funcionando
-- -----------------------------------------------------------------------------
-- Usuário comum faz SELECT na própria atribuição
-- Esperado: PERMITIDO (política role_assignments_member_read existente +
--   as políticas RESTRICTIVAS de DELETE/UPDATE/INSERT não afetam SELECT)

-- -----------------------------------------------------------------------------
-- CENÁRIO 8: Isolamento entre tenants continua funcionando
-- -----------------------------------------------------------------------------
-- Usuário do tenant A tenta acessar atribuições do tenant B
-- Esperado: conforme políticas existentes (role_assignments_visibility_guard,
--   role_assignments_admin_scope_guard etc.)

-- -----------------------------------------------------------------------------
-- CENÁRIO 9: service_role mantém acesso esperado
-- -----------------------------------------------------------------------------
-- service_role executa operações administrativas em role_assignments
-- Esperado: PERMITIDO (políticas existentes com auth.role() = 'service_role')
--   As novas políticas RESTRICTIVAS também se aplicam, mas service_role
--   geralmente é tratado como bypass nas políticas permissivas existentes.

-- -----------------------------------------------------------------------------
-- CENÁRIO 10: Políticas anteriores continuam preservadas
-- -----------------------------------------------------------------------------
-- As 7 políticas existentes não foram removidas nem modificadas:
--   role_assignments_admin_delete_guard
--   role_assignments_admin_scope_guard
--   role_assignments_admin_update_guard
--   role_assignments_member_read
--   role_assignments_visibility_guard
--   roles_member_read
--   roles_select
--
-- Esperado: todas continuam ativas e funcionando

-- -----------------------------------------------------------------------------
-- MATRIZ DE TESTES (preencher após execução em ambiente de teste)
-- -----------------------------------------------------------------------------
-- | Caso | Resultado esperado | Resultado real | Status |
-- |------|-------------------|----------------|--------|
-- | 1a: Usuário comum INSERT self admin_master | NEGADO | | NÃO EXECUTADO |
-- | 1b: Usuário comum UPDATE self role | NEGADO | | NÃO EXECUTADO |
-- | 2a: Usuário DELETE self assignment | NEGADO | | NÃO EXECUTADO |
-- | 2b: Usuário UPDATE self assignment | NEGADO | | NÃO EXECUTADO |
-- | 3a: admin_master INSERT third-party | PERMITIDO | | NÃO EXECUTADO |
-- | 3b: admin_master UPDATE third-party | PERMITIDO | | NÃO EXECUTADO |
-- | 4a: tenant_admin INSERT global ROOT | NEGADO | | NÃO EXECUTADO |
-- | 5a: DELETE último ROOT | NEGADO | | NÃO EXECUTADO |
-- | 5b: UPDATE último ROOT (rebaixar) | NEGADO | | NÃO EXECUTADO |
-- | 6a: Concorrência 2 ROOTs → pelo menos 1 permanece | PERMITIDO 1 | | NÃO EXECUTADO |
-- | 7a: SELECT próprio perfil | PERMITIDO | | NÃO EXECUTADO |
-- | 8a: Isolamento tenant A → tenant B | CONFORME ESCOPO | | NÃO EXECUTADO |
-- | 9a: service_role operação admin | PERMITIDO | | NÃO EXECUTADO |
-- | 10a: 7 políticas existentes preservadas | PRESERVADAS | | NÃO EXECUTADO |
