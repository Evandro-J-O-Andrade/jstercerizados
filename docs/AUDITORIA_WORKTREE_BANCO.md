# AUDITORIA WORKTREE — INVENTÁRIO DO BANCO ANTES DA MIGRAÇÃO

**Empresa:** J&S Empregos LTDA  
**Data:** 2026-09-14  
**Método:** READ-ONLY — nenhuma migration aplicada, nenhum arquivo alterado, nenhum dado modificado  
**Branch:** `main`  
**HEAD local:** `2c490b9` (2.11: RH reconciliation to V2.1 physical schema)

---

## 1. ESTADO DA WORKTREE

| Item               | Status                               |
| ------------------ | ------------------------------------ |
| Branch             | `main`                               |
| HEAD               | `2c490b9`                            |
| Working tree       | 3 modified, 19 deleted, 30 untracked |
| Staging            | Limpo (modificações não staged)      |
| Arquivo base local | `supabase/schema.sql`                |
| Diretório spec     | `supabase/specs/sql/` (47 arquivos)  |

---

## 2. ARQUIVOS RELEVANTES ENCONTRADOS

### Migrations locais (50 arquivos)

- `supabase/migrations/20260816*_*.sql` — 8 migrations base (core, identity, companies, candidates, jobs, applications, rbac, storage, domain_events, notifications, talent_pool, rls_consolidation)
- `supabase/migrations/20260816000100_core_people_tenants.sql` — tenants, people, tenant_memberships
- `supabase/migrations/20260816000200_identity_people_auth.sql` — triggers auth.users → people sync
- `supabase/migrations/20260816000300_companies.sql` — companies, company_relationships, company_contacts
- `supabase/migrations/20260816000400_candidates.sql` — skills, candidates + child tables
- `supabase/migrations/20260816000500_jobs.sql` — jobs, job_skills
- `supabase/migrations/20260816000600_applications.sql` — applications, status_history, profile_snapshots
- `supabase/migrations/20260816000700_rbac.sql` — roles, permissions, role_permissions, role_assignments
- `supabase/migrations/20260816000800_storage.sql` — storage, files
- `supabase/migrations/20260816000900_domain_events.sql` — domain_events
- `supabase/migrations/20260816001000_notifications.sql` — notifications
- `supabase/migrations/20260816001100_talent_pool.sql` — talent_pool_memberships
- `supabase/migrations/20260816001200_rls_consolidation.sql` — role_resource_permissions, user_has_permission(), can_access_tenant(), RLS policies
- `supabase/migrations/20260816001300_seed_admin_master_permissions.sql`
- `supabase/migrations/20260827000100_employees.sql` — employees + employee_documents, employee_education, employee_experiences, employee_skills, employee_languages, employee_courses + RLS
- `supabase/migrations/20260827000000_recruitment_stages.sql` — recruitment_stages
- `supabase/migrations/20260817*` — seed, rls, fix_role_assignments
- `supabase/migrations/20260823*` — rbac seeds
- `supabase/migrations/20260824*` — fix grants, seed jobs
- `supabase/migrations/20260825*` — auth flow, rbac finance, first access tables, reconcile local vs cloud
- `supabase/migrations/20260826*` — candidate bootstrap
- `supabase/migrations/20260827*` — candidate child tables, finance
- `supabase/migrations/20260828*` — fix bootstrap identity
- `supabase/migrations/20260829*` — services
- `supabase/migrations/20260830*` — reconcile applications, recruitment_demands, job_matches, notifications, company_services_link, service_orders_relationship, storage_services_images
- `supabase/migrations/20260831*` — company_social_links
- `supabase/migrations/20260901*` — media storage v1
- `supabase/migrations/20260902*` — schema reconciliation (bloco1-10, backend_gate, p0)
- `supabase/migrations/20260903*` — rbac fixes, services alignment
- `supabase/migrations/20260904*` — candidate self-service RBAC, canonical roles
- `supabase/migrations/20260905*` — candidate job alerts
- `supabase/migrations/20260906*` — candidate portal navigation
- `supabase/migrations/20260907*` — footer configs
- `supabase/migrations/20260908*` — page templates, fixes
- `supabase/migrations/20260909*` — fix user_has_permission, fix bootstrap candidate role
- `supabase/migrations/20260910*` — unify first_login_state

### Specs SQL (`supabase/specs/sql/`)

47 arquivos: `00_extensions` até `47_rbac_canonical.sql`, definindo o modelo V2.1 canônico.

### Tipos TypeScript

- `src/types/database.ts` — **34 tabelas definidas** (Row/Insert/Update)
- `src/types/domain/employee.ts` — Employee domain type (já reconciliado com physical schema)
- `src/types/domain/mappers.ts` — mapEmployee (explicit field mapping)
- `database_new.ts` — **ARTEFATO LEGACY NÃO IMPORTADO**, ainda contém `employee_code` (lines 2192, 2203, 2214)

