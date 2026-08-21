-- 30_recruitment.sql
-- Recruitment domain: skills, stages, processes, candidate documents, candidate experience, education, courses, languages

-- ============================================================
-- SKILLS
-- ============================================================

create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id),
  name text not null,
  category text,
  description text,
  is_global boolean not null default true,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_skills_tenant_name unique (tenant_id, name)
);

-- ============================================================
-- CANDIDATE DOCUMENTS
-- ============================================================

create table if not exists public.candidate_documents (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  document_type text not null,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size integer,
  uploaded_at timestamptz not null default now(),
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CANDIDATE EXPERIENCES
-- ============================================================

create table if not exists public.candidate_experiences (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  company_name text not null,
  role text not null,
  start_date date not null,
  end_date date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CANDIDATE EDUCATION
-- ============================================================

create table if not exists public.candidate_education (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  institution text not null,
  course text not null,
  degree text,
  start_date date not null,
  end_date date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CANDIDATE COURSES
-- ============================================================

create table if not exists public.candidate_courses (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  name text not null,
  institution text,
  completion_date date,
  expiration_date date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CANDIDATE LANGUAGES
-- ============================================================

create table if not exists public.candidate_languages (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  language text not null,
  proficiency text not null check (proficiency in ('basic', 'intermediate', 'advanced', 'fluent', 'native')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CANDIDATE SKILLS
-- ============================================================

create table if not exists public.candidate_skills (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  skill_id uuid not null references public.skills(id),
  level text,
  years_used numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_candidate_skill unique (candidate_id, skill_id)
);

-- ============================================================
-- JOB SKILLS
-- ============================================================

create table if not exists public.job_skills (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  job_id uuid not null references public.jobs(id),
  skill_id uuid not null references public.skills(id),
  required boolean not null default true,
  level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_job_skill unique (job_id, skill_id)
);

-- ============================================================
-- STAGE TEMPLATES
-- ============================================================

create table if not exists public.stage_templates (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  description text,
  order_index integer not null,
  is_mandatory boolean not null default true,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RECRUITMENT PROCESSES
-- ============================================================

create table if not exists public.recruitment_processes (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  job_id uuid not null references public.jobs(id),
  candidate_id uuid not null references public.candidates(id),
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed', 'cancelled')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_recruitment_process_job_candidate unique (job_id, candidate_id)
);

-- ============================================================
-- RECRUITMENT STAGES
-- ============================================================

create table if not exists public.recruitment_stages (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  recruitment_process_id uuid not null references public.recruitment_processes(id),
  stage_template_id uuid not null references public.stage_templates(id),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'skipped', 'rejected')),
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CANDIDATE PROCESSES
-- ============================================================

create table if not exists public.candidate_processes (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  recruitment_process_id uuid not null references public.recruitment_processes(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_candidate_process unique (candidate_id, recruitment_process_id)
);

-- ============================================================
-- APPLICATION PROFILE SNAPSHOTS
-- ============================================================

create table if not exists public.application_profile_snapshots (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  application_id uuid not null references public.applications(id),
  snapshot jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- INTERVIEW PARTICIPANTS
-- ============================================================

create table if not exists public.interview_participants (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  interview_id uuid not null references public.interviews(id),
  person_id uuid references public.people(id),
  role text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INTERVIEW FEEDBACK
-- ============================================================

create table if not exists public.interview_feedback (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  interview_id uuid not null references public.interviews(id),
  participant_id uuid not null references public.interview_participants(id),
  rating integer,
  comments text,
  recommendation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
