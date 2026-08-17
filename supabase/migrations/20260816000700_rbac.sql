-- =============================================================================
-- GATE-DATA-04.007 — RBAC: Roles & Permissions (Global + Tenant)
-- =============================================================================
-- Entity: roles (global + tenant), permissions (global), role_permissions
-- Schema: public
-- Order: 7
-- Dependencies: 001_core, 002_identity
-- =============================================================================
-- Purpose:
--   Implement the canonical two-level RBAC system for the J&S SaaS.
--
-- Rules (per GATE-DATA-03 §3.21 RBAC canônico):
--   - Global roles (admin_master) coexist with tenant roles
--   - permissions are global/canonical (shared namespace)
--   - role_permissions connect roles to permissions
--   - role_assignments scoped by tenant (nullable for global roles)
--   - NO user credentials in this migration — use secret manager
--   - NO service_role key exposed
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. roles — Papéis canônicos (global + tenant)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Define papéis de autorização no sistema.

-- WHY:
-- Precisamos de controle de acesso granular para segurança do SaaS.

-- ARCHITECTURE:
-- - is_global=TRUE → sistema-wide (admin_master)
-- - is_global=FALSE → scoped a tenant (tenant_admin, recruiter, etc.)
-- - name UNIQUE por (tenant_id IS NULL, name) — mesmo nome não pode existir
-- - NÃO colocamos credenciais de usuário aqui
create table public.roles (
  id          uuid primary key default gen_random_uuid(),

  -- WHAT: Nome canônico do papel
  -- WHY:  Identificador único no sistema
  -- ARCH: UNIQUE combinado com is_global
  name        varchar(50) not null,

  -- WHAT: Flag de escopo global vs tenant
  -- WHY:  Distingue admin_master de tenant_admin
  -- ARCH: TRUE para sistema; FALSE (default) para tenant
  is_global   boolean not null default false,

  -- WHAT: Descrição do papel
  description text,

  -- WHAT: Auditoria
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- WHAT: Unicidade canônica
  -- WHY:  Não pode existir dois papéis "admin" globais
  -- ARCH: NULL tenant_id + name para globais
  --       tenant_id + name para tenant-scoped
  unique (is_global, name)
);

-- -----------------------------------------------------------------------------
-- 2. permissions — Permissões canônicas (namespace global)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Define ações específicas que podem ser autorizadas.

-- WHY:
-- Granularidade fina de acesso — não "admin" amplo, mas operações específicas.

