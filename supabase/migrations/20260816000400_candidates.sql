-- =============================================================================
-- GATE-DATA-04.004 — CANDIDATES: Profissionais em contexto de recrutamento
-- =============================================================================
-- Entity: candidates (contexto de recrutamento dentro de um tenant)
-- Related: candidate_experiences, candidate_education, candidate_skills,
--          candidate_languages, candidate_courses, candidate_documents,
--          candidate_availability
-- Schema: public
-- Order: 4
-- Dependencies: 001_core (people), 002_identity, 003_companies (skills)
-- =============================================================================
-- Purpose:
--   Representar o contexto de uma pessoa como candidata dentro de um tenant,
--   juntamente com seu currículo estruturado.
--
-- Rules (per GATE-DATA-03 §1.0 Portability + §1.0.1 Security + §1.0 Regra de IDs):
--   - people is the canonical identity — candidates is a TENANT-SCOPED context
--   - candidates.person_id is NOT unique globally (same person, multiple tenants)
--   - UNIQUE(person_id, tenant_id) enforces one candidacy per tenant
--   - skills table is GLOBAL (shared vocabulary for candidate + job matching)
--   - No auth.users.id as primary key
--   - No external API calls
--   - RLS uses chain: auth.uid → people → tenant_memberships → tenant_id
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. skills — Vocabulário canônico global de habilidades
--    Shared between candidates and jobs for intelligent matching
-- -----------------------------------------------------------------------------

-- WHAT:
-- Catálogo global de habilidades/tecnologias/conhecimentos.

-- WHY:
-- Precisamos de um vocabulário comum entre candidatos e vagas.

