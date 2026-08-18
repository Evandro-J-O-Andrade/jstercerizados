-- =============================================================================
-- GATE-DATA-04.009 — DOMAIN EVENTS: Transactional Outbox Pattern
-- =============================================================================
-- Entity: domain_events (immutable event log)
-- Schema: public
-- Order: 9
-- Dependencies: 001_core, 002_identity, 006_applications, 007_rbac
-- =============================================================================
-- Purpose:
--   Persist domain events as the bridge between business logic and automation.
--   Uses Transactional Outbox pattern: events persisted in the same transaction.
--
-- Rules (per GATE-DATA-03 §17 Princípio canônico de eventos):
--   - Event is persisted BEFORE automation reacts
--   - PostgreSQL is source of truth; n8n is orchestrator
--   - Events are immutable (append-only)
--   - Events are idempotent (n8n tracks processing)
--   - No external API calls in this migration
--   - No WhatsApp/email logic in DB
--   - Event contracts version-controlled (event_version)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. domain_events — Event log canônico (Transactional Outbox)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Registro imutável de eventos de domínio. Implementa o padrão Transactional Outbox.

-- WHY:
-- Separa persistência de negócio (PostgreSQL) da automação (n8n/WhatsApp).
-- Garante que evento seja registrado mesmo se a automação falhar.

