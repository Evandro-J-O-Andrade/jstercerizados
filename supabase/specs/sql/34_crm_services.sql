-- 34_crm_services.sql
-- CRM interactions and recruitment demands

create table if not exists public.company_services (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  name text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interactions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid references public.companies(id),
  person_id uuid references public.people(id),
  type text not null,
  direction text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.recruitment_demands (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  position text not null,
  quantity integer not null default 1,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
