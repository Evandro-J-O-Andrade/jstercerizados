-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: support
-- STATUS: merged
-- SOURCE: supabase/specs/sql/08_tasks_support.sql -> 15_support.sql
-- DEPENDENCIES: 01_core.sql
-- ============================================================

create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  subject text not null,
  status text not null default 'open',
  priority text not null default 'medium',
  category text,
  assignee_person_id uuid references public.people(id),
  sla_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_ticket_status_history (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  ticket_id uuid not null references public.support_tickets(id),
  status text not null,
  changed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
