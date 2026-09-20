-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: domain_events
-- STATUS: merged
-- SOURCE: supabase/specs/sql/10_notifications_events.sql -> 22_domain_events.sql
-- DEPENDENCIES: 01_core.sql
-- ============================================================

create table if not exists public.domain_events (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  correlation_id uuid,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);
