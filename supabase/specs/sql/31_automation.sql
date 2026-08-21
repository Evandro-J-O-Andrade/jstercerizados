-- 31_automation.sql
-- Automation/Webhooks domain: webhook deliveries, automation jobs, automation executions

-- ============================================================
-- WEBHOOK DELIVERIES
-- ============================================================

create table if not exists public.webhook_deliveries (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  event_id uuid not null references public.domain_events(id),
  destination text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'retrying')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  failed_at timestamptz,
  response_status integer,
  response_body jsonb,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_webhook_deliveries_event_destination unique (event_id, destination)
);

-- ============================================================
-- AUTOMATION JOBS
-- ============================================================

create table if not exists public.automation_jobs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  description text,
  trigger_type text not null check (trigger_type in ('event', 'schedule', 'manual')),
  trigger_config jsonb not null default '{}'::jsonb,
  action_type text not null check (action_type in ('webhook', 'notification', 'function', 'email', 'whatsapp')),
  action_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  run_count integer not null default 0,
  failure_count integer not null default 0,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- AUTOMATION EXECUTIONS
-- ============================================================

create table if not exists public.automation_executions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  automation_job_id uuid not null references public.automation_jobs(id),
  event_id uuid references public.domain_events(id),
  status text not null default 'running' check (status in ('running', 'completed', 'failed', 'cancelled')),
  input_data jsonb not null default '{}'::jsonb,
  output_data jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
