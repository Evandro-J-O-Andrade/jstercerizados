-- 20_lgpd.sql
-- LGPD: consents, privacy requests, data retention and legal acceptances

create table if not exists public.consents (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  purpose text not null,
  granted boolean not null,
  channel text,
  evidence_url text,
  term_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  causation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_consents_person_purpose_term unique (person_id, purpose, term_version)
);

create table if not exists public.privacy_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  type text not null,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  finished_at timestamptz,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  causation_id uuid,
  idempotency_key text unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_export_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  status text not null default 'pending',
  file_url text,
  requested_at timestamptz not null default now(),
  finished_at timestamptz,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  causation_id uuid,
  idempotency_key text unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_deletion_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  status text not null default 'pending',
  reason text,
  anonymized_fields jsonb,
  legal_hold boolean not null default false,
  requested_at timestamptz not null default now(),
  finished_at timestamptz,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  causation_id uuid,
  idempotency_key text unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_retention_policies (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  data_domain text not null,
  retention_days integer not null,
  legal_basis text,
  action_after_expiry text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_data_retention_policies_tenant_domain unique (tenant_id, data_domain)
);

alter table if exists public.legal_acceptances
  add column if not exists actor_person_id uuid references public.people(id),
  add column if not exists correlation_id uuid,
  add column if not exists causation_id uuid;
