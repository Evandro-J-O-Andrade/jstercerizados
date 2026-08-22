-- 11_audit_security.sql
-- Audit logs and security events

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_person_id uuid references public.people(id),
  tenant_id uuid references public.tenants(id),
  scope text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  correlation_id uuid,
  causation_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid references public.people(id),
  tenant_id uuid references public.tenants(id),
  event_type text not null,
  ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.first_login_state (
  person_id uuid primary key references public.people(id),
  must_change_password boolean not null default true,
  terms_version text,
  privacy_version text,
  lgpd_consent_version text,
  first_login_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_acceptances (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid not null references public.people(id),
  tenant_id uuid not null references public.tenants(id),
  document_type text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);
