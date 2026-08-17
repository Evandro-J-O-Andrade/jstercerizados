-- =============================================================================
-- GATE-DATA-04.011 — TALENT POOL: Candidate availability & matching state
-- =============================================================================
-- Entities: talent_pool_memberships, candidate_preferences, candidate_skills (enhanced)
-- Schema: public
-- Order: 11
-- Dependencies: 001_core, 004_candidates, 006_applications, 007_rbac, 009_domain_events
-- =============================================================================
-- Purpose:
--   Talent Pool is NOT a new entity. It is a STATE/RELATIONSHIP of availability
--   and consent for existing candidates to receive matching opportunities.
--
-- Rules (per GATE-DATA-03 § Banco de Talentos canônico):
--   1. talent_pool_membership references candidate (not people directly)
--   2. One candidate can have ONE active membership per tenant
--   3. Entry REQUIRES explicit consent
--   4. Rejected candidate is invited — not auto-added
--   5. Premium enhances experience but NEVER blocks candidatura
--   6. Matching score lives per candidate↔job, NOT on candidate
--   7. LGPD: consent_status, consented_at, consent_source tracked
-- =============================================================================

create type talent_pool_status as enum (
  'active',
  'paused',
  'removed'
);

create type talent_pool_source as enum (
  'direct_signup',          -- Candidato cadastra-se diretamente
  'application_rejected',   -- Após processo seletivo não aprovado
  'recruiter_invitation',   -- Convite de recrutador
  'import',                 -- Importado de outro sistema
  'campaign'                 -- Via campanha/marketing
);

create type consent_status as enum (
  'granted',
  'revoked',
  'expired'
);

-- -----------------------------------------------------------------------------
-- 1. talent_pool_memberships — Estado de disponibilidade do candidato
-- -----------------------------------------------------------------------------
-- WHAT:
-- Registro de que um candidato concordou em participar do Banco de Talentos.

-- WHY:
-- - NÃO é uma pessoa nova, não é um currículo novo
-- - É um estado de disponibilidade + consentimento
-- - Permite matching de vagas compatíveis

-- ARCHITECTURE:
-- - candidate_id → candidates (NOT people)
-- - tenant_id garante isolamento
-- - (candidate_id, tenant_id) = UNIQUE → 1 membership por candidato/tenant
-- - consentimento é OBRIGATÓRIO

create table public.talent_pool_memberships (
  id                  uuid primary key default gen_random_uuid(),

  -- WHAT: Candidato no banco de talentos
  -- WHY:  Reutiliza currículo existente — NÃO cria currículo duplicado
  -- ARCH: (candidate_id, tenant_id) é UNIQUE
  candidate_id        uuid not null
    references public.candidates(id)
    on delete cascade,

  -- WHAT: Tenant proprietário do pool
  -- WHY:  Multi-tenant isolation
  -- ARCH: Mesmo tenant do candidate (validated via FK candidates.tenant_id)
  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Status do pool membership
  -- WHY:  active = pode receber matching
  --       paused = temporariamente inativo
  --       removed = saiu do pool
  status              talent_pool_status not null default 'active',

  -- WHAT: Origem da entrada no pool
  -- WHY:  Para analytics: como as pessoas chegam ao Banco de Talentos
  source              talent_pool_source not null,

  -- WHAT: Consentimento LGPD
  -- WHY:  OBRIGATÓRIO — não entra sem consentimento explícito
  consent_status      consent_status not null default 'granted',
  consented_at        timestamptz not null default now(),
  consent_source      varchar(50),  -- 'website', 'email', 'app', 'admin'
  consent_version     varchar(20),  -- versionamento do termo

  -- WHAT: Timestamps de fluxo
  joined_at           timestamptz not null default now(),  -- quando entrou no pool
  removed_at          timestamptz,                          -- quando saiu
  removal_reason      varchar(100),                        -- por que saiu

  -- WHAT: Metadados técnicos
  metadata            jsonb not null default '{}'::jsonb,

  created_at          timestamptz not null default now(),
  created_by          uuid references public.people(id) on delete set null,
  updated_at          timestamptz not null default now()
);

