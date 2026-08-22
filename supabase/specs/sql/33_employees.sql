-- 33_employees.sql
-- HR domain: employees, departments, positions, contracts, documents, status history

create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  description text,
  parent_id uuid references public.departments(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_departments_tenant_name unique (tenant_id, name)
);

create table if not exists public.positions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  title text not null,
  description text,
  department_id uuid references public.departments(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_positions_tenant_title unique (tenant_id, title)
);

create table if not exists public.employees (
  id uuid primary key references public.people(id),
  tenant_id uuid not null references public.tenants(id),
  employee_code text not null unique,
  hire_date date not null,
  termination_date date,
  salary numeric,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_positions (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees(id),
  position_id uuid not null references public.positions(id),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_employee_positions unique (employee_id, position_id, start_date)
);

create table if not exists public.employee_contracts (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees(id),
  contract_type text not null,
  start_date date not null,
  end_date date,
  salary numeric,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_documents (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees(id),
  document_type text not null,
  file_url text not null,
  issue_date date,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_status_history (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees(id),
  status text not null,
  start_date date not null,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
