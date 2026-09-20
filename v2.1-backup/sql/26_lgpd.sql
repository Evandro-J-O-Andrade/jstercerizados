-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: lgpd
-- STATUS: merged
-- SOURCE: supabase/specs/sql/11_audit_security.sql -> 26_lgpd.sql
-- DEPENDENCIES: 01_core.sql
-- ============================================================

create table if not exists public.legal_acceptances (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid not null references public.people(id),
  tenant_id uuid not null references public.tenants(id),
  document_type text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);