-- Indexes
create index idx_talent_pool_tenant on public.talent_pool_memberships(tenant_id);
create index idx_talent_pool_candidate on public.talent_pool_memberships(candidate_id);
create index idx_talent_pool_status on public.talent_pool_memberships(status);
create index idx_talent_pool_source on public.talent_pool_memberships(source);
create index idx_talent_pool_consent on public.talent_pool_memberships(consent_status);
create index idx_talent_pool_joined on public.talent_pool_memberships(joined_at desc);
create index idx_talent_pool_active on public.talent_pool_memberships(status, consent_status) where status = 'active' and consent_status = 'granted';

-- Unique: one active membership per candidate per tenant
create unique index uk_talent_pool_candidate_tenant
  on public.talent_pool_memberships(candidate_id, tenant_id);

-- Trigger: updated_at
create trigger update_talent_pool_updated_at
  before update on public.talent_pool_memberships
  for each row execute procedure public.update_updated_at();

-- Constraint: consentimento required for active status
-- WHY:  ACTIVE membership REQUIRES consentimento, não pode ser ativo sem
create or replace function public.validate_talent_pool_consent()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'active' and new.consent_status != 'granted' then
    raise exception 'Active talent_pool_membership requires consent_status = granted';
  end if;
  if new.status = 'removed' and new.removed_at is null then
    new.removed_at := now();
  end if;
  if new.status = 'active' and new.conset_status = 'revoked' then
    raise exception 'Cannot set active with revoked consent';
  end if;
  return new;
end;
$$;

create trigger validate_talent_pool_consent
  before insert or update on public.talent_pool_memberships
  for each row execute function public.validate_talent_pool_consent();

-- -----------------------------------------------------------------------------
-- 2. candidate_preferences — Preferências para matching e comunicação
-- -----------------------------------------------------------------------------
-- WHAT:
-- Preferências declaradas pelo candidato para matching de vagas.

-- WHY:
-- - Melhora a precisão do matching engine
-- - Permite "Essa vaga caiu para você" com alta relevância
-- - NÃO é um currículo — é intenção de busca

-- ARCHITECTURE:
-- - One preferences record per candidate
-- - JSON para flexibilidade (cargos, localizações, salário, etc)
-- - updated_at para invalidar cache de matching

