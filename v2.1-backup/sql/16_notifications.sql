-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: notifications
-- STATUS: merged
-- SOURCE: supabase/specs/sql/10_notifications_events.sql -> 16_notifications.sql
-- DEPENDENCIES: 01_core.sql
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  recipient_person_id uuid references public.people(id),
  channel text not null,
  status text not null default 'pending',
  subject text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default uuid_generate_v4(),
  notification_id uuid not null references public.notifications(id),
  channel text not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  sent_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
