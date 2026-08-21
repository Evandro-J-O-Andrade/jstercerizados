-- 40_tasks_support.sql
-- Tasks only; support tables live in 14b_support_tickets.sql

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