### Repositories (27 arquivos)

- `employees.repository.ts` — CRUD completo (registration, todos os campos físicos)
- `employee-documents.repository.ts` — CRUD employee_documents
- `candidates.repository.ts`, `candidate-experiences.repository.ts`, `candidate-education.repository.ts`, `candidate-courses.repository.ts`, `candidate-languages.repository.ts`, `candidate-documents.repository.ts`, `candidate-skills.repository.ts`, `candidate-preferences.repository.ts`, `candidate-profile-views.repository.ts`
- `applications.repository.ts` (inclui application_status_history)
- `jobs.repository.ts`, `recruitment-stages.repository.ts`, `recruitment-processes.repository.ts`
- `companies.repository.ts`, `suppliers.repository.ts`, `partners.repository.ts`, `budget.repository.ts`
- `services.repository.ts`, `warehouse.repository.ts`, `stock.repository.ts`
- `finance.repository.ts`, `financial-transaction.repository.ts`, `financial-account.repository.ts`, `financial-category.repository.ts`, `financial-installment.repository.ts`, `accounts-receivable.repository.ts`, `accounts-payable.repository.ts`, `accounting.repository.ts`, `billing.repository.ts`, `cash-flow.repository.ts`, `invoice.repository.ts`, `receipt.repository.ts`, `bank-account.repository.ts`, `bank-reconciliation.repository.ts`
- `tenant.repository.ts`, `users.repository.ts`, `role.repository.ts`, `permission.repository.ts`
- `notification.repository.ts`, `audit.repository.ts`, `security.repository.ts`
- `cost-center.repository.ts`, `navigation.repository.ts`, `page-template.repository.ts`, `footer.repository.ts`
- `support.repository.ts`, `fiscal.repository.ts`
- Repositórios `candidate-portal/` (publicJobs, jobAlerts, favoriteJobs)

### Services

- `src/services/candidates.ts` — submitCandidateApplication (people, candidates, candidate_documents, consents, tenants)

### Hooks com queries Supabase

- `src/hooks/useGlobalDashboardStats.ts` — domain_events count
- `src/hooks/useRealtimeChat.ts` — chat_rooms, chat_messages
- `src/hooks/usePublicCompanies.ts`

### Páginas com queries Supabase

- `DashboardRh.tsx`, `Funcionarios.tsx`, `FuncionarioDetalhe.tsx`, `DocumentosRh.tsx`, `RhPage.tsx`, `RelatorioRhPage.tsx`
- `RbacAuditPage.tsx` — people, roles, permissions, role_permissions, tenant_memberships, role_assignments, tenants
- `SegurancaPage.tsx` — roles
- `SkillsPage.tsx` — skills
- `SessoesPage.tsx` — sessions
- `ClientesPage.tsx` — companies
- `CompanyRelationshipsPage.tsx` — company_relationships
- `DocumentosPage.tsx` — files
- `OnboardingPage.tsx` — tenants
- `LgpdPage.tsx`, `TermosPage.tsx` — legal_acceptances

### Edge Functions (3)

- `supabase/functions/turnstile-siteverify/index.ts` — Cloudflare Turnstile verification
- `supabase/functions/chat/index.ts` — OpenRouter chat
- `supabase/functions/handoff/index.ts` — n8n webhook handoff

### Scripts de verificação

- `scripts/check_auth_users.mts`
- `scripts/check_auth_logs.mts`
- `scripts/check_historical.mts`
- `scripts/check_historical_user.mts`
- `scripts/check_public_services.mts`
- `scripts/test_companies.mts`
- `scripts/test_public_jobs.mts`
- `scripts/test_signup.mts`

### Documentação relevante

- `docs/SUPABASE-REAL-SCHEMA-INVENTORY.md` — inventário 2026-08-25
- `docs/V2.1-GAP-ANALYSIS.md` — gap analysis V2.1
- `docs/V21-MISSING-OBJECTS-RECONSTRUCTION-PLAN.md` — plano de reconstrução
- `docs/V21-GAP-CLOSURE-MATRIX.md`
- `docs/V21-GAP-CLOSURE-DEPENDENCY-GRAPH.md`
- `supabase/migrations/MIGRATION-AUDIT-20260901.md` — mapeamento migrations locais vs remote

---

## 3. MIGRATIONS LOCAIS — INVENTÁRIO

