# V21 — Missing Objects Reconstruction Plan

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Objetivo:** Para cada objeto ausente no canônico atual, definir origem, definição, dependências e ação de reconstrução.  
**Restrição:** READ ONLY. Nenhum arquivo alterado, nenhuma migration executada.

---

## 1. RH — Recursos Humanos

### 1.1 skills

| Campo                | Valor                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Objeto               | skills                                                                    |
| Domínio              | RH                                                                        |
| Tipo                 | TABLE                                                                     |
| Arquivo atual        | Ausente                                                                   |
| Arquivo backup       | 05_rh.sql                                                                 |
| Existência no backup | Sim                                                                       |
| Definição            | `create table if not exists public.skills (...)`                          |
| PK                   | `id uuid PRIMARY KEY`                                                     |
| FK                   | Nenhuma                                                                   |
| tenant_id            | Sim (`tenant_id uuid references public.tenants(id)`) — não NOT NULL       |
| Constraints          | `name not null`, `is_global boolean not null default true`                |
| Auditoria            | `created_at`, `updated_at`                                                |
| Origem               | Backup canônico 05_rh.sql                                                 |
| Ação                 | RESTORE_FROM_BACKUP                                                       |
| Observação           | `tenant_id` é nullable; reavaliar se deve ser NOT NULL no gate de tenancy |

### 1.2 candidate_skills

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | candidate_skills                                              |
| Domínio              | RH                                                            |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 05_rh.sql                                                     |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.candidate_skills (...)`    |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `candidate_id → candidates(id)`, `skill_id → skills(id)`      |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Constraints          | `uq_candidate_skill (candidate_id, skill_id)`                 |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 05_rh.sql                                     |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 1.3 candidate_documents

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | candidate_documents                                           |
| Domínio              | RH                                                            |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 05_rh.sql                                                     |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.candidate_documents (...)` |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `candidate_id → candidates(id)`                               |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 05_rh.sql                                     |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 1.4 candidate_experiences

| Campo                | Valor                                                           |
| -------------------- | --------------------------------------------------------------- |
| Objeto               | candidate_experiences                                           |
| Domínio              | RH                                                              |
| Tipo                 | TABLE                                                           |
| Arquivo atual        | Ausente                                                         |
| Arquivo backup       | 05_rh.sql                                                       |
| Existência no backup | Sim                                                             |
| Definição            | `create table if not exists public.candidate_experiences (...)` |
| PK                   | `id uuid PRIMARY KEY`                                           |
| FK                   | `candidate_id → candidates(id)`                                 |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)   |
| Auditoria            | `created_at`, `updated_at`                                      |
| Origem               | Backup canônico 05_rh.sql                                       |
| Ação                 | RESTORE_FROM_BACKUP                                             |

### 1.5 candidate_education

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | candidate_education                                           |
| Domínio              | RH                                                            |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 05_rh.sql                                                     |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.candidate_education (...)` |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `candidate_id → candidates(id)`                               |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 05_rh.sql                                     |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 1.6 candidate_courses

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | candidate_courses                                             |
| Domínio              | RH                                                            |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 05_rh.sql                                                     |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.candidate_courses (...)`   |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `candidate_id → candidates(id)`                               |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 05_rh.sql                                     |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 1.7 candidate_languages

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | candidate_languages                                           |
| Domínio              | RH                                                            |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 05_rh.sql                                                     |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.candidate_languages (...)` |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `candidate_id → candidates(id)`                               |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 05_rh.sql                                     |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 1.8 role_resource_permissions

| Campo                | Valor                                                               |
| -------------------- | ------------------------------------------------------------------- |
| Objeto               | role_resource_permissions                                           |
| Domínio              | RBAC                                                                |
| Tipo                 | TABLE                                                               |
| Arquivo atual        | Ausente                                                             |
| Arquivo backup       | 03_rbac.sql                                                         |
| Existência no backup | Sim                                                                 |
| Definição            | `create table if not exists public.role_resource_permissions (...)` |
| PK                   | `id uuid PRIMARY KEY`                                               |
| FK                   | `role_id → roles(id)`, `permission_id → permissions(id)`            |
| tenant_id            | Não                                                                 |
| Constraints          | `uq_role_permission_resource`                                       |
| Auditoria            | `created_at`                                                        |
| Origem               | Backup canônico 03_rbac.sql                                         |
| Ação                 | RESTORE_FROM_BACKUP                                                 |

---

## 2. Recruitment

### 2.1 stage_templates

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | stage_templates                                               |
| Domínio              | Recruitment                                                   |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 06_recruitment.sql                                            |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.stage_templates (...)`     |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | Nenhuma                                                       |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Constraints          | `order integer not null`                                      |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 06_recruitment.sql                            |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 2.2 job_skills

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | job_skills                                                    |
| Domínio              | Recruitment                                                   |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 06_recruitment.sql                                            |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.job_skills (...)`          |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `job_id → jobs(id)`, `skill_id → skills(id)`                  |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Constraints          | `uq_job_skill (job_id, skill_id)`                             |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 06_recruitment.sql                            |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 2.3 recruitment_processes

| Campo                | Valor                                                           |
| -------------------- | --------------------------------------------------------------- |
| Objeto               | recruitment_processes                                           |
| Domínio              | Recruitment                                                     |
| Tipo                 | TABLE                                                           |
| Arquivo atual        | Ausente                                                         |
| Arquivo backup       | 06_recruitment.sql                                              |
| Existência no backup | Sim                                                             |
| Definição            | `create table if not exists public.recruitment_processes (...)` |
| PK                   | `id uuid PRIMARY KEY`                                           |
| FK                   | `job_id → jobs(id)`, `stage_template_id → stage_templates(id)`  |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)   |
| Auditoria            | `created_at`, `updated_at`                                      |
| Origem               | Backup canônico 06_recruitment.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                             |

### 2.4 recruitment_stages

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | recruitment_stages                                            |
| Domínio              | Recruitment                                                   |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 06_recruitment.sql                                            |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.recruitment_stages (...)`  |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `recruitment_process_id → recruitment_processes(id)`          |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 06_recruitment.sql                            |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 2.5 candidate_processes

| Campo                | Valor                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Objeto               | candidate_processes                                                                                                                |
| Domínio              | Recruitment                                                                                                                        |
| Tipo                 | TABLE                                                                                                                              |
| Arquivo atual        | Ausente                                                                                                                            |
| Arquivo backup       | 06_recruitment.sql                                                                                                                 |
| Existência no backup | Sim                                                                                                                                |
| Definição            | `create table if not exists public.candidate_processes (...)`                                                                      |
| PK                   | `id uuid PRIMARY KEY`                                                                                                              |
| FK                   | `recruitment_process_id → recruitment_processes(id)`, `candidate_id → candidates(id)`, `current_stage_id → recruitment_stages(id)` |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)                                                                      |
| Auditoria            | `created_at`, `updated_at`                                                                                                         |
| Origem               | Backup canônico 06_recruitment.sql                                                                                                 |
| Ação                 | RESTORE_FROM_BACKUP                                                                                                                |

### 2.6 application_profile_snapshots

| Campo                | Valor                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Objeto               | application_profile_snapshots                                           |
| Domínio              | Recruitment                                                             |
| Tipo                 | TABLE                                                                   |
| Arquivo atual        | Ausente                                                                 |
| Arquivo backup       | 06_recruitment.sql                                                      |
| Existência no backup | Sim                                                                     |
| Definição            | `create table if not exists public.application_profile_snapshots (...)` |
| PK                   | `id uuid PRIMARY KEY`                                                   |
| FK                   | `application_id → applications(id)`                                     |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)           |
| Auditoria            | `created_at`                                                            |
| Origem               | Backup canônico 06_recruitment.sql                                      |
| Ação                 | RESTORE_FROM_BACKUP                                                     |

### 2.7 interview_participants

| Campo                | Valor                                                            |
| -------------------- | ---------------------------------------------------------------- |
| Objeto               | interview_participants                                           |
| Domínio              | Recruitment                                                      |
| Tipo                 | TABLE                                                            |
| Arquivo atual        | Ausente                                                          |
| Arquivo backup       | 06_recruitment.sql                                               |
| Existência no backup | Sim                                                              |
| Definição            | `create table if not exists public.interview_participants (...)` |
| PK                   | `id uuid PRIMARY KEY`                                            |
| FK                   | `interview_id → interviews(id)`, `person_id → people(id)`        |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)    |
| Auditoria            | `created_at`, `updated_at`                                       |
| Origem               | Backup canônico 06_recruitment.sql                               |
| Ação                 | RESTORE_FROM_BACKUP                                              |

### 2.8 interview_feedback

| Campo                | Valor                                                                          |
| -------------------- | ------------------------------------------------------------------------------ |
| Objeto               | interview_feedback                                                             |
| Domínio              | Recruitment                                                                    |
| Tipo                 | TABLE                                                                          |
| Arquivo atual        | Ausente                                                                        |
| Arquivo backup       | 06_recruitment.sql                                                             |
| Existência no backup | Sim                                                                            |
| Definição            | `create table if not exists public.interview_feedback (...)`                   |
| PK                   | `id uuid PRIMARY KEY`                                                          |
| FK                   | `interview_id → interviews(id)`, `participant_id → interview_participants(id)` |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)                  |
| Auditoria            | `created_at`, `updated_at`                                                     |
| Origem               | Backup canônico 06_recruitment.sql                                             |
| Ação                 | RESTORE_FROM_BACKUP                                                            |

---

## 3. Contracts

### 3.1 contract_items

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | contract_items                                                |
| Domínio              | Contracts                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 09_contracts.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.contract_items (...)`      |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `contract_id → contracts(id)`                                 |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 09_contracts.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 3.2 contract_services

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | contract_services                                             |
| Domínio              | Contracts                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 09_contracts.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.contract_services (...)`   |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `contract_id → contracts(id)`, `service_id → services(id)`    |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 09_contracts.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 3.3 contract_status_history (ausente no atual)

| Campo                | Valor                                                             |
| -------------------- | ----------------------------------------------------------------- |
| Objeto               | contract_status_history                                           |
| Domínio              | Contracts                                                         |
| Tipo                 | TABLE                                                             |
| Arquivo atual        | Ausente no canônico atual                                         |
| Arquivo backup       | 09_contracts.sql                                                  |
| Existência no backup | Sim                                                               |
| Definição            | `create table if not exists public.contract_status_history (...)` |
| PK                   | `id uuid PRIMARY KEY`                                             |
| FK                   | `contract_id → contracts(id)`                                     |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)     |
| Auditoria            | `changed_at`, `created_at`, `changed_by_person_id`, `notes`       |
| Origem               | Backup canônico 09_contracts.sql                                  |
| Ação                 | RESTORE_FROM_BACKUP                                               |

### 3.4 contract_documents

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | contract_documents                                            |
| Domínio              | Contracts                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 09_contracts.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.contract_documents (...)`  |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `contract_id → contracts(id)`                                 |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 09_contracts.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 3.5 contract_versions

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | contract_versions                                             |
| Domínio              | Contracts                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 09_contracts.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.contract_versions (...)`   |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `contract_id → contracts(id)`                                 |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 09_contracts.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 3.6 contract_obligations

| Campo                | Valor                                                          |
| -------------------- | -------------------------------------------------------------- |
| Objeto               | contract_obligations                                           |
| Domínio              | Contracts                                                      |
| Tipo                 | TABLE                                                          |
| Arquivo atual        | Ausente                                                        |
| Arquivo backup       | 09_contracts.sql                                               |
| Existência no backup | Sim                                                            |
| Definição            | `create table if not exists public.contract_obligations (...)` |
| PK                   | `id uuid PRIMARY KEY`                                          |
| FK                   | `contract_id → contracts(id)`                                  |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)  |
| Auditoria            | `created_at`, `updated_at`                                     |
| Origem               | Backup canônico 09_contracts.sql                               |
| Ação                 | RESTORE_FROM_BACKUP                                            |

### 3.7 contract_renewals

| Campo                | Valor                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Objeto               | contract_renewals                                                         |
| Domínio              | Contracts                                                                 |
| Tipo                 | TABLE                                                                     |
| Arquivo atual        | Ausente                                                                   |
| Arquivo backup       | 09_contracts.sql                                                          |
| Existência no backup | Sim                                                                       |
| Definição            | `create table if not exists public.contract_renewals (...)`               |
| PK                   | `id uuid PRIMARY KEY`                                                     |
| FK                   | `contract_id → contracts(id)`, `renewed_from_contract_id → contracts(id)` |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)             |
| Auditoria            | `created_at`, `updated_at`                                                |
| Origem               | Backup canônico 09_contracts.sql                                          |
| Ação                 | RESTORE_FROM_BACKUP                                                       |

---

## 4. Employees

### 4.1 employees

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | employees                                                     |
| Domínio              | Employees                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 07_employees.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.employees (...)`           |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `person_id → people(id)`, `company_id → companies(id)`        |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Constraints          | `uq_employee_tenant_person (tenant_id, person_id)`            |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 07_employees.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 4.2 employee_contracts

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | employee_contracts                                            |
| Domínio              | Employees                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 07_employees.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.employee_contracts (...)`  |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `employee_id → employees(id)`                                 |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 07_employees.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 4.3 employee_documents

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | employee_documents                                            |
| Domínio              | Employees                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 07_employees.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.employee_documents (...)`  |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `employee_id → employees(id)`                                 |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 07_employees.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 4.4 employee_status_history

| Campo                | Valor                                                             |
| -------------------- | ----------------------------------------------------------------- |
| Objeto               | employee_status_history                                           |
| Domínio              | Employees                                                         |
| Tipo                 | TABLE                                                             |
| Arquivo atual        | Ausente                                                           |
| Arquivo backup       | 07_employees.sql                                                  |
| Existência no backup | Sim                                                               |
| Definição            | `create table if not exists public.employee_status_history (...)` |
| PK                   | `id uuid PRIMARY KEY`                                             |
| FK                   | `employee_id → employees(id)`                                     |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)     |
| Auditoria            | `changed_at`, `created_at`, `changed_by_person_id`, `reason`      |
| Origem               | Backup canônico 07_employees.sql                                  |
| Ação                 | RESTORE_FROM_BACKUP                                               |

### 4.5 departments

| Campo                | Valor                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Objeto               | departments                                                             |
| Domínio              | Employees                                                               |
| Tipo                 | TABLE                                                                   |
| Arquivo atual        | Ausente                                                                 |
| Arquivo backup       | 07_employees.sql                                                        |
| Existência no backup | Sim                                                                     |
| Definição            | `create table if not exists public.departments (...)`                   |
| PK                   | `id uuid PRIMARY KEY`                                                   |
| FK                   | `parent_department_id → departments(id)`, `head_person_id → people(id)` |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)           |
| Auditoria            | `created_at`, `updated_at`                                              |
| Origem               | Backup canônico 07_employees.sql                                        |
| Ação                 | RESTORE_FROM_BACKUP                                                     |

### 4.6 positions

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | positions                                                     |
| Domínio              | Employees                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 07_employees.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.positions (...)`           |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `department_id → departments(id)`                             |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 07_employees.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 4.7 employee_positions

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | employee_positions                                            |
| Domínio              | Employees                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 07_employees.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.employee_positions (...)`  |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `employee_id → employees(id)`, `position_id → positions(id)`  |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 07_employees.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

---

## 5. Inventory

### 5.1 products (atualizado)

| Campo                | Valor                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Objeto               | products                                                                                   |
| Domínio              | Inventory                                                                                  |
| Tipo                 | TABLE                                                                                      |
| Arquivo atual        | 07_inventory_custody.sql                                                                   |
| Arquivo backup       | 11_inventory.sql                                                                           |
| Existência no backup | Sim                                                                                        |
| Definição atual      | Versão simplificada                                                                        |
| Definição backup     | Versão completa com `sku`, `description`, `min_stock`, `created_by`, `updated_by`          |
| PK                   | `id uuid PRIMARY KEY`                                                                      |
| FK                   | Nenhuma                                                                                    |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)                              |
| Auditoria            | `created_at`, `updated_at`                                                                 |
| Origem               | Backup canônico 11_inventory.sql                                                           |
| Ação                 | RECONCILE — atualizar definição em 07_inventory_custody.sql para versão completa do backup |

### 5.2 product_categories

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | product_categories                                            |
| Domínio              | Inventory                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 11_inventory.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.product_categories (...)`  |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `parent_category_id → product_categories(id)`                 |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 11_inventory.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 5.3 warehouses

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | warehouses                                                    |
| Domínio              | Inventory                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 11_inventory.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.warehouses (...)`          |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | Nenhuma                                                       |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 11_inventory.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 5.4 warehouse_locations

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | warehouse_locations                                           |
| Domínio              | Inventory                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 11_inventory.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.warehouse_locations (...)` |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `warehouse_id → warehouses(id)`                               |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 11_inventory.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 5.5 stock_balances

| Campo                | Valor                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Objeto               | stock_balances                                                                                        |
| Domínio              | Inventory                                                                                             |
| Tipo                 | TABLE                                                                                                 |
| Arquivo atual        | Ausente                                                                                               |
| Arquivo backup       | 11_inventory.sql                                                                                      |
| Existência no backup | Sim                                                                                                   |
| Definição            | `create table if not exists public.stock_balances (...)`                                              |
| PK                   | `id uuid PRIMARY KEY`                                                                                 |
| FK                   | `product_id → products(id)`, `warehouse_id → warehouses(id)`, `location_id → warehouse_locations(id)` |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)                                         |
| Constraints          | `uq_stock_balance_product_warehouse_location (product_id, warehouse_id, location_id)`                 |
| Auditoria            | `created_at`, `updated_at`                                                                            |
| Origem               | Backup canônico 11_inventory.sql                                                                      |
| Ação                 | RESTORE_FROM_BACKUP                                                                                   |

### 5.6 stock_movements (atualizado)

| Campo                | Valor                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Objeto               | stock_movements                                                                                                 |
| Domínio              | Inventory                                                                                                       |
| Tipo                 | TABLE                                                                                                           |
| Arquivo atual        | 07_inventory_custody.sql                                                                                        |
| Arquivo backup       | 11_inventory.sql                                                                                                |
| Existência no backup | Sim                                                                                                             |
| Definição atual      | Versão simplificada                                                                                             |
| Definição backup     | Versão completa com `warehouse_id`, `type`, `unit_cost`, `document_type`, `document_id`, `notes`, `occurred_at` |
| PK                   | `id uuid PRIMARY KEY`                                                                                           |
| FK                   | `product_id → products(id)`, `warehouse_id → warehouses(id)`                                                    |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)                                                   |
| Auditoria            | `created_at`, `updated_at`                                                                                      |
| Origem               | Backup canônico 11_inventory.sql                                                                                |
| Ação                 | RECONCILE — atualizar definição em 07_inventory_custody.sql para versão completa do backup                      |

### 5.7 stock_entries

| Campo                | Valor                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Objeto               | stock_entries                                                                               |
| Domínio              | Inventory                                                                                   |
| Tipo                 | TABLE                                                                                       |
| Arquivo atual        | Ausente                                                                                     |
| Arquivo backup       | 11_inventory.sql                                                                            |
| Existência no backup | Sim                                                                                         |
| Definição            | `create table if not exists public.stock_entries (...)`                                     |
| PK                   | `id uuid PRIMARY KEY`                                                                       |
| FK                   | `product_id → products(id)`, `warehouse_id → warehouses(id)`, `supplier_id → suppliers(id)` |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)                               |
| Auditoria            | `created_at`, `updated_at`                                                                  |
| Origem               | Backup canônico 11_inventory.sql                                                            |
| Ação                 | RESTORE_FROM_BACKUP                                                                         |

### 5.8 stock_exits

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | stock_exits                                                   |
| Domínio              | Inventory                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 11_inventory.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.stock_exits (...)`         |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `product_id → products(id)`, `warehouse_id → warehouses(id)`  |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 11_inventory.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 5.9 stock_inventory

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | stock_inventory                                               |
| Domínio              | Inventory                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 11_inventory.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.stock_inventory (...)`     |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `warehouse_id → warehouses(id)`                               |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 11_inventory.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

