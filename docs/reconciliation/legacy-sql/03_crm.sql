-- 03_crm.sql
-- Companies and relationships

create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  legal_name text,
  document text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_relationships (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id),
  relationship_type text not null,
  status text not null default 'active',
  start_date date,
  end_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_contacts (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id),
  name text,
  email text,
  phone text,
  role text,
  created_at timestamptz not null default now()
);