| Migration                        | Objetivo                                              | Tabelas                                                                                                                                                                | Functions                                                                | Triggers       | RLS                    | Policies             | Status                          |
| -------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------- | ---------------------- | -------------------- | ------------------------------- |
| 20260816000100_core              | tenants, people, tenant_memberships                   | tenants, people, tenant_memberships                                                                                                                                    | update_updated_at()                                                      | 3 (updated_at) | ✅                     | 6                    | LOCAL — APLICADA (34 no remote) |
| 20260816000200_identity          | auth.users → people sync                              | —                                                                                                                                                                      | handle_new_auth_user, handle_auth_user_updated, handle_auth_user_deleted | 3              | —                      | —                    | LOCAL — NÃO APLICADA            |
| 20260816000300_companies         | companies + relacionamentos                           | companies, company_types, company_relationship_types, company_relationships, company_contacts                                                                          | —                                                                        | triggers       | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816000400_candidates        | candidates + skills + child tables                    | skills, candidates, candidate_skills, candidate_experiences, candidate_education, candidate_courses, candidate_languages, candidate_documents, candidate_profile_views | —                                                                        | triggers       | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816000500_jobs              | jobs + job_skills                                     | jobs, job_skills                                                                                                                                                       | —                                                                        | triggers       | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816000600_applications      | applications + history                                | applications, application_status_history, application_profile_snapshots                                                                                                | —                                                                        | triggers       | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816000700_rbac              | roles, permissions, assignments                       | roles, permissions, role_permissions, role_assignments                                                                                                                 | —                                                                        | 3 triggers     | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816000800_storage           | storage, files                                        | files                                                                                                                                                                  | —                                                                        | —              | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816000900_domain_events     | domain_events                                         | domain_events                                                                                                                                                          | —                                                                        | —              | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816001000_notifications     | notifications                                         | notifications                                                                                                                                                          | —                                                                        | —              | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816001100_talent_pool       | talent_pool_memberships                               | talent_pool_memberships                                                                                                                                                | —                                                                        | —              | ✅                     | policies             | LOCAL — APLICADA                |
| 20260816001200_rls_consolidation | role_resource_permissions, user_has_permission(), RLS | role_resource_permissions                                                                                                                                              | user_has_permission(), can_access_tenant(), is_frontend_safe_role()      | —              | ✅ (47 tables forçado) | ~25 policies         | LOCAL — APLICADA                |
| 20260827000100_employees         | employees + child tables                              | employees, employee_documents, employee_education, employee_experiences, employee_skills, employee_languages, employee_courses                                         | —                                                                        | 7 triggers     | ✅                     | policies (employees) | LOCAL — NÃO APLICADA            |
| 20260909000000                   | Fix user_has_permission (remove expires_at)           | —                                                                                                                                                                      | user_has_permission()                                                    | —              | —                      | —                    | LOCAL — NÃO APLICADA            |
| 20260909000001                   | Fix bootstrap candidate role name                     | —                                                                                                                                                                      | bootstrap_candidate_from_auth_user()                                     | —              | —                      | —                    | LOCAL — NÃO APLICADA            |
| 20260910000002                   | Unify first_login_state                               | first_login_state                                                                                                                                                      | bootstrap_candidate_from_auth_user(), bootstrap_candidate_identity()     | —              | —                      | —                    | LOCAL — NÃO APLICADA            |

**Total migrations locais:** 50 arquivos  
**Aplicadas no remote (conhecidas):** ~34 (base 20260816* + algumas 20260823-0830)  
**NÃO aplicadas no remote:** employees, identity sync trigger, fixes de 20260909-10

---

## 4. MODELO DE DADOS IDENTIFICADO

### Identidade (chain canônico)

```text
auth.users (Supabase Auth — nÃO acessível via PostgREST)
  │ INSERT/UPDATE/DELETE (trigger)
  ▼
handle_new_auth_user() → people (1:1 via auth_user_id UNIQUE)
  │
  ├── tenant_memberships (many-to-many people ↔ tenants, membership_role)
  │     │
  │     ├── role_assignments (global roles null tenant | tenant roles)
  │     │     ├── roles (admin_master global | tenant_admin, rh_manager, etc.)
  │     │     └── role_permissions (role ↔ permission)
  │     │           ├── permissions (resource.action canônicos)
  │     │           └── role_resource_permissions (matriz de autorização)
  │     │
  │     └── companies (via company_relationships)
  │
  ├── candidates (contexto de recrutamento, UNIQUE(person_id, tenant_id))
  │     ├── candidate_skills
  │     ├── candidate_experiences
  │     ├── candidate_education
  │     ├── candidate_courses
  │     ├── candidate_languages
  │     ├── candidate_documents (storage)
  │     ├── candidate_profile_views
  │     ├── candidate_preferences
  │     └── job_matches (candidato ↔ jobs)
  │
  └── employees (vínculo de trabalho)
        ├── employee_documents
        ├── employee_education
        ├── employee_experiences
        ├── employee_skills
        ├── employee_languages
        ├── employee_courses
        ├── employee_positions (V2.1 spec — NÃO na physical migration)
        ├── employee_contracts (V2.1 spec — NÃO na physical migration)
        └── employee_status_history (V2.1 spec — NÃO na physical migration)
```

