# C2.2 — RH / Recrutamento — Matriz de Implementação

## Objetivo

Implementar o domínio RH/Recrutamento exclusivamente a partir do schema real do Supabase Cloud, sem inventar tabelas, campos, permissions ou roles.

Arquitetura obrigatória:

```
Banco real (Supabase Cloud)
   ↓
Tabela + colunas + FK + ENUM + DEFAULT + NULLABLE
   ↓
tenant_id + RLS
   ↓
Role + Permission
   ↓
Repository
   ↓
Listagem / Filtros / Busca
   ↓
Formulário dinâmico
   ↓
CRUD
   ↓
Detalhe / Relacionamentos / Histórico
   ↓
Dashboard / KPIs
```

## Regras fixas

1. **RH não é administração de usuários do sistema.**
2. `people` é identidade canônica, não lista universal.
3. `tenant_id` + RLS + membership + role + permission determinam o escopo.
4. Nenhum mock. Nenhuma tabela inventada. Nenhuma permission inventada.
5. Frontend permission check + Repository + Supabase RLS.
6. Formulários derivados de `NOT NULL`, `CHECK`, `FK`, `DEFAULT`.
7. Não remover módulos do Sidebar. Não ocultar módulo por página incompleta.

## Domínio RH/Recrutamento — Tabelas confirmadas no schema real

| #   | Tabela                          | Scope      | tenant_id | RLS | Status |
| --- | ------------------------------- | ---------- | --------- | --- | ------ |
| 1   | `skills`                        | **GLOBAL** | ❌        | ✅  | Seed   |
| 2   | `candidates`                    | Tenant     | ✅        | ✅  | Core   |
| 3   | `candidate_skills`              | Tenant     | ✅        | ✅  | Core   |
| 4   | `candidate_experiences`         | Tenant     | ✅        | ✅  | Core   |
| 5   | `candidate_education`           | Tenant     | ✅        | ✅  | Core   |
| 6   | `candidate_courses`             | Tenant     | ✅        | ✅  | Core   |
| 7   | `candidate_languages`           | Tenant     | ✅        | ✅  | Core   |
| 8   | `candidate_documents`           | Tenant     | ✅        | ✅  | Core   |
| 9   | `candidate_preferences`         | Tenant     | ✅        | ✅  | Core   |
| 10  | `candidate_profile_views`       | Tenant     | ✅        | ✅  | Core   |
| 11  | `candidate_processes`           | Tenant     | ✅        | ✅  | Core   |
| 12  | `jobs`                          | Tenant     | ✅        | ✅  | Core   |
| 13  | `job_skills`                    | Tenant     | ✅        | ✅  | Core   |
| 14  | `applications`                  | Tenant     | ✅        | ✅  | Core   |
| 15  | `application_status_history`    | Tenant     | ✅        | ✅  | Core   |
| 16  | `application_profile_snapshots` | Tenant     | ✅        | ✅  | Core   |
| 17  | `interviews`                    | Tenant     | ✅        | ✅  | Core   |
| 18  | `interview_participants`        | Tenant     | ✅        | ✅  | Core   |
| 19  | `interview_feedback`            | Tenant     | ✅        | ✅  | Core   |
| 20  | `stage_templates`               | Tenant     | ✅        | ✅  | Core   |
| 21  | `recruitment_processes`         | Tenant     | ✅        | ✅  | Core   |
| 22  | `recruitment_stages`            | Tenant     | ✅        | ✅  | Core   |
| 23  | `talent_pool_memberships`       | Tenant     | ✅        | ✅  | Core   |
| 24  | `job_matches`                   | Tenant     | ✅        | ✅  | Core   |
| 25  | `recruitment_demands`           | Tenant     | ✅        | ✅  | Core   |

## Permissions existentes no seed (recruitment)

| Permission             | Module      | Descrição               |
| ---------------------- | ----------- | ----------------------- |
| `candidates.read`      | recruitment | Visualizar candidatos   |
| `candidates.create`    | recruitment | Criar candidatos        |
| `candidates.update`    | recruitment | Atualizar candidatos    |
| `jobs.read`            | recruitment | Visualizar vagas        |
| `jobs.create`          | recruitment | Criar vagas             |
| `jobs.update`          | recruitment | Editar vagas            |
| `jobs.publish`         | recruitment | Publicar vagas          |
| `jobs.delete`          | recruitment | Arquivar vagas          |
| `applications.read`    | recruitment | Visualizar candidaturas |
| `applications.update`  | recruitment | Atualizar candidaturas  |
| `applications.reject`  | recruitment | Rejeitar candidaturas   |
| `applications.approve` | recruitment | Aprovar candidaturas    |

## Campos por entidade (schema real)

### candidates

