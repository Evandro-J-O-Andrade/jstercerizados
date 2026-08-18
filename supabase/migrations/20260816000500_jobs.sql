-- =============================================================================
-- GATE-DATA-04.005 — JOBS: Vagas de emprego (tenant-scoped)
-- =============================================================================
-- Entity: jobs (vagas dentro de um tenant)
-- Related: job_skills
-- Schema: public
-- Order: 5
-- Dependencies: 001_core, 002_identity, 003_companies, 004_candidates
-- =============================================================================
-- Purpose:
--   Representar vagas de emprego publicadas por um tenant, referenciando a
--   empresa contratante via company_relationships.
--
-- Rules (per GATE-DATA-03 §1.0 Portability + §1.0.1 Security + §1.0 Regra de IDs):
--   - jobs is TENANT-SCOPED (not global entity)
--   - company reference via company_relationship_id (not direct company_id)
--   - slug unique per (tenant_id, slug) — tenant has its own namespace
--   - salary values preserved from editorial mock (R$ 10.56/h, R$ 15.56/h, etc.)
--   - work_mode normalized: PRESENCIAL→onsite, REMOTO→remote, HIBRIDO→hybrid
--   - status includes draft (invisible until published)
--   - No external API calls
--   - RLS uses chain: auth.uid → people → tenant_memberships → tenant_id → jobs
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. jobs — Vagas de emprego (tenant-scoped)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Representa uma vaga de emprego publicada por um tenant.

-- WHY:
-- O tenant precisa divulgar oportunidades para candidatos.

