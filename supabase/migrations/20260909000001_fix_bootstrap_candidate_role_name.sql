-- =============================================================================
-- CORREÇÃO CONTROLADA — BOOTSTRAP DA ROLE `candidato`
-- =============================================================================
-- Motivo:
--   A função bootstrap_candidate_from_auth_user() (trigger em auth.users) procura:
--
--       where r.name = 'candidate'
--
--   mas a role canônica existente no banco é:
--
--       candidato
--       scope = tenant
--       status = active
--
--   Resultado: role_assignments nunca é criado para novos candidatos.
--
-- Correção:
--   Substituir apenas a referência incorreta por 'candidato'.
--
-- Preservado:
--   - SECURITY DEFINER
--   - search_path
--   - tenant behavior
--   - idempotência
--   - tratamento de usuário/People/Candidate já existente
--   - prevenção de role_assignment duplicado
--   - retorno atual
--   - mensagens de erro (exceto a referência corrigida)
--   - bootstrap_candidate_identity() NÃO é alterada
--   - roles, permissions, RLS, tabelas, constraints NÃO são alteradas
--   - migration histórica NÃO é restaurada
--
-- Esta migration é nova e incremental. Não edita migrations históricas.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.bootstrap_candidate_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
declare
  v_tenant_id uuid;
  v_person_id uuid;
  v_candidate_role_id uuid;
begin
  SET LOCAL row_security = off;

  select t.id into v_tenant_id
  from public.tenants t
  where t.slug = 'js-empregos'
  limit 1;

  if v_tenant_id is null then
    raise exception 'candidate tenant js-empregos not configured';
  end if;

  if nullif(trim(coalesce(new.email, '')), '') is null then
    raise exception 'candidate email is required';
  end if;

  if nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '') is null then
    raise exception 'candidate full name is required';
  end if;

  select p.id into v_person_id
  from public.people p
  where p.auth_user_id = new.id
  limit 1;

  if v_person_id is null then
    insert into public.people (auth_user_id, full_name, email, phone, status)
    values (
      new.id,
      trim(new.raw_user_meta_data ->> 'full_name'),
      lower(trim(new.email)),
      nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
      'active'
    )
    returning id into v_person_id;
  end if;

  insert into public.tenant_memberships (person_id, tenant_id, status, joined_at)
  values (v_person_id, v_tenant_id, 'active', now())
  on conflict (person_id, tenant_id) do nothing;

  insert into public.first_login_state (person_id, must_change_password, first_login_completed)
  values (v_person_id, true, false)
  on conflict (person_id) do nothing;

  insert into public.candidates (person_id, tenant_id, status)
  values (v_person_id, v_tenant_id, 'active')
  on conflict (person_id, tenant_id) do nothing;

  -- CORREÇÃO: role canônica é 'candidato' (não 'candidate')
  select r.id into v_candidate_role_id
  from public.roles r
  where r.name = 'candidato'
  limit 1;

  if v_candidate_role_id is not null then
    insert into public.role_assignments (person_id, role_id, tenant_id, assigned_at, created_at)
    values (v_person_id, v_candidate_role_id, v_tenant_id, now(), now())
    on conflict (person_id, role_id, tenant_id) do nothing;
  end if;

  return new;
end;
$function$;

-- Re-grant para segurança (idempotente)
GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_from_auth_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_from_auth_user() TO service_role;

COMMIT;