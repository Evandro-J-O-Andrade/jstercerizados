-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: employees
-- STATUS: canonical
-- SOURCE: MASTER SPEC + docs/sql/05_employees.sql
-- DEPENDENCIES: 01_core.sql, 04_crm.sql
-- ============================================================

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  company_id uuid not null references public.companies(id),
  registration text,
  admission_date date,
  position text,
  department text,
  status text not null default 'active',
  salary_base numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_employee_tenant_person unique (tenant_id, person_id)
);

create table if not exists public.employee_contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  employee_id uuid not null references public.employees(id),
  type text not null,
  start_date date not null,
  end_date date,
  salary numeric,
  workload text,
  contract_file_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  employee_id uuid not null references public.employees(id),
  type text not null,
  file_url text not null,
  file_name text,
  issued_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  employee_id uuid not null references public.employees(id),
  status text not null,
  changed_by_person_id uuid references public.people(id),
  reason text,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  parent_department_id uuid references public.departments(id),
  name text not null,
  description text,
  head_person_id uuid references public.people(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  department_id uuid not null references public.departments(id),
  title text not null,
  description text,
  salary_range jsonb not null default '{}'::jsonb,
  requirements text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_positions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  employee_id uuid not null references public.employees(id),
  position_id uuid not null references public.positions(id),
  start_date date not null,
  end_date date,
  is_current boolean not null default true,
  workload text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