| Campo                    | Tipo          | Nullable | Default                   | FK/Check                                    |
| ------------------------ | ------------- | -------- | ------------------------- | ------------------------------------------- |
| `id`                     | uuid          | NO       | gen_random_uuid()         | PK                                          |
| `person_id`              | uuid          | NO       | —                         | FK `people(id)`                             |
| `tenant_id`              | uuid          | NO       | —                         | FK `tenants(id)`                            |
| `headline`               | varchar(150)  | YES      | —                         | —                                           |
| `salary_expectation_min` | numeric(10,2) | YES      | —                         | —                                           |
| `salary_expectation_max` | numeric(10,2) | YES      | —                         | —                                           |
| `salary_type`            | varchar(20)   | YES      | `negotiate`               | CHECK: range/monthly/negotiate              |
| `availability`           | jsonb         | YES      | `{"type":"immediate"...}` | —                                           |
| `source`                 | varchar(50)   | YES      | —                         | —                                           |
| `status`                 | varchar(20)   | NO       | `active`                  | CHECK: active/inactive/archived/blacklisted |
| `metadata`               | jsonb         | NO       | `{}`                      | —                                           |
| `created_by`             | uuid          | YES      | —                         | FK `people(id)`                             |
| `created_at`             | timestamptz   | NO       | now()                     | —                                           |
| `updated_at`             | timestamptz   | NO       | now()                     | —                                           |

**Unique:** `(person_id, tenant_id)`

### jobs

| Campo                     | Tipo          | Nullable | Default           | FK/Check                                                |
| ------------------------- | ------------- | -------- | ----------------- | ------------------------------------------------------- |
| `id`                      | uuid          | NO       | gen_random_uuid() | PK                                                      |
| `tenant_id`               | uuid          | NO       | —                 | FK `tenants(id)`                                        |
| `company_relationship_id` | uuid          | YES      | —                 | FK `company_relationships(id)`                          |
| `title`                   | varchar(200)  | NO       | —                 | —                                                       |
| `slug`                    | varchar(200)  | NO       | —                 | —                                                       |
| `description`             | text          | YES      | —                 | —                                                       |
| `responsibilities`        | text          | YES      | —                 | —                                                       |
| `requirements`            | text          | YES      | —                 | —                                                       |
| `benefits`                | text          | YES      | —                 | —                                                       |
| `salary_min`              | numeric(10,2) | YES      | —                 | —                                                       |
| `salary_max`              | numeric(10,2) | YES      | —                 | —                                                       |
| `salary_type`             | varchar(20)   | YES      | `negotiate`       | CHECK: range/monthly/negotiate                          |
| `contract_type`           | varchar(20)   | YES      | `clt`             | CHECK: clt/internship/temporary/freelance/contracted/cd |
| `seniority`               | varchar(20)   | YES      | —                 | CHECK: internship/junior/mid/senior/master/leadership   |
| `work_hours`              | varchar(50)   | YES      | —                 | —                                                       |
| `work_mode`               | varchar(20)   | YES      | `onsite`          | CHECK: onsite/hybrid/remote                             |
| `city`                    | varchar(100)  | YES      | —                 | —                                                       |
| `state`                   | varchar(2)    | YES      | —                 | —                                                       |
| `location_detail`         | varchar(255)  | YES      | —                 | —                                                       |
| `status`                  | varchar(20)   | NO       | `draft`           | CHECK: draft/published/archived/hired/expired           |
| `views_count`             | integer       | NO       | 0                 | —                                                       |
| `applications_count`      | integer       | NO       | 0                 | —                                                       |
| `published_at`            | timestamptz   | YES      | —                 | —                                                       |
| `expires_at`              | timestamptz   | YES      | —                 | —                                                       |
| `metadata`                | jsonb         | NO       | `{}`              | —                                                       |
| `created_by`              | uuid          | YES      | —                 | FK `people(id)`                                         |
| `created_at`              | timestamptz   | NO       | now()             | —                                                       |
| `updated_at`              | timestamptz   | NO       | now()             | —                                                       |

**Unique:** `(tenant_id, slug)`

### applications

