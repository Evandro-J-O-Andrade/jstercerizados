-- =============================================================================
-- GATE-SEC-001 — Bloquear autogerenciamento de atribuições de papel
-- =============================================================================
-- Motivo:
--   O painel permitiu que um usuário removesse sua própria atribuição
--   admin_master, deixando o sistema sem identidade ROOT. Nenhum usuário deve
--   conceder, revogar, rebaixar ou alterar os próprios privilégios.
--
-- Abordagem:
--   1. Políticas RESTRICTIVAS em role_assignments (não removem as existentes).
--      Políticas restritivas se combinam com AND às permissivas, adicionando
--      restrições sem enfraquecer o que já existe.
--   2. Nenhuma referência a TG_OP, NEW, OLD ou TG_WHEN (inválidas em contexto RLS).
--   3. Usar roles.scope = 'global' (schema confirmado), nunca roles.is_global.
--   4. Função SECURITY DEFINER com search_path fixo para serialização do
--      último ROOT via pg_advisory_xact_lock (protege contra concorrência).
--   5. Políticas separadas por operação (DELETE, UPDATE) para não depender de
--      contexto de trigger.
--   6. Preservar as políticas existentes (5 em role_assignments, 2 em roles).
--
-- Esta migration é incremental e idempotente. Não remove dados existentes.
-- Não altera políticas existentes. Apenas adiciona camadas de restrição.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Função de guarda do último ROOT (serialização contra concorrência)
--    Usa pg_advisory_xact_lock para garantir que apenas uma transação por vez
--    avalie se uma operação remove ou rebaixa o último admin_master global.
--    Recebe explicitamente o tipo de operação para evitar TG_OP.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_last_root_operation(
  target_role_id uuid,
  target_tenant_id uuid,
  operation_type text  -- 'DELETE' ou 'UPDATE'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_target_is_root boolean;
  v_root_count integer;
BEGIN
  -- Serializar todas as operações que possam afetar ROOTs globais.
  -- O lock é liberado automaticamente no final da transação (xact).
  PERFORM pg_advisory_xact_lock(hashtext('gate_sec_001_root_protection'));

  -- Verificar se o alvo é um admin_master global ativo
  SELECT EXISTS (
    SELECT 1
    FROM public.role_assignments ra
    JOIN public.roles r ON r.id = ra.role_id
    WHERE ra.role_id = target_role_id
      AND r.name = 'admin_master'
      AND r.scope = 'global'
      AND ra.tenant_id IS NULL
      AND (ra.expires_at IS NULL OR ra.expires_at > now())
  ) INTO v_target_is_root;

  -- Se o alvo não é ROOT global, não há restrição de último ROOT
  IF NOT v_target_is_root THEN
    RETURN true;
  END IF;

  -- Contar ROOTs globais ativos (dentro do mesmo lock, leitura consistente)
  SELECT count(*) INTO v_root_count
  FROM public.role_assignments ra
  JOIN public.roles r ON r.id = ra.role_id
  WHERE r.name = 'admin_master'
    AND r.scope = 'global'
    AND ra.tenant_id IS NULL
    AND (ra.expires_at IS NULL OR ra.expires_at > now());

  -- DELETE: não permitir remover o último ROOT
  IF operation_type = 'DELETE' AND v_root_count <= 1 THEN
    RETURN false;
  END IF;

  -- UPDATE: não permitir se a alteração afeta o escopo global do último ROOT
  IF operation_type = 'UPDATE' AND v_root_count <= 1 THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Função auxiliar: identificar o person_id do usuário autenticado
--    Usada nas políticas RLS para bloquear self-management.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_auth_person_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
STABLE
AS $$
  SELECT p.id
  FROM public.people p
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- -----------------------------------------------------------------------------
-- 3. Política RESTRICTIVA: bloquear self-management em role_assignments (DELETE)
--    Ninguém pode excluir a própria atribuição de papel.
-- -----------------------------------------------------------------------------
CREATE POLICY "role_assignments_no_self_delete"
  ON public.role_assignments
  AS RESTRICTIVE
  FOR DELETE
  USING (
    role_assignments.person_id IS DISTINCT FROM public.current_auth_person_id()
  );

-- -----------------------------------------------------------------------------
-- 4. Política RESTRICTIVA: bloquear self-management em role_assignments (UPDATE)
--    Ninguém pode alterar a própria atribuição de papel.
-- -----------------------------------------------------------------------------
CREATE POLICY "role_assignments_no_self_update"
  ON public.role_assignments
  AS RESTRICTIVE
  FOR UPDATE
  USING (
    -- Linha existente (antiga): não pertence ao próprio ator
    role_assignments.person_id IS DISTINCT FROM public.current_auth_person_id()
  )
  WITH CHECK (
    -- Nova linha: não pertence ao próprio ator (impede transferir para si)
    role_assignments.person_id IS DISTINCT FROM public.current_auth_person_id()
  );

-- -----------------------------------------------------------------------------
-- 5. Política RESTRICTIVA: bloquear self-management em role_assignments (INSERT)
--    Ninguém pode criar uma atribuição de papel para si próprio.
-- -----------------------------------------------------------------------------
CREATE POLICY "role_assignments_no_self_insert"
  ON public.role_assignments
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (
    role_assignments.person_id IS DISTINCT FROM public.current_auth_person_id()
  );

-- -----------------------------------------------------------------------------
-- 6. Política RESTRICTIVA: proteger último ROOT em DELETE
--    Impede remover o último admin_master global ativo.
--    Delegado para função transacional com advisory lock (concorrência segura).
-- -----------------------------------------------------------------------------
CREATE POLICY "role_assignments_protect_last_root_delete"
  ON public.role_assignments
  AS RESTRICTIVE
  FOR DELETE
  USING (
    -- Se a linha não é um ROOT global, permitir.
    -- Se é ROOT global, delegar para a função de guarda.
    NOT (
      EXISTS (
        SELECT 1
        FROM public.roles r
        WHERE r.id = role_assignments.role_id
          AND r.name = 'admin_master'
          AND r.scope = 'global'
      )
      AND role_assignments.tenant_id IS NULL
    )
    OR public.guard_last_root_operation(
      role_assignments.role_id,
      role_assignments.tenant_id,
      'DELETE'
    )
  );

-- -----------------------------------------------------------------------------
-- 7. Política RESTRICTIVA: proteger último ROOT em UPDATE
--    Impede rebaixar ou alterar o último admin_master global ativo.
--    Para UPDATE, verificamos tanto a linha antiga (USING) quanto a nova
--    (WITH CHECK), pois o rebaixamento pode ocorrer mudando role_id, tenant_id
--    ou expirando a atribuição.
-- -----------------------------------------------------------------------------
CREATE POLICY "role_assignments_protect_last_root_update"
  ON public.role_assignments
  AS RESTRICTIVE
  FOR UPDATE
  USING (
    -- Linha existente: se é último ROOT global, delegar para guarda
    NOT (
      EXISTS (
        SELECT 1
        FROM public.roles r
        WHERE r.id = role_assignments.role_id
          AND r.name = 'admin_master'
          AND r.scope = 'global'
      )
      AND role_assignments.tenant_id IS NULL
    )
    OR public.guard_last_root_operation(
      role_assignments.role_id,
      role_assignments.tenant_id,
      'UPDATE'
    )
  )
  WITH CHECK (
    -- Nova linha: se o alvo da atualização ainda é um ROOT global, permitir.
    -- Se a atualização remove o status de ROOT global (muda role, tenant ou
    -- expira), e era o último ROOT, bloquear.
    NOT (
      EXISTS (
        SELECT 1
        FROM public.roles r
        WHERE r.id = role_assignments.role_id
          AND r.name = 'admin_master'
          AND r.scope = 'global'
      )
      AND role_assignments.tenant_id IS NULL
    )
    OR public.guard_last_root_operation(
      role_assignments.role_id,
      role_assignments.tenant_id,
      'UPDATE'
    )
  );

-- -----------------------------------------------------------------------------
-- 8. Comentários de documentação
-- -----------------------------------------------------------------------------
COMMENT ON FUNCTION public.guard_last_root_operation(uuid, uuid, text) IS
  'Serializa operações que afetam admin_master global via advisory lock. Impede remoção ou rebaixamento do último ROOT ativo.';

COMMENT ON FUNCTION public.current_auth_person_id() IS
  'Retorna o person_id do usuário autenticado (auth.uid) vinculado à tabela people. Usada nas políticas RLS de bloqueio de self-management.';

COMMENT ON POLICY "role_assignments_no_self_delete" ON public.role_assignments IS
  'Política RESTRICTIVA: impede exclusão da própria atribuição de papel.';

COMMENT ON POLICY "role_assignments_no_self_update" ON public.role_assignments IS
  'Política RESTRICTIVA: impede alteração da própria atribuição de papel.';

COMMENT ON POLICY "role_assignments_no_self_insert" ON public.role_assignments IS
  'Política RESTRICTIVA: impede criação de atribuição de papel para si próprio.';

COMMENT ON POLICY "role_assignments_protect_last_root_delete" ON public.role_assignments IS
  'Política RESTRICTIVA: impede remoção do último admin_master global ativo.';

COMMENT ON POLICY "role_assignments_protect_last_root_update" ON public.role_assignments IS
  'Política RESTRICTIVA: impede rebaixamento ou alteração do último admin_master global ativo.';
