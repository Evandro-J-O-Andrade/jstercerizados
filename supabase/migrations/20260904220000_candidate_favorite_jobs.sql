-- =============================================================================
-- GATE-CAND-PORTAL-01 — Candidate Favorite Jobs (self-service)
-- =============================================================================
-- Purpose:
--   - Add `favorite_jobs` table for candidatos to mark vagas as favoritas
--   - Self-scoped RLS: candidato can only manage their own favorites
--   - Multi-tenant via `tenant_id` (candidates is multi-tenant)
--   - No write for `a` (insert) without `is_tenant_member` + ownership via people
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. favorite_jobs — Vagas favoritadas pelo candidato
-- -----------------------------------------------------------------------------

create table if not exists public.favorite_jobs (
  id            uuid primary key default gen_random_uuid(),

  -- WHAT: Tenant onde a vaga foi publicada
  -- WHY:  Isolamento multi-tenant
  -- ARCH: RLS chain: auth.uid → people → tenant_memberships → tenant_id
  tenant_id     uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Pessoa (candidato) que favoritou
  -- WHY:  Vínculo direto à people (identidade), não candidate, para evitar
  --       inconsistência enquanto o contexto candidate é criado via bootstrap.
  -- ARCH: 1 favorito por (person_id, job_id) — UNIQUE
  person_id     uuid not null
    references public.people(id)
    on delete cascade,

  -- WHAT: Vaga favoritada
  -- WHY:  Referência à vaga publicada
  job_id        uuid not null
    references public.jobs(id)
    on delete cascade,

  created_at    timestamptz not null default now(),

  constraint favorite_jobs_unique unique (person_id, job_id)
);

create index if not exists idx_favorite_jobs_person
  on public.favorite_jobs(person_id);
create index if not exists idx_favorite_jobs_job
  on public.favorite_jobs(job_id);
create index if not exists idx_favorite_jobs_tenant
  on public.favorite_jobs(tenant_id);

-- -----------------------------------------------------------------------------
-- 2. RLS
-- -----------------------------------------------------------------------------

alter table public.favorite_jobs enable row level security;

-- Candidato vê apenas os próprios favoritos
drop policy if exists favorite_jobs_self_read on public.favorite_jobs;
create policy favorite_jobs_self_read
  on public.favorite_jobs for select
  using (
    person_id = public.current_person_id()
  );

-- Candidato pode inserir apenas com person_id = self e tenant_id = membership
drop policy if exists favorite_jobs_self_insert on public.favorite_jobs;
create policy favorite_jobs_self_insert
  on public.favorite_jobs for insert
  with check (
    person_id = public.current_person_id()
    and is_tenant_member(tenant_id)
  );

-- Candidato pode deletar apenas os próprios
drop policy if exists favorite_jobs_self_delete on public.favorite_jobs;
create policy favorite_jobs_self_delete
  on public.favorite_jobs for delete
  using (
    person_id = public.current_person_id()
  );

-- -----------------------------------------------------------------------------
-- 3. Grants
-- -----------------------------------------------------------------------------

grant select, insert, delete on public.favorite_jobs to authenticated;

-- -----------------------------------------------------------------------------
-- 4. Comments
-- -----------------------------------------------------------------------------

comment on table public.favorite_jobs is
  'Vagas favoritadas pelo candidato. Self-service (RLS escopa por person_id).';