| Campo              | Tipo         | Nullable | Default           | FK/Check                                                                                                                     |
| ------------------ | ------------ | -------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `id`               | uuid         | NO       | gen_random_uuid() | PK                                                                                                                           |
| `tenant_id`        | uuid         | NO       | —                 | FK `tenants(id)`                                                                                                             |
| `job_id`           | uuid         | NO       | —                 | FK `jobs(id)`                                                                                                                |
| `candidate_id`     | uuid         | NO       | —                 | FK `candidates(id)`                                                                                                          |
| `profile_snapshot` | jsonb        | YES      | —                 | —                                                                                                                            |
| `match_score`      | numeric(5,2) | YES      | —                 | —                                                                                                                            |
| `match_details`    | jsonb        | YES      | —                 | —                                                                                                                            |
| `source`           | varchar(50)  | YES      | —                 | CHECK: website/whatsapp/email/indication/talent_pool/api/other                                                               |
| `current_stage`    | varchar(50)  | NO       | `submitted`       | CHECK: submitted/screening/interview/technical_interview/presentation/reference_check/offer/hired/rejected/withdrawn/on_hold |
| `notes`            | text         | YES      | —                 | —                                                                                                                            |
| `applied_at`       | timestamptz  | NO       | now()             | —                                                                                                                            |
| `updated_at`       | timestamptz  | NO       | now()             | —                                                                                                                            |
| `created_by`       | uuid         | YES      | —                 | FK `people(id)`                                                                                                              |

**Unique:** `(candidate_id, job_id)`

### interviews

| Campo            | Tipo        | Nullable | Default           | FK/Check                                     |
| ---------------- | ----------- | -------- | ----------------- | -------------------------------------------- |
| `id`             | uuid        | NO       | gen_random_uuid() | PK                                           |
| `application_id` | uuid        | NO       | —                 | FK `applications(id)`                        |
| `scheduled_at`   | timestamptz | YES      | —                 | —                                            |
| `type`           | varchar(50) | YES      | —                 | —                                            |
| `location`       | text        | YES      | —                 | —                                            |
| `status`         | varchar(20) | NO       | `scheduled`       | CHECK: scheduled/completed/cancelled/no_show |
| `evaluation`     | text        | YES      | —                 | —                                            |
| `notes`          | text        | YES      | —                 | —                                            |
| `created_at`     | timestamptz | NO       | now()             | —                                            |
| `updated_at`     | timestamptz | NO       | now()             | —                                            |

### recruitment_processes

| Campo             | Tipo        | Nullable | Default           | FK/Check                                 |
| ----------------- | ----------- | -------- | ----------------- | ---------------------------------------- |
| `id`              | uuid        | NO       | gen_random_uuid() | PK                                       |
| `tenant_id`       | uuid        | NO       | —                 | FK `tenants(id)`                         |
| `job_id`          | uuid        | NO       | —                 | FK `jobs(id)`                            |
| `candidate_id`    | uuid        | NO       | —                 | FK `candidates(id)`                      |
| `status`          | varchar(20) | NO       | `open`            | CHECK: open/in_progress/closed/cancelled |
| `opened_at`       | timestamptz | NO       | now()             | —                                        |
| `closed_at`       | timestamptz | YES      | —                 | —                                        |
| `actor_person_id` | uuid        | YES      | —                 | FK `people(id)`                          |
| `created_at`      | timestamptz | NO       | now()             | —                                        |
| `updated_at`      | timestamptz | NO       | now()             | —                                        |

**Unique:** `(job_id, candidate_id)`

### recruitment_stages

| Campo                    | Tipo        | Nullable | Default           | FK/Check                                              |
| ------------------------ | ----------- | -------- | ----------------- | ----------------------------------------------------- |
| `id`                     | uuid        | NO       | gen_random_uuid() | PK                                                    |
| `tenant_id`              | uuid        | NO       | —                 | FK `tenants(id)`                                      |
| `recruitment_process_id` | uuid        | NO       | —                 | FK `recruitment_processes(id)`                        |
| `stage_template_id`      | uuid        | NO       | —                 | FK `stage_templates(id)`                              |
| `status`                 | varchar(20) | NO       | `pending`         | CHECK: pending/in_progress/completed/skipped/rejected |
| `started_at`             | timestamptz | YES      | —                 | —                                                     |
| `completed_at`           | timestamptz | YES      | —                 | —                                                     |
| `notes`                  | text        | YES      | —                 | —                                                     |
| `actor_person_id`        | uuid        | YES      | —                 | FK `people(id)`                                       |
| `created_at`             | timestamptz | NO       | now()             | —                                                     |
| `updated_at`             | timestamptz | NO       | now()             | —                                                     |

### talent_pool_memberships