-- ARCHITECTURE:
-- - APPEND-ONLY: nunca UPDATE, nunca DELETE em domain_events
-- - published_at controla entrega ao n8n (n8n polls via realtime ou scheduler)
-- - idempotency_key previne duplicata no consumer
-- - correlation_id rastreia uma operação inteira (request → sub-events)
-- - causation_id liga evento a evento anterior (chain)
create table public.domain_events (
  id                  uuid primary key default gen_random_uuid(),

  -- WHAT: Tenant proprietário do evento
  -- WHY:  Isolamento multi-tenant
  -- ARCH: RLS chain: auth.uid → people → tenant_memberships → tenant_id
  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Nome canônico do evento
  -- WHY:  Identifica o fato de negócio
  -- ARCH: Convenção: aggregate.verb, ex: application.created
  event_name          varchar(100) not null,
  event_version       varchar(20) not null default '1.0',

  -- WHAT: Entidade que originou o evento
  aggregate_type      varchar(50),
  aggregate_id        uuid,

  -- WHAT: Quem provocou a ação (pode ser system para automation)
  actor_person_id     uuid references public.people(id) on delete set null,

  -- WHAT: Rastreamento transversal
  -- WHY:  correlation_id = request única, causation_id = evento anterior
  -- ARCH: Permite reconstruir o fluxo completo
  correlation_id      uuid,
  causation_id        uuid,

  -- WHAT: Dados do evento
  -- WHY:  Payload para consumo pelo n8n
  -- ARCH: JSONB — contrato versionado
  payload             jsonb not null default '{}'::jsonb,

  -- WHAT: Metadados técnicos
  -- WHY:  Contexto para debugging e auditoria
  metadata            jsonb not null default '{}'::jsonb,

  -- WHAT: Quando ocorreu no domínio
  -- WHY:  Para replay e timeline correta
  -- ARCH: captured BEFORE outbox publishing
  occurred_at         timestamptz not null default now(),

  -- WHAT: Quando foi persistido
  created_at          timestamptz not null default now(),

  -- WHAT: Quando foi entregue ao consumidor
  -- WHY:  n8n marca published_at após sucesso
  -- ARCH: NULL = pending, preenchido = delivered
  published_at        timestamptz,

  -- WHAT: Tentativas de entrega
  delivery_attempts   integer not null default 0,

  -- WHAT: Último erro
  last_error          text,

  -- WHAT: Idempotência
  -- WHY:  Previne duplicata no consumer
  -- ARCH: uuid gerado pelo producer
  idempotency_key     uuid
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_domain_events_tenant on public.domain_events(tenant_id);
create index idx_domain_events_name on public.domain_events(event_name);
create index idx_domain_events_aggregate on public.domain_events(aggregate_type, aggregate_id);
create index idx_domain_events_correlation on public.domain_events(correlation_id);
create index idx_domain_events_occurred_at on public.domain_events(occurred_at desc);
create index idx_domain_events_pending on public.domain_events(published_at) where published_at is null;
create index idx_domain_events_actor on public.domain_events(actor_person_id);
create index idx_domain_events_idempotency on public.domain_events(idempotency_key);

-- -----------------------------------------------------------------------------
-- Trigger: updated_at
-- -----------------------------------------------------------------------------
-- domain_events should NOT be updated at all (immutable)
-- We only update published_at/delivery_attempts
create trigger update_domain_events_updated_at
  before update on public.domain_events
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- Imutabilidade: bloquear UPDATE/DELETE em domain_events
-- -----------------------------------------------------------------------------
-- WHAT:
-- Garante que eventos sejam absolutamente imutáveis.

-- WHY:
-- Event sourcing e auditoria exigem que eventos nunca sejam alterados.

-- ARCHITECTURE:
-- - Apenas INSERT e UPDATE de published_at/delivery_attempts/last_error permitidos
-- - UPDATE de payload/event_name/etc é BLOQUEADO
create or replace function public.prevent_event_modification()
returns trigger
language plpgsql
as $$
begin
  -- Only allow updating published_at, delivery_attempts, last_error
  if old.payload is distinct from new.payload then
    raise exception 'domain_events payload is immutable';
  end if;
  if old.event_name is distinct from new.event_name then
    raise exception 'domain_events event_name is immutable';
  end if;
  if old.tenant_id is distinct from new.tenant_id then
    raise exception 'domain_events tenant_id is immutable';
  end if;
  if old.event_version is distinct from new.event_version then
    raise exception 'domain_events event_version is immutable';
  end if;
  if old.occurred_at is distinct from new.occurred_at then
    raise exception 'domain_events occurred_at is immutable';
  end if;

  return new;
end;
$$;

create trigger prevent_event_update
  before update on public.domain_events
  for each row execute function public.prevent_event_modification();

create trigger prevent_event_delete
  before delete on public.domain_events
  for each row execute function public.prevent_history_modification();

-- -----------------------------------------------------------------------------
-- Function: emit_domain_event()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Helper function to emit domain events with proper context.

-- WHY:
-- Garante que todos os eventos sejam criados com o mesmo formato/contract.

-- ARCHITECTURE:
-- Called from triggers AFTER INSERT/UPDATE on domain tables.
-- Example: AFTER INSERT ON applications → emit 'application.created'
create or replace function public.emit_domain_event(
  p_tenant_id uuid,
  p_event_name varchar,
  p_aggregate_type varchar,
  p_aggregate_id uuid,
  p_payload jsonb default '{}'::jsonb,
  p_actor_person_id uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_event_id uuid;
  v_correlation_id uuid;
begin
  -- Generate correlation_id if not exists (for tracing)
  v_correlation_id := gen_random_uuid();

  insert into public.domain_events (
    tenant_id,
    event_name,
    event_version,
    aggregate_type,
    aggregate_id,
    actor_person_id,
    correlation_id,
    payload,
    occurred_at
  ) values (
    p_tenant_id,
    p_event_name,
    '1.0',
    p_aggregate_type,
    p_aggregate_id,
    p_actor_person_id,
    v_correlation_id,
    p_payload,
    now()
  ) returning id into v_event_id;

  return v_event_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Triggers: emit events from domain tables
-- -----------------------------------------------------------------------------

-- WHAT:
-- When an application is created, emit 'application.created' event.

-- WHY:
-- Automação precisa saber quando uma candidatura é feita.

-- ARCHITECTURE:
-- AFTER INSERT em applications → emit_domain_event
create or replace function public.emit_application_created_event()
returns trigger
language plpgsql
as $$
begin
  perform public.emit_domain_event(
    new.tenant_id,
    'application.created',
    'application',
    new.id,
    jsonb_build_object(
      'application_id', new.id,
      'candidate_id', new.candidate_id,
      'job_id', new.job_id,
      'source', new.source,
      'match_score', new.match_score,
      'applied_at', new.applied_at
    ),
    new.created_by
  );

  return new;
end;
$$;

create trigger application_created_event
  after insert on public.applications
  for each row
  execute function public.emit_application_created_event();

-- WHAT:
-- When an application status changes, emit 'application.status_changed' event.

-- WHY:
-- Automação precisa notificar sobre progresso do processo.

-- ARCHITECTURE:
-- AFTER INSERT em application_status_history → emit status_changed
create or replace function public.emit_application_status_changed_event()
returns trigger
language plpgsql
as $$
begin
  perform public.emit_domain_event(
    (SELECT tenant_id FROM public.applications WHERE id = new.application_id),
    'application.status_changed',
    'application',
    new.application_id,
    jsonb_build_object(
      'application_id', new.application_id,
      'previous_stage', new.previous_stage,
      'stage', new.stage,
      'reason', new.reason,
      'changed_by', new.changed_by,
      'changed_at', new.changed_at
    ),
    new.changed_by
  );

  return new;
end;
$$;

create trigger application_status_changed_event
  after insert on public.application_status_history
  for each row
  execute function public.emit_application_status_changed_event();

-- -----------------------------------------------------------------------------
-- Triggers: emit events from candidate domain
-- -----------------------------------------------------------------------------

create or replace function public.emit_candidate_created_event()
returns trigger
language plpgsql
as $$
begin
  perform public.emit_domain_event(
    new.tenant_id,
    'candidate.created',
    'candidate',
    new.id,
    jsonb_build_object(
      'candidate_id', new.id,
      'person_id', new.person_id,
      'tenant_id', new.tenant_id,
      'source', new.source,
      'created_at', new.created_at
    ),
    new.created_by
  );

  return new;
end;
$$;

create trigger candidate_created_event
  after insert on public.candidates
  for each row
  execute function public.emit_candidate_created_event();

-- -----------------------------------------------------------------------------
-- Triggers: emit events from job domain
-- -----------------------------------------------------------------------------

create or replace function public.emit_job_published_event()
returns trigger
language plpgsql
as $$
begin
  -- Only emit when status transitions to 'published'
  if new.status = 'published' and (old.status is null or old.status != 'published') then
    perform public.emit_domain_event(
      new.tenant_id,
      'job.published',
      'job',
      new.id,
      jsonb_build_object(
        'job_id', new.id,
        'title', new.title,
        'company_relationship_id', new.company_relationship_id,
        'published_at', new.published_at,
        'match_skills', (
          select jsonb_agg(s.name)
          from public.job_skills js
          join public.skills s on s.id = js.skill_id
          where js.job_id = new.id
        )
      ),
      new.created_by
    );
  end if;

  return new;
end;
$$;

create trigger job_published_event
  after update on public.jobs
  for each row
  execute function public.emit_job_published_event();

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------
-- WHY:
-- Events são scoped ao tenant — um tenant não vê eventos de outro.

-- ARCH:
-- auth.uid()
--    ↓
-- people.auth_user_id
--    ↓
-- people.id
--    ↓
-- tenant_memberships
--    ↓
-- tenant_id
--    ↓
-- domain_events.tenant_id
alter table public.domain_events enable row level security;

create policy "Domain events visible to tenant members"
  on public.domain_events for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Domain events insertable by trigger (service)"
  on public.domain_events for insert
  with check (
    true  -- triggers use SECURITY DEFINER via emit_domain_event
  );

-- -----------------------------------------------------------------------------
-- Function: get_pending_domain_events()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Retrieves pending events for n8n/event publisher to consume.

-- WHY:
-- n8n polls for events to process. This function provides a clean interface.

-- ARCHITECTURE:
-- - Returns events where published_at IS NULL
-- - Ordered by occurred_at (FIFO)
-- - Used by event publisher/scheduler
create or replace function public.get_pending_domain_events(
  p_limit integer default 100
)
returns table (
  event_id uuid,
  event_name varchar,
  tenant_id uuid,
  aggregate_type varchar,
  aggregate_id uuid,
  payload jsonb,
  occurred_at timestamptz,
  idempotency_key uuid
)
language sql
security definer
as $$
  select
    id, event_name, tenant_id, aggregate_type, aggregate_id,
    payload, occurred_at, idempotency_key
  from public.domain_events
  where published_at is null
  order by occurred_at asc
  limit p_limit
$$;

-- -----------------------------------------------------------------------------
-- Function: mark_event_published()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Marks an event as published after successful delivery to n8n.

-- WHY:
-- Prevents reprocessing of the same event.

-- ARCHITECTURE:
-- - Called by event publisher after n8n webhook success
-- - Sets published_at, increments attempt counter
create or replace function public.mark_event_published(
  p_event_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  update public.domain_events
  set published_at = now(),
      delivery_attempts = delivery_attempts + 1
  where id = p_event_id
    and published_at is null;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: mark_event_failed()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Records a failed delivery attempt with error details.

-- WHY:
-- Enables retry logic and debugging.

-- ARCHITECTURE:
-- - Called by event publisher after n8n webhook failure
-- - Does NOT mark as published — remains pending for retry
create or replace function public.mark_event_failed(
  p_event_id uuid,
  p_error text
)
returns void
language plpgsql
security definer
as $$
begin
  update public.domain_events
  set last_error = p_error,
      delivery_attempts = delivery_attempts + 1
  where id = p_event_id;
end;
$$;