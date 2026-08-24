-- =============================================================================
-- V2.1 — Fix RLS helper: is_tenant_member auth mapping + GRANT
-- Data: 2026-08-24
-- Empresa: J&S Empregos LTDA
-- Escopo: Correção da função `is_tenant_member` para usar `people.auth_user_id`
-- Ordem: 00
-- Dependencies: 012_rls_consolidation
-- =============================================================================
-- Propósito:
--   A função `is_tenant_member` estava comparando `tenant_memberships.person_id`
--   diretamente com `auth.uid()`, mas `auth.uid()` retorna o UUID do Auth, enquanto
--   `person_id` é o UUID da pessoa em `people`. Esta migration corrige o join
--   para passar por `people.auth_user_id` e garante GRANT para `authenticated`.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.people p
    JOIN public.tenant_memberships tm ON tm.person_id = p.id
    WHERE p.auth_user_id = auth.uid()
      AND tm.tenant_id = p_tenant_id
      AND tm.status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated;
