-- 43_notifications.sql
-- Notification preferences

create table if not exists public.notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  channel text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_notification_preferences unique (tenant_id, person_id, channel)
);
