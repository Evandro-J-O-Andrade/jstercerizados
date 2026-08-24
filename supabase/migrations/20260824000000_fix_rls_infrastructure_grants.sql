-- =============================================================================
-- V2.1 — Security hardening fix: restore authenticated EXECUTE for RLS infrastructure
-- Data: 2026-08-24
-- Empresa: J&S Empregos LTDA
-- Escopo: Reverte apenas as funções de infraestrutura de RLS para authenticated
-- Ordem: 00
-- Dependencies: 20260823000200_security_hardening_revoke_execute.sql
-- =============================================================================
-- Propósito:
--   O commit 6da94da revogou EXECUTE de 21 funções SECURITY DEFINER,
--   incluindo funções de infraestrutura de RLS. Isso quebrou o acesso
--   autenticado porque policies RLS dependem dessas funções.
--   Esta migration:
--   1. Corrige is_tenant_member() para usar people.auth_user_id
--   2. Corrige user_tenant_ids() para usar people.auth_user_id
--   3. Garante GRANT EXECUTE para authenticated nas funções de RLS
-- =============================================================================

BEGIN;

-- Fix is_tenant_member: auth.uid() é o usuário Auth, não person_id
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

-- Fix user_tenant_ids: auth.uid() é o usuário Auth, não person_id
CREATE OR REPLACE FUNCTION public.user_tenant_ids()
RETURNS SETOF uuid AS $$
  SELECT tm.tenant_id
  FROM public.tenant_memberships tm
  JOIN public.people p ON p.id = tm.person_id
  WHERE p.auth_user_id = auth.uid()
    AND tm.status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Restore EXECUTE for authenticated on RLS infrastructure functions
GRANT EXECUTE ON FUNCTION public.is_admin_master() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_permissions(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_tenant_ids() TO authenticated;

-- Keep application functions restricted to service_role
-- (no grant to authenticated/anonymous for backend-only functions)

COMMIT;