-- ARCHITECTURE:
-- - Tabela global — mesmas permissões em todos os tenants
-- - name segue padrão: resource.action (ex: candidates.read)
-- - module agrupa permissões por domínio
-- - NÃO scoped por tenant — todas as permissões são canônicas
create table public.permissions (
  id          uuid primary key default gen_random_uuid(),

  -- WHAT: Nome canônico da permissão
  -- WHY:  Identificador único global
  -- ARCH: padrão resource.action, ex: jobs.create, applications.reject
  name        varchar(100) not null unique,

  -- WHAT: Domínio ao qual pertence
  -- WHY:  Organização conceptual
  description text,

  -- WHAT: Módulo de origem
  module      varchar(50),

  -- WHAT: Auditoria
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. role_permissions — Relacionamento roles ↔ permissions
-- -----------------------------------------------------------------------------

-- WHAT:
-- Conecta papéis às permissões que possuem.

-- WHY:
-- Um role herda um conjunto de permissões.

-- ARCHITECTURE:
-- - NOT scoped by tenant — permissions são global
-- - UNIQUE(role_id, permission_id) previne duplicação
-- - Concedido por admin_master ou sistema
create table public.role_permissions (
  id              uuid primary key default gen_random_uuid(),

  -- WHAT: Papel
  role_id         uuid not null
    references public.roles(id)
    on delete cascade,

  -- WHAT: Permissão
  permission_id   uuid not null
    references public.permissions(id)
    on delete cascade,

  -- WHAT: Auditoria
  granted_at      timestamptz not null default now(),
  granted_by      uuid references public.people(id),

  -- WHAT: Unicidade
  unique (role_id, permission_id)
);

-- -----------------------------------------------------------------------------
-- 4. role_assignments — Atribuição de papéis a pessoas
-- -----------------------------------------------------------------------------

-- WHAT:
-- Associa uma pessoa a um papel, dentro de um escopo (global ou tenant).

-- WHY:
-- Uma pessoa pode ser admin_master (global) e tenant_admin (em outro tenant).

-- ARCHITECTURE:
-- - tenant_id NULL → global role (admin_master)
-- - tenant_id preenchido → tenant-scoped role
-- - UNIQUE(person_id, role_id, tenant_id) — com COALESCE para globais
-- - Exemplo: evandro → admin_master (global) + tenant_admin (J&S)
create table public.role_assignments (
  id              uuid primary key default gen_random_uuid(),

  -- WHAT: Pessoa que recebe o papel
  person_id       uuid not null
    references public.people(id)
    on delete cascade,

  -- WHAT: Papel atribuído
  role_id         uuid not null
    references public.roles(id)
    on delete cascade,

  -- WHAT: Tenant de escopo (NULL para global)
  -- WHY:  Distingue admin_master de tenant_admin
  -- ARCH: NULL = global, preenchido = tenant
  tenant_id       uuid references public.tenants(id) on delete cascade,

  -- WHAT: Quem atribuiu
  assigned_by     uuid references public.people(id),

  -- WHAT: Quando atribuído
  assigned_at     timestamptz not null default now(),
  expires_at      timestamptz,

  -- WHAT: Unicidade
  -- WHY:  Evita duplicação de role assignment
  -- ARCH: COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid)
  -- para tratar NULL como escopo único para globais
  unique (person_id, role_id, coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- -----------------------------------------------------------------------------
-- Triggers: updated_at
-- -----------------------------------------------------------------------------
create trigger update_roles_updated_at
  before update on public.roles
  for each row execute procedure public.update_updated_at();

create trigger update_permissions_updated_at
  before update on public.permissions
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_roles_name on public.roles(name);
create index idx_roles_is_global on public.roles(is_global);
create index idx_permissions_name on public.permissions(name);
create index idx_permissions_module on public.permissions(module);
create index idx_role_permissions_role on public.role_permissions(role_id);
create index idx_role_permissions_permission on public.role_permissions(permission_id);
create index idx_role_assignments_person on public.role_assignments(person_id);
create index idx_role_assignments_role on public.role_assignments(role_id);
create index idx_role_assignments_tenant on public.role_assignments(tenant_id);

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------

-- WHY:
-- Roles globais visíveis a todos autenticados.
-- Role assignments visíveis apenas ao próprio usuário ou admin.
alter table public.roles enable row level security;
create policy "Roles visible to authenticated"
  on public.roles for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Roles manageable by global admin"
  on public.roles for all
  using (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.people p ON ra.person_id = p.id
      JOIN public.roles r ON ra.role_id = r.id
      WHERE p.auth_user_id = auth.uid()
        AND r.name = 'admin_master'
        AND ra.tenant_id IS NULL
    )
    OR auth.role() = 'service_role'
  );

-- Permissions: global visibility
alter table public.permissions enable row level security;
create policy "Permissions visible to authenticated"
  on public.permissions for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Permissions manageable by global admin"
  on public.permissions for all
  using (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.people p ON ra.person_id = p.id
      JOIN public.roles r ON ra.role_id = r.id
      WHERE p.auth_user_id = auth.uid()
        AND r.name = 'admin_master'
        AND ra.tenant_id IS NULL
    )
    OR auth.role() = 'service_role'
  );

-- Role permissions: visible to authenticated
alter table public.role_permissions enable row level security;
create policy "Role permissions visible to authenticated"
  on public.role_permissions for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Role permissions manageable by global admin"
  on public.role_permissions for all
  using (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.people p ON ra.person_id = p.id
      JOIN public.roles r ON ra.role_id = r.id
      WHERE p.auth_user_id = auth.uid()
        AND r.name = 'admin_master'
        AND ra.tenant_id IS NULL
    )
    OR auth.role() = 'service_role'
  );

-- Role assignments: visible only to self or tenant/global admins
alter table public.role_assignments enable row level security;

create policy "Role assignments visible to self or admin"
  on public.role_assignments for select
  using (
    person_id IN (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.role_assignments ra2
      JOIN public.people p ON ra2.person_id = p.id
      JOIN public.roles r ON ra2.role_id = r.id
      WHERE p.auth_user_id = auth.uid()
        AND r.name = 'admin_master'
        AND ra2.tenant_id IS NULL
    )
    OR auth.role() = 'service_role
  );

