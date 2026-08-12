-- =============================================================================
-- GATE-DATA-02 — Schema PostgreSQL unificado J&S Empregos LTDA
-- =============================================================================
-- Fonte: supabase/schema.sql + database/*.sql + database/novo_schema.sql
-- Autoridade de identidade: Supabase Auth (auth.users)
-- Nenhuma senha_hash na aplicação
-- =============================================================================

-- =============================================================================
-- 01 — EXTENSIONS / TYPES
-- =============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =============================================================================
-- 02 — TENANCY
-- =============================================================================
create table public.tenants (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  plan        text not null default 'free',
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.tenants enable row level security;

create policy "Tenants visible to authenticated"
  on public.tenants for select
  using (auth.role() = 'authenticated');

-- =============================================================================
-- 03 — IDENTITY / PROFILES / MEMBERSHIPS
-- =============================================================================
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  email         text not null,
  full_name     text not null,
  role          text not null check (role in ('admin','candidato','empresa','rh','comercial','financeiro','atendimento')),
  phone         text,
  company_name  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins view all tenant profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.tenant_id = profiles.tenant_id
    )
  );

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.tenants (id, name, slug)
  values (uuid_generate_v4(), new.raw_user_meta_data->>'company_name' or new.email, lower(split_part(new.email, '@', 1)))
  on conflict (slug) do nothing
  returning id into new.tenant_id;

  if new.tenant_id is null then
    select id into new.tenant_id from public.tenants where slug = 'js-empregos' limit 1;
  end if;

  insert into public.profiles (id, tenant_id, email, full_name, role)
  values (
    new.id,
    new.tenant_id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'candidato')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.tenant_memberships (
  id               uuid primary key default uuid_generate_v4(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  membership_role  text not null check (membership_role in ('owner','admin','manager','member','viewer')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, user_id)
);

alter table public.tenant_memberships enable row level security;

create policy "Members view own membership"
  on public.tenant_memberships for select
  using (user_id = auth.uid());

-- =============================================================================
-- 04 — ORGANIZATIONS / COMPANIES
-- =============================================================================
create table public.companies (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  name            text not null,
  trading_name    text,
  cnpj            text unique,
  phone           text,
  whatsapp        text,
  email           text,
  website         text,
  logo_url        text,
  address         jsonb,
  type            text not null check (type in ('client','partner','supplier','internal')),
  status          text not null default 'active' check (status in ('active','inactive','pending','rejected')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.companies enable row level security;

create policy "Companies visible within tenant"
  on public.companies for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Companies manageable within tenant"
  on public.companies for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create policy "Companies updatable within tenant"
  on public.companies for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

-- =============================================================================
-- 05 — CANDIDATES / CURRICULUM
-- =============================================================================
create table public.candidates (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  profile_id          uuid references auth.users(id) on delete set null,
  name                text not null,
  cpf                 text,
  rg                  text,
  phone               text not null,
  email               text,
  birth_date          date,
  city                text,
  state               text,
  target_role         text,
  target_area         text,
  salary_min          numeric,
  salary_max          numeric,
  experience_summary  text,
  linkedin            text,
  portfolio_url       text,
  status              text not null default 'new' check (status in ('new','review','interview','approved','rejected','talent_pool','inactive')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.candidates enable row level security;

create policy "Candidates visible within tenant"
  on public.candidates for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Candidates insertable within tenant"
  on public.candidates for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Candidates updatable within tenant"
  on public.candidates for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create index idx_candidates_tenant on public.candidates(tenant_id);
create index idx_candidates_status on public.candidates(status);
create index idx_candidates_target_role on public.candidates(target_role);
create index idx_candidates_target_area on public.candidates(target_area);

create table public.curricula (
  id                  uuid primary key default uuid_generate_v4(),
  candidate_id        uuid not null references public.candidates(id) on delete cascade,
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  title               text,
  objective           text,
  salary_min          numeric,
  salary_max          numeric,
  salary_type         text check (salary_type in ('range','monthly','negotiable')),
  availability        text check (availability in ('immediate','15_days','30_days','90_days')),
  linkedin            text,
  portfolio_url       text,
  cv_storage_path     text,
  status              text not null default 'active' check (status in ('active','inactive','archived')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (candidate_id)
);

alter table public.curricula enable row level security;

create policy "Curricula visible within tenant"
  on public.curricula for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Curricula manageable within tenant"
  on public.curricula for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Curricula updatable within tenant"
  on public.curricula for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create table public.experiences (
  id              uuid primary key default uuid_generate_v4(),
  curriculum_id   uuid not null references public.curricula(id) on delete cascade,
  company         text not null,
  role            text not null,
  start_date      date,
  end_date        date,
  is_current      boolean not null default false,
  description     text,
  created_at      timestamptz not null default now()
);

alter table public.experiences enable row level security;

create policy "Experiences visible within tenant"
  on public.experiences for select
  using (
    curriculum_id in (
      select c.id from public.curricula c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create policy "Experiences manageable within tenant"
  on public.experiences for insert
  with check (
    curriculum_id in (
      select c.id from public.curricula c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create policy "Experiences updatable within tenant"
  on public.experiences for update
  using (
    curriculum_id in (
      select c.id from public.curricula c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create table public.education (
  id              uuid primary key default uuid_generate_v4(),
  curriculum_id   uuid not null references public.curricula(id) on delete cascade,
  institution     text not null,
  course          text not null,
  level           text check (level in ('elementary','high_school','technical','undergraduate','graduate','masters','doctorate')),
  start_date      date,
  end_date        date,
  completed       boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.education enable row level security;

create policy "Education visible within tenant"
  on public.education for select
  using (
    curriculum_id in (
      select c.id from public.curricula c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create policy "Education manageable within tenant"
  on public.education for insert
  with check (
    curriculum_id in (
      select c.id from public.curricula c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create policy "Education updatable within tenant"
  on public.education for update
  using (
    curriculum_id in (
      select c.id from public.curricula c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create table public.courses (
  id              uuid primary key default uuid_generate_v4(),
  curriculum_id   uuid not null references public.curricula(id) on delete cascade,
  name            text not null,
  institution     text,
  hours           text,
  completion_date date,
  certificate_url text,
  created_at      timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Courses visible within tenant"
  on public.courses for select
  using (
    curriculum_id in (
      select c.id from public.curricula c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create table public.languages (
  id              uuid primary key default uuid_generate_v4(),
  curriculum_id   uuid not null references public.curricula(id) on delete cascade,
  language        text not null,
  proficiency     text check (proficiency in ('basic','intermediate','advanced','fluent','native')),
  created_at      timestamptz not null default now(),
  unique (curriculum_id, language)
);

alter table public.languages enable row level security;

create policy "Languages visible within tenant"
  on public.languages for select
  using (
    curriculum_id in (
      select c.id from public.curricula c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

-- =============================================================================
-- 06 — SKILLS
-- =============================================================================
create table public.skills (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid references public.tenants(id) on delete cascade,
  name            text not null,
  category        text,
  scope           text not null default 'global' check (scope in ('global','tenant')),
  created_at      timestamptz not null default now(),
  unique (tenant_id, name)
);

alter table public.skills enable row level security;

create policy "Skills visible to authenticated"
  on public.skills for select
  using (auth.role() = 'authenticated');

create table public.candidate_skills (
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  skill_id        uuid not null references public.skills(id) on delete cascade,
  level           text check (level in ('basic','intermediate','advanced')),
  months_used     integer default 0,
  last_used       date,
  created_at      timestamptz not null default now(),
  primary key (candidate_id, skill_id)
);

alter table public.candidate_skills enable row level security;

create policy "Candidate skills visible within tenant"
  on public.candidate_skills for select
  using (
    candidate_id in (
      select c.id from public.candidates c
      where c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create table public.job_skills (
  job_id          uuid not null references public.jobs(id) on delete cascade,
  skill_id        uuid not null references public.skills(id) on delete cascade,
  level_required  text check (level_required in ('basic','intermediate','advanced')),
  required        boolean not null default true,
  created_at      timestamptz not null default now(),
  primary key (job_id, skill_id)
);

alter table public.job_skills enable row level security;

create policy "Job skills visible within tenant"
  on public.job_skills for select
  using (
    job_id in (
      select j.id from public.jobs j
      where j.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

-- =============================================================================
-- 07 — JOBS
-- =============================================================================
create table public.jobs (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  company_id          uuid references public.companies(id) on delete set null,
  title               text not null,
  slug                text not null,
  description         text,
  responsibilities    text,
  requirements        text,
  benefits            jsonb,
  salary_min          numeric,
  salary_max          numeric,
  salary_type         text check (salary_type in ('range','monthly','negotiable')),
  employment_type     text not null check (employment_type in ('temporary','effective','internship','apprentice','freelance','third_party')),
  job_source          text not null check (job_source in ('client','talent_pool')),
  professional_area   text,
  workload            text,
  work_schedule       text,
  work_mode           text check (work_mode in ('presencial','hybrid','remote')),
  location            jsonb,
  status              text not null default 'draft' check (status in ('draft','active','archived','filled')),
  published_at        timestamptz,
  expires_at          timestamptz,
  views               integer not null default 0,
  applications_count  integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (tenant_id, slug)
);

alter table public.jobs enable row level security;

create policy "Jobs visible within tenant"
  on public.jobs for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Jobs manageable within tenant"
  on public.jobs for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create policy "Jobs updatable within tenant"
  on public.jobs for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create policy "Jobs deletable within tenant"
  on public.jobs for delete
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create index idx_jobs_tenant on public.jobs(tenant_id);
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_employment_type on public.jobs(employment_type);
create index idx_jobs_job_source on public.jobs(job_source);
create index idx_jobs_professional_area on public.jobs(professional_area);
create index idx_jobs_published on public.jobs(published_at desc);

-- =============================================================================
-- 08 — RECRUITMENT PROCESSES
-- =============================================================================
create table public.recruitment_processes (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  job_id          uuid not null references public.jobs(id) on delete cascade,
  company_id      uuid references public.companies(id) on delete set null,
  title           text,
  stages_config   jsonb not null default '[]'::jsonb,
  status          text not null default 'open' check (status in ('open','in_progress','paused','completed','cancelled')),
  started_at      date,
  expected_end    date,
  ended_at        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.recruitment_processes enable row level security;

create policy "Processes visible within tenant"
  on public.recruitment_processes for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Processes manageable within tenant"
  on public.recruitment_processes for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create policy "Processes updatable within tenant"
  on public.recruitment_processes for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create index idx_processes_tenant on public.recruitment_processes(tenant_id);
create index idx_processes_job on public.recruitment_processes(job_id);
create index idx_processes_status on public.recruitment_processes(status);

-- =============================================================================
-- 09 — APPLICATIONS
-- =============================================================================
create table public.applications (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  job_id              uuid not null references public.jobs(id) on delete cascade,
  candidate_id        uuid not null references public.candidates(id) on delete cascade,
  curriculum_id       uuid references public.curricula(id) on delete set null,
  current_status      text not null default 'submitted' check (current_status in ('submitted','in_analysis','interview','approved','rejected','withdrawn')),
  applied_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.applications enable row level security;

create policy "Applications visible within tenant"
  on public.applications for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Applications insertable within tenant"
  on public.applications for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Applications updatable within tenant"
  on public.applications for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create index idx_applications_tenant on public.applications(tenant_id);
create index idx_applications_job on public.applications(job_id);
create index idx_applications_candidate on public.applications(candidate_id);
create index idx_applications_status on public.applications(current_status);
create unique index idx_applications_unique_job_candidate on public.applications(tenant_id, job_id, candidate_id);

-- =============================================================================
-- 10 — APPLICATION STATUS HISTORY
-- =============================================================================
create table public.application_status_history (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references public.applications(id) on delete cascade,
  from_status     text,
  to_status       text not null,
  changed_at      timestamptz not null default now(),
  changed_by      uuid references auth.users(id) on delete set null,
  metadata        jsonb
);

alter table public.application_status_history enable row level security;

create policy "History visible within tenant"
  on public.application_status_history for select
  using (
    application_id in (
      select a.id from public.applications a
      where a.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create index idx_application_history_app on public.application_status_history(application_id);
create index idx_application_history_changed on public.application_status_history(changed_at desc);

-- =============================================================================
-- 11 — INTERVIEWS / EVALUATIONS / HIRES
-- =============================================================================
create table public.interviews (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  process_id      uuid not null references public.recruitment_processes(id) on delete cascade,
  application_id  uuid references public.applications(id) on delete set null,
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  stage           text,
  scheduled_at    timestamptz,
  location        text,
  video_link      text,
  status          text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','rescheduled')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.interviews enable row level security;

create policy "Interviews visible within tenant"
  on public.interviews for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Interviews manageable within tenant"
  on public.interviews for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create policy "Interviews updatable within tenant"
  on public.interviews for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create index idx_interviews_tenant on public.interviews(tenant_id);
create index idx_interviews_process on public.interviews(process_id);
create index idx_interviews_candidate on public.interviews(candidate_id);

create table public.evaluations (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  interview_id    uuid not null references public.interviews(id) on delete cascade,
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  criteria        text not null,
  score           numeric(3,1),
  notes           text,
  evaluator_id    uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.evaluations enable row level security;

create policy "Evaluations visible within tenant"
  on public.evaluations for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Evaluations manageable within tenant"
  on public.evaluations for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create policy "Evaluations updatable within tenant"
  on public.evaluations for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create table public.hires (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  application_id  uuid not null references public.applications(id) on delete cascade,
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  job_id          uuid not null references public.jobs(id) on delete cascade,
  company_id      uuid references public.companies(id) on delete set null,
  start_date      date,
  contract_type   text check (contract_type in ('temporary','effective','internship','apprentice','freelance','third_party')),
  salary          numeric,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.hires enable row level security;

create policy "Hires visible within tenant"
  on public.hires for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Hires manageable within tenant"
  on public.hires for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create policy "Hires updatable within tenant"
  on public.hires for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

-- =============================================================================
-- 12 — DOCUMENTS
-- =============================================================================
create table public.candidate_documents (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  storage_path    text not null,
  file_name       text not null,
  mime_type       text,
  size_bytes      bigint,
  category        text check (category in ('cv','document','certificate','identity','other')),
  created_at      timestamptz not null default now()
);

alter table public.candidate_documents enable row level security;

create policy "Documents visible within tenant"
  on public.candidate_documents for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Documents manageable within tenant"
  on public.candidate_documents for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','member')
    )
  );

-- =============================================================================
-- 13 — CONSENTS / LGPD
-- =============================================================================
create table public.consents (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  purpose         text not null,
  status          text not null check (status in ('granted','revoked','pending')),
  version         text not null,
  granted_at      timestamptz,
  revoked_at      timestamptz,
  metadata        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.consents enable row level security;

create policy "Consents visible within tenant"
  on public.consents for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- 14 — FAVORITES
-- =============================================================================
create table public.favorite_jobs (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  job_id          uuid not null references public.jobs(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (tenant_id, candidate_id, job_id)
);

alter table public.favorite_jobs enable row level security;

create policy "Favorites visible within tenant"
  on public.favorite_jobs for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- 15 — LEADS / CONTACT REQUESTS
-- =============================================================================
create table public.leads (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  name            text not null,
  company         text,
  email           text,
  phone           text,
  origin          text check (origin in ('site','whatsapp','instagram','google','referral','event')),
  lead_type       text check (lead_type in ('client','company','candidate','partner','supplier','press')),
  message         text,
  utm_source      text,
  utm_campaign    text,
  ip_address      text,
  assigned_to     uuid references auth.users(id) on delete set null,
  status          text not null default 'new' check (status in ('new','contacted','qualified','proposal_sent','converted','discarded')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Leads visible within tenant"
  on public.leads for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create index idx_leads_tenant on public.leads(tenant_id);
create index idx_leads_status on public.leads(status);
create index idx_leads_origin on public.leads(origin);
create index idx_leads_type on public.leads(lead_type);

create table public.contact_requests (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  name            text not null,
  company         text,
  cnpj            text,
  phone           text not null,
  whatsapp        text not null,
  email           text not null,
  city            text,
  state           text,
  service         text not null,
  posts           integer not null default 1,
  message         text,
  status          text not null default 'new' check (status in ('new','contacted','proposal','won','lost')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

create policy "Contact requests visible within tenant"
  on public.contact_requests for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- 16 — NOTIFICATIONS
-- =============================================================================
create table public.notifications (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  message         text not null,
  type            text check (type in ('email','whatsapp','system','push')),
  read            boolean not null default false,
  link            text,
  created_at      timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Notifications visible to owner"
  on public.notifications for select
  using (user_id = auth.uid());

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(read);

-- =============================================================================
-- 17 — AUDIT LOGS
-- =============================================================================
create table public.audit_logs (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  action          text not null,
  table_name      text,
  record_id       uuid,
  details         jsonb,
  ip_address      text,
  user_agent      text,
  created_at      timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Audit logs visible within tenant"
  on public.audit_logs for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin')
    )
  );

create index idx_audit_logs_tenant on public.audit_logs(tenant_id);
create index idx_audit_logs_user on public.audit_logs(user_id);
create index idx_audit_logs_created on public.audit_logs(created_at desc);

-- =============================================================================
-- 18 — SERVICES
-- =============================================================================
create table public.services (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  name                text not null,
  description         text,
  short_description   text,
  benefits            text[],
  image_url           text,
  icon                text,
  category            text not null check (category in ('rh','facilities','terceirizacao','candidate')),
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Services visible publicly"
  on public.services for select
  using (true);

create policy "Services manageable within tenant"
  on public.services for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

-- =============================================================================
-- 19 — SUPPORT TICKETS
-- =============================================================================
create table public.tickets (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  company_id      uuid references public.companies(id) on delete set null,
  user_id         uuid not null references auth.users(id) on delete cascade,
  category        text check (category in ('security','cleaning','access','maintenance','facilities','others')),
  title           text not null,
  description     text,
  priority        text check (priority in ('low','medium','high','urgent')) default 'medium',
  status          text check (status in ('open','in_analysis','resolved','closed')) default 'open',
  assigned_to     uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.tickets enable row level security;

create policy "Tickets visible within tenant"
  on public.tickets for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create index idx_tickets_tenant on public.tickets(tenant_id);
create index idx_tickets_status on public.tickets(status);
create index idx_tickets_priority on public.tickets(priority);

-- =============================================================================
-- 20 — AUTOMATION / WEBHOOKS / WHATSAPP / EMAIL / IA
-- =============================================================================
create table public.webhooks (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  event           text not null,
  url             text not null,
  method          text not null default 'POST',
  headers         jsonb,
  secret          text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.webhooks enable row level security;

create policy "Webhooks manageable within tenant"
  on public.webhooks for all
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create table public.automation_queue (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  event           text not null,
  payload         jsonb not null,
  status          text not null default 'pending' check (status in ('pending','processing','success','error')),
  attempts        integer not null default 0,
  max_attempts    integer not null default 5,
  last_error      text,
  scheduled_at    timestamptz,
  executed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.automation_queue enable row level security;

create policy "Automation queue manageable within tenant"
  on public.automation_queue for all
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create index idx_automation_queue_tenant on public.automation_queue(tenant_id);
create index idx_automation_queue_status on public.automation_queue(status);
create index idx_automation_queue_event on public.automation_queue(event);

create table public.whatsapp_messages (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  phone_number    text not null,
  direction       text not null default 'inbound' check (direction in ('inbound','outbound')),
  message         text not null,
  status          text not null default 'sent' check (status in ('sent','delivered','read','error')),
  provider        text,
  external_id     text,
  session_id      text,
  created_at      timestamptz not null default now()
);

alter table public.whatsapp_messages enable row level security;

create policy "WhatsApp messages visible within tenant"
  on public.whatsapp_messages for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create index idx_whatsapp_tenant on public.whatsapp_messages(tenant_id);
create index idx_whatsapp_phone on public.whatsapp_messages(phone_number);
create index idx_whatsapp_created on public.whatsapp_messages(created_at);

create table public.emails (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  recipient       text not null,
  subject         text not null,
  body_html       text,
  body_text       text,
  status          text not null default 'sent' check (status in ('sent','error','opened','clicked')),
  template_id     text,
  provider        text,
  external_id     text,
  created_at      timestamptz not null default now()
);

alter table public.emails enable row level security;

create policy "Emails visible within tenant"
  on public.emails for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create index idx_emails_tenant on public.emails(tenant_id);
create index idx_emails_status on public.emails(status);

create table public.ai_conversations (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  session_id      text not null,
  channel         text check (channel in ('chat','whatsapp','website')),
  company_id      uuid references public.companies(id) on delete set null,
  user_id         uuid references auth.users(id) on delete set null,
  user_message    text not null,
  assistant_reply text,
  context         jsonb,
  model           text,
  tokens_used     integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;

create policy "AI conversations visible within tenant"
  on public.ai_conversations for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create index idx_ai_conversations_tenant on public.ai_conversations(tenant_id);
create index idx_ai_conversations_session on public.ai_conversations(session_id);
create index idx_ai_conversations_created on public.ai_conversations(created_at);

-- =============================================================================
-- 21 — FUNCTIONS / TRIGGERS
-- =============================================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.increment_job_views(p_job_id uuid)
returns void as $$
begin
  update public.jobs
  set views = views + 1
  where id = p_job_id;
end;
$$ language plpgsql security definer;

create or replace function public.increment_application_count(p_job_id uuid)
returns void as $$
begin
  update public.jobs
  set applications_count = applications_count + 1
  where id = p_job_id;
end;
$$ language plpgsql security definer;

create trigger update_tenants_updated_at
  before update on public.tenants
  for each row execute procedure public.update_updated_at();

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_candidates_updated_at
  before update on public.candidates
  for each row execute procedure public.update_updated_at();

create trigger update_jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.update_updated_at();

create trigger update_applications_updated_at
  before update on public.applications
  for each row execute procedure public.update_updated_at();

-- =============================================================================
-- 22 — SEED / BOOTSTRAP J&S
-- =============================================================================
-- Tenant principal J&S Empregos LTDA
insert into public.tenants (id, name, slug, plan, settings)
values (
  uuid_generate_v4(),
  'J&S Empregos LTDA',
  'js-empregos',
  'enterprise',
  '{"primary_color":"#16a34a","whatsapp":"5511968380592","phone":"(11) 96838-0592"}'::jsonb
) on conflict (slug) do nothing;
