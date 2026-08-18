-- =============================================================================
-- GATE-DATA-04.002 — IDENTITY: auth.users ↔ people synchronization
-- =============================================================================
-- Entity: people.auth_user_id (optional FK to auth.users)
-- Schema: public
-- Order: 2
-- =============================================================================
-- Purpose:
--   Automatically create/synchronize the business entity (people) when a user
--   registers via Supabase Auth, maintaining a strict 1:1 relationship.
--
-- Rules (per GATE-DATA-03 §1.0 Portability):
--   - auth.users is infrastructure; people is business entity
--   - No external API calls in this trigger (no WhatsApp/n8n/email)
--   - Function must be idempotent: never duplicate people for same auth_user_id
--   - No table profiles is created
--
-- Design:
--   auth.users
--        │ INSERT
--        ▼
--   trigger on_auth_user_created
--        │
--        ▼
--   function handle_new_auth_user()
--        │
--        ├── person exists for auth_user_id? → preserve, update email
--        └── person does not exist?           → create with name/email
--        │
--        ▼
--   people
--     ├── id           UUID próprio (gen_random_uuid())
--     ├── auth_user_id = NEW.auth.users.id (UNIQUE → 1:1 garantido)
--     ├── full_name    (do raw_user_meta ou email prefix)
--     ├── email        (sincronizado com auth.users.email)
--     └── status       default 'active'
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Function: handle_new_auth_user()
--    Triggered AFTER INSERT on auth.users
--    Creates or preserves the corresponding people record
-- -----------------------------------------------------------------------------

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
  -- Extract metadata from auth.users (raw_user_meta / raw_app_meta)
  v_meta := coalesce(new.raw_user_meta, '{}'::jsonb);
  v_email := new.email;

  -- Determine name: prefer full_name from metadata, fallback to email prefix
  v_full_name := v_meta ->> 'full_name';
  if v_full_name is null or v_full_name = '' then
    v_full_name := v_meta ->> 'name';
  end if;
  if v_full_name is null or v_full_name = '' then
    v_full_name := split_part(v_email, '@', 1);
  end if;

  -- Idempotent: check if people already exists for this auth.uid
  -- This prevents duplicates if trigger fires multiple times
  if exists (select 1 from public.people where auth_user_id = new.id) then
    -- Person exists — update email/name if changed (controlled sync)
    update public.people
    set email = v_email,
        full_name = v_full_name
    where auth_user_id = new.id
      and (email is distinct from v_email
           or full_name is distinct from v_full_name);
  else
    -- Person does not exist — create new business entity
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

-- -----------------------------------------------------------------------------
-- 2. Trigger: on_auth_user_created
--    Fires AFTER INSERT on auth.users
-- -----------------------------------------------------------------------------
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- 3. Trigger: on_auth_user_updated
--    Keeps people.email in sync if auth.users.email changes
--    NOTE: Does NOT overwrite people.full_name from auth metadata on updates
--    (name is business data — only set at creation)
-- -----------------------------------------------------------------------------
create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only sync email; preserve business-controlled fields
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

-- -----------------------------------------------------------------------------
-- 4. Cleanup: handle_deleted_auth_user
--    Preserves people record but clears the auth link
--    (person can still exist without auth — e.g. invited)
-- -----------------------------------------------------------------------------
create or replace function public.handle_auth_user_deleted()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Clear auth_user_id so person becomes unlinked (not deleted)
  -- This preserves business data if auth user is removed
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
