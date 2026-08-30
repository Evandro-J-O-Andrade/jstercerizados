-- =============================================================================
-- FASE 0 — Auth: sincronizar auth.users → people automaticamente
-- =============================================================================
-- Garante que todo usuário autenticado no Supabase tenha um registro em people
-- e, no caso de candidatos, também receba tenant_membership + candidate.
-- =============================================================================

-- 1. Function: handle_new_auth_user()
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
declare
  v_meta jsonb;
  v_full_name text;
  v_email text;
begin
  v_meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_email := new.email;

  v_full_name := v_meta ->> 'full_name';
  if v_full_name is null or v_full_name = '' then
    v_full_name := v_meta ->> 'name';
  end if;
  if v_full_name is null or v_full_name = '' then
    v_full_name := split_part(v_email, '@', 1);
  end if;

  if exists (select 1 from public.people where auth_user_id = new.id) then
    update public.people
    set email = v_email,
        full_name = v_full_name
    where auth_user_id = new.id
      and (email is distinct from v_email
           or full_name is distinct from v_full_name);
  else
    insert into public.people (id, auth_user_id, full_name, email, status)
    values (
      gen_random_uuid(),
      new.id,
      v_full_name,
      v_email,
      'active'
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- 2. Function: handle_auth_user_updated()
create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.email is distinct from old.email then
    update public.people
    set email = new.email
    where auth_user_id = new.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_updated
  after update of email on auth.users
  for each row
  execute function public.handle_auth_user_updated();

-- 3. Function: handle_auth_user_deleted()
create or replace function public.handle_auth_user_deleted()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.people
  set auth_user_id = null
  where auth_user_id = old.id;

  return old;
end;
$$;

create trigger on_auth_user_deleted
  after delete on auth.users
  for each row
  execute function public.handle_auth_user_deleted();
