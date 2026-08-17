-- =============================================================================
-- GATE-DATA-04.016 — SECURITY FIX: Resolve RLS infinite recursion on role_assignments + roles
-- =============================================================================
-- Issue:
--   Original policies in 007 created infinite recursion:
--     roles policy → queries role_assignments → role_assignments policy
--     recursion
--
-- Fix:
--   1. Force drop ALL policies on both tables via DO block
--   2. Create SECURITY DEFINER helper functions
--   3. Recreate clean policies (no cross-table recursion)
-- ============================================================================="

-- -----------------------------------------------------------------------------
-- Step 1: Force drop ALL policies on role_assignments
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN
    SELECT polname FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'role_assignments' AND n.nspname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON public.role_assignments', policy_name);
  END LOOP;
END $$;

-- Force drop ALL policies on roles
DO $$
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN
    SELECT polname FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'roles' AND n.nspname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON public.roles', policy_name);
    RAISE NOTICE 'Dropped role policy: %', policy_name;
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- Step 2: Create helper functions (SECURITY DEFINER bypasses RLS)
-- -----------------------------------------------------------------------------

-- Check if current user is admin_master (global role)
create or replace function public.is_admin_master(auth_uid uuid default auth.uid())
returns boolean as $$
  select exists (
    select 1
    from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = $1
      and r.name = 'admin_master'
      and r.is_global = true
  )
$$ language sql security definer stable;

-- Check if current user can manage a specific role assignment
create or replace function public.can_manage_role_assignment(
  target_tenant_id uuid default null
)
returns boolean as $$
  select exists (
    select 1 from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = auth.uid()
      and r.name = 'admin_master'
      and r.is_global = true
    union all
    select 1 from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = auth.uid()
      and r.name = 'tenant_admin'
      and r.is_global = false
      and ra.tenant_id = can_manage_role_assignment.target_tenant_id
  )
$$ language sql security definer stable;

-- -----------------------------------------------------------------------------
-- Step 3: Recreate clean policies using helper functions (no recursion)
-- -----------------------------------------------------------------------------

create policy "role_assignments_select"
  on public.role_assignments for select
  using (
    person_id in (select id from public.people where auth_user_id = auth.uid())
    or is_admin_master()
    or auth.role() = 'service_role'
  );

create policy "role_assignments_manage"
  on public.role_assignments for all
  using (
    is_admin_master()
    or can_manage_role_assignment(role_assignments.tenant_id)
    or auth.role() = 'service_role'
  )
  with check (
    is_admin_master()
    or can_manage_role_assignment(null::uuid)
    or auth.role() = 'service_role'
  );

-- Ensure RLS is enabled
alter table public.role_assignments force row level security;

-- -----------------------------------------------------------------------------
-- Step 4: Recreate clean policies on roles (no recursion via role_assignments)
-- -----------------------------------------------------------------------------
-- Roles SELECT: any authenticated user can read (roles are not sensitive)
create policy "roles_select"
  on public.roles for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Roles MANAGE: only admin_master can manage roles (via helper function)
create policy "roles_manage"
  on public.roles for all
  using (
    is_admin_master()
    or auth.role() = 'service_role'
  )
  with check (
    is_admin_master()
    or auth.role() = 'service_role'
  );

-- Ensure RLS is enabled
alter table public.roles force row level security;
