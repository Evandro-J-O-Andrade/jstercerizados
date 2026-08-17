-- =============================================================================
-- GATE-DATA-04.003 — COMPANIES: Empresa + Relacionamentos + Contatos
-- =============================================================================
-- Entity: companies (entidade jurídica global)
-- Related: company_relationship_types, company_relationships, company_contacts
-- Schema: public
-- Order: 3
-- Dependencies: 001_core, 002_identity
-- =============================================================================
-- Purpose:
--   Unificar clientes, parceiros, fornecedores em uma arquitetura de
--   empresa (entidade global) + relacionamento comercial (scoped por tenant).
--
-- Rules (per GATE-DATA-03 §1.0 Portability + §1.0.1 Security):
--   - companies is a global entity (no required tenant_id)
--   - Relationship is tenant-scoped via company_relationships.tenant_id
--   - company_contacts references people (People-First)
--   - CNPJ unique globally
--   - No external API calls in this migration
--   - RLS uses chain: auth.uid → people → tenant_memberships → tenant
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. company_types — Natureza jurídica da empresa
--    (corporation, limited_company, epp, mei, nonprofit, government)
-- -----------------------------------------------------------------------------
create table public.company_types (
  id          uuid primary key default gen_random_uuid(),
  code        varchar(30) not null unique,
  name        varchar(100) not null,
  description text,
  created_at  timestamptz not null default now()
);

insert into public.company_types (code, name) values
  ('corporation', 'Sociedade Anônima'),
  ('limited_company', 'Sociedade Limitada'),
  ('epp', 'Empresa de Pequeno Porte'),
  ('mei', 'Microempreendedor Individual'),
  ('nonprofit', 'Organização Sem Fins Lucrativos'),
  ('government', 'Entidade Pública');

-- -----------------------------------------------------------------------------
-- 2. companies — Entidade jurídica/comercial (global, não scoped por tenant)
-- -----------------------------------------------------------------------------
create table public.companies (
  id                    uuid primary key default gen_random_uuid(),

  -- Identidade jurídica (global)
  legal_name            varchar(200) not null,
  trading_name          varchar(100),
  cnpj                  varchar(18) unique,
  cnpj_root             varchar(15),
  state_registration    varchar(20),
  municipal_registration varchar(20),
  company_type_id       uuid references public.company_types(id),
  industry              varchar(100),

  -- Dados comerciais (global)
  phone                 varchar(20),
  email                 varchar(255),
  website               varchar(255),
  linkedin_url          varchar(255),
  logo_url              text,
  address               jsonb,
  size                    varchar(20)
                          check (size in ('micro','small','medium','large','enterprise')),

  -- Status da empresa
  status                varchar(20) not null default 'active'
                          check (status in ('active','inactive','suspended','pending')),
  is_active             boolean not null default true,

  -- Extensibilidade
  metadata              jsonb not null default '{}'::jsonb,

  -- Auditoria
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            uuid references public.people(id)
);

-- -----------------------------------------------------------------------------
-- 3. company_relationship_types — Tipo de relacionamento comercial
--    (CLIENT, PARTNER, SUPPLIER)
-- -----------------------------------------------------------------------------
create table public.company_relationship_types (
  id            uuid primary key default gen_random_uuid(),
  code          varchar(20) not null unique,
  name          varchar(100) not null,
  description   text,
  created_at    timestamptz not null default now()
);

insert into public.company_relationship_types (code, name) values
  ('client', 'Cliente'),
  ('partner', 'Parceiro'),
  ('supplier', 'Fornecedor');

-- -----------------------------------------------------------------------------
-- 4. company_relationships — Relacionamento entre empresa e tenant
--    Permite que uma empresa tenha múltiplos papéis simultaneamente
-- -----------------------------------------------------------------------------
create table public.company_relationships (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  relationship_type_id uuid not null references public.company_relationship_types(id),

  -- Status do relacionamento
  status            varchar(20) not null default 'active'
                        check (status in ('active','inactive','pending','suspended')),

  -- Período do relacionamento
  started_at        timestamptz,
  ended_at          timestamptz,

  -- Contexto
  metadata          jsonb not null default '{}'::jsonb,
  created_by        uuid references public.people(id),

  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Unicidade: empresa não pode ter 2 relacionamentos do mesmo tipo no mesmo tenant
  unique (company_id, tenant_id, relationship_type_id)
);

