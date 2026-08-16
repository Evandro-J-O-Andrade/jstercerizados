-- =============================================================================
-- GATE-DATA-04.001 — CORE: People-First SaaS Foundation
-- =============================================================================
-- Entity: people (business entity) — auth.users is technical only
-- Schema: public
-- Order: 1
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- TENANTS: Tenant / organization (SaaS scope)
-- -----------------------------------------------------------------------------
create table public.tenants (
  id          uuid primary key default uuid_generate_v4(),
  name        varchar(200) not null,
  slug        varchar(100) not null unique,
  plan        varchar(20) not null default 'free'
              check (plan in ('free','starter','pro','enterprise')),
  settings    jsonb not null default '{}'::jsonb,
  status      varchar(20) not null default 'active'
              check (status in ('active','inactive','suspended','trial')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- PEOPLE: Business entity — NOT auth.users
-- -----------------------------------------------------------------------------
create table public.people (
  id              uuid primary key default uuid_generate_v4(),
  auth_user_id    uuid unique,    -- optional FK to auth.users (set when user registers)
  full_name       varchar(150) not null,
  social_name     varchar(150),
  cpf             varchar(14) unique,
  birth_date      date,
  gender          varchar(20)
                   check (gender in ('male','female','other','prefer_not_to_say')),
  status          varchar(20) not null default 'active'
                   check (status in ('active','inactive','archived')),
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- TENANT_MEMBERSHIPS: Person ↔ Tenant (many-to-many)
-- -----------------------------------------------------------------------------
create table public.tenant_memberships (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  person_id       uuid not null references public.people(id) on delete cascade,
  membership_role varchar(20) not null
                   check (membership_role in ('owner','admin','manager','member','viewer')),
  is_primary      boolean not null default false,
  status          varchar(20) not null default 'active'
                   check (status in ('active','invited','suspended','inactive')),
  joined_at       timestamptz not null default now(),
  left_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (tenant_id, person_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_tenants_slug on public.tenants(slug);
create index idx_tenants_status on public.tenants(status);
create index idx_people_auth_user_id on public.people(auth_user_id);
create index idx_people_cpf on public.people(cpf);
create index idx_tenant_memberships_tenant on public.tenant_memberships(tenant_id);
create index idx_tenant_memberships_person on public.tenant_memberships(person_id);
create index idx_tenant_memberships_role on public.tenant_memberships(membership_role);

-- -----------------------------------------------------------------------------
-- Triggers: updated_at
-- -----------------------------------------------------------------------------
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger update_tenants_updated_at
  before update on public.tenants
  for each row execute procedure public.update_updated_at();

create trigger update_people_updated_at
  before update on public.people
  for each row execute procedure public.update_updated_at();

create trigger update_tenant_memberships_updated_at
  before update on public.tenant_memberships
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------
-- Tenants: visible to authenticated users
alter table public.tenants enable row level security;

create policy "Tenants visible to authenticated"
  on public.tenants for select
  using (auth.role() = 'authenticated');

create policy "Tenants manageable by tenant admins"
  on public.tenants for all
  using (
    EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.tenant_id = tenants.id
        AND tm.membership_role IN ('owner', 'admin')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.tenant_id = tenants.id
        AND tm.membership_role IN ('owner', 'admin')
    )
  );

-- People: users see only themselves (via auth_user_id)
alter table public.people enable row level security;

create policy "People view own record"
  on public.people for select
  using (auth_user_id = auth.uid() OR auth.role() = 'service_role');

create policy "People update own record"
  on public.people for update
  using (auth_user_id = auth.uid() OR auth.role() = 'service_role');

create policy "People insert (self-registration)"
  on public.people for insert
  with check (auth_user_id = auth.uid() OR auth.role() = 'service_role');

-- Tenant Memberships: members see own + tenant
alter table public.tenant_memberships enable row level security;

create policy "Members view own membership"
  on public.tenant_memberships for select
  using (
    person_id IN (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Members insert within tenant"
  on public.tenant_memberships for insert
  with check (
    EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.tenant_id = tenant_memberships.tenant_id
        AND tm.membership_role IN ('owner', 'admin', 'manager')
    )
    OR auth.role() = 'service_role'
  );

create policy "Members update own membership role"
  on public.tenant_memberships for update
  using (
    person_id IN (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.tenant_id = tenant_memberships.tenant_id
        AND tm.membership_role IN ('owner', 'admin')
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- Seed: J&S Empregos LTDA (tenant principal)
-- -----------------------------------------------------------------------------
insert into public.tenants (id, name, slug, plan, settings, status)
values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'J&S Empregos LTDA',
  'js-empregos',
  'enterprise',
  '{"primary_color":"#16a34a","whatsapp":"5511968380592","phone":"(11) 96838-0592"}'::jsonb,
  'active'
) on conflict (slug) do nothing;
