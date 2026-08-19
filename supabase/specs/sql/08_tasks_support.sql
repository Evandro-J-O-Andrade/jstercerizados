-- 08_tasks_support.sql
-- Task engine and support tickets

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
  ticket_id uuid not null references public.support_tickets(id),
  status text not null,
  changed_at timestamptz not null default now(),
  actor_person_id uuid references public.people(id),
  metadata jsonb not null default '{}'::jsonb
);
