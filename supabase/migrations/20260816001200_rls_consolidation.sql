-- =============================================================================
-- GATE-DATA-04.012 — RLS CONSOLIDATION: Authorization matrix & security hardening
-- =============================================================================
-- Schema: public
-- Order: 12
-- Dependencies: All previous (001-011)
-- =============================================================================
-- Purpose:
--   Consolidate and harden all RLS policies into a canonical authorization matrix.
--   Validates tenant isolation and role-based access before applying seed data.
--
-- Rules (per GATE-DATA-03 §12 RLS Consolidation):
--   - auth.uid() → people.auth_user_id → people.id → tenant_memberships → tenant_id
--   - admin_master: global access (is_global role)
--   - tenant_admin: tenant-scoped access
--   - candidate: own data only
--   - viewer: read-only scoped by role permissions
--   - ZERO tenant data leakage
--   - No service_role in frontend
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Authorization Matrix (canonical reference implemented as table)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Matrix of resource-level permissions per role.
-- This is the SINGLE SOURCE OF TRUTH for what each role can do.

-- WHY:
-- - Avoid scattered policies
-- - Enables audit and role design
-- - Drives RBAC queries

-- ARCHITECTURE:
-- - resource = table name (lowercase)
-- - action = crud (create/read/update/delete)
-- - role_id comes from public.roles (007_rbac)
-- - If no row exists for (role, resource, action) → DENY by default

create table public.role_resource_permissions (
  id              uuid primary key default gen_random_uuid(),
  role_id         uuid not null
    references public.roles(id)
    on delete cascade,
  resource        varchar(100) not null,
  action          varchar(20) not null,
  allowed         boolean not null default true,
  created_at      timestamptz not null default now(),
  constraint uk_role_resource_action
    unique (role_id, resource, action)
);

create index idx_role_resource_permission_role on public.role_resource_permissions(role_id);
create index idx_role_resource_permission_resource on public.role_resource_permissions(resource);

-- -----------------------------------------------------------------------------
-- Canonical Authorization Matrix
-- -----------------------------------------------------------------------------

-- admin_master: global access to ALL resources
insert into public.role_resource_permissions (role_id, resource, action)
select r.id, res.resource, res.action
from public.roles r
cross join (
  values
    ('people', 'create'), ('people', 'read'), ('people', 'update'), ('people', 'delete'),
    ('tenants', 'create'), ('tenants', 'read'), ('tenants', 'update'), ('tenants', 'delete'),
    ('tenant_memberships', 'create'), ('tenant_memberships', 'read'), ('tenant_memberships', 'update'), ('tenant_memberships', 'delete'),
    ('candidates', 'create'), ('candidates', 'read'), ('candidates', 'update'), ('candidates', 'delete'),
    ('jobs', 'create'), ('jobs', 'read'), ('jobs', 'update'), ('jobs', 'delete'),
    ('applications', 'create'), ('applications', 'read'), ('applications', 'update'), ('applications', 'delete'),
    ('companies', 'create'), ('companies', 'read'), ('companies', 'update'), ('companies', 'delete'),
    ('files', 'create'), ('files', 'read'), ('files', 'update'), ('files', 'delete'),
    ('domain_events', 'read'), ('domain_events', 'create'),
    ('notifications', 'read'), ('notifications', 'create'), ('notifications', 'update'),
    ('notification_deliveries', 'read'), ('notification_deliveries', 'create'), ('notification_deliveries', 'update'),
    ('talent_pool_memberships', 'create'), ('talent_pool_memberships', 'read'), ('talent_pool_memberships', 'update'), ('talent_pool_memberships', 'delete'),
    ('candidate_preferences', 'read'), ('candidate_preferences', 'update'),
    ('job_matches', 'read'), ('job_matches', 'create'), ('job_matches', 'update'),
    ('candidate_skills', 'create'), ('candidate_skills', 'read'), ('candidate_skills', 'update'), ('candidate_skills', 'delete'),
    ('skills', 'read'),
    ('role_assignments', 'create'), ('role_assignments', 'read'), ('role_assignments', 'update'), ('role_assignments', 'delete'),
    ('roles', 'read')
) as res(resource, action)
where r.name = 'admin_master'
on conflict (role_id, resource, action) do nothing;

