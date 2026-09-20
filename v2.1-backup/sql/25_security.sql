-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: security
-- STATUS: merged
-- SOURCE: supabase/specs/sql/11_audit_security.sql -> 25_security.sql
-- DEPENDENCIES: 01_core.sql
-- ============================================================

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
