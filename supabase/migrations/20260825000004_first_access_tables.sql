-- =============================================================================
-- FIRST-ACCESS & LEGAL ACCEPTANCE TABLES
-- =============================================================================
-- Purpose:
--   - Track first-login state (must_change_password, terms acceptance)
--   - Record legal/terms acceptance audit trail
--
-- References:
--   supabase/specs/sql/11_audit_security.sql
--   supabase/specs/sql/32_seed.sql

-- -----------------------------------------------------------------------------
-- 1. FIRST LOGIN STATE
-- -----------------------------------------------------------------------------

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

comment on table public.first_login_state is 'Tracks first-login requirements: password change, terms acceptance, privacy consent.';

-- -----------------------------------------------------------------------------
-- 2. LEGAL ACCEPTANCES
-- -----------------------------------------------------------------------------

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

comment on table public.legal_acceptances is 'Audit trail for legal document acceptances (terms, privacy, LGPD).';

-- -----------------------------------------------------------------------------
-- 3. INDEXES
-- -----------------------------------------------------------------------------

create index if not exists idx_first_login_state_person
  on public.first_login_state(person_id);

create index if not exists idx_legal_acceptances_person
  on public.legal_acceptances(person_id);

create index if not exists idx_legal_acceptances_tenant
  on public.legal_acceptances(tenant_id);