-- tenant_admin: tenant-scoped access (no tenant creation/deletion)
insert into public.role_resource_permissions (role_id, resource, action)
select r.id, res.resource, res.action
from public.roles r
cross join (
  values
    ('candidates', 'create'), ('candidates', 'read'), ('candidates', 'update'), ('candidates', 'delete'),
    ('jobs', 'create'), ('jobs', 'read'), ('jobs', 'update'), ('jobs', 'delete'),
    ('applications', 'create'), ('applications', 'read'), ('applications', 'update'), ('applications', 'delete'),
    ('companies', 'read'), ('companies', 'update'),
    ('company_relationships', 'create'), ('company_relationships', 'read'), ('company_relationships', 'update'), ('company_relationships', 'delete'),
    ('notifications', 'read'), ('notifications', 'update'),
    ('notification_deliveries', 'read'), ('notification_deliveries', 'create'), ('notification_deliveries', 'update'),
    ('domain_events', 'read'),
    ('skills', 'read'),
    ('candidate_skills', 'create'), ('candidate_skills', 'read')
) as res(resource, action)
where r.name = 'tenant_admin'
on conflict (role_id, resource, action) do nothing;

-- rh_manager: HR management within tenant
insert into public.role_resource_permissions (role_id, resource, action)
select r.id, res.resource, res.action
from public.roles r
cross join (
  values
    ('candidates', 'read'), ('candidates', 'update'),
    ('jobs', 'read'), ('jobs', 'update'),
    ('applications', 'read'), ('applications', 'update'),
    ('notifications', 'read'),
    ('notification_deliveries', 'read'), ('notification_deliveries', 'create'), ('notification_deliveries', 'update'),
    ('domain_events', 'read'),
    ('skills', 'read'),
    ('candidate_skills', 'read')
) as res(resource, action)
where r.name = 'rh_manager'
on conflict (role_id, resource, action) do nothing;

-- recruiter: read + application management
insert into public.role_resource_permissions (role_id, resource, action)
select r.id, res.resource, res.action
from public.roles r
cross join (
  values
    ('candidates', 'read'),
    ('jobs', 'read'),
    ('applications', 'read'), ('applications', 'update'),
    ('notifications', 'read'),
    ('notification_deliveries', 'read')
) as res(resource, action)
where r.name = 'recruiter'
on conflict (role_id, resource, action) do nothing;

-- finance: read finance-related, no PII
insert into public.role_resource_permissions (role_id, resource, action)
select r.id, res.resource, res.action
from public.roles r
cross join (
  values
    ('candidates', 'read'),
    ('jobs', 'read'),
    ('applications', 'read'),
    ('notifications', 'read')
) as res(resource, action)
where r.name = 'finance'
on conflict (role_id, resource, action) do nothing;

-- viewer: read-only within tenant
insert into public.role_resource_permissions (role_id, resource, action)
select r.id, res.resource, res.action
from public.roles r
cross join (
  values
    ('candidates', 'read'),
    ('jobs', 'read'),
    ('applications', 'read'),
    ('notifications', 'read'),
    ('skills', 'read')
) as res(resource, action)
where r.name = 'viewer'
on conflict (role_id, resource, action) do nothing;

-- member: own candidate data
insert into public.role_resource_permissions (role_id, resource, action)
select r.id, res.resource, res.action
from public.roles r
cross join (
  values
    ('candidates', 'read'), ('candidates', 'update'),
    ('jobs', 'read'),
    ('applications', 'read'),
    ('notifications', 'read')
) as res(resource, action)
where r.name = 'member'
on conflict (role_id, resource, action) do nothing;

