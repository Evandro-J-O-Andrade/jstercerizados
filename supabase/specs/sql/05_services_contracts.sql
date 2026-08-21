-- 05_services_contracts.sql
-- Services, contracts and operational documents

create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  description text,
  category text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_order_status_history (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references public.service_orders(id),
  status text not null,
  changed_at timestamptz not null default now(),
  actor_person_id uuid references public.people(id),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.contracts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  title text not null,
  start_date date,
  end_date date,
  value numeric,
  payment_terms text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contract_status_history (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references public.contracts(id),
  status text not null,
  changed_at timestamptz not null default now(),
  actor_person_id uuid references public.people(id),
  metadata jsonb not null default '{}'::jsonb
);
