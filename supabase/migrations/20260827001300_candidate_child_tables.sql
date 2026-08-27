-- -----------------------------------------------------------------------------
-- Candidate child tables
-- -----------------------------------------------------------------------------

-- candidate_experiences
create table public.candidate_experiences (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references public.candidates(id) on delete cascade,
  company       varchar(150) not null,
  position      varchar(150) not null,
  start_date    date,
  end_date      date,
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_candidate_experiences_candidate on public.candidate_experiences(candidate_id);

-- candidate_education
create table public.candidate_education (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references public.candidates(id) on delete cascade,
  institution   varchar(150) not null,
  course        varchar(150) not null,
  degree        varchar(100),
  start_date    date,
  end_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_candidate_education_candidate on public.candidate_education(candidate_id);

-- candidate_courses
create table public.candidate_courses (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references public.candidates(id) on delete cascade,
  name          varchar(150) not null,
  institution   varchar(150),
  hours         numeric(6,1),
  completed_at  date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_candidate_courses_candidate on public.candidate_courses(candidate_id);

-- candidate_languages
create table public.candidate_languages (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references public.candidates(id) on delete cascade,
  language      varchar(80) not null,
  level         varchar(50) not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_candidate_languages_candidate on public.candidate_languages(candidate_id);

-- candidate_documents
create table public.candidate_documents (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references public.candidates(id) on delete cascade,
  type          varchar(50) not null,
  url           text not null,
  name          varchar(150),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_candidate_documents_candidate on public.candidate_documents(candidate_id);

-- RLS
alter table public.candidate_experiences enable row level security;
alter table public.candidate_education enable row level security;
alter table public.candidate_courses enable row level security;
alter table public.candidate_languages enable row level security;
alter table public.candidate_documents enable row level security;

create policy "candidate_experiences_read_own_tenant"
  on public.candidate_experiences for select
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_experiences.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_experiences_write_own_tenant"
  on public.candidate_experiences for all
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_experiences.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_education_read_own_tenant"
  on public.candidate_education for select
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_education.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_education_write_own_tenant"
  on public.candidate_education for all
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_education.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_courses_read_own_tenant"
  on public.candidate_courses for select
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_courses.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_courses_write_own_tenant"
  on public.candidate_courses for all
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_courses.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_languages_read_own_tenant"
  on public.candidate_languages for select
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_languages.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_languages_write_own_tenant"
  on public.candidate_languages for all
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_languages.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_documents_read_own_tenant"
  on public.candidate_documents for select
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_documents.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));

create policy "candidate_documents_write_own_tenant"
  on public.candidate_documents for all
  using (exists (
    select 1 from public.candidates c
    where c.id = candidate_documents.candidate_id
      and c.tenant_id = auth.uid()::uuid
  ));