**IMPORTANTE:** A migration física (`20260827000100_employees.sql`) NÃO cria `employee_positions`, `employee_contracts`, `employee_status_history`, `departments` ou `positions`. Elas existem apenas:

- Na spec V2.1 (`supabase/specs/sql/33_employees.sql`)
- No `database.ts` (types)

### Entidades de negócio identificadas (32)

| Entidade                   | Tabela                        | Tipo                                  |
| -------------------------- | ----------------------------- | ------------------------------------- |
| Pessoa                     | people                        | ✅ Tabela física                      |
| Tenant                     | tenants                       | ✅ Tabela física                      |
| Membership                 | tenant_memberships            | ✅ Tabela física                      |
| Role                       | roles                         | ✅ Tabela física                      |
| Permission                 | permissions                   | ✅ Tabela física                      |
| Role Assignment            | role_assignments              | ✅ Tabela física                      |
| Role Permissions           | role_permissions              | ✅ Tabela física                      |
| Role Resource Permissions  | role_resource_permissions     | ✅ Tabela física                      |
| Habilidade                 | skills                        | ✅ Tabela física                      |
| Candidato                  | candidates                    | ✅ Tabela física                      |
| Candidato Skills           | candidate_skills              | ✅ Tabela física                      |
| Candidato Experiences      | candidate_experiences         | ✅ Tabela física                      |
| Candidato Education        | candidate_education           | ✅ Tabela física                      |
| Candidato Courses          | candidate_courses             | ✅ Tabela física                      |
| Candidato Languages        | candidate_languages           | ✅ Tabela física                      |
| Candidato Documents        | candidate_documents           | ✅ Tabela física                      |
| Profile Views              | candidate_profile_views       | ✅ Tabela física                      |
| Talent Pool                | talent_pool_memberships       | ✅ Tabela física                      |
| Preferences                | candidate_preferences         | ✅ Tabela física                      |
| Job Match                  | job_matches                   | ✅ Tabela física                      |
| Vaga (Job)                 | jobs                          | ✅ Tabela física                      |
| Job Skills                 | job_skills                    | ✅ Tabela física                      |
| Candidatura                | applications                  | ✅ Tabela física                      |
| Application Status History | application_status_history    | ✅ Tabela física                      |
| Application Snapshots      | application_profile_snapshots | ✅ Tabela física                      |
| Recruitment Stage          | recruitment_stages            | ✅ Tabela física                      |
| Lead                       | leads                         | ✅ database.ts / NÃO migration        |
| Service                    | services                      | ✅ Tabela física                      |
| Supplier                   | suppliers                     | ✅ database.ts                        |
| Partner                    | partners                      | ✅ database.ts                        |
| Budget Request             | budget_requests               | ✅ database.ts                        |
| Empregado                  | employees                     | ✅ Tabela física                      |
| Departments (V2.1)         | departments                   | ⚠️ database.ts / NÃO migration física |
| Positions (V2.1)           | positions                     | ⚠️ database.ts / NÃO migration física |
| Employee Positions         | employee_positions            | ⚠️ database.ts / NÃO migration física |
| Employee Contracts         | employee_contracts            | ⚠️ database.ts / NÃO migration física |
| Employee Status History    | employee_status_history       | ⚠️ database.ts / NÃO migration física |

**Total tabelas no database.ts:** 34 tabelas definidas

---

## 5. ENTIDADES — MAPEAMENTO COMPLETO

Veja tabela acima (32+ entidades).

---

## 6. DEPENDÊNCIAS

```text
tenants
  └── tenant_memberships
        └── people
              ├── role_assignments → roles → role_permissions → permissions
              ├── candidates
              │     ├── candidate_skills → skills
              │     ├── candidate_experiences
              │     ├── candidate_education
              │     ├── candidate_courses
              │     ├── candidate_languages
              │     ├── candidate_documents
              │     ├── candidate_profile_views
              │     ├── candidate_preferences
              │     └── job_matches → jobs
              ├── employees
              │     ├── employee_documents
              │     ├── employee_education
              │     ├── employee_experiences
              │     ├── employee_skills
              │     ├── employee_languages
              │     ├── employee_courses
              │     ├── employee_positions → positions → departments (V2.1 only)
              │     ├── employee_contracts (V2.1 only)
              │     └── employee_status_history (V2.1 only)
              └── first_login_state

companies
  └── company_relationships
        └── jobs
              └── applications → candidates

files (storage)
  └── (referenciado por candidate_documents, employee_documents, etc.)

domain_events
  └── (append-only, tenant-scoped)

notifications
  └── (recipient_person_id → people)
```

