-- 04_rh_recruitment.sql
-- Candidates, jobs, applications, interviews

create table if not exists public.candidates (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid not null references public.people(id),
  tenant_id uuid not null references public.tenants(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid references public.companies(id),
  title text not null,
  description text,
  status text not null default 'draft',
  employment_type text,
  location text,
  salary text,
  benefits text,
  requirements text,
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id),
  job_id uuid not null references public.jobs(id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_status_history (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id),
  status text not null,
  changed_at timestamptz not null default now(),
  actor_person_id uuid references public.people(id),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.interviews (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id),
  scheduled_at timestamptz,
  type text,
  location text,
  status text not null default 'scheduled',
  evaluation text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