-- -----------------------------------------------------------------------------
-- 5. company_contacts — Contatos da empresa (via people)
-- -----------------------------------------------------------------------------
create table public.company_contacts (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  person_id       uuid not null references public.people(id) on delete cascade,
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  role            varchar(100),
  is_primary      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not NULL default now(),

  -- Uma pessoa é contato de uma empresa apenas uma vez por tenant
  unique (company_id, person_id, tenant_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_companies_cnpj on public.companies(cnpj);
create index idx_companies_type on public.companies(company_type_id);
create index idx_companies_status on public.companies(status);
create index idx_companies_created_by on public.companies(created_by);

create index idx_company_relationships_company on public.company_relationships(company_id);
create index idx_company_relationships_tenant on public.company_relationships(tenant_id);
create index idx_company_relationships_type on public.company_relationships(relationship_type_id);
create index idx_company_relationships_status on public.company_relationships(status);

create index idx_company_contacts_company on public.company_contacts(company_id);
create index idx_company_contacts_person on public.company_contacts(person_id);
create index idx_company_contacts_tenant on public.company_contacts(tenant_id);

-- -----------------------------------------------------------------------------
-- Triggers: updated_at
-- -----------------------------------------------------------------------------
create trigger update_company_types_updated_at
  before update on public.company_types
  for each row execute procedure public.update_updated_at();

create trigger update_companies_updated_at
  before update on public.companies
  for each row execute procedure public.update_updated_at();

create trigger update_company_relationship_types_updated_at
  before update on public.company_relationship_types
  for each row execute procedure public.update_updated_at();

create trigger update_company_relationships_updated_at
  before update on public.company_relationships
  for each row execute procedure public.update_updated_at();

create trigger update_company_contacts_updated_at
  before update on public.company_contacts
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------
-- Companies: global entity — visible to authenticated users who belong to any tenant
-- Access is controlled via company_relationships.tenant_id chain
alter table public.companies enable row level security;

create policy "Companies visible to authenticated"
  on public.companies for select
  using (auth.role() = 'authenticated');

create policy "Companies manageable by tenant members"
  on public.companies for all
  using (
    EXISTS (
      SELECT 1 FROM public.company_relationships cr
      JOIN public.people p ON p.auth_user_id = auth.uid()
      JOIN public.tenant_memberships tm ON tm.tenant_id = cr.tenant_id AND tm.person_id = p.id
      WHERE cr.company_id = companies.id
        AND tm.membership_role IN ('owner', 'admin', 'manager')
    )
    OR auth.role() = 'service_role'
  )
  with check (
    EXISTS (
      SELECT 1 FROM public.company_relationships cr
      JOIN public.people p ON p.auth_user_id = auth.uid()
      JOIN public.tenant_memberships tm ON tm.tenant_id = cr.tenant_id AND tm.person_id = p.id
      WHERE cr.company_id = companies.id
        AND tm.membership_role IN ('owner', 'admin', 'manager')
    )
    OR auth.role() = 'service_role'
  );

-- Company Types: visible to authenticated
alter table public.company_types enable row level security;
create policy "Company types visible to authenticated"
  on public.company_types for select
  using (auth.role() = 'authenticated');

create policy "Company types manageable by admins"
  on public.company_types for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Company Relationship Types: visible to authenticated
alter table public.company_relationship_types enable row level security;
create policy "Company relationship types visible to authenticated"
  on public.company_relationship_types for select
  using (auth.role() = 'authenticated');

create policy "Company relationship types manageable by admins"
  on public.company_relationship_types for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Company Relationships: scoped by tenant membership
alter table public.company_relationships enable row level security;

create policy "Company relationships visible to tenant members"
  on public.company_relationships for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Company relationships manageable by tenant admins"
  on public.company_relationships for all
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager')
    )
    OR auth.role() = 'service_role'
  )
  with check (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager')
    )
    OR auth.role() = 'service_role'
  );

-- Company Contacts: scoped by tenant membership
alter table public.company_contacts enable row level security;

create policy "Company contacts visible to tenant members"
  on public.company_contacts for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Company contacts manageable by tenant admins"
  on public.company_contacts for all
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager')
    )
    OR auth.role() = 'service_role'
  )
  with check (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager')
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- Seed: Relationship types already inserted above
-- -----------------------------------------------------------------------------