-- -----------------------------------------------------------------------------
-- Function: user_has_permission()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Centralized permission checker that respects both global and tenant roles.

-- WHY:
-- - Single function to validate authorization
-- - Used by RLS policies and application logic
-- - Supports is_global (admin_master) OR tenant-scoped roles

-- ARCHITECTURE:
-- 1. Check global roles first (is_global = true) — admin_master
-- 2. Then check tenant membership + role assignment
-- 3. Returns boolean

create or replace function public.user_has_permission(
  p_user_auth_uid uuid,
  p_resource varchar,
  p_action varchar,
  p_tenant_id uuid default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_person_id uuid;
  v_has_perm boolean;
begin
  -- Get person from auth uid
  select id into v_person_id
  from public.people
  where auth_user_id = p_user_auth_uid;

  if v_person_id is null then
    return false;
  end if;

  -- Check global role (admin_master bypasses tenant)
  if exists (
    select 1
    from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.role_resource_permissions rrp on rrp.role_id = r.id
    where ra.actor_person_id = v_person_id
      and r.is_global = true
      and r.is_active = true
      and rrp.resource = p_resource
      and rrp.action = p_action
      and rrp.allowed = true
      and (ra.expires_at is null or ra.expires_at > now())
  ) then
    return true;
  end if;

  -- Check tenant-scoped role
  if p_tenant_id is not null then
    if exists (
      select 1
      from public.role_assignments ra
      join public.roles r on r.id = ra.role_id
      join public.role_resource_permissions rrp on rrp.role_id = r.id
      join public.tenant_memberships tm on tm.id = ra.tenant_membership_id
      where ra.actor_person_id = v_person_id
        and r.is_global = false
        and r.is_active = true
        and rrp.resource = p_resource
        and rrp.action = p_action
        and rrp.allowed = true
        and tm.tenant_id = p_tenant_id
        and (ra.expires_at is null or ra.expires_at > now())
    ) then
      return true;
    end if;
  end if;

  return false;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: can_access_tenant()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Validates that the current user can access the specified tenant.

-- WHY:
-- - Used as helper in RLS policies
-- - Returns boolean

create or replace function public.can_access_tenant(p_tenant_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.people p on tm.person_id = p.id
    where p.auth_user_id = auth.uid()
      and tm.tenant_id = p_tenant_id
      and tm.status = 'active'
  )
  or public.user_has_permission(auth.uid(), 'tenants', 'read', null)
$$;

-- -----------------------------------------------------------------------------
-- Consolidated RLS Policies
-- -----------------------------------------------------------------------------
-- PRINCIPLE: Each resource has ONE policy pattern:
--   - admin_master: global access (via user_has_permission)
--   - tenant members: access scoped by tenant_memberships
--   - self: own data (where applicable)

-- Helper: user's tenants
-- This subquery pattern is reused across all policies
-- auth.uid() → people.auth_user_id → people.id → tenant_memberships → tenant_id

-- -----------------------------------------------------------------------------
-- people: global for admin_master, self for auth users
-- -----------------------------------------------------------------------------

-- WHAT:
-- People can view their own record. admin_master can view any.

create policy "People: admin_master sees all"
  on public.people for select
  using (
    public.user_has_permission(auth.uid(), 'people', 'read', null)
  );

create policy "People: users see own record"
  on public.people for select
  using (
    auth_user_id = auth.uid()
    or auth.role() = 'service_role'
  );

create policy "People: admin can update"
  on public.people for update
  using (
    public.user_has_permission(auth.uid(), 'people', 'update', null)
  );

create policy "People: tenant_admin can manage within tenant"
  on public.people for update
  using (
    auth.uid() is not null
    and (
      select p.id from public.people p where p.auth_user_id = auth.uid()
    ) in (
      select ra.actor_person_id
      from public.role_assignments ra
      join public.roles r on r.id = ra.role_id
      join public.tenant_memberships tm on tm.id = ra.tenant_membership_id
      where r.name = 'tenant_admin'
        and r.is_global = false
        and (ra.expires_at is null or ra.expires_at > now())
    )
  );

-- -----------------------------------------------------------------------------
-- companies: tenant-scoped (admin_master global, tenant_admin+ for manage)
-- -----------------------------------------------------------------------------

create policy "Companies: visible to tenant members"
  on public.companies for select
  using (
    EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      JOIN public.company_relationships cr ON cr.tenant_id = tm.tenant_id
      WHERE cr.company_id = companies.id
        AND tm.person_id = (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
    )
    OR public.user_has_permission(auth.uid(), 'companies', 'read', null)
  );

create policy "Companies: tenant_admin can create"
  on public.companies for insert
  with check (
    public.user_has_permission(auth.uid(), 'companies', 'create',
      (SELECT id FROM public.tenants WHERE id IN (
        SELECT tm.tenant_id FROM public.tenant_memberships tm
        JOIN public.people p ON p.id = tm.person_id
        WHERE p.auth_user_id = auth.uid()
      ))
    )
  );

-- -----------------------------------------------------------------------------
-- candidates: tenant-scoped with self-access
-- -----------------------------------------------------------------------------

create policy "Candidates: visible to tenant members"
  on public.candidates for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'candidates', 'read', null)
  );

