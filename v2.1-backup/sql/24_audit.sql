-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: audit
-- STATUS: merged
-- SOURCE: supabase/specs/sql/11_audit_security.sql -> 24_audit.sql
-- DEPENDENCIES: 01_core.sql
-- ============================================================

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id),
  scope text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  correlation_id uuid,
  created_at timestamptz not null default now()
);
