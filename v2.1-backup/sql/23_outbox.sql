-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: outbox
-- STATUS: merged
-- SOURCE: supabase/specs/sql/10_notifications_events.sql -> 23_outbox.sql
-- DEPENDENCIES: 01_core.sql, 22_domain_events.sql
-- ============================================================

create table if not exists public.event_outbox (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.domain_events(id),
  status text not null default 'pending',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_deliveries (
  id uuid primary key default uuid_generate_v4(),
  outbox_id uuid not null references public.event_outbox(id),
  destination text not null,
  status text not null default 'pending',
  request_payload jsonb,
  response_payload jsonb,
  attempts integer not null default 0,
  sent_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
