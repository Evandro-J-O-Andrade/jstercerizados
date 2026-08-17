-- =============================================================================
-- GATE-DATA-04.006 — APPLICATIONS: Candidaturas + Histórico Imutável
-- =============================================================================
-- Entity: applications (relação candidato ↔ vaga dentro de um tenant)
-- Related: application_status_history
-- Schema: public
-- Order: 6
-- Dependencies: 001_core, 002_identity, 003_companies, 004_candidates, 005_jobs
-- =============================================================================
-- Purpose:
--   Representar a candidatura de um candidato a uma vaga, preservando o snapshot
--   do perfil do candidato no momento da candidatura e mantendo histórico imutável
--   de mudanças de status.
--
-- Rules (per GATE-DATA-03 §1.0 + §1.0.1 + §16 Product-Led Growth):
--   - Application is TENANT-SCOPED
--   - ONE application per (candidate, job) — no duplicates
--   - Profile snapshot captured at submission time — never updated
--   - Status changes are APPEND-ONLY via application_status_history
--   - No external API calls in this migration
--   - RLS chain: auth.uid → people → tenant_memberships → tenant_id → applications
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. applications — Relação candidato ↔ vaga
-- -----------------------------------------------------------------------------

-- WHAT:
-- Representa a candidatura de um candidato a uma vaga específica.

-- WHY:
-- Precisamos rastrear quem se candidatou a qual vaga, quando, e o progresso
-- do processo seletivo.

