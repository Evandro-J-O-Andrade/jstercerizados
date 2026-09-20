-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: services
-- STATUS: canonical
-- SOURCE: MASTER SPEC + docs/sql/05_services_contracts.sql
-- DEPENDENCIES: 01_core.sql, 04_crm.sql
-- ============================================================

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  description text,
  category text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid references public.companies(id),
  service_id uuid references public.services(id),
  status text not null default 'draft',
  quantity numeric,
  value numeric,
  period_start date,
  period_end date,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_order_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  service_order_id uuid not null references public.service_orders(id),
  status text not null,
  changed_by_person_id uuid references public.people(id),
  notes text,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
