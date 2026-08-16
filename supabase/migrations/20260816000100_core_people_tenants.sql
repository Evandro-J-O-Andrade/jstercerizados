-- =============================================================================
-- GATE-DATA-SAAS-01 / 001 CORE
-- J&S Empregos — People-first SaaS foundation
-- =============================================================================
-- Purpose:
--   Establish the canonical business identity and tenant boundary.
--
-- Rules:
--   - The business entity is public.people, not public.users/profiles.
--   - Authentication linkage to auth.users is added by the IDENTITY migration.
--   - No job/vacancy/editorial data is created or modified here.
--   - RLS is enabled here; policies that depend on auth.users/person linkage
--     are finalized by the IDENTITY/RLS migrations.
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- PEOPLE
-- -----------------------------------------------------------------------------
create table public.people (
  id                uuid primary key default uuid_generate_v4(),
  full_name         text not null,
  preferred_name    text,
  email             text,
  phone             text,
  avatar_url        text,
  status            text not null default 'active'
                    check (status in ('active', 'inactive', 'blocked', 'pending')),
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index uq_people_email_ci
  on public.people (lower(email))
  where email is not null;

create index idx_people_status on public.people(status);

-- -----------------------------------------------------------------------------
-- TENANTS
-- -----------------------------------------------------------------------------
create table public.tenants (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  plan              text not null default 'free',
  status            text not null default 'active'
                    check (status in ('active', 'suspended', 'cancelled', 'trial')),
  settings          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_tenants_status on public.tenants(status);

-- -----------------------------------------------------------------------------
-- TENANT MEMBERSHIPS
-- -----------------------------------------------------------------------------
create table public.tenant_memberships (
  id                uuid primary key default uuid_generate_v4(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  person_id         uuid not null references public.people(id) on delete cascade,
  membership_role   text not null default 'member'
                    check (membership_role in ('owner', 'admin', 'manager', 'member', 'viewer')),
  status            text not null default 'active'
                    check (status in ('active', 'invited', 'suspended', 'removed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, person_id)
);

create index idx_tenant_memberships_tenant
  on public.tenant_memberships(tenant_id);

create index idx_tenant_memberships_person
  on public.tenant_memberships(person_id);

create index idx_tenant_memberships_role
  on public.tenant_memberships(membership_role);

-- -----------------------------------------------------------------------------
-- UPDATED_AT
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_people_updated_at
before update on public.people
for each row execute function public.set_updated_at();

create trigger trg_tenants_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

create trigger trg_tenant_memberships_updated_at
before update on public.tenant_memberships
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
-- RLS is enabled at module creation time. Identity-aware policies are added
-- once people.auth_user_id is established by the IDENTITY migration.
alter table public.people enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;

-- No permissive policies are created here. This intentionally prevents an
-- incomplete identity layer from exposing tenant data. The next migration
-- establishes auth.users <-> people and the corresponding access policies.

-- -----------------------------------------------------------------------------
-- BOOTSTRAP TENANT
-- -----------------------------------------------------------------------------
insert into public.tenants (name, slug, plan, status)
values ('J&S Empregos LTDA', 'js-empregos', 'free', 'active')
on conflict (slug) do nothing;

-- No people/membership seed is created until the Supabase Auth identity
-- migration is applied. This avoids creating an orphan business identity.