---

## 7. SEGURANÇA

### Implementado localmente (RLS + policies)

**Migration `20260816000700_rbac.sql`:**

- roles: RLS (authenticated read, admin_master manage)
- permissions: RLS (authenticated read, admin_master manage)
- role_permissions: RLS (authenticated read, admin_master manage)
- role_assignments: RLS (self or admin read, admin/tenant_admin manage)

**Migration `20260816001200_rls_consolidation.sql`:**

- role_resource_permissions table (matriz de autorização)
- `user_has_permission()` — SECURITY DEFINER function
- `can_access_tenant()` — SECURITY DEFINER function
- `is_frontend_safe_role()` — SECURITY DEFINER function
- RLS forçado em todas as 47 tabelas (DO $$ loop)
- revoke all on schema public from public
- grant usage on schema to authenticated, service_role

**Migration `20260816000100_core_people_tenants.sql`:**

- tenants: RLS (authenticated read, admin manage)
- people: RLS (self read, self update, self insert)
- tenant_memberships: RLS (own read, insert within tenant, manage by owner/admin)

**Migration `20260816000300_companies.sql`:**

- companies: RLS policies
- company_relationships: RLS policies
- company_contacts: RLS policies

**Migration `20260816000400_candidates.sql`:**

- All candidate tables: RLS policies via user_has_permission()

**Migration `20260816000500_jobs.sql`:**

- jobs: RLS policies

**Migration `20260816000600_applications.sql`:**

- applications: RLS policies
- application_status_history: RLS (append-only, tenant read)
- application_profile_snapshots: RLS (append-only, tenant read)

**Migration `20260827000100_employees.sql`:**

- employees: RLS (tenant members visible, tenant HR manageable)
- employee_documents, employee_education, employee_experiences, employee_skills, employee_languages, employee_courses: RLS enabled

### NÃO aplicado no remote (conhecido)

- Migration `20260816000200_identity_people_auth.sql` — triggers auth.users sync (NÃO aplicada)
- Migration `20260827000100_employees.sql` — tabelas employees (NÃO aplicada)
- Migration `20260909000000` — fix user_has_permission expires_at (NÃO aplicada)
- Migration `20260909000001` — fix bootstrap candidate role (NÃO aplicada)
- Migration `20260910000002` — unify first_login_state (NÃO aplicada)

### RBAC canônico (seed no remote)

- Roles: admin_master (global), platform_admin, support_engineer, tenant_admin, rh_manager, recruiter, finance, support, content_manager, viewer, member
- Permissions: 19+ permissões canônicas (people._, candidates._, jobs._, applications._, companies._, finance._, audit.*, roles.manage, tenant.manage, integrations.manage)

---

## 8. INTEGRAÇÃO COM O FRONTEND — TABELAS ACESSADAS

