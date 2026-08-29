-- 22_candidate_auth_bootstrap.sql
-- Bootstrap candidate domain identity when Supabase Auth creates a user.
-- This is required when email confirmation is enabled and signUp() returns no session.

create or replace function public.bootstrap_candidate_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tenant_id uuid;
  v_person_id uuid;
begin
  set local row_security = off;

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

  return new;
end;
$$;

drop trigger if exists trg_bootstrap_candidate_from_auth_user on auth.users;

create trigger trg_bootstrap_candidate_from_auth_user
after insert on auth.users
for each row
execute function public.bootstrap_candidate_from_auth_user();

revoke execute on function public.bootstrap_candidate_from_auth_user() from public, anon, authenticated;
grant execute on function public.bootstrap_candidate_from_auth_user() to service_role;
