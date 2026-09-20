-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: recruitment
-- STATUS: canonical
-- SOURCE: MASTER SPEC + docs/sql/04_rh_recruitment.sql
-- DEPENDENCIES: 01_core.sql, 04_crm.sql, 05_rh.sql
-- ============================================================

create table if not exists public.stage_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  "order" integer not null,
  is_default boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  title text not null,
  description text not null,
  requirements jsonb not null default '{}'::jsonb,
  location text,
  schedule text,
  contract_type text,
  status text not null default 'active',
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create table if not exists public.job_skills (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  job_id uuid not null references public.jobs(id),
  skill_id uuid not null references public.skills(id),
  required boolean not null default true,
  weight integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_job_skill unique (job_id, skill_id)
);

create table if not exists public.recruitment_processes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  job_id uuid not null references public.jobs(id),
  stage_template_id uuid references public.stage_templates(id),
  name text not null,
  status text not null default 'active',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recruitment_stages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  recruitment_process_id uuid not null references public.recruitment_processes(id),
  name text not null,
  "order" integer not null,
  status text not null default 'pending',
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_processes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  recruitment_process_id uuid not null references public.recruitment_processes(id),
  candidate_id uuid not null references public.candidates(id),
  current_stage_id uuid references public.recruitment_stages(id),
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  job_id uuid not null references public.jobs(id),
  candidate_id uuid not null references public.candidates(id),
  status text not null default 'pending',
  source text,
  cover_letter text,
  applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  application_id uuid not null references public.applications(id),
  status text not null,
  changed_by_person_id uuid references public.people(id),
  notes text,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.application_profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  application_id uuid not null references public.applications(id),
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  candidate_process_id uuid not null references public.candidate_processes(id),
  type text not null,
  scheduled_at timestamptz,
  finished_at timestamptz,
  location text,
  notes text,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_participants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  interview_id uuid not null references public.interviews(id),
  person_id uuid not null references public.people(id),
  role text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_feedback (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  interview_id uuid not null references public.interviews(id),
  participant_id uuid not null references public.interview_participants(id),
  rating integer,
  strengths text,
  weaknesses text,
  recommendation text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