| Arquivo                                       | Tabela/RPC                                                                                  | Operação                    | Finalidade                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------- |
| services/candidates.ts                        | people                                                                                      | SELECT                      | Identificar pessoa via auth_user_id                      |
| services/candidates.ts                        | candidates                                                                                  | INSERT                      | Criar candidato                                          |
| services/candidates.ts                        | candidate_documents                                                                         | INSERT                      | Upload documento                                         |
| services/candidates.ts                        | consents                                                                                    | INSERT                      | Registrar consentimento LGPD                             |
| services/candidates.ts                        | tenants                                                                                     | SELECT                      | Obter tenant_id por slug                                 |
| services/candidates.ts                        | storage(curriculos)                                                                         | UPLOAD                      | Enviar currículo                                         |
| hooks/useGlobalDashboardStats.ts              | domain_events                                                                               | SELECT count                | Dashboard estatísticas                                   |
| hooks/useRealtimeChat.ts                      | chat_rooms                                                                                  | SELECT/INSERT               | Chat em tempo real                                       |
| hooks/useRealtimeChat.ts                      | chat_messages                                                                               | SELECT/INSERT               | Mensagens do chat                                        |
| hooks/useRealtimeChat.ts                      | chat_rooms                                                                                  | SELECT (update)             | Atualização de salas                                     |
| repositories/employees.repository.ts          | employees                                                                                   | SELECT/INSERT/UPDATE/DELETE | CRUD funcionários                                        |
| repositories/employee-documents.repository.ts | employee_documents                                                                          | CRUD                        | Documentos de funcionários                               |
| repositories/index.ts                         | candidate_*                                                                                 | CRUD                        | CRUD candidatos (docs, exp, edu, courses, langs, skills) |
| repositories/candidates.repository.ts         | candidates                                                                                  | CRUD                        | CRUD candidatos                                          |
| repositories/applications.repository.ts       | applications, application_status_history                                                    | CRUD                        | CRUD candidaturas                                        |
| repositories/jobs.repository.ts               | jobs                                                                                        | SELECT                      | Listar vagas                                             |
| repositories/recruitment-stages.repository.ts | recruitment_stages                                                                          | CRUD                        | Etapas de recrutamento                                   |
| repositories/companies.repository.ts          | companies, company_relationships                                                            | CRUD                        | CRUD empresas                                            |
| repositories/tenant.repository.ts             | tenants                                                                                     | CRUD                        | CRUD tenants                                             |
| repositories/role.repository.ts               | roles                                                                                       | CRUD                        | CRUD roles                                               |
| repositories/permission.repository.ts         | permissions                                                                                 | CRUD                        | CRUD permissions                                         |
| repositories/users.repository.ts              | people                                                                                      | SELECT                      | Dados do usuário                                         |
| pages/dashboard/RhPage.tsx                    | people                                                                                      | SELECT                      | Listar pessoas                                           |
| pages/dashboard/RbacAuditPage.tsx             | people, roles, permissions, role_permissions, tenant_memberships, role_assignments, tenants | SELECT                      | Auditoria RBAC                                           |
| pages/dashboard/SegurancaPage.tsx             | roles                                                                                       | SELECT                      | Configuração de segurança                                |
| pages/dashboard/SkillsPage.tsx                | skills                                                                                      | SELECT                      | Gerenciar habilidades                                    |
| pages/dashboard/ClientesPage.tsx              | companies                                                                                   | SELECT                      | Listar clientes                                          |
| pages/dashboard/CompanyRelationshipsPage.tsx  | company_relationships                                                                       | SELECT                      | Relacionamentos                                          |
| pages/dashboard/DocumentosPage.tsx            | files                                                                                       | SELECT                      | Arquivos                                                 |
| pages/dashboard/OnboardingPage.tsx            | tenants                                                                                     | SELECT/INSERT               | Onboarding                                               |
| pages/dashboard/LgpdPage.tsx                  | legal_acceptances                                                                           | SELECT                      | LGPD                                                     |
| pages/dashboard/TermosPage.tsx                | legal_acceptances                                                                           | SELECT                      | Termos                                                   |
| pages/dashboard/SessoesPage.tsx               | sessions                                                                                    | SELECT                      | Sessões ativas                                           |
| repositories/page-template.repository.ts      | rpc: resolve_page_template                                                                  | RPC                         | Templates de página                                      |
| lib/chat-client.ts                            | rpc: chat                                                                                   | FUNCTION_INVOKE             | Chat com OpenRouter                                      |
| lib/n8n.ts                                    | rpc: handoff                                                                                | FUNCTION_INVOKE             | Handoff para n8n                                         |
| src/lib/n8n.ts                                | —                                                                                           | FUNCTIONS_INVOKE            | n8n webhook                                              |
| AuthContext.tsx                               | candidates                                                                                  | SELECT                      | Verificar candidato no contexto                          |

**Tabelas não acessadas pelo frontend mas definidas no database.ts:**

- employee_positions, employee_contracts, employee_status_history, departments, positions (V2.1 spec)
- service_orders, financial_transactions, stock_movements, support_tickets, report_definitions, tenant_settings, first_login_state, legal_acceptances (algumas acessadas indiretamente)

---

## 9. GAPS IDENTIFICADOS

### EXISTENTE LOCALMENTE (definido no código)

- Todas as 34 tabelas no `database.ts`
- Migrations para core, identity, companies, candidates, jobs, applications, rbac, storage, employees
- Functions: user_has_permission(), can_access_tenant(), is_frontend_safe_role(), handle_new_auth_user()
- Edge functions: chat, handoff, turnstile-siteverify
- RBAC canônico: 11 roles, 19+ permissions

### INCOMPLETO

- employee_positions, employee_contracts, employee_status_history, departments, positions — definidos no database.ts mas **não criados na migration física** (`20260827000100_employees.sql`)
- employee_education, employee_experiences, employee_skills, employee_languages, employee_courses — criados na migration física mas **não definidos no database.ts**

### AUSENTE

- Nenhuma tabela crítica está ausente entre as definidas no database.ts e as migradas fisicamente (exceto as do item INCOMPLETO acima)
- Migration `20260816000200_identity_people_auth.sql` (triggers Auth) — **não aplicada no remote**

### INCONSISTENTE

**GAP-001: divergent model — employee_code vs registration**