create policy "Role assignments manageable by global admin or tenant admin"
  on public.role_assignments for all
  using (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.people p ON ra.person_id = p.id
      JOIN public.roles r ON ra.role_id = r.id
      WHERE (
        (p.auth_user_id = auth.uid() AND r.name = 'admin_master' AND ra.tenant_id IS NULL)
        OR
        (p.auth_user_id = auth.uid()
         AND r.name = 'tenant_admin'
         AND ra.tenant_id = role_assignments.tenant_id)
      )
    )
    OR auth.role() = 'service_role'
  )
  with check (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra
      JOIN public.people p ON ra.person_id = p.id
      JOIN public.roles r ON ra.role_id = r.id
      WHERE (
        (p.auth_user_id = auth.uid() AND r.name = 'admin_master' AND ra.tenant_id IS NULL)
        OR
        (p.auth_user_id = auth.uid()
         AND r.name = 'tenant_admin'
         AND ra.tenant_id = role_assignments.tenant_id)
      )
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- Seed: Global roles
-- -----------------------------------------------------------------------------
insert into public.roles (name, is_global, description) values
  ('admin_master', TRUE, 'Plataforma — acesso global com auditoria obrigatória'),
  ('platform_admin', TRUE, 'Administração da plataforma J&S'),
  ('support_engineer', TRUE, 'Suporte técnico global');

-- -----------------------------------------------------------------------------
-- Seed: Tenant roles (default template)
-- -----------------------------------------------------------------------------
insert into public.roles (name, is_global, description) values
  ('tenant_admin', FALSE, 'Administração do tenant'),
  ('rh_manager', FALSE, 'Gestão de RH'),
  ('recruiter', FALSE, 'Recrutamento e triagem'),
  ('finance', FALSE, 'Financeiro'),
  ('support', FALSE, 'Atendimento ao cliente'),
  ('content_manager', FALSE, 'Conteúdo do site'),
  ('viewer', FALSE, 'Apenas leitura');

-- -----------------------------------------------------------------------------
-- Seed: Canonical permissions (resource.action)
-- -----------------------------------------------------------------------------
insert into public.permissions (name, module, description) values
  -- People
  ('people.read', 'core', 'Visualizar pessoas'),
  ('people.create', 'core', 'Criar pessoas'),
  ('people.update', 'core', 'Atualizar pessoas'),
  ('people.disable', 'core', 'Desativar pessoas'),

  -- Candidates
  ('candidates.read', 'recruitment', 'Visualizar candidatos'),
  ('candidates.create', 'recruitment', 'Criar candidatos'),
  ('candidates.update', 'recruitment', 'Atualizar candidatos'),

  -- Jobs
  ('jobs.read', 'recruitment', 'Visualizar vagas'),
  ('jobs.create', 'recruitment', 'Criar vagas'),
  ('jobs.update', 'recruitment', 'Editar vagas'),
  ('jobs.publish', 'recruitment', 'Publicar vagas'),
  ('jobs.delete', 'recruitment', 'Arquivar vagas'),

  -- Applications
  ('applications.read', 'recruitment', 'Visualizar candidaturas'),
  ('applications.update', 'recruitment', 'Atualizar candidaturas'),
  ('applications.reject', 'recruitment', 'Rejeitar candidaturas'),
  ('applications.approve', 'recruitment', 'Aprovar candidaturas'),

  -- Companies
  ('companies.read', 'core', 'Visualizar empresas'),
  ('companies.create', 'core', 'Criar empresas'),
  ('companies.update', 'core', 'Editar empresas'),

  -- Finance
  ('finance.read', 'finance', 'Acessar dados financeiros'),
  ('finance.create', 'finance', 'Criar lançamentos financeiros'),
  ('finance.update', 'finance', 'Atualizar financeiro'),

  -- Audit
  ('audit.read', 'platform', 'Visualizar logs de auditoria'),

  -- Platform
  ('roles.manage', 'platform', 'Gerenciar papéis e permissões'),
  ('tenant.manage', 'platform', 'Administrar tenant'),
  ('integrations.manage', 'platform', 'Gerenciar integrações');

-- -----------------------------------------------------------------------------
-- NO USER CREDENTIALS HERE — admin_master bootstrap handled via secret manager
-- -----------------------------------------------------------------------------
-- Credenciais iniciais devem ser provisionadas fora do Git:
--
-- 1. Supabase CLI / Dashboard
-- 2. Secret Manager (HashiCorp, AWS Secrets, etc.)
-- 3. Variáveis de ambiente seguras
-- 4. Password temporária + força troca no primeiro login
-- 5. 2FA obrigatório para admin_master
-- -----------------------------------------------------------------------------
