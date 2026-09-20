-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: rh
-- STATUS: canonical
-- SOURCE: MASTER SPEC + docs/sql/04_rh_recruitment.sql
-- DEPENDENCIES: 01_core.sql, 04_crm.sql
-- ============================================================

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  status text not null default 'active',
  source text,
  expected_salary numeric,
  availability text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_candidate_tenant_person unique (tenant_id, person_id)
);

create table if not exists public.candidate_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  type text not null,
  file_url text not null,
  file_name text,
  mime_type text,
  size integer,
  issued_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_experiences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  company text not null,
  title text not null,
  start_date date,
  end_date date,
  description text,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_education (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  institution text not null,
  course text not null,
  degree text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_courses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  name text not null,
  institution text,
  hours integer,
  issued_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_languages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  language text not null,
  proficiency text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_skills (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.candidates(id),
  skill_id uuid not null references public.skills(id),
  level text,
  years integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_candidate_skill unique (candidate_id, skill_id)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  is_global boolean not null default true,
  tenant_id uuid references public.tenants(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
