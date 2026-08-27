-- =============================================================================
-- GATE-DATA-04.007 — RECRUITMENT_STAGES: Etapas de Recrutamento
-- =============================================================================
-- Entity: recruitment_stages
-- Schema: public
-- Order: 7
-- Dependencies: 001_core, 005_jobs, 006_applications, 008_rbac
-- =============================================================================
-- Purpose:
--   Representar as etapas configuradas de um processo seletivo, permitindo
--   ordenação e status por etapa.
--
-- Rules:
--   - Stage is TENANT-SCOPED
--   - FK para recruitment_processes
--   - Ordem definida por campo order
--   - RLS chain: auth.uid → people → tenant_memberships → tenant_id
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. recruitment_stages — Etapas do processo seletivo
-- -----------------------------------------------------------------------------

create table public.recruitment_stages (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  recruitment_process_id uuid not null
    references public.recruitment_processes(id)
    on delete cascade,

  name                varchar(120) not null,
  description         text,
  status              varchar(50) not null default 'active'
    check (status in ('active', 'inactive', 'completed', 'skipped')),

  order               integer not null default 0,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_recruitment_stages_tenant on public.recruitment_stages(tenant_id);
create index idx_recruitment_stages_process on public.recruitment_stages(recruitment_process_id);
create index idx_recruitment_stages_order on public.recruitment_stages(recruitment_process_id, order);

create trigger update_recruitment_stages_updated_at
  before update on public.recruitment_stages
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.recruitment_stages enable row level security;

create policy "Recruitment stages visible to tenant members"
  on public.recruitment_stages for select
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.people p on tm.person_id = p.id
      where p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

create policy "Recruitment stages manageable by tenant recruiters"
  on public.recruitment_stages for all
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.people p on tm.person_id = p.id
      where p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','recruiter')
    )
    or auth.role() = 'service_role'
  )
  with check (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.people p on tm.person_id = p.id
      where p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','recruiter')
    )
    or auth.role() = 'service_role'
  );
