-- =============================================================================
-- GATE-DATA-04.008 — EMPLOYEES: Gestão de Funcionários
-- =============================================================================
-- Entity: employees
-- Schema: public
-- Order: 8
-- Dependencies: 001_core, 002_identity, 003_companies, 004_candidates
-- =============================================================================
-- Purpose:
--   Representar o vínculo funcional de uma pessoa dentro do tenant,
--   separando identidade (people) de cargo/função (employees).
--
-- Rules:
--   - Employee is TENANT-SCOPED
--   - FK para people (identidade)
--   - FK opcional para companies/company_relationships
--   - Dados sensíveis protegidos por RLS
--   - tenant_id obrigatório
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. employees — Vínculo funcional
-- -----------------------------------------------------------------------------

create table public.employees (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  person_id           uuid not null
    references public.people(id)
    on delete cascade,

  company_id          uuid
    references public.companies(id)
    on delete set null,

  registration        varchar(120) unique,
  job_title           varchar(255),
  department          varchar(255),
  cost_center         varchar(255),

  hire_date           date,
  termination_date    date,
  probation_end_date  date,

  employment_type     varchar(50)
    check (employment_type in ('clt', 'internship', 'temporary', 'freelance', 'contracted', 'cd')),

  work_mode           varchar(50)
    check (work_mode in ('onsite', 'hybrid', 'remote')),

  salary              numeric(12,2),
  salary_currency     varchar(3) default 'BRL',
  salary_frequency    varchar(50)
    check (salary_frequency in ('monthly', 'biweekly', 'weekly', 'hourly', 'project')),

  status              varchar(50) not null default 'active'
    check (status in ('active', 'inactive', 'terminated', 'suspended', 'on_leave')),

  manager_id          uuid
    references public.employees(id)
    on delete set null,

  notes               text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_employees_tenant on public.employees(tenant_id);
create index idx_employees_person on public.employees(person_id);
create index idx_employees_company on public.employees(company_id);
create index idx_employees_status on public.employees(tenant_id, status);
create index idx_employees_registration on public.employees(registration);
create index idx_employees_manager on public.employees(manager_id);

create trigger update_employees_updated_at
  before update on public.employees
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 2. employee_documents — Documentos do funcionário
-- -----------------------------------------------------------------------------

create table public.employee_documents (
  id                  uuid primary key default gen_random_uuid(),

  employee_id         uuid not null
    references public.employees(id)
    on delete cascade,

  document_type       varchar(100) not null,
  document_name       varchar(255) not null,
  document_url        text not null,
  issue_date          date,
  expiry_date         date,
  is_verified         boolean not null default false,
  notes               text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_employee_documents_employee on public.employee_documents(employee_id);
create index idx_employee_documents_type on public.employee_documents(document_type);

create trigger update_employee_documents_updated_at
  before update on public.employee_documents
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 3. employee_education — Formação do funcionário
-- -----------------------------------------------------------------------------

create table public.employee_education (
  id                  uuid primary key default gen_random_uuid(),

  employee_id         uuid not null
    references public.employees(id)
    on delete cascade,

  institution         varchar(255) not null,
  course              varchar(255) not null,
  degree_level         varchar(100),
  field_of_study      varchar(255),
  start_date          date,
  end_date            date,
  is_completed        boolean not null default false,
  notes               text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_employee_education_employee on public.employee_education(employee_id);

create trigger update_employee_education_updated_at
  before update on public.employee_education
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 4. employee_experiences — Experiências profissionais
-- -----------------------------------------------------------------------------

create table public.employee_experiences (
  id                  uuid primary key default gen_random_uuid(),

  employee_id         uuid not null
    references public.employees(id)
    on delete cascade,

  company_name        varchar(255) not null,
  job_title           varchar(255) not null,
  start_date          date not null,
  end_date            date,
  is_current          boolean not null default false,
  description         text,
  achievements        text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_employee_experiences_employee on public.employee_experiences(employee_id);

create trigger update_employee_experiences_updated_at
  before update on public.employee_experiences
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 5. employee_skills — Habilidades do funcionário
-- -----------------------------------------------------------------------------

create table public.employee_skills (
  id                  uuid primary key default gen_random_uuid(),

  employee_id         uuid not null
    references public.employees(id)
    on delete cascade,

  skill_name          varchar(255) not null,
  proficiency_level   varchar(50)
    check (proficiency_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience    numeric(4,1),
  is_certified        boolean not null default false,
  certification_name  varchar(255),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_employee_skills_employee on public.employee_skills(employee_id);
create index idx_employee_skills_name on public.employee_skills(skill_name);

create trigger update_employee_skills_updated_at
  before update on public.employee_skills
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 6. employee_languages — Idiomas do funcionário
-- -----------------------------------------------------------------------------

create table public.employee_languages (
  id                  uuid primary key default gen_random_uuid(),

  employee_id         uuid not null
    references public.employees(id)
    on delete cascade,

  language            varchar(100) not null,
  proficiency         varchar(50)
    check (proficiency in ('basic', 'intermediate', 'advanced', 'fluent', 'native')),
  is_primary          boolean not null default false,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_employee_languages_employee on public.employee_languages(employee_id);

create trigger update_employee_languages_updated_at
  before update on public.employee_languages
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 7. employee_courses — Cursos do funcionário
-- -----------------------------------------------------------------------------

create table public.employee_courses (
  id                  uuid primary key default gen_random_uuid(),

  employee_id         uuid not null
    references public.employees(id)
    on delete cascade,

  course_name         varchar(255) not null,
  institution         varchar(255),
  completion_date     date,
  expiry_date         date,
  certificate_url     text,
  hours               integer,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_employee_courses_employee on public.employee_courses(employee_id);

create trigger update_employee_courses_updated_at
  before update on public.employee_courses
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.employees enable row level security;

create policy "Employees visible to tenant members"
  on public.employees for select
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.people p on tm.person_id = p.id
      where p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

create policy "Employees manageable by tenant HR"
  on public.employees for all
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.people p on tm.person_id = p.id
      where p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  )
  with check (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.people p on tm.person_id = p.id
      where p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  );

-- RLS para tabelas relacionadas (herdam do employee via FK)

alter table public.employee_documents enable row level security;
alter table public.employee_education enable row level security;
alter table public.employee_experiences enable row level security;
alter table public.employee_skills enable row level security;
alter table public.employee_languages enable row level security;
alter table public.employee_courses enable row level security;

create policy "Employee documents visible to tenant HR"
  on public.employee_documents for select
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_documents.employee_id
        and p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

create policy "Employee documents manageable by tenant HR"
  on public.employee_documents for all
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_documents.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  )
  with check (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_documents.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  );

create policy "Employee education visible to tenant HR"
  on public.employee_education for select
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_education.employee_id
        and p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

create policy "Employee education manageable by tenant HR"
  on public.employee_education for all
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_education.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  )
  with check (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_education.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  );

create policy "Employee experiences visible to tenant HR"
  on public.employee_experiences for select
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_experiences.employee_id
        and p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

create policy "Employee experiences manageable by tenant HR"
  on public.employee_experiences for all
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_experiences.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  )
  with check (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_experiences.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  );

create policy "Employee skills visible to tenant HR"
  on public.employee_skills for select
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_skills.employee_id
        and p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

create policy "Employee skills manageable by tenant HR"
  on public.employee_skills for all
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_skills.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  )
  with check (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_skills.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  );

create policy "Employee languages visible to tenant HR"
  on public.employee_languages for select
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_languages.employee_id
        and p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

create policy "Employee languages manageable by tenant HR"
  on public.employee_languages for all
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_languages.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  )
  with check (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_languages.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  );

create policy "Employee courses visible to tenant HR"
  on public.employee_courses for select
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_courses.employee_id
        and p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

create policy "Employee courses manageable by tenant HR"
  on public.employee_courses for all
  using (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_courses.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  )
  with check (
    exists (
      select 1 from public.employees e
      join public.tenant_memberships tm on tm.tenant_id = e.tenant_id
      join public.people p on tm.person_id = p.id
      where e.id = employee_courses.employee_id
        and p.auth_user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager','rh_manager','recruiter','hr')
    )
    or auth.role() = 'service_role'
  );
