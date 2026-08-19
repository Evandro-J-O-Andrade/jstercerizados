-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: custody
-- STATUS: canonical
-- SOURCE: MASTER SPEC + supabase/specs/sql/07_inventory_custody.sql
-- DEPENDENCIES: 01_core.sql, 03_crm.sql, 07_inventory_custody.sql
-- ============================================================

create table if not exists public.third_party_custody (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  status text not null default 'open',
  expected_return_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.third_party_custody_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  custody_id uuid not null references public.third_party_custody(id),
  product_id uuid not null references public.products(id),
  quantity numeric not null,
  returned_quantity numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
