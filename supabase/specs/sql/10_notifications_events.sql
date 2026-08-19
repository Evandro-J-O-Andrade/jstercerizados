-- 10_notifications_events.sql
-- Notifications, domain events and outbox

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  recipient_person_id uuid references public.people(id),
  channel text not null,
  status text not null default 'pending',
  subject text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  notification_id uuid not null references public.notifications(id),
  channel text not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  idempotency_key text unique,
  sent_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.domain_events (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  actor_person_id uuid references public.people(id),
  payload jsonb not null default '{}'::jsonb,
  correlation_id uuid,
  causation_id uuid,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.event_outbox (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  event_id uuid not null references public.domain_events(id),
  status text not null default 'pending',
  attempts integer not null default 0,
  correlation_id uuid,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_event_outbox_event_id unique (event_id)
);

create table if not exists public.event_deliveries (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  outbox_id uuid not null references public.event_outbox(id),
  destination text not null,
  status text not null default 'pending',
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  idempotency_key text unique,
  request_payload jsonb,
  response_payload jsonb,
  attempts integer not null default 0,
  sent_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_event_deliveries_idempotency_key unique (idempotency_key)
);