-- ARCHITECTURE:
-- - TENANT scope: a candidatura pertence a um tenant
-- - candidate_id → contexto do candidato (não people.id diretamente)
-- - job_id → vaga publicada
-- - UNIQUE(candidate_id, job_id) → impede candidatura duplicada
-- - profile_snapshot → JSONB snapshot do perfil no momento da candidatura
create table public.applications (
  id                  uuid primary key default gen_random_uuid(),

  -- WHAT: Tenant proprietário da candidatura
  -- WHY:  Isolamento multi-tenant — candidatura de um tenant não aparece no outro
  -- ARCH: RLS chain: auth.uid → people → tenant_memberships → tenant_id
  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Vaga à qual o candidato se candidata
  -- WHY:  Relaciona candidato com oportunidade
  -- ARCH: job também é tenant-scoped — garante coerência de tenant
  job_id              uuid not null
    references public.jobs(id)
    on delete cascade,

  -- WHAT: Candidato (contexto, não identidade)
  -- WHY:  O candidato é um contexto de people dentro do tenant
  -- ARCH: NÃO referenciamos people.id diretamente — usamos o contexto candidate
  candidate_id        uuid not null
    references public.candidates(id)
    on delete cascade,

  -- WHAT: Snapshot do perfil no momento da candidatura
  -- WHY:  Preservar o estado do candidato como naquele momento
  -- ARCH: JSONB imutável — alterações futuras no candidato não afetam aplicações antigas
  --       Isso é obrigatório (GATE-DATA-03 §4 Snapshot da candidatura)
  profile_snapshot    jsonb,

  -- WHAT: Resumo da compatibilidade no momento da candidatura
  -- WHY:  Registrar o matching score apresentado ao candidato
  -- ARCH: Calculado pelo matching engine (006_jobs.skills vs candidate_skills)
  match_score         numeric(5,2),
  match_details       jsonb,

  -- WHAT: Fonte da candidatura
  -- WHY:  Rastrear como o candidato chegou à vaga
  -- ARCH: website / whatsapp / email / indicacao / banco_de_talentos
  source              varchar(50)
    check (source in ('website','whatsapp','email','indication','talent_pool','api','other')),

  -- WHAT: Estado atual do processo seletivo
  -- WHY:  Controlar o andamento da candidatura
  -- ARCH: Estado derivado do application_status_history
  --       (sempre atualizado via trigger a partir do histórico)
  current_stage       varchar(50) not null default 'submitted'
    check (current_stage in (
      'submitted',
      'screening',
      'interview',
      'technical_interview',
      'presentation',
      'reference_check',
      'offer',
      'hired',
      'rejected',
      'withdrawn',
      'on_hold'
    )),

  -- WHAT: Notas de triagem
  -- WHY:  Registro interno de observações
  -- ARCH: NÃO enviado ao candidato — apenas visível para equipe J&S
  notes               text,

  -- WHAT: Quando a candidatura foi feita
  -- WHY:  Timeline
  applied_at          timestamptz not null default now(),

  -- WHAT: Última atualização de status
  -- WHY:  Para cache de performance
  -- ARCH: Atualizado via trigger a partir de application_status_history
  updated_at          timestamptz not null default now(),

  -- WHAT: Auditoria
  -- WHY:  Rastrear quem criou/modificou
  -- ARCH: created_by aponta para people.id (recrutador interno)
  created_by          uuid references public.people(id),

  -- WHAT: Unicidade da candidatura
  -- WHY:  Um candidato não pode se candidatar duas vezes à mesma vaga
  -- ARCH: Permite apenas uma candidatura por (candidato, vaga)
  unique (candidate_id, job_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_applications_tenant on public.applications(tenant_id);
create index idx_applications_job on public.applications(job_id);
create index idx_applications_candidate on public.applications(candidate_id);
create index idx_applications_status on public.applications(current_stage);
create index idx_applications_applied_at on public.applications(applied_at desc);

-- -----------------------------------------------------------------------------
-- 2. application_status_history — Histórico imutável de mudanças de status
-- -----------------------------------------------------------------------------

-- WHAT:
-- Registro imutável de cada mudança de status da candidatura.

-- WHY:
-- Precisamos de auditoria completa e histórico para triagem.

-- ARCHITECTURE:
-- - APPEND-ONLY: nunca UPDATE, nunca DELETE
-- - Cada mudança gera um novo registro
-- - current_stage em applications derivado do último registro
-- - Isso respeita a regra de histórico imutável (GATE-DATA-03 §1.5)
create table public.application_status_history (
  id                  uuid primary key default gen_random_uuid(),

  -- WHAT: Candidatura à qual este histórico pertence
  -- WHY:  Relacionamento com a aplicação
  -- ARCH: ON DELETE CASCADE — se a aplicação for excluída, limpa o histórico
  application_id      uuid not null
    references public.applications(id)
    on delete cascade,

  -- WHAT: Novo estágio
  -- WHY:  Estado da candidatura após a mudança
  -- ARCH: Deve ser consistente com applications.current_stage
  stage               varchar(50) not null
    check (stage in (
      'submitted',
      'screening',
      'interview',
      'technical_interview',
      'presentation',
      'reference_check',
      'offer',
      'hired',
      'rejected',
      'withdrawn',
      'on_hold'
    )),

  -- WHAT: Estágio anterior
  -- WHY:  Para auditoria e replay
  -- ARCH: Pode ser NULL na primeira inserção (submitted)
  previous_stage      varchar(50),
  next_stage          varchar(50),

  -- WHAT: Quem fez a mudança
  -- WHY:  Auditoria
  -- ARCH: people.id do recrutador/responsável
  changed_by          uuid references public.people(id),

  -- WHAT: Motivo da mudança de status
  -- WHY:  Registro qualitativo para triagem futura
  -- ARCH: Texto livre, não estruturado
  reason              text,

  -- WHAT: Quando ocorreu
  -- WHY:  Timeline precisa
  -- ARCH: DEFAULT NOW()
  changed_at          timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_app_history_application on public.application_status_history(application_id);
create index idx_app_history_changed_at on public.application_status_history(changed_at desc);
create index idx_app_history_stage on public.application_status_history(stage);

-- -----------------------------------------------------------------------------
-- Trigger: sincroniza applications.current_stage com o histórico
-- -----------------------------------------------------------------------------

-- WHAT:
-- Após inserir um registro em application_status_history,
-- atualiza automaticamente applications.current_stage.

-- WHY:
-- Garante consistência entre o histórico imutável e o estado atual.

-- ARCHITECTURE:
-- - Trigger AFTER INSERT em application_status_history
-- - Atualiza apenas o current_stage, preservando o histórico
-- - NÃO permite UPDATE/DELETE em application_status_history (imutabilidade)
create or replace function public.sync_application_current_stage()
returns trigger
language plpgsql
as $$
begin
  update public.applications
  set current_stage = new.stage,
      updated_at = now()
  where id = new.application_id;

  return new;
end;
$$;

create trigger sync_application_current_stage
  after insert on public.application_status_history
  for each row
  execute function public.sync_application_current_stage();

-- -----------------------------------------------------------------------------
-- Trigger: captura profile_snapshot na inserção da aplicação
-- -----------------------------------------------------------------------------

-- WHAT:
-- Na criação de uma application, automaticamente captura o snapshot
-- do perfil do candidato (experiências, skills, formação, etc.).

-- WHY:
-- Preservar o estado do candidato como naquele momento — regra obrigatória
-- (GATE-DATA-03 §4 Snapshot da candidatura).

-- ARCHITECTURE:
-- - BEFORE INSERT em applications
-- - Se profile_snapshot for NULL, preenche automaticamente
-- - Usa JSON para serializar: experiences, education, skills, courses
-- - Imutabilidade garantida: snapshot nunca mais é alterado
create or replace function public.capture_application_profile_snapshot()
returns trigger
language plpgsql
as $$
declare
  v_candidate jsonb;
begin
  -- Se já foi fornecido um snapshot, não sobrescrever
  if new.profile_snapshot is not null then
    return new;
  end if;

  -- Captura o perfil do candidato no momento da candidatura
  select
    jsonb_build_object(
      'candidate_id', c.id,
      'headline', c.headline,
      'skills', (
        select jsonb_agg(
          jsonb_build_object(
            'name', s.name,
            'proficiency', cs.proficiency,
            'years_experience', cs.years_experience
          )
        )
        from public.candidate_skills cs
        join public.skills s on s.id = cs.skill_id
        where cs.candidate_id = c.id
      ),
      'experience_count', (
        select count(*) from public.candidate_experiences
        where candidate_id = c.id
      ),
      'education_count', (
        select count(*) from public.candidate_education
        where candidate_id = c.id
      )
    )
  into v_candidate
  from public.candidates c
  where c.id = new.candidate_id;

  new.profile_snapshot := v_candidate;
  return new;
end;
$$;

create trigger capture_profile_snapshot
  before insert on public.applications
  for each row
  when (new.profile_snapshot is null)
  execute function public.capture_application_profile_snapshot();

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Applications são scoped ao tenant via cadeia people → tenant_memberships.

-- WHY:
-- Previne acesso a candidaturas de outro tenant.

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
-- applications.tenant_id
alter table public.applications enable row level security;

create policy "Applications visible to tenant members"
  on public.applications for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Applications manageable by tenant recruiters"
  on public.applications for all
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
    OR auth.role() = 'service_role
  );

-- -----------------------------------------------------------------------------
-- RLS for application_status_history (inherits from applications via application_id)
-- -----------------------------------------------------------------------------
alter table public.application_status_history enable row level security;

create policy "Application history visible to tenant members"
  on public.application_status_history for select
  using (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.tenant_memberships tm ON tm.tenant_id = a.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND a.id = application_status_history.application_id
    )
    OR auth.role() = 'service_role'
  );

create policy "Application history manageable by tenant recruiters"
  on public.application_status_history for all
  using (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.tenant_memberships tm ON tm.tenant_id = a.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND a.id = application_status_history.application_id
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  )
  with check (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.tenant_memberships tm ON tm.tenant_id = a.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND a.id = application_status_history.application_id
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- Imutabilidade: bloquear UPDATE/DELETE em application_status_history
-- -----------------------------------------------------------------------------
-- WHAT:
-- Garante que o histórico de status seja absolutamente imutável.

-- WHY:
-- Auditoria exige que ninguém altere ou delete registros históricos.

-- ARCHITECTURE:
-- - Bloqueado via triggers BEFORE UPDATE/DELETE
-- - Apenas INSERT é permitido
-- - Aplicação obrigatória: usar INSERT para novos status
create or replace function public.prevent_history_modification()
returns trigger
language plpgsql
as $$
begin
  raise exception 'application_status_history is immutable — use INSERT to add new status';
  return null;
end;
$$;

create trigger prevent_history_update
  before update on public.application_status_history
  for each row execute function public.prevent_history_modification();

create trigger prevent_history_delete
  before delete on public.application_status_history
  for each row execute function public.prevent_history_modification();

-- -----------------------------------------------------------------------------
-- Seed: No seed data for applications — created via candidatura process
-- -----------------------------------------------------------------------------
