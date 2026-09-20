-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: rbac
-- STATUS: canonical
-- SOURCE: MASTER SPEC + supabase/specs/sql/02_rbac.sql
-- DEPENDENCIES: 01_core.sql
-- ============================================================

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_global boolean not null default false,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  resource text not null,
  action text not null,
  description text,
  is_global boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_permission_resource_action unique (resource, action)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id),
  permission_id uuid not null references public.permissions(id),
  created_at timestamptz not null default now(),
  constraint uq_role_permission unique (role_id, permission_id)
);

create table if not exists public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id),
  role_id uuid not null references public.roles(id),
  tenant_id uuid references public.tenants(id),
  assigned_by uuid,
  expires_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_role_assignment_person_role_tenant unique (person_id, role_id, tenant_id)
);

create table if not exists public.role_resource_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id),
  resource text not null,
  action text not null,
  conditions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