-- ARCHITECTURE:
-- GLOBAL scope: uma habilidade como "Excel" ou "JavaScript" é canônica,
-- não muda por tenant. Evita duplicação e permite matching.
create table public.skills (
  id          uuid primary key default gen_random_uuid(),
  code        varchar(50) unique,
  name        varchar(150) not null,
  slug        varchar(150) unique,
  category    varchar(50),
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Seed: skills canônicas comuns em recrutamento
insert into public.skills (code, name, slug, category) values
  ('office-excel', 'Microsoft Excel', 'microsoft-excel', 'office'),
  ('office-word', 'Microsoft Word', 'microsoft-word', 'office'),
  ('portaria', 'Portaria', 'portaria', 'operacional'),
  ('limpeza', 'Limpeza Profissional', 'limpeza-profissional', 'operacional'),
  ('lideranca', 'Liderança', 'lideranca', 'comportamental'),
  ('javascript', 'JavaScript', 'javascript', 'tech'),
  ('react', 'React', 'react', 'tech'),
  ('comunicacao', 'Comunicação', 'comunicacao', 'comportamental');

create index idx_skills_slug on public.skills(slug);
create index idx_skills_category on public.skills(category);

create trigger update_skills_updated_at
  before update on public.skills
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 2. candidate_skills — Relação candidato → habilidade (global)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Habilidades associadas a um candidato dentro de um contexto.

-- WHY:
-- Precisamos saber quais habilidades cada candidato possui.

-- ARCHITECTURE:
-- TENANT scope: o candidato é contextual. Associamos skills canônicas (global)
-- ao contexto de candidato (tenant) com proficiência e experiência.
create table public.candidate_skills (
  id                  uuid primary key default gen_random_uuid(),
  candidate_id        uuid not null references public.candidates(id) on delete cascade,
  skill_id            uuid not null references public.skills(id),
  proficiency         varchar(20)
                        check (proficiency in ('basic','intermediate','advanced','expert')),
  years_experience    numeric(3,1),
  last_used_at        timestamptz,
  created_at          timestamptz not null default now(),

  -- Uma habilidade não pode ser cadastrada duas vezes para o mesmo candidato
  unique (candidate_id, skill_id)
);

create index idx_candidate_skills_candidate on public.candidate_skills(candidate_id);
create index idx_candidate_skills_skill on public.candidate_skills(skill_id);

-- -----------------------------------------------------------------------------
-- 3. candidates — Contexto de recrutamento dentro de um tenant
--    A entidade de pessoa continua em `people`
-- -----------------------------------------------------------------------------

-- WHAT:
-- Representa o contexto de uma pessoa como candidata dentro de um tenant.

-- WHY:
-- Uma pessoa pode candidatar-se a múltiplos tenants.
-- Precisamos de contexto operacional (status, disponibilidade, origem)
-- sem duplicar a identidade de `people`.

-- ARCHITECTURE:
-- - people.id → identidade canônica (GLOBAL)
-- - candidates.id → contexto candidato (TENANT)
-- - candidates.person_id → FK para people (não é a identidade da pessoa)
-- - candidates.tenant_id → escopo de isolamento (RLS)
-- - UNIQUE(person_id, tenant_id) → candidatura única por tenant
create table public.candidates (
  id           uuid primary key default gen_random_uuid(),

  -- WHAT: Liga ao identity canônico da pessoa.
  -- WHY:  Não duplicamos pessoas. O contexto candidato precisa da identidade.
  -- ARCH: people-first: uma pessoa pode ser candidata em múltiplos tenants.
  person_id    uuid not null
    references public.people(id)
    on delete restrict,

  -- WHAT: Escopo de isolamento do candidato.
  -- WHY:  Cada tenant gerencia seus próprios candidatos.
  -- ARCH: NÃO usar UNIQUE(person_id). Usar UNIQUE(person_id, tenant_id).
  tenant_id    uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Perfil profissional resumido
  -- WHY:  Exibido em listagens e cards de candidatos
  -- ARCH: Campo livre, indexável para buscas
  headline             varchar(150),
  salary_expectation_min numeric(10,2),
  salary_expectation_max numeric(10,2),
  salary_type          varchar(20)
                           check (salary_type in ('range','monthly','negotiate'))
                           default 'negotiate',

  -- WHAT: Quando o candidato está disponível para iniciar
  -- WHY:  Informação crucial para triagem de processos
  -- ARCH: JSONB permite estrutura flexível sem schema rigid
  availability           jsonb
                           default '{"type":"immediate","notice_period_days":0}'::jsonb,

  -- WHAT: Como o candidato chegou (site, indicação, WhatsApp)
  -- WHY:  Métrica de aquisição de talentos
  -- ARCH: Campo aberto, validado pela aplicação
  source                 varchar(50),

  -- WHAT: Status do candidato no contexto deste tenant
  -- WHY:  Permite arquivamento sem deletar dados
  -- ARCH: TENANT-scoped — outro tenant vê status próprio
  status                 varchar(20) not null default 'active'
                           check (status in ('active','inactive','archived','blacklisted')),

  -- WHAT: Metadados para customizações sem migrations
  -- WHY:  Extensibilidade sem alterar schema
  -- ARCH: JSONB, não expor diretamente no frontend
  metadata               jsonb not null default '{}'::jsonb,

  -- WHAT: Auditoria
  -- WHY:  Rastrear origem e responsável
  -- ARCH: created_by aponta para people.id do colaborador que cadastrou
  created_by             uuid references public.people(id),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- WHAT: Unicidade do contexto candidato
  -- WHY:  Uma pessoa não pode ser duas vezes candidata no mesmo tenant
  -- ARCH: Evita duplicação de candidatura — permite multi-tenant
  unique (person_id, tenant_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_candidates_person on public.candidates(person_id);
create index idx_candidates_tenant on public.candidates(tenant_id);
create index idx_candidates_status on public.candidates(status);
create index idx_candidates_created_by on public.candidates(created_by);
create index idx_candidates_availability on public.candidates using GIN (availability);

-- -----------------------------------------------------------------------------
-- Trigger: updated_at
-- -----------------------------------------------------------------------------
create trigger update_candidates_updated_at
  before update on public.candidates
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Candidates são scoped ao tenant via cadeia people → tenant_memberships.

-- WHY:
-- Previne acesso a candidatos de outro tenant, mesmo que o cliente envie
-- o ID correto.

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
-- candidates.tenant_id
alter table public.candidates enable row level security;

create policy "Candidates visible to tenant members"
  on public.candidates for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Candidates manageable by tenant admins"
  on public.candidates for all
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
-- RLS for candidate_skills (inherits from candidates via candidate_id)
-- -----------------------------------------------------------------------------
alter table public.candidate_skills enable row level security;

create policy "Candidate skills visible to tenant members"
  on public.candidate_skills for select
  using (
    EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.tenant_memberships tm ON tm.tenant_id = c.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND c.id = candidate_skills.candidate_id
    )
    OR auth.role() = 'service_role'
  );

create policy "Candidate skills manageable by tenant admins"
  on public.candidate_skills for all
  using (
    EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.tenant_memberships tm ON tm.tenant_id = c.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND c.id = candidate_skills.candidate_id
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  )
  with check (
    EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.tenant_memberships tm ON tm.tenant_id = c.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND c.id = candidate_skills.candidate_id
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- RLS for skills (global table)
-- -----------------------------------------------------------------------------
alter table public.skills enable row level security;

create policy "Skills visible to authenticated"
  on public.skills for select
  using (auth.role() = 'authenticated');

create policy "Skills manageable by admins"
  on public.skills for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- Remaining candidate subentities
-- (created in subsequent migrations: 004b, 004c, etc.)
-- -----------------------------------------------------------------------------
-- candidate_experiences
-- candidate_education
-- candidate_courses
-- candidate_languages
-- candidate_documents
-- candidate_availability (already in JSONB field above)