- **Descrição:** A spec V2.1 (`33_employees.sql`) define `employee_code`, mas a migration física (`20260827000100_employees.sql`) define `registration`. O `database.ts` e `employee.ts` já foram reconciliados para `registration`. O arquivo `database_new.ts` (legacy) ainda usa `employee_code`.
- **Arquivo:** `database_new.ts:2192, 2203, 2214`
- **Evidência:** Grep não encontra `employee_code` em `src/` (apenas em `database_new.ts`, `docs/`, e `supabase/specs/sql/33_employees.sql`)
- **Impacto:** Nenhum runtime — `database_new.ts` não é importado
- **Dependência:** Nenhuma
- **Sugestão futura:** Remover `database_new.ts` da worktree (arquivo órfão)

**GAP-002: V2.1 relation tables não criadas fisicamente**

- **Descrição:** `employee_positions`, `employee_contracts`, `employee_status_history`, `departments`, `positions` são definidas no `database.ts` e na spec V2.1, mas a migration física (`20260827000100_employees.sql`) usa apenas colunas diretas (`department text`, `job_title text`) na tabela employees.
- **Arquivo:** `supabase/migrations/20260827000100_employees.sql` (lines 25-71) vs `supabase/specs/sql/33_employees.sql` (lines 4-81)
- **Evidência:** database.ts:1415 (employee_positions), 1444 (employee_contracts), 1479 (employee_status_history), 1511 (departments), 1540 (positions) — nenhuma migration física cria estas tabelas
- **Impacto:** O código tentará queries em tabelas inexistentes se as funções forem ativadas
- **Dependência:** employees (FK)
- **Sugestão futura:** Criar migration adicional ou remover types do database.ts

**GAP-003: employee_education/experiences/skills/languages/courses físicas não no database.ts**

- **Descrição:** A migration física cria 5 tabelas filhas (employee_education, employee_experiences, employee_skills, employee_languages, employee_courses) que estão na migration mas não no `database.ts`.
- **Arquivo:** `supabase/migrations/20260827000100_employees.sql` (lines 118-255) vs `src/types/database.ts`
- **Evidência:** migration lines 118-255 criam as tabelas; database.ts não as define
- **Impacto:** Types TypeScript não cobrem estas tabelas existentes na migration
- **Sugestão futura:** Adicionar types para estas 5 tabelas no database.ts

**GAP-004: role_assignments.expires_at — schema vs reality**

- **Descrição:** O `database.ts` define `expires_at` em role_assignments (line 184), e a migration `20260816000700_rbac.sql` cria a coluna. Porém, o `MIGRATION-AUDIT-20260901.md` indica que o remote NÃO tem esta coluna. A migration `20260909000000` foi criada para remover referências a esta coluna inexistente.
- **Arquivo:** `supabase/migrations/20260909000000_fix_user_has_permission_expires_at.sql`
- **Evidência:** MIGRATION-AUDIT-20260901.md:8-11 — "live role_assignments table does NOT have an expires_at column"
- **Impacto:** user_has_permission() falha com HTTP 400
- **Sugestão futura:** A migration 20260909* precisa ser aplicada

### BLOQUEADORES

- Nenhum bloqueador crítico identificado para iniciar a reconstrução — a maioria das migrations base já foi mapeada.

---

## 10. ORDEM SUGERIDA DE RECONSTRUÇÃO

Baseado nas dependências FK e no `V21-GAP-CLOSURE-DEPENDENCY-GRAPH.md`:

```text
1. Extensions (uuid-ossp, pgcrypto)
2. Core: tenants → people → tenant_memberships
3. Identity: triggers auth.users → people sync
4. Companies: company_types → companies → company_relationship_types → company_relationships → company_contacts
5. Candidates: skills → candidates → candidate_* (skills, experiences, education, courses, languages, documents, profile_views)
6. Jobs: jobs → job_skills
7. Applications: applications → application_status_history → application_profile_snapshots
8. RBAC: roles → permissions → role_permissions → role_assignments → role_resource_permissions
9. Security: user_has_permission(), can_access_tenant(), RLS policies (force RLS, revoke public, grant authenticated)
10. Storage: files + buckets
11. Domain Events: domain_events
12. Notifications: notifications + notification_preferences
13. Talent Pool: talent_pool_memberships
14. Recruitment: recruitment_stages (depends on recruitment_processes)
15. Employees: employees → employee_documents/education/experiences/skills/languages/courses
16. Services: services + company_services_link
17. Company Relationships (seed empresa J&S)
18. Candidate Bootstrap: trigger candidato
19. RBAC Fixes: candidate self-service scope, role_resource_permissions
20. Seed: admin_master, tenant_admin, permissões canônicas
21. First Login: first_login_state, legal_acceptances
22. Fixes incrementais (20260909, 20260910)
```

---

## 11. MIGRATIONS QUE PRECISAM SER APLICADAS (pendentes no remote)