### 5.10 stock_inventory_items

| Campo                | Valor                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Objeto               | stock_inventory_items                                                   |
| Domínio              | Inventory                                                               |
| Tipo                 | TABLE                                                                   |
| Arquivo atual        | Ausente                                                                 |
| Arquivo backup       | 11_inventory.sql                                                        |
| Existência no backup | Sim                                                                     |
| Definição            | `create table if not exists public.stock_inventory_items (...)`         |
| PK                   | `id uuid PRIMARY KEY`                                                   |
| FK                   | `stock_inventory_id → stock_inventory(id)`, `product_id → products(id)` |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`)           |
| Auditoria            | `created_at`, `updated_at`                                              |
| Origem               | Backup canônico 11_inventory.sql                                        |
| Ação                 | RESTORE_FROM_BACKUP                                                     |

### 5.11 stock_adjustments

| Campo                | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Objeto               | stock_adjustments                                             |
| Domínio              | Inventory                                                     |
| Tipo                 | TABLE                                                         |
| Arquivo atual        | Ausente                                                       |
| Arquivo backup       | 11_inventory.sql                                              |
| Existência no backup | Sim                                                           |
| Definição            | `create table if not exists public.stock_adjustments (...)`   |
| PK                   | `id uuid PRIMARY KEY`                                         |
| FK                   | `product_id → products(id)`, `warehouse_id → warehouses(id)`  |
| tenant_id            | Sim (`tenant_id uuid not null references public.tenants(id)`) |
| Auditoria            | `created_at`, `updated_at`                                    |
| Origem               | Backup canônico 11_inventory.sql                              |
| Ação                 | RESTORE_FROM_BACKUP                                           |

---

## 6. Support — Complementares

### 6.1 support_ticket_messages

| Campo                    | Valor                                                                      |
| ------------------------ | -------------------------------------------------------------------------- |
| Objeto                   | support_ticket_messages                                                    |
| Domínio                  | Support                                                                    |
| Tipo                     | TABLE                                                                      |
| Arquivo atual            | Ausente                                                                    |
| Arquivo backup           | Ausente no backup 15_support.sql                                           |
| Existência no build spec | Sim (`docs/DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md`)                       |
| Definição                | `CREATE TABLE support_ticket_messages (...)`                               |
| PK                       | `id uuid PRIMARY KEY`                                                      |
| FK                       | `support_ticket_id → support_tickets(id)`, `author_person_id → people(id)` |
| tenant_id                | Sim (`tenant_id uuid not null references tenants(id)`)                     |
| Auditoria                | `created_at`, `updated_at`                                                 |
| Origem                   | Build spec V2.1                                                            |
| Ação                     | RECONCILE — verificar se deve ser criado ou se é opcional                  |

### 6.2 support_ticket_assignments

| Campo                    | Valor                                                               |
| ------------------------ | ------------------------------------------------------------------- |
| Objeto                   | support_ticket_assignments                                          |
| Domínio                  | Support                                                             |
| Tipo                     | TABLE                                                               |
| Arquivo atual            | Ausente                                                             |
| Arquivo backup           | Ausente no backup 15_support.sql                                    |
| Existência no build spec | Sim                                                                 |
| Definição                | `CREATE TABLE support_ticket_assignments (...)`                     |
| PK                       | `id uuid PRIMARY KEY`                                               |
| FK                       | `support_ticket_id → support_tickets(id)`, `person_id → people(id)` |
| tenant_id                | Sim (`tenant_id uuid not null references tenants(id)`)              |
| Auditoria                | `created_at`, `updated_at`                                          |
| Origem                   | Build spec V2.1                                                     |
| Ação                     | RECONCILE — verificar se deve ser criado ou se é opcional           |

### 6.3 support_ticket_categories

| Campo                    | Valor                                                     |
| ------------------------ | --------------------------------------------------------- |
| Objeto                   | support_ticket_categories                                 |
| Domínio                  | Support                                                   |
| Tipo                     | TABLE                                                     |
| Arquivo atual            | Ausente                                                   |
| Arquivo backup           | Ausente no backup 15_support.sql                          |
| Existência no build spec | Sim                                                       |
| Definição                | `CREATE TABLE support_ticket_categories (...)`            |
| PK                       | `id uuid PRIMARY KEY`                                     |
| FK                       | Nenhuma                                                   |
| tenant_id                | Sim (`tenant_id uuid not null references tenants(id)`)    |
| Auditoria                | `created_at`, `updated_at`                                |
| Origem                   | Build spec V2.1                                           |
| Ação                     | RECONCILE — verificar se deve ser criado ou se é opcional |

---

## 7. Finance / Fiscal / Documents / Storage — Scaffolds

### 7.1 financial_*

| Campo          | Valor                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objetos        | financial_accounts, financial_categories, cost_centers, accounts_receivable, accounts_payable, financial_transactions, invoices, invoice_items, payments, expenses, revenues |
| Domínio        | Finance                                                                                                                                                                      |
| Tipo           | TABLE                                                                                                                                                                        |
| Arquivo atual  | Ausente                                                                                                                                                                      |
| Arquivo backup | 19_finance.sql (scaffold vazio)                                                                                                                                              |
| Definição      | Não definida no backup                                                                                                                                                       |
| Origem         | Build spec V2.1 + docs/sql/07_finance.sql                                                                                                                                    |
| Ação           | DESIGN — projetar conforme build spec                                                                                                                                        |

### 7.2 fiscal_*

| Campo          | Valor                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objetos        | fiscal_configurations, fiscal_integrations, fiscal_documents, fiscal_document_items, fiscal_document_events, fiscal_document_status_history, fiscal_api_requests, fiscal_api_responses |
| Domínio        | Fiscal                                                                                                                                                                                 |
| Tipo           | TABLE                                                                                                                                                                                  |
| Arquivo atual  | Ausente                                                                                                                                                                                |
| Arquivo backup | 20_fiscal.sql (scaffold vazio)                                                                                                                                                         |
| Definição      | Não definida no backup                                                                                                                                                                 |
| Origem         | Build spec V2.1 + docs/sql/08_fiscal.sql                                                                                                                                               |
| Ação           | DESIGN — projetar conforme build spec                                                                                                                                                  |

### 7.3 documents_*

| Campo          | Valor                                                              |
| -------------- | ------------------------------------------------------------------ |
| Objetos        | files, file_access_logs, document_versions, document_links         |
| Domínio        | Documents/Storage                                                  |
| Tipo           | TABLE                                                              |
| Arquivo atual  | Ausente                                                            |
| Arquivo backup | 18_storage.sql (scaffold vazio), 21_documents.sql (scaffold vazio) |
| Definição      | Não definida no backup                                             |
| Origem         | Build spec V2.1 + docs/sql/06_administrative.sql                   |
| Ação           | DESIGN — projetar conforme build spec                              |

---

## 8. Transversais

### 8.1 Functions

| Campo          | Valor                                       |
| -------------- | ------------------------------------------- |
| Objeto         | Functions                                   |
| Domínio        | Transversal                                 |
| Tipo           | FUNCTION                                    |
| Arquivo atual  | Ausente                                     |
| Arquivo backup | 27_functions.sql (scaffold vazio)           |
| Definição      | Não definida no backup                      |
| Origem         | Build spec V2.1 + docs/sql/18_functions.sql |
| Ação           | DESIGN — projetar conforme contrato V2.1    |

### 8.2 Triggers

| Campo          | Valor                                      |
| -------------- | ------------------------------------------ |
| Objeto         | Triggers                                   |
| Domínio        | Transversal                                |
| Tipo           | TRIGGER                                    |
| Arquivo atual  | Ausente                                    |
| Arquivo backup | 28_triggers.sql (scaffold vazio)           |
| Definição      | Não definida no backup                     |
| Origem         | Build spec V2.1 + docs/sql/19_triggers.sql |
| Ação           | DESIGN — projetar conforme contrato V2.1   |

### 8.3 Indexes

| Campo          | Valor                                     |
| -------------- | ----------------------------------------- |
| Objeto         | Indexes                                   |
| Domínio        | Transversal                               |
| Tipo           | INDEX                                     |
| Arquivo atual  | Ausente                                   |
| Arquivo backup | 29_indexes.sql (scaffold vazio)           |
| Definição      | Não definida no backup                    |
| Origem         | Build spec V2.1 + docs/sql/20_indexes.sql |
| Ação           | DESIGN — projetar conforme contrato V2.1  |

### 8.4 Views

| Campo          | Valor                                    |
| -------------- | ---------------------------------------- |
| Objeto         | Views                                    |
| Domínio        | Transversal                              |
| Tipo           | VIEW                                     |
| Arquivo atual  | Ausente                                  |
| Arquivo backup | 30_views.sql (scaffold vazio)            |
| Definição      | Não definida no backup                   |
| Origem         | Build spec V2.1                          |
| Ação           | DESIGN — projetar conforme contrato V2.1 |

### 8.5 RLS

| Campo          | Valor                                    |
| -------------- | ---------------------------------------- |
| Objeto         | RLS Policies                             |
| Domínio        | Transversal                              |
| Tipo           | POLICY                                   |
| Arquivo atual  | Ausente                                  |
| Arquivo backup | 31_rls.sql (scaffold vazio)              |
| Definição      | Não definida no backup                   |
| Origem         | Build spec V2.1 + docs/sql/21_rls.sql    |
| Ação           | DESIGN — projetar conforme contrato V2.1 |

### 8.6 Seed

| Campo          | Valor                                    |
| -------------- | ---------------------------------------- |
| Objeto         | Seed data                                |
| Domínio        | Transversal                              |
| Tipo           | SEED                                     |
| Arquivo atual  | Ausente                                  |
| Arquivo backup | 32_seed.sql (scaffold vazio)             |
| Definição      | Não definida no backup                   |
| Origem         | Build spec V2.1 + docs/sql/22_seed.sql   |
| Ação           | DESIGN — projetar conforme contrato V2.1 |

### 8.7 Validation

| Campo          | Valor                                        |
| -------------- | -------------------------------------------- |
| Objeto         | Validation tests                             |
| Domínio        | Transversal                                  |
| Tipo           | VALIDATION                                   |
| Arquivo atual  | Ausente                                      |
| Arquivo backup | 33_validation.sql (scaffold vazio)           |
| Definição      | Não definida no backup                       |
| Origem         | Build spec V2.1 + docs/sql/23_validation.sql |
| Ação           | DESIGN — projetar conforme contrato V2.1     |

---

## 9. Resumo de ações

| Categoria                  | Quantidade | Ação predominante   |
| -------------------------- | ---------- | ------------------- |
| Recuperáveis do backup     | 31 objetos | RESTORE_FROM_BACKUP |
| Recuperáveis do build spec | 3 objetos  | RECONCILE           |
| Projetar novo              | 7 grupos   | DESIGN              |
| Reconciliar existente      | 3 objetos  | RECONCILE           |

---

## 10. Confirmação de gates aprovados

| Gate | Domínio    | Resultado |
| ---- | ---------- | --------- |
| D.12 | Custody    | PASS      |
| D.13 | Purchasing | PASS      |
| D.14 | Tasks      | PASS      |
| D.15 | Support    | PASS      |

---

## 11. Próximo gate sugerido

Após aprovação deste plano:

```text
D.16 — Notifications / Events
D.17 — Chat
D.18 — Storage
D.19 — Finance
D.20 — Fiscal
D.21 — Documents
D.22 — Domain Events
D.23 — Outbox
D.24 — Audit
D.25 — Security
D.26 — LGPD
D.27 — Functions
D.28 — Triggers
D.29 — Indexes
D.30 — Views
D.31 — RLS
D.32 — Seed
D.33 — Validation
```

---

**Checkpoint:**

- Nenhum arquivo alterado.
- Nenhuma migration executada.
- Supabase remoto não alterado.
- Frontend não alterado.