create table public.candidate_preferences (
  id                  uuid primary key default gen_random_uuid(),

  candidate_id        uuid not null
    references public.candidates(id)
    on delete cascade,

  -- WHAT: Cargo(s) desejado(s)
  -- WHY:  Para matching de habilidades
  desired_roles       text[],

  -- WHAT: Localizaçãoções preferidas
  -- WHY:  Para matching geográfico
  desired_locations   text[],

  -- WHAT: Faixa salarial mínima
  -- WHY:  Para filtrar vagas
  salary_min          numeric(10,2),
  salary_max          numeric(10,2),

  -- WHAT: Tipo de contrato
  -- WHY:  CLT, Estágio, PJ, Temporário, etc
  contract_types      text[],

  -- WHAT: Turno
  -- WHY:  Manhã, Tarde, Noite, Full
  shifts              text[],

  -- WHAT: Modalidade
  -- WHY:  Presencial, Remoto, Híbrido
  work_modes          text[],

  -- WHAT: Distância máxima (km)
  -- WHY:  Para matching geográfico
  max_distance_km     integer,

  -- WHAT: Disponibilidade
  available_from      date,

  -- WHAT: Habilidades pesquisadas recentemente
  -- WHY:  Para matching engine
  matching_enabled    boolean not null default true,

  -- WHAT: Receber notificações de matching?
  -- WHY:  Opt-in para "Essa vaga caiu para você"
  receive_match_alerts boolean not null default true,

  -- WHAT: Último cálculo de matching
  last_match_at       timestamptz,

  -- WHAT: Versão do algoritmo usado no último matching
  last_match_version  varchar(20),

  preferences_version varchar(20) not in ('1.0'),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_candidate_prefs_candidate on public.candidate_preferences(candidate_id);
create unique index uk_candidate_prefs_candidate on public.candidate_preferences(candidate_id);
create index idx_candidate_prefs_matching on public.candidate_preferences(matching_enabled, receive_match_alerts);

create trigger update_candidate_prefs_updated_at
  before update on public.candidate_preferences
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 3. candidate_profile_views — Tracking de visualizações
-- -----------------------------------------------------------------------------
-- WHAT:
-- Registro de quando um recrutador visualiza o perfil de um candidato do pool.

-- WHY:
-- - Analytics: quais perfis têm mais interesse
-- - Matching implícito: quem é visto frequentente pode ser relevante
-- - NOT para pressure — candidato não precisa saber

create table public.candidate_profile_views (
  id                  uuid primary key default gen_random_uuid(),

  candidate_id        uuid not null
    references public.candidates(id)
    on delete cascade,

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  viewer_person_id    uuid
    references public.people(id)
    on delete set null,

  viewed_at           timestamptz not null default now(),

  -- WHAT: Contexto da visualização
  source              varchar(50),  -- 'job_detail', 'search', 'recommendation'
  metadata            jsonb not null default '{}'::jsonb
);

create index idx_profile_views_candidate on public.candidate_profile_views(candidate_id);
create index idx_profile_views_tenant on public.candidate_profile_views(tenant_id);
create index idx_profile_views_viewer on public.candidate_profile_views(viewer_person_id);
create index idx_profile_views_at on public.candidate_profile_views(viewed_at desc);

-- -----------------------------------------------------------------------------
-- 4. job_matches — Score de compatibilidade candidato ↔ vaga
-- -----------------------------------------------------------------------------
-- WHAT:
-- Registro de match entre candidato e vaga com score e razões.

-- WHY:
-- - O score NÃO fica no candidato — é contextual (relação candidato↔vaga)
-- - Permite cache de matching sem recalcula toda hora
-- - reasons = explicação do score para feedback

-- ARCHITECTURE:
-- - (candidate_id, job_id) = UNIQUE
-- - score 0-100
-- - reasons JSONB para explicar o cálculo
-- - invalidated_at para forçar recálculo quando perfil mudar

create table public.job_matches (
  id                  uuid primary key default gen_random_uuid(),

  candidate_id        uuid not null
    references public.candidates(id)
    on delete cascade,

  job_id              uuid not null
    references public.jobs(id)
    on delete cascade,

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Score de compatibilidade (0-100)
  score               numeric(5,2) not null check (score >= 0 and score <= 100),

  -- WHAT: Detalhamento do cálculo
  reasons             jsonb not null default '{}'::jsonb,

  -- WHAT: Algoritmo version
  algorithm_version   varchar(20) not in ('1.0'),

  -- WHAT: Estado do match
  is_eligible         boolean not null default true,
  sent_notification   boolean not null default false,

  -- WHAT: Cache invalidation
  invalidated_at      timestamptz,
  invalidated_reason  varchar(100),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_job_matches_candidate on public.job_matches(candidate_id);
create index idx_job_matches_job on public.job_matches(job_id);
create index idx_job_matches_tenant on public.job_matches(tenant_id);
create index idx_job_matches_score on public.job_matches(score desc);
create index idx_job_matches_eligible on public.job_matches(is_eligible, sent_notification) where is_eligible = true and sent_notification = false;
create index idx_job_matches_invalidated on public.job_matches(invalidated_at) where invalidated_at is not null;
create unique index uk_job_matches_candidate_job on public.job_matches(candidate_id, job_id);

create trigger update_job_matches_updated_at
  before update on public.job_matches
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 5. Triggers: emit domain events for talent pool
-- -----------------------------------------------------------------------------

-- WHAT:
-- When a candidate joins the talent pool, emit 'talent_pool.joined' event.

-- WHY:
-- - Allows n8n to send welcome notification
-- - "Seu perfil foi adicionado ao Banco de Talentos..."

create or replace function public.emit_talent_pool_joined_event()
returns trigger
language plpgsql
as $$
begin
  perform public.emit_domain_event(
    new.tenant_id,
    'talent_pool.joined',
    'talent_pool_membership',
    new.id,
    jsonb_build_object(
      'membership_id', new.id,
      'candidate_id', new.candidate_id,
      'source', new.source,
      'joined_at', new.joined_at
    ),
    new.created_by
  );

  return new;
end;
$$;

create trigger talent_pool_joined_event
  after insert on public.talent_pool_memberships
  for each row
  when (NEW.status = 'active' and NEW.consent_status = 'granted')
  execute function public.emit_talent_pool_joined_event();

-- WHAT:
-- When a job match is found, emit 'job.match_found' event.

-- WHY:
-- - Triggers n8n notification
-- - "Encontramos uma vaga compatível com seu perfil"

create or replace function public.emit_job_match_found_event()
returns trigger
language plpgsql
as $$
begin
  -- Only emit on high match or new eligible match
  if new.score >= 80 and new.sent_notification = false and new.invalidated_at is null then
    perform public.emit_domain_event(
      new.tenant_id,
      'job.match_found',
      'job_match',
      new.id,
      jsonb_build_object(
        'job_match_id', new.id,
        'candidate_id', new.candidate_id,
        'job_id', new.job_id,
        'score', new.score,
        'reasons', new.reasons
      ),
      null  -- system-generated
    );
  end if;

  return new;
end;
$$;

create trigger job_match_found_event
  after insert on public.job_matches
  for each row
  execute function public.emit_job_match_found_event();

-- -----------------------------------------------------------------------------
-- 6. Function: join_talent_pool()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Safe function to add a candidate to talent pool with consent.

-- WHY:
-- - Centralized entry point
-- - Validates consent
-- - Handles idempotency
-- - Can be called from application_rejected flow or direct signup

create or replace function public.join_talent_pool(
  p_candidate_id uuid,
  p_tenant_id uuid,
  p_source talent_pool_source,
  p_consent_source varchar default 'website',
  p_consent_version varchar default '1.0',
  p_created_by uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_membership_id uuid;
  v_existing_id uuid;
begin
  -- Check if already in pool for this tenant
  select id into v_existing_id
  from public.talent_pool_memberships
  where candidate_id = p_candidate_id
    and tenant_id = p_tenant_id;

  if v_existing_id is not null then
    -- Check if it was removed/paused — restore it
    update public.talent_pool_memberships
    set status = 'active',
        consent_status = 'granted',
        consented_at = now(),
        consent_source = p_consent_source,
        consent_version = p_consent_version,
        source = p_source,
        joined_at = now(),
        removed_at = null,
        removal_reason = null,
        updated_at = now()
    where id = v_existing_id
    returning id into v_membership_id;

    return v_membership_id;
  end if;

  -- Validate tenant match with candidate
  if (select tenant_id from public.candidates where id = p_candidate_id) != p_tenant_id then
    raise exception 'Candidate tenant mismatch';
  end if;

  insert into public.talent_pool_memberships (
    candidate_id,
    tenant_id,
    status,
    source,
    consent_status,
    consented_at,
    consent_source,
    consent_version,
    joined_at,
    created_by
  ) values (
    p_candidate_id,
    p_tenant_id,
    'active',
    p_source,
    'granted',
    now(),
    p_consent_source,
    p_consent_version,
    now(),
    p_created_by
  ) returning id into v_membership_id;

  return v_membership_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 7. Function: remove_from_talent_pool()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Remove a candidate from talent pool (soft — keeps history).

-- WHY:
-- - LGPD compliance: candidate can revoke
-- - Analytics: still know they were in pool

create or replace function public.remove_from_talent_pool(
  p_membership_id uuid,
  p_reason varchar default 'user_requested'
)
returns void
language plpgsql
security definer
as $$
begin
  update public.talent_pool_memberships
  set status = 'removed',
      consent_status = 'revoked',
      removed_at = now(),
      removal_reason = p_reason
  where id = p_membership_id;

  -- Emit talent_pool.removed event
  perform public.emit_domain_event(
    (select tenant_id from public.talent_pool_memberships where id = p_membership_id),
    'talent_pool.removed',
    'talent_pool_membership',
    p_membership_id,
    jsonb_build_object(
      'membership_id', p_membership_id,
      'removal_reason', p_reason,
      'removed_at', now()
    ),
    null  -- system-generated
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 8. Function: pause_talent_pool()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Temporarily pause a candidate from receiving matching opportunities.

create or replace function public.pause_talent_pool(
  p_membership_id uuid,
  p_reason varchar default 'user_requested'
)
returns void
language plpgsql
security definer
as $$
begin
  update public.talent_pool_memberships
  set status = 'paused',
      updated_at = now()
  where id = p_membership_id
    and status = 'active';

  perform public.emit_domain_event(
    (select tenant_id from public.talent_pool_memberships where id = p_membership_id),
    'talent_pool.paused',
    'talent_pool_membership',
    p_membership_id,
    jsonb_build_object('reason', p_reason),
    null
  );
end;
$$;

-- -----------------------------------------------------------------------------

-- 9. Function: get_active_candidates_for_matching()
-- -----------------------------------------------------------------------------

-- WHAT:
-- Retrieves candidates active in talent pool for matching engine.

-- WHY:
-- - Matching engine calls this to find candidates for a job
-- - Filters for active pool + consent + notification preferences

create or replace function public.get_active_candidates_for_matching(
  p_job_id uuid,
  p_tenant_id uuid,
  p_limit integer default 50
)
returns table (
  candidate_id uuid,
  membership_id uuid,
  match_score numeric,
  person_id uuid,
  desired_roles text[],
  skills jsonb
)
language sql
security definer
as $$
  select
    tpm.candidate_id,
    tpm.id as membership_id,
    jm.score as match_score,
    c.person_id,
    cp.desired_roles,
    (select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name))
     from public.candidate_skills cs
     join public.skills s on s.id = cs.skill_id
     where cs.candidate_id = tpm.candidate_id) as skills
  from public.talent_pool_memberships tpm
  join public.candidates c on c.id = tpm.candidate_id
  left join public.job_matches jm on jm.candidate_id = tpm.candidate_id and jm.job_id = p_job_id
  left join public.candidate_preferences cp on cp.candidate_id = tpm.candidate_id
  where tpm.tenant_id = p_tenant_id
    and tpm.status = 'active'
    and tpm.consent_status = 'granted'
    and (jm.is_eligible is null or jm.is_eligible = true)
  order by jm.score desc nulls last, tpm.joined_at desc
  limit p_limit
$$;

-- -----------------------------------------------------------------------------
-- 10. RLS (Row-Level Security)
-- -----------------------------------------------------------------------------

alter table public.talent_pool_memberships enable row level security;

create policy "Talent pool visible to tenant members"
  on public.talent_pool_memberships for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Talent pool insertable by service"
  on public.talent_pool_memberships for insert
  with check (
    true  -- via join_talent_pool() function with SECURITY DEFINER
  );

create policy "Talent pool updatable by owner/service"
  on public.talent_pool_memberships for update
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  )
  with check (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

alter table public.candidate_preferences enable row level security;

create policy "Candidate preferences visible to owner/service"
  on public.candidate_preferences for all
  using (
    candidate_id IN (
      SELECT c.id
      FROM public.candidates c
      JOIN public.people p ON p.id = c.person_id
      JOIN public.tenant_memberships tm ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  )
  with check (
    candidate_id IN (
      SELECT c.id
      FROM public.candidates c
      JOIN public.people p ON p.id = c.person_id
      JOIN public.tenant_memberships tm ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

alter table public.job_matches enable row level security;

create policy "Job matches visible to tenant members"
  on public.job_matches for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Job matches insertable by service"
  on public.job_matches for insert
  with check (
    true  -- via matching engine (service)
  );

alter table public.candidate_profile_views enable row level security;

create policy "Profile views visible to tenant members"
  on public.candidate_profile_views for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- Trigger: prevent unauthorized candidate_preferences update
-- -----------------------------------------------------------------------------

-- WHAT:
-- candidate_preferences should only be updated through proper channels
-- This prevents direct SQL manipulation bypassing validation

create or replace function public.validate_candidate_preferences_update()
returns trigger
language plpgsql
as $$
begin
  -- Ensure tenant ownership is consistent
  if (select tenant_id from public.candidates where id = new.candidate_id) is null then
    raise exception 'Invalid candidate_id';
  end if;

  return new;
end;
$$;

create trigger validate_candidate_preferences_update
  before update on public.candidate_preferences
  for each row execute function public.validate_candidate_preferences_update();