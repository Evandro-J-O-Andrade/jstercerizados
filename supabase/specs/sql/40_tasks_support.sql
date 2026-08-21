-- 40_tasks_support.sql
-- Tasks and support tickets

create table if not exists public.task_comments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  task_id uuid not null references public.tasks(id),
  person_id uuid not null references public.people(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_attachments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  task_id uuid not null references public.tasks(id),
  file_url text not null,
  file_name text not null,
  mime_type text,
  uploaded_by uuid references public.people(id),
  created_at timestamptz not null default now()
);

create table if not exists public.task_status_history (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  task_id uuid not null references public.tasks(id),
  status text not null,
  changed_by uuid references public.people(id),
  notes text,
  created_at timestamptz not null default now()
);

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
