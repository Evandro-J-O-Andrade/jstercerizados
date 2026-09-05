-- =============================================================================
-- GATE-CAND-ALERTS-01 — Candidate Job Alerts (self-service)
-- =============================================================================
-- Purpose:
--   - Add `candidate_job_alerts` table: saved search criteria for vagas
--   - Self-scoped RLS: candidato can only manage their own alerts
--   - Multi-tenant via tenant_id
--   - Snapshot of criteria (keywords, location, contract, work_mode, salary)
--   - Frequency controls how often the candidate receives notifications
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. candidate_job_alerts — Alertas de vagas por candidato
-- -----------------------------------------------------------------------------

create table if not exists public.candidate_job_alerts (
  id            uuid primary key default gen_random_uuid(),

  -- WHAT: Tenant onde o alerta está ativo
  -- WHY:  Isolamento multi-tenant
  tenant_id     uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Pessoa (candidato) dona do alerta
  -- WHY:  Vínculo direto à people (identidade)
  -- ARCH: 1 alerta por (person_id, name) — nome único por candidato
  person_id     uuid not null
    references public.people(id)
    on delete cascade,

  -- WHAT: Nome amigável do alerta
  -- WHY:  Permite múltiplos alertas ("Vagas SP", "Vagas Remotas")
  name          text not null,

  -- WHAT: Critérios de busca (snapshot dos filtros aplicados)
  keywords      text,
  city          text,
  state         text,
  contract_type text,
  work_mode     text,
  salary_min    integer,
  salary_max    integer,

  -- WHAT: Frequência do alerta
  -- WHY:  Controla cadência das notificações
  -- ARCH: 'instant' | 'daily' | 'weekly'
  frequency     text not null default 'daily'
    check (frequency in ('instant', 'daily', 'weekly')),

  -- WHAT: Alerta ativo?
  is_active     boolean not null default true,

  -- WHAT: Última vez que o alerta foi disparado (auditoria / dedupe)
  last_sent_at  timestamptz,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint candidate_job_alerts_unique unique (person_id, name)
);

create index if not exists idx_candidate_job_alerts_person
  on public.candidate_job_alerts(person_id);
create index if not exists idx_candidate_job_alerts_tenant
  on public.candidate_job_alerts(tenant_id);
create index if not exists idx_candidate_job_alerts_active
  on public.candidate_job_alerts(tenant_id, is_active);

-- -----------------------------------------------------------------------------
-- 2. updated_at trigger
-- -----------------------------------------------------------------------------

drop trigger if exists trg_candidate_job_alerts_updated_at on public.candidate_job_alerts;
create trigger trg_candidate_job_alerts_updated_at
  before update on public.candidate_job_alerts
  for each row execute function public.tg_set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. RLS
-- -----------------------------------------------------------------------------

alter table public.candidate_job_alerts enable row level security;

-- Candidato vê apenas os próprios alertas
drop policy if exists candidate_job_alerts_self_read on public.candidate_job_alerts;
create policy candidate_job_alerts_self_read
  on public.candidate_job_alerts for select
  using (
    person_id = public.current_person_id()
  );

-- Candidato pode inserir apenas com person_id = self e tenant_id = membership
drop policy if exists candidate_job_alerts_self_insert on public.candidate_job_alerts;
create policy candidate_job_alerts_self_insert
  on public.candidate_job_alerts for insert
  with check (
    person_id = public.current_person_id()
    and is_tenant_member(tenant_id)
  );

-- Candidato pode atualizar apenas os próprios
drop policy if exists candidate_job_alerts_self_update on public.candidate_job_alerts;
create policy candidate_job_alerts_self_update
  on public.candidate_job_alerts for update
  using (
    person_id = public.current_person_id()
  )
  with check (
    person_id = public.current_person_id()
    and is_tenant_member(tenant_id)
  );

-- Candidato pode deletar apenas os próprios
drop policy if exists candidate_job_alerts_self_delete on public.candidate_job_alerts;
create policy candidate_job_alerts_self_delete
  on public.candidate_job_alerts for delete
  using (
    person_id = public.current_person_id()
  );

-- -----------------------------------------------------------------------------
-- 4. Grants
-- -----------------------------------------------------------------------------

grant select, insert, update, delete on public.candidate_job_alerts to authenticated;

-- -----------------------------------------------------------------------------
-- 5. RBAC — permission + grant to 'candidato' role
-- -----------------------------------------------------------------------------

INSERT INTO public.permissions (code, resource, action, description)
VALUES (
  'candidate_job_alerts.manage',
  'candidate_job_alerts',
  'manage',
  'Gerenciar próprios alertas de vagas'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'candidato'
  AND p.code = 'candidate_job_alerts.manage'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. Comments
-- -----------------------------------------------------------------------------

comment on table public.candidate_job_alerts is
  'Alertas de vagas do candidato (self-service). RLS escopa por person_id.';