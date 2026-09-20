-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: tasks
-- STATUS: merged
-- SOURCE: supabase/specs/sql/08_tasks_support.sql -> 14_tasks.sql
-- DEPENDENCIES: 01_core.sql
-- ============================================================

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  title text not null,
  description text,
  status text not null default 'open',
  related_entity_type text,
  related_entity_id uuid,
  assignee_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