-- ARCHITECTURE:
-- - TENANT scope: a vaga pertence a um tenant
-- - company_relationship_id → garante que a empresa tem relacionamento comercial válido
-- - slug unique por (tenant_id, slug): cada tenant tem seu namespace de URLs
-- - salary values preserved: R$ 10.56/h, R$ 15.56/h, etc. — NEVER simplified
create table public.jobs (
  id                  uuid primary key default gen_random_uuid(),

  -- WHAT: Escopo do tenant que está divulgando a vaga
  -- WHY:  Vaga é contexto de recrutamento, não entidade global
  -- ARCH: RLS chain: auth.uid → people → tenant_memberships → tenant_id
  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Relacionamento comercial com a empresa contratante
  -- WHY:  Garante que a empresa possua tipo de relacionamento válido com este tenant
  -- ARCH: NÃO usar company_id diretamente — evita vaga para empresa sem relacionamento
  company_relationship_id uuid
    references public.company_relationships(id)
    on delete set null,

  -- WHAT: Identidade da vaga
  -- WHY:  Título e slug para URL amigável
  -- ARCH: slug unique por tenant (namespace próprio)
  title               varchar(200) not null,
  slug                varchar(200) not null,

  -- WHAT: Descrição detalhada da vaga
  -- WHY:  Conteúdo editorial preservado do mock legacy
  -- ARCH: TEXT permite conteúdo longo e formatado
  description         text,
  responsibilities    text,
  requirements        text,
  benefits            text,

  -- WHAT: Remuneração
  -- WHY:  Preservar valores editoriais (R$ 10.56/h, R$ 15.56/h, salários fixos)
  -- ARCH: salary_type range/monthly/negotiate; min/max preservam valores exatos
  salary_min          numeric(10,2),
  salary_max          numeric(10,2),
  salary_type         varchar(20)
                        check (salary_type in ('range','monthly','negotiate'))
                        default 'negotiate',

  -- WHAT: Tipo de contrato
  -- WHY:  Mapear de CLT/ESTAGIO/etc do mock para snake_case canônico
  -- ARCH: CHECK constraint garante dados consistentes
  contract_type       varchar(20)
                        check (contract_type in ('clt','internship','temporary','freelance','contracted','cd'))
                        default 'clt',

  -- WHAT: Senioridade
  seniority           varchar(20)
                        check (seniority in ('internship','junior','mid','senior','master','leadership')),

  -- WHAT: Jornada e local de trabalho
  work_hours          varchar(50),
  work_mode           varchar(20)
                        check (work_mode in ('onsite','hybrid','remote'))
                        default 'onsite',
  city                varchar(100),
  state               varchar(2),
  location_detail     varchar(255),

  -- WHAT: Ciclo de vida da vaga
  -- WHY:  draft → published → hired/expired (nunca deletar)
  -- ARCH: status imutável no histórico; draft = invisível para candidatos
  status              varchar(20) not null default 'draft'
                        check (status in ('draft','published','archived','hired','expired')),

  -- WHAT: Métricas de engajamento
  views_count         integer not null default 0,
  applications_count  integer not null default 0,

  -- WHAT: Timeline de publicação
  published_at        timestamptz,
  expires_at          timestamptz,

  -- WHAT: Metadados (área, schedule, quantidade)
  -- WHY:  Campos livres do mock legacy (area, workSchedule, vagas)
  -- ARCH: JSONB — não expor diretamente, validar na aplicação
  metadata            jsonb not null default '{}'::jsonb,

  -- WHAT: Auditoria
  created_by          uuid references public.people(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- WHAT: Unicidade do slug dentro do tenant
  -- WHY:  Cada tenant tem seu próprio namespace de URLs
  -- ARCH: /j&s/vagas/analista-rh ≠ /outro-tenant/vagas/analista-rh
  unique (tenant_id, slug)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_jobs_tenant on public.jobs(tenant_id);
create index idx_jobs_company_relationship on public.jobs(company_relationship_id);
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_published on public.jobs(published_at desc);
create index idx_jobs_work_mode on public.jobs(work_mode);
create index idx_jobs_contract_type on public.jobs(contract_type);

-- -----------------------------------------------------------------------------
-- 2. job_skills — Habilidades requeridas pela vaga
-- -----------------------------------------------------------------------------

-- WHAT:
-- Relaciona skills globais (tabela skills) às vagas.

-- WHY:
-- Precisamos saber quais habilidades uma vaga exige para matching.

-- ARCHITECTURE:
-- - skills is GLOBAL (shared with candidate_skills)
-- - job_skills is TENANT-SCOPED (via jobs.tenant_id)
-- - is_required permite habilidades nice-to-have vs must-have
create table public.job_skills (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null
                    references public.jobs(id)
                    on delete cascade,
  skill_id        uuid not null
                    references public.skills(id),
  required_level  varchar(20)
                    check (required_level in ('beginner','intermediate','advanced')),
  is_required     boolean not null default true,
  created_at      timestamptz not null default now(),

  -- Uma skill não pode ser adicionada duas vezes à mesma vaga
  unique (job_id, skill_id)
);

create index idx_job_skills_job on public.job_skills(job_id);
create index idx_job_skills_skill on public.job_skills(skill_id);

-- -----------------------------------------------------------------------------
-- Triggers: updated_at
-- -----------------------------------------------------------------------------
create trigger update_jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.update_updated_at();

create trigger update_job_skills_updated_at
  before update on public.job_skills
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Jobs são scoped ao tenant via cadeia people → tenant_memberships.

-- WHY:
-- Previne acesso a vagas de outro tenant.

-- ARCH:
-- auth.uid()
--    ↓
-- people.auth_user_id
--    ↓
-- people.id
--    ↓
-- tenant_memberships.person_id
--    ↓
-- tenant_memberships.tenant_id
--    ↓
-- jobs.tenant_id
alter table public.jobs enable row level security;

create policy "Jobs visible to tenant members"
  on public.jobs for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Jobs manageable by tenant admins"
  on public.jobs for all
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  )
  with check (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- RLS for job_skills (inherits from jobs via job_id)
-- -----------------------------------------------------------------------------
alter table public.job_skills enable row level security;

create policy "Job skills visible to tenant members"
  on public.job_skills for select
  using (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.tenant_memberships tm ON tm.tenant_id = j.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND j.id = job_skills.job_id
    )
    OR auth.role() = 'service_role'
  );

create policy "Job skills manageable by tenant admins"
  on public.job_skills for all
  using (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.tenant_memberships tm ON tm.tenant_id = j.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND j.id = job_skills.job_id
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  )
  with check (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.tenant_memberships tm ON tm.tenant_id = j.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND j.id = job_skills.job_id
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- Seed: jobs are NOT seeded here — vagas are seeded via 017_seed
-- -----------------------------------------------------------------------------
-- Editorial vagas (15 + 3 REMOTO/HIBRIDO) are preserved exactly in their
-- original values. No salary, title, location, or editorial content
-- is simplified, translated, or replaced during migration.