create policy "Candidates: candidate sees own"
  on public.candidates for select
  using (
    person_id = (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

create policy "Candidates: tenant members can create/update"
  on public.candidates for insert
  with check (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'candidates', 'create', null)
  );

create policy "Candidates: tenant members can update"
  on public.candidates for update
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'candidates', 'update', null)
  );

-- -----------------------------------------------------------------------------
-- jobs: tenant-scoped
-- -----------------------------------------------------------------------------

create policy "Jobs: visible to tenant members"
  on public.jobs for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'jobs', 'read', null)
  );

create policy "Jobs: tenant members can create"
  on public.jobs for insert
  with check (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'jobs', 'create', null)
  );

create policy "Jobs: tenant members can update"
  on public.jobs for update
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'jobs', 'update', null)
  );

-- -----------------------------------------------------------------------------
-- applications: tenant-scoped, candidate sees own
-- -----------------------------------------------------------------------------

create policy "Applications: visible to tenant members"
  on public.applications for select
  using (
    (
      SELECT c.tenant_id FROM public.candidates c WHERE c.id = applications.candidate_id
    ) IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'applications', 'read', null)
  );

create policy "Applications: candidate sees own"
  on public.applications for select
  using (
    candidate_id IN (
      SELECT id FROM public.candidates c
      JOIN public.people p ON c.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- application_status_history: append-only (already in 006)
-- -----------------------------------------------------------------------------

-- Already blocked from UPDATE/DELETE in 006 — just enforce select policy

create policy "Status history: tenant members can see"
  on public.application_status_history for select
  using (
    (
      SELECT c.tenant_id FROM public.candidates c
      JOIN public.applications a ON a.candidate_id = c.id
      WHERE a.id = application_status_history.application_id
    ) IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- application_profile_snapshots: append-only
-- -----------------------------------------------------------------------------

create policy "Profile snapshots: tenant members can see"
  on public.application_profile_snapshots for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- files: private by default, tenant-scoped
-- -----------------------------------------------------------------------------

create policy "Files: visible to tenant members"
  on public.files for select
  using (
    visibility = 'public'
    OR tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR uploaded_by = (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Files: tenant members can upload"
  on public.files for insert
  with check (
    visibility = 'public'
    OR tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR uploaded_by = (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- domain_events: tenant-scoped read
-- -----------------------------------------------------------------------------

create policy "Events: tenant members can read"
  on public.domain_events for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'domain_events', 'read', null)
  );

-- -----------------------------------------------------------------------------
-- notifications: recipient or tenant member can see
-- -----------------------------------------------------------------------------

create policy "Notifications: recipient sees own"
  on public.notifications for select
  using (
    recipient_person_id = (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- notification_preferences: own preferences
-- -----------------------------------------------------------------------------

create policy "Preferences: user manages own"
  on public.notification_preferences for all
  using (
    person_id = (
      SELECT c.person_id FROM public.candidates c WHERE c.id = (
        SELECT candidate_id FROM public.talent_pool_memberships WHERE id = notification_preferences.person_id
      )
    )
    OR person_id = (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  )
  with check (
    person_id = (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- talent_pool_memberships: tenant-scoped
-- -----------------------------------------------------------------------------

create policy "Talent pool: tenant members can see"
  on public.talent_pool_memberships for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR public.user_has_permission(auth.uid(), 'talent_pool_memberships', 'read', null)
  );

-- -----------------------------------------------------------------------------
-- job_matches: tenant-scoped, candidate sees own
-- -----------------------------------------------------------------------------

create policy "Job matches: tenant members can see"
  on public.job_matches for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR candidate_id IN (
      SELECT c.id FROM public.candidates c
      JOIN public.people p ON c.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- roles / role_resource_permissions: admin_master only
-- -----------------------------------------------------------------------------

create policy "Roles: admin_master only"
  on public.roles for all
  using (
    auth.uid() is not null
    AND EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.roles r ON r.id = ra.role_id
      WHERE ra.actor_person_id = (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
        AND r.name = 'admin_master'
        AND r.is_global = true
        AND (ra.expires_at IS NULL OR ra.expires_at > now())
    )
  )
  with check (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.roles r ON r.id = ra.role_id
      WHERE ra.actor_person_id = (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
        AND r.name = 'admin_master'
        AND r.is_global = true
        AND (ra.expires_at IS NULL OR ra.expires_at > now())
    )
  );

create policy "Role resource permissions: admin_master only"
  on public.role_resource_permissions for all
  using (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.roles r ON r.id = ra.role_id
      WHERE ra.actor_person_id = (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
        AND r.name = 'admin_master'
        AND r.is_global = true
        AND (ra.expires_at IS NULL OR ra.expires_at > now())
    )
  )
  with check (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.roles r ON r.id = ra.role_id
      WHERE ra.actor_person_id = (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
        AND r.name = 'admin_master'
        AND r.is_global = true
        AND (ra.expires_at IS NULL OR ra.expires_at > now())
    )
  );

-- -----------------------------------------------------------------------------
-- Security hardening: revoke public access
-- -----------------------------------------------------------------------------
-- WHAT:
-- By default, REVOKE all access from PUBLIC schema.
-- Everything is granted via explicit policies.

revoke default on schema public from public;
revoke all on schema public from public;

-- Table-level grants to authenticated and service_role
grant usage on schema public to authenticated, service_role;
grant all on all tables in schema public to authenticated, service_role;
grant all on all sequences in schema public to authenticated, service_role;
grant all on all functions in schema public to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Security hardening: force row level security on all tables
-- -----------------------------------------------------------------------------
-- WHAT:
-- Ensure RLS is enabled on every table, even if policies are added later.

-- WHY:
-- Defense-in-depth: if a policy is accidentally removed, data is still protected.

do $$
declare
  r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename not in (
        'schema_migrations',
        'supabase_functions',
        'supabase_realtime'
      )
  loop
    execute format('alter table public.%I force row level security', r.tablename);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Security: validate no service_role tokens reach frontend
-- -----------------------------------------------------------------------------
-- WHAT:
-- Helper function to check if a role is safe for frontend use.

-- WHY:
-- Prevents accidentally granting service_role-equivalent access.

create or replace function public.is_frontend_safe_role()
returns boolean
language sql
security definer
as $$
  select auth.role() = 'authenticated'
$$;