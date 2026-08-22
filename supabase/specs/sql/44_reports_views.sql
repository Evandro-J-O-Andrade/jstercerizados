-- 44_reports_views.sql
-- Reports, dashboards, and aggregated views

create table if not exists public.report_definitions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  query text not null,
  parameters jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_executions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  report_id uuid not null references public.report_definitions(id),
  executed_by uuid references public.people(id),
  result jsonb,
  executed_at timestamptz not null default now()
);

create table if not exists public.report_schedules (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  report_id uuid not null references public.report_definitions(id),
  cron text not null,
  recipients jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_widgets (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  type text not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_layouts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid references public.people(id),
  widget_id uuid not null references public.dashboard_widgets(id),
  position_x integer not null,
  position_y integer not null,
  width integer not null,
  height integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