| Campo             | Tipo               | Nullable | Default           | FK/Check                                                                      |
| ----------------- | ------------------ | -------- | ----------------- | ----------------------------------------------------------------------------- |
| `id`              | uuid               | NO       | gen_random_uuid() | PK                                                                            |
| `candidate_id`    | uuid               | NO       | —                 | FK `candidates(id)`                                                           |
| `tenant_id`       | uuid               | NO       | —                 | FK `tenants(id)`                                                              |
| `status`          | talent_pool_status | NO       | `active`          | ENUM: active/paused/removed                                                   |
| `source`          | talent_pool_source | NO       | —                 | ENUM: direct_signup/application_rejected/recruiter_invitation/import/campaign |
| `consent_status`  | consent_status     | NO       | `granted`         | ENUM: granted/revoked/expired                                                 |
| `consented_at`    | timestamptz        | NO       | now()             | —                                                                             |
| `consent_source`  | varchar(50)        | YES      | —                 | —                                                                             |
| `consent_version` | varchar(20)        | YES      | —                 | —                                                                             |
| `joined_at`       | timestamptz        | NO       | now()             | —                                                                             |
| `removed_at`      | timestamptz        | YES      | —                 | —                                                                             |
| `removal_reason`  | varchar(100)       | YES      | —                 | —                                                                             |
| `metadata`        | jsonb              | NO       | `{}`              | —                                                                             |
| `created_at`      | timestamptz        | NO       | now()             | —                                                                             |
| `created_by`      | uuid               | YES      | —                 | FK `people(id)`                                                               |
| `updated_at`      | timestamptz        | NO       | now()             | —                                                                             |

**Unique:** `(candidate_id, tenant_id)`

### job_matches

| Campo                | Tipo         | Nullable | Default           | FK/Check            |
| -------------------- | ------------ | -------- | ----------------- | ------------------- |
| `id`                 | uuid         | NO       | gen_random_uuid() | PK                  |
| `candidate_id`       | uuid         | NO       | —                 | FK `candidates(id)` |
| `job_id`             | uuid         | NO       | —                 | FK `jobs(id)`       |
| `tenant_id`          | uuid         | NO       | —                 | FK `tenants(id)`    |
| `score`              | numeric(5,2) | NO       | —                 | CHECK: 0-100        |
| `reasons`            | jsonb        | NO       | `{}`              | —                   |
| `algorithm_version`  | varchar(20)  | YES      | —                 | CHECK: 1.0          |
| `is_eligible`        | boolean      | NO       | true              | —                   |
| `sent_notification`  | boolean      | NO       | false             | —                   |
| `invalidated_at`     | timestamptz  | YES      | —                 | —                   |
| `invalidated_reason` | varchar(100) | YES      | —                 | —                   |
| `created_at`         | timestamptz  | NO       | now()             | —                   |
| `updated_at`         | timestamptz  | NO       | now()             | —                   |

**Unique:** `(candidate_id, job_id)`

## RLS chains confirmadas

| Tabela                          | Chain                                              |
| ------------------------------- | -------------------------------------------------- |
| `skills`                        | GLOBAL: authenticated read / service_role manage   |
| `candidates`                    | auth.uid → people → tenant_memberships → tenant_id |
| `candidate_skills`              | candidate → tenant_memberships                     |
| `jobs`                          | auth.uid → people → tenant_memberships → tenant_id |
| `job_skills`                    | job → tenant_memberships                           |
| `applications`                  | auth.uid → people → tenant_memberships → tenant_id |
| `application_status_history`    | application → tenant_memberships                   |
| `application_profile_snapshots` | application → tenant_memberships                   |
| `interviews`                    | application → tenant_memberships                   |
| `interview_participants`        | interview → tenant_memberships                     |
| `interview_feedback`            | interview → tenant_memberships                     |
| `recruitment_processes`         | auth.uid → people → tenant_memberships → tenant_id |
| `recruitment_stages`            | recruitment_process → tenant_memberships           |
| `talent_pool_memberships`       | auth.uid → people → tenant_memberships → tenant_id |
| `job_matches`                   | auth.uid → people → tenant_memberships → tenant_id |
| `candidate_preferences`         | candidate → people → tenant_memberships            |
| `candidate_profile_views`       | auth.uid → people → tenant_memberships → tenant_id |

## Ordem de implementação

### Fase 1 — Core RH

1. `CandidateRepository` + `CandidatosPage`
2. `JobRepository` + `VagasPage`
3. `ApplicationRepository` + `CandidaturasPage`

### Fase 2 — Processo seletivo

4. `RecruitmentProcessRepository` + `ProcessosPage`
5. `InterviewRepository` + `EntrevistasPage`

### Fase 3 — Talent Pool

6. `TalentPoolRepository` + `BancoDeTalentosPage`
7. `JobMatchRepository` + `JobMatchPage`

### Fase 4 — Relatórios RH

8. Dashboard RH com KPIs reais

## Não implementar ainda

- `candidate_experiences` (detalhe)
- `candidate_education` (detalhe)
- `candidate_courses` (detalhe)
- `candidate_languages` (detalhe)
- `candidate_documents` (detalhe)
- `candidate_preferences` (detalhe)
- `stage_templates` (detalhe)
- `interview_participants` (detalhe)
- `interview_feedback` (detalhe)

Esses ficam para detalhamento do candidato após Fase 1 fechada.

## Próximo passo

Implementar `CandidateRepository` e `CandidatosPage` seguindo o contrato real.
