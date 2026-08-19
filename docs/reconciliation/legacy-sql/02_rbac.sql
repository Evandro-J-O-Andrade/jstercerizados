-- 02_rbac.sql
-- Roles, permissions, assignments

create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  scope text not null default 'tenant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default uuid_generate_v4(),
  resource text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint uq_permission_resource_action unique (resource, action)
);

create table if not exists public.role_permissions (
  id uuid primary key default uuid_generate_v4(),
  role_id uuid not null references public.roles(id),
  permission_id uuid not null references public.permissions(id),
  created_at timestamptz not null default now(),
  constraint uq_role_permission unique (role_id, permission_id)
);

create table if not exists public.role_assignments (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid not null references public.people(id),
  role_id uuid not null references public.roles(id),
  tenant_id uuid references public.tenants(id),
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint uq_role_assignment_person_role_tenant unique (person_id, role_id, tenant_id)
);
