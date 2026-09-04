-- =========================================================================
-- Fix RLS alignment: public.services writes -> service_orders permissions
-- Data: 2026-09-03
-- Origem: docs/MATRIZ-DASHBOARD-DB-CRUD-RBAC-2026-09-03.md (P0 / B1)
--
-- PROBLEMA
-- A policy `services_member_write` exige
--   p.resource = 'services' AND p.action IN ('create','update','delete')
-- mas em public.permissions NÃO existem permissões com resource='services'
-- (somente service_orders.*). Resultado: ninguém consegue inserir/atualizar/
-- excluir em public.services via PostgREST, nem admin_master.
--
-- DECISÃO (usuário, opção 1)
-- Alinhar a policy com o contrato de permissões já consolidado no
-- Registry, App.tsx, repositories e demais policies relacionadas: usar
-- `resource = 'service_orders'` com `action IN ('create','update','delete')`.
-- Não destrutivo: não altera dados nem cria permissões `services.*`.
--
-- SEGURANÇA
-- - DROP apenas da policy alvo `services_member_write`.
-- - As policies `services_member_read`, `services_member_update` e
--   `services_public_read` permanecem intactas.
-- - Operação idempotente: se a policy já estiver com a expressão corrigida,
--   ela é recriada igual. Se não existir, falha explicitamente.
-- =========================================================================

begin;

do $$
declare
  v_old_using text;
  v_old_check text;
  v_expected  text := '(is_tenant_member(tenant_id) AND (EXISTS ( SELECT 1'
                  || '   FROM (((role_assignments ra'
                  || '     JOIN role_permissions rp ON ((rp.role_id = ra.role_id)))'
                  || '     JOIN permissions p ON ((p.id = rp.permission_id)))'
                  || '     JOIN people pe ON ((pe.id = ra.person_id)))'
                  || '  WHERE ((pe.auth_user_id = auth.uid()) AND (p.resource = ''service_orders''::text) AND (p.action = ANY (ARRAY[''create''::text, ''update''::text, ''delete''::text]))))))';
begin
  select pg_get_expr(p.polqual, p.polrelid),
         pg_get_expr(p.polwithcheck, p.polrelid)
    into v_old_using, v_old_check
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname = 'services'
     and p.polname = 'services_member_write';

  if v_old_using is null then
    raise exception 'policy services_member_write não encontrada em public.services';
  end if;

  drop policy services_member_write on public.services;

  execute format(
    'create policy services_member_write on public.services '
    || 'as permissive for all to authenticated '
    || 'using %s with check %s',
    v_expected, v_expected
  );

  raise notice 'services_member_write recriada com resource=service_orders';
end $$;

-- Validação: policy deve existir e referenciar 'service_orders'
do $$
declare
  v_using text;
begin
  select pg_get_expr(p.polqual, p.polrelid)
    into v_using
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname = 'services'
     and p.polname = 'services_member_write';

  if v_using is null or position('service_orders' in v_using) = 0 then
    raise exception 'validação falhou: policy não referencia service_orders';
  end if;
end $$;

commit;