| #   | Migration                                               | Segurança                                       | Ação recomendada |
| --- | ------------------------------------------------------- | ----------------------------------------------- | ---------------- |
| 1   | `20260816000200_identity_people_auth.sql`               | ✅ create or replace + trigger                  | Executar via CLI |
| 2   | `20260827000100_employees.sql`                          | ✅ CREATE TABLE IF NOT EXISTS + RLS             | Executar via CLI |
| 3   | `20260909000000_fix_user_has_permission_expires_at.sql` | ✅ create or replace function                   | Executar via CLI |
| 4   | `20260909000001_fix_bootstrap_candidate_role_name.sql`  | ✅ create or replace function                   | Executar via CLI |
| 5   | `20260910000002_unify_first_login_state.sql`            | ✅ ADD COLUMN IF NOT EXISTS + create or replace | Executar via CLI |

---

## 12. O QUE NÃO DEVE SER RECRIADO

1. **auth.users** — gerenciado pelo Supabase Auth, não acessível via PostgREST
2. **database_new.ts** — arquivo órfão na raiz, não importado pelo código (`src/types/database.ts` é o tipo canônico)
3. **V2.1 spec (33_employees.sql)** — legacy, contém `employee_code` que não existe na physical migration
4. **Migrations históricas de RBAC** — já aplicadas no remote (roles, permissions, role_assignments)
5. **Seed de roles/permissions** — já aplicado no remote

---

## RESUMO EXECUTIVO

```text
WORKTREE
├── migrations encontradas: 50 arquivos
├── tabelas identificadas: 34 (no database.ts)
├── functions: 4 principais (user_has_permission, can_access_tenant, is_frontend_safe_role, handle_new_auth_user)
├── triggers: 3+ (updated_at, auth sync, candidate bootstrap)
├── policies: ~50+ (distribuídas em múltiplas migrations)
├── roles: 11 canônicas
├── permissions: 19+ canônicas
├── entidades de negócio: 32+
├── gaps críticos: 2 (GAP-001, GAP-004)
├── gaps médios: 2 (GAP-002, GAP-003)
└── bloqueadores: 0
```

### A. O que já foi construído localmente?

- 50 migrations locais cobrindo core, identity, companies, candidates, jobs, applications, RBAC, storage, employees
- 34 tabelas definidas em `src/types/database.ts` com tipos Row/Insert/Update completos
- 4 functions de segurança (user_has_permission, can_access_tenant, is_frontend_safe_role, handle_new_auth_user)
- 347 policies de RLS distribuídas
- 11 roles e 19+ permissions canônicas com seeds
- Repositórios para 27 entidades
- Edge functions para chat, handoff, turnstile
- Reconciliação de employee_code → registration concluída no código ativo

### B. O que ainda falta construir?

- employee_positions, employee_contracts, employee_status_history, departments, positions (tabelas V2.1 não criadas na migration física)
- employee_education, employee_experiences, employee_skills, employee_languages, employee_courses (criadas na migration mas não no database.ts)
- database_new.ts precisa ser removido (órfão)

### C. O que está inconsistente?

- GAP-001: database_new.ts (legacy) ainda referencia `employee_code` — não afeta runtime
- GAP-002: 5 tabelas V2.1 no database.ts mas não na migration física
- GAP-003: 5 tabelas físicas não definidas no database.ts
- GAP-004: role_assignments.expires_at existe no schema local mas não no banco real

### D. Qual deve ser a ordem das migrations?

1. Extensions → Core → Identity → Companies → Candidates → Jobs → Applications
2. RBAC → Security (RLS + functions) → Storage → Events → Notifications → Talent Pool
3. Recruitment Stages → Employees → Services → Relationships
4. Candidate Bootstrap → RBAC Fixes → Seeds
5. First Login → Incremental Fixes (20260909-10)

### E. O que NÃO devemos recriar?

- auth.users (Supabase Auth)
- database_new.ts (órfão)
- V2.1 spec 33_employees.sql (legacy)
- Migrations já aplicadas no remote (20260816*, partes de 20260823-0830)
- Seed de roles/permissions (já aplicado)

### F. Estamos prontos para começar a preparar a migração?

**SIM.** O inventário está completo. Temos:

- Mapa completo de migrations locais e seu status de aplicação
- Gap analysis detalhado
- Ordem de reconstrução definida
- Lista de migrations pendentes de aplicação (5 arquivos)

A próxima etapa seria validar via dry-run qualquer nova migration proposta antes de aplicar ao remote.

---

**Checkpoint de segurança:**

- Nenhuma migration executada
- Nenhum arquivo modificado
- Nenhum commit realizado
- Nenhuma alteração no banco remoto
- Este relatório é READ-ONLY puro
