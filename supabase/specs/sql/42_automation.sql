-- 42_automation.sql
-- Automation templates

create table if not exists public.automation_templates (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  trigger_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
