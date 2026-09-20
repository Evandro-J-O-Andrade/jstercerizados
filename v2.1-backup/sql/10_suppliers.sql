-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: suppliers
-- STATUS: canonical
-- SOURCE: MASTER SPEC + supabase/specs/sql/06_suppliers_purchasing.sql
-- DEPENDENCIES: 01_core.sql, 04_crm.sql
-- ============================================================

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  payment_terms text,
  lead_time integer,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
