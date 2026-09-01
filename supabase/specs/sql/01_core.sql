-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: core
-- STATUS: canonical
-- SOURCE: MASTER SPEC + docs/sql/01_core.sql
-- DEPENDENCIES: 00_extensions.sql
-- ============================================================

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text not null unique,
  phone text,
  document text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  tax_id text,
  email text,
  phone text,
  address jsonb,
  status text not null default 'active',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  membership_role text not null,
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_tenant_membership_tenant_person unique (tenant_id, person_id)
);

create table if not exists public.tenant_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  branding jsonb not null default '{}'::jsonb,
  timezone text not null default 'America/Sao_Paulo',
  locale text not null default 'pt-BR',
  notifications jsonb not null default '{}'::jsonb,
  recruitment jsonb not null default '{}'::jsonb,
  finance jsonb not null default '{}'::jsonb,
  fiscal jsonb not null default '{}'::jsonb,
  chat jsonb not null default '{}'::jsonb,
  feature_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_tenant_settings_tenant unique (tenant_id)
);
