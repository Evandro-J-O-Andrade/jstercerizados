-- 04b_service_orders.sql
-- Service orders and related entities

create table if not exists public.service_orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_service_id uuid not null references public.company_services(id),
  status text not null default 'pending',
  scheduled_at timestamptz,
  completed_at timestamptz,
  quantity numeric,
  value numeric,
  period_start date,
  period_end date,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_order_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  service_order_id uuid not null references public.service_orders(id),
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_acceptances (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  service_order_id uuid not null references public.service_orders(id),
  accepted_by uuid references public.people(id),
  accepted_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_service_acceptances_order unique (service_order_id)
);

create table if not exists public.service_executions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  service_order_id uuid not null references public.service_orders(id),
  executed_by uuid references public.people(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_attachments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  service_order_id uuid not null references public.service_orders(id),
  file_url text not null,
  file_name text not null,
  mime_type text,
  uploaded_by uuid references public.people(id),
  created_at timestamptz not null default now()
);

create table if not exists public.service_order_status_history (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  service_order_id uuid not null references public.service_orders(id),
  status text not null,
  changed_at timestamptz not null default now(),
  actor_person_id uuid references public.people(id),
  metadata jsonb not null default '{}'::jsonb
);
