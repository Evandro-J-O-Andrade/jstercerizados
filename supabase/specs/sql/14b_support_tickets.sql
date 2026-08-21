-- 14b_support_tickets.sql
-- Support ticket categories and tickets

create table if not exists public.support_ticket_categories (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_support_ticket_categories_tenant_name unique (tenant_id, name)
);

create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  category_id uuid not null references public.support_ticket_categories(id),
  title text not null,
  description text not null,
  status text not null default 'open',
  priority text not null default 'medium',
  assignee_person_id uuid references public.people(id),
  sla_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  ticket_id uuid not null references public.support_tickets(id),
  person_id uuid not null references public.people(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_ticket_assignments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  ticket_id uuid not null references public.support_tickets(id),
  person_id uuid not null references public.people(id),
  assigned_at timestamptz not null default now(),
  constraint uq_support_ticket_assignments unique (ticket_id, person_id)
);

create table if not exists public.support_ticket_status_history (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  ticket_id uuid not null references public.support_tickets(id),
  status text not null,
  changed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_set_updated_at_support_tickets
  before update on public.support_tickets
  for each row execute function public.set_updated_at();
