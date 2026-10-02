# Database Master Map — J&S Empregos LTDA

> **Propósito**: Único contrato arquitetural entre Supabase (fonte de verdade) e o frontend.
> **Cada tabela** é cruzada com: Domínio → Módulo → CRUD → Repository → Frontend → RBAC.
> **Classificação**: KEEP | REUSE | CONNECT | REFACTOR | MOVE | MERGE | DEPRECATE | MISSING | IGNORED
>
> **Status do banco**: 2026-09-30  
> **Supabase project**: `okxqfyoqbhcmflpurfrw`  
> **Método**: somente leitura via `supabase db query`  
> **⚠️ Nenhuma migration executada. Nenhum dado alterado. Nenhum commit realizado.**

---

## 0. Database Macro Summary

| Métrica                                        | Valor                |
| ---------------------------------------------- | -------------------- |
| Tabelas (BASE TABLE, public)                   | **221**              |
| Views                                          | **5**                |
| Funções (public, excl. realtime/auth internas) | **233**              |
| Roles (tabela `roles`)                         | **53**               |
| PostgreSQL roles (pg_roles)                    | 12 (padrão Supabase) |
| Permissions (tabela `permissions`)             | **230**              |
| Role Permissions (tabela `role_permissions`)   | **739**              |
| Índices (total)                                | **713**              |
| FKs sem índice                                 | **266**              |
| Tabelas com RLS                                | **221** (100%)       |
| Tabelas com policies                           | **221** (100%)       |

---

## 1. Architecture Spine

```text
AUTH (auth.users)
    ↓
IDENTITY (people)
    ↓
TENANT (tenants)
    ↓
TENANT_MEMBERSHIP (tenant_memberships)
    ↓
ROLE (roles)
    ↓
ROLE_ASSIGNMENT (role_assignments)
    ↓
PERMISSION (permissions)
    ↓
ROLE_PERMISSION (role_permissions)
    ↓
MODULE (PORTAL_MODULES no ModuleRegistry.ts)
    ↓
CRU D (Repository → Service → Hook → Page)
    ↓
DASHBOARD (Gestão / Analítica / Operacional)
    ↓
ROUTE (App.tsx — única fonte de routing)
```

**RBAC 4-layer security stack** (nunca confiar em frontend só):

```
Layer 1: Auth       — Supabase Auth (auth.users)
Layer 2: Context    — AccountContext, AuthContext, UserIdentity
Layer 3: RBAC       — roles → role_assignments → role_permissions → permissions
Layer 4: RLS         — row-level security em cada tabela + policies
```

---

## 2. The 10 Domains

| #   | Domain                   | Scope  | Tables                                                                                                                                                                                                | Description                                 |
| --- | ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | **Core/Identity**        | global | people, tenants, tenant_memberships, tenant_settings, first_login_state, legal_acceptances                                                                                                            | Identidade canônica, tenancy, first-login   |
| 2   | **RBAC**                 | global | roles, permissions, role_permissions, role_assignments, audit_logs, security_events                                                                                                                   | Papéis, permissões, logs de segurança       |
| 3   | **Recruitment**          | tenant | jobs, candidates, candidate__, applications, recruitment__, interviews, interview__, job_matches, job_skills, talent_pool__, skills, stage_templates                                                  | Vagas, candidatos, processos seletivos      |
| 4   | **CRM/Commercial**       | tenant | companies, company__, leads, interactions, quotes, quote_items, contracts, contract__, customers, company_services, company_social_links, company_locations                                           | Empresas, clientes, parceiros, fornecedores |
| 5   | **RH (Human Resources)** | tenant | employees, employee_*, departments, positions, candidate_processes                                                                                                                                    | Funcionários, admissões, afastamentos       |
| 6   | **Finance**              | tenant | financial_*, accounts_payable, accounts_receivable, invoices, invoice_items, payments, receipts, cost_centers, bank_reconciliations, financial_accounts, financial_categories, financial_installments | Contas a pagar/receber, fluxo de caixa      |
| 7   | **Fiscal**               | tenant | fiscal_*, tax_rates, tax_calculations, fiscal_documents                                                                                                                                               | Notas fiscais, tributos, conformidade       |
| 8   | **Accounting**           | tenant | accounting_chart_of_accounts, accounting_entries, accounting_trial_balance                                                                                                                            | Plano de contas, lançamentos                |
| 9   | **Services/Operations**  | tenant | services, service__, work_orders, work_order__, material_issues, material_returns, third_party_custody                                                                                                | Ordens de serviço, almoxarifado             |
| 10  | **Supply/Stock**         | tenant | products, product_categories, stock__, warehouses, warehouse_locations, epi__                                                                                                                         | Produtos, estoque, EPI                      |
| 11  | **Support**              | tenant | support_tickets, support_ticket__, faqs, feedback, customer__                                                                                                                                         | Chamados, FAQ, feedback                     |
| 12  | **Communications**       | tenant | notifications, notification__, chat__, email__, integration__                                                                                                                                         | Notificações, chat, e-mail, integrações     |
| 13  | **AI/Automation**        | tenant | ai__, automation__, tasks, task_*                                                                                                                                                                     | Assistente IA, automações, tarefas          |
| 14  | **Reports/Dashboard**    | tenant | report__, dashboard__, page_templates, media_assets, candidate_portal_modules                                                                                                                         | Relatórios, dashboards, templates           |

> Note: Domains 12-14 are "platform" domains, not core business.

---

## 3. RBAC Matrix (live database)

### 3.1 Roles by Level/Sector

| Level | Role                                                                                                                                                                                                | Scope  | Sector                                                                                              | Status                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **0** | `admin_master`                                                                                                                                                                                      | global | system                                                                                              | **KEEP** — super-admin                           |
| **7** | `candidato`                                                                                                                                                                                         | tenant | special                                                                                             | **KEEP** — candidate self-service                |
| **7** | `viewer`                                                                                                                                                                                            | tenant | special                                                                                             | **KEEP** — read-only                             |
| **5** | `*_assistant` (12 roles)                                                                                                                                                                            | tenant | accounting, finance, commercial, commerce, facilities, it, operations, rh, security, stock, support | **KEEP** — assistants                            |
| **4** | `accountant`, `commercial`, `finance`, `it_admin` (deprecated), `it_operator`, `lawyer`, `operations_operator`, `operator` (deprecated), `recruiter`, `rh`, `support` (deprecated), `support_agent` | tenant | various                                                                                             | **DEPRECATE**: `it_admin`, `operator`, `support` |
| **3** | `*_supervisor` (12 roles)                                                                                                                                                                           | tenant | various                                                                                             | **KEEP**                                         |
| **2** | `*_manager` (12 roles)                                                                                                                                                                              | tenant | various                                                                                             | **KEEP**                                         |
| **1** | `tenant_admin`                                                                                                                                                                                      | tenant | tenant                                                                                              | **KEEP** — tenant admin                          |

**Total**: 53 roles (1 global + 2 special + 50 tenant roles)

### 3.2 Permission Counts

| Table            | Row count |
| ---------------- | --------- |
| permissions      | 230       |
| role_permissions | 739       |

### 3.3 Key Functions (233 total in public schema)

| Function                               | Purpose                              | Status   |
| -------------------------------------- | ------------------------------------ | -------- |
| `current_person_id()`                  | Get current authenticated person     | **KEEP** |
| `is_admin_master()`                    | Check global admin                   | **KEEP** |
| `is_tenant_member()`                   | Check tenant membership              | **KEEP** |
| `user_has_permission()`                | Check permission by resource.action  | **KEEP** |
| `user_permissions()`                   | Get all permissions for current user | **KEEP** |
| `user_tenant_ids()`                    | Get all tenant IDs for user          | **KEEP** |
| `bootstrap_candidate_from_auth_user()` | Auto-create candidate from auth user | **KEEP** |
| `bootstrap_candidate_identity()`       | Create candidate identity            | **KEEP** |
| `bootstrap_company_from_auth_user()`   | Auto-create company from auth user   | **KEEP** |
| `can_manage_role_assignment()`         | RBAC check for role management       | **KEEP** |
| `set_updated_at()`                     | Trigger helper                       | **KEEP** |
| `tg_set_updated_at()`                  | Auto-updated_at trigger              | **KEEP** |
| `domain_event_emit()`                  | Emit domain event                    | **KEEP** |
| `event_outbox_enqueue()`               | Queue domain event                   | **KEEP** |
| `financial_reversal()`                 | Reversão financeira                  | **KEEP** |
| `fiscal_emit_invoice()`                | Emitir nota fiscal                   | **KEEP** |
| `fiscal_cancel_invoice()`              | Cancelar nota fiscal                 | **KEEP** |
| `match_candidates_to_demand()`         | Matching algorítmico                 | **KEEP** |
| `stock_movement_insert()`              | Registrar movimento de estoque       | **KEEP** |
| `purchase_receipt_confirm()`           | Confirmar recebimento                | **KEEP** |
| `pos_daily_closure_validate()`         | Validar fechamento do dia            | **KEEP** |

---

## 4. Database × Module × Frontend Matrix

Each module below maps to entries in `ModuleRegistry.ts::PORTAL_MODULES`. Status classification follows the table below.

### Classification Legend

| Status        | Meaning                                                             |
| ------------- | ------------------------------------------------------------------- |
| **KEEP**      | Already correct; do not touch                                       |
| **REUSE**     | Exists and will be reused                                           |
| **CONNECT**   | Exists in database but not yet connected to frontend                |
| **REFACTOR**  | Works but needs controlled reorganization                           |
| **MOVE**      | Needs to change physical location                                   |
| **MERGE**     | Duplicate; needs consolidation                                      |
| **DEPRECATE** | No longer needed                                                    |
| **MISSING**   | Frontend needs capability that database provides but frontend lacks |
| **IGNORED**   | Public site / not in scope                                          |

---

### 4.1 Core / Identity Module

| Table                | Colunas (PK/FK)                                                                                                                               | RLS | Policies | Repository            | Route                                         | Status                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------- | --------------------- | --------------------------------------------- | ------------------------------ |
| `people`             | id (PK), auth_user_id (FK→auth.users), full_name, email, phone, status, created_at, updated_at                                                | ✅  | 1        | `peopleRepository.ts` | `/dashboard/usuarios`                         | **KEEP**                       |
| `tenants`            | id (PK), name, slug, status, created_at, updated_at                                                                                           | ✅  | 1        | —                     | `/dashboard/tenants`, `/dashboard/onboarding` | **CONNECT** (needs repository) |
| `tenant_memberships` | id (PK), person_id (FK), tenant_id (FK), status, joined_at, created_at, updated_at                                                            | ✅  | 3        | —                     | `/dashboard/usuarios`                         | **CONNECT**                    |
| `tenant_settings`    | id (PK), tenant_id (FK), key, value, created_at, updated_at                                                                                   | ✅  | 3        | —                     | `/dashboard/configuracoes`                    | **CONNECT**                    |
| `first_login_state`  | person_id (PK, FK), must_change_password, terms_version, privacy_version, lgpd_consent_version, first_login_completed, created_at, updated_at | ✅  | 3        | —                     | login flow                                    | **KEEP**                       |
| `legal_acceptances`  | id (PK), person_id (FK), tenant_id (FK), document_type, document_version, accepted_at, metadata                                               | ✅  | 2        | —                     | `/login`, `/cadastro`                         | **KEEP**                       |

### 4.2 RBAC Module

| Table              | Colunas (PK/FK)                                                                                                                                         | RLS | Policies | Repository                     | Route                          | Status      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------- | ------------------------------ | ------------------------------ | ----------- |
| `roles`            | id (PK), name, description, scope, level, sector, status, slug, replacement_role_id, created_at, updated_at                                             | ✅  | 2        | `rolesRepository.ts`           | `/dashboard/roles-permissoes`  | **KEEP**    |
| `permissions`      | id (PK), resource, action, code, description, created_at, updated_at                                                                                    | ✅  | 1        | `permissionsRepository.ts`     | `/dashboard/roles-permissoes`  | **KEEP**    |
| `role_permissions` | id (PK), role_id (FK→roles), permission_id (FK→permissions), created_at                                                                                 | ✅  | 1        | —                              | `/dashboard/roles-permissoes`  | **KEEP**    |
| `role_assignments` | id (PK), person_id (FK→people), role_id (FK→roles), tenant_id (FK→tenants), assigned_at, created_at, updated_at                                         | ✅  | 3        | `roleAssignmentsRepository.ts` | `/dashboard/usuarios`          | **KEEP**    |
| `audit_logs`       | id (PK), actor_person_id (FK), tenant_id (FK), scope, action, entity_type, entity_id, before_data, after_data, correlation_id, causation_id, created_at | ✅  | 1        | —                              | `/dashboard/auditoria`         | **CONNECT** |
| `security_events`  | id (PK), tenant_id (FK), event_type, severity, actor_person_id (FK), ip_address, metadata, created_at                                                   | ✅  | 2        | —                              | `/dashboard/auditoria/eventos` | **CONNECT** |

### 4.3 Recruitment Module

| Table                           | Colunas (PK/FK)                                                                                                                                                          | RLS | Policies | Repository                          | Route                                        | Status      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | -------- | ----------------------------------- | -------------------------------------------- | ----------- |
| `jobs`                          | id (PK), tenant_id, company_id, title, description, status, employment_type, location, ..., slug, published_at, closed_at, created_at, updated_at                        | ✅  | 4        | `jobsRepository.ts`                 | `/dashboard/vagas`, `/vagas`, `/vagas/:slug` | **KEEP**    |
| `job_skills`                    | id (PK), tenant_id, job_id (FK→jobs), skill_id (FK), required, level, created_at, updated_at                                                                             | ✅  | 4        | —                                   | `/dashboard/vagas/:id/habilidades`           | **CONNECT** |
| `candidates`                    | id (PK), person_id (FK→people), tenant_id, status, headline, salary_expectation_min/max, salary_type, availability, source, metadata, created_by, created_at, updated_at | ✅  | 3        | `candidatesRepository.ts`           | `/dashboard/candidatos`, `/candidato/*`      | **KEEP**    |
| `candidate_skills`              | id (PK), tenant_id, candidate_id (FK→candidates), skill_id (FK→skills), name, level, years_used, created_at, updated_at                                                  | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/habilidades`      | **CONNECT** |
| `candidate_experiences`         | id (PK), tenant_id, candidate_id, company_name, role, start_date, end_date, description, created_at, updated_at                                                          | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/experiencias`     | **CONNECT** |
| `candidate_education`           | id (PK), tenant_id, candidate_id, institution, course, degree, start_date, end_date, description, created_at, updated_at                                                 | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/formacao`         | **CONNECT** |
| `candidate_courses`             | id (PK), tenant_id, candidate_id, name, institution, completion_date, expiration_date, description, created_at, updated_at                                               | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/cursos`           | **CONNECT** |
| `candidate_languages`           | id (PK), tenant_id, candidate_id, language, proficiency, created_at, updated_at                                                                                          | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/idiomas`          | **CONNECT** |
| `candidate_documents`           | id (PK), tenant_id, candidate_id, document_type, file_name, storage_path, mime_type, size, uploaded_at, actor_person_id, created_at, updated_at                          | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/documentos`       | **CONNECT** |
| `candidate_profile_views`       | id (PK), tenant_id, candidate_id, viewer_person_id, viewed_at, metadata                                                                                                  | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/visualizacoes`    | **CONNECT** |
| `candidate_preferences`         | id (PK), tenant_id, candidate_id, preference_key, preference_value, created_at, updated_at                                                                               | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/preferencias`     | **CONNECT** |
| `candidate_portal_modules`      | id (PK), tenant_id, name, is_visible, sort_order, created_at, updated_at                                                                                                 | ✅  | 2        | —                                   | `/candidato/*` (portal visibility)           | **KEEP**    |
| `candidate_processes`           | id (PK), tenant_id, candidate_id, process_id, started_at, finished_at, metadata                                                                                          | ✅  | 3        | —                                   | `/dashboard/candidatos/:id/processos`        | **CONNECT** |
| `applications`                  | id (PK), candidate_id (FK), job_id (FK), status, metadata, created_by, applied_at, created_at, updated_at, tenant_id                                                     | ✅  | 3        | `applicationsRepository.ts`         | `/dashboard/candidaturas`                    | **KEEP**    |
| `application_status_history`    | id (PK), application_id (FK), status, changed_at, actor_person_id (FK), metadata                                                                                         | ✅  | 2        | —                                   | `/dashboard/candidaturas/:id`                | **CONNECT** |
| `application_profile_snapshots` | id (PK), application_id (FK), candidate_id (FK), snapshot_data, created_at                                                                                               | ✅  | 2        | —                                   | `/dashboard/candidaturas/:id`                | **CONNECT** |
| `talent_pool_memberships`       | id (PK), tenant_id, candidate_id (FK), pool_id, status, notes, created_at, updated_at                                                                                    | ✅  | 3        | —                                   | `/dashboard/banco-de-talentos`               | **CONNECT** |
| `job_matches`                   | id (PK), tenant_id, candidate_id (FK), demand_id (FK), job_id (FK), score, status, created_at, updated_at, match_details, notified_at, applied_at                        | ✅  | 3        | `jobMatchesRepository.ts`           | `/dashboard/matches`                         | **KEEP**    |
| `recruitment_processes`         | id (PK), tenant_id, title, description, status, start_date, end_date, created_at, updated_at                                                                             | ✅  | 3        | `recruitmentProcessesRepository.ts` | `/dashboard/processos-seletivos`             | **CONNECT** |
| `recruitment_demands`           | id (PK), tenant_id, title, description, status, priority, deadline, created_by, created_at, updated_at                                                                   | ✅  | 3        | `recruitmentDemandsRepository.ts`   | `/dashboard/processos-seletivos`             | **CONNECT** |
| `recruitment_stages`            | id (PK), tenant_id, name, description, sort_order, is_active, created_at, updated_at                                                                                     | ✅  | 3        | `recruitmentStagesRepository.ts`    | `/dashboard/etapas`                          | **CONNECT** |
| `interviews`                    | id (PK), tenant_id, application_id (FK), scheduled_at, duration, status, room, notes, created_at, updated_at                                                             | ✅  | 3        | —                                   | `/dashboard/candidaturas/:id/entrevistas`    | **CONNECT** |
| `interview_participants`        | id (PK), tenant_id, interview_id (FK), person_id (FK), role, created_at, updated_at                                                                                      | ✅  | 3        | —                                   | `/dashboard/candidaturas/:id/entrevistas`    | **CONNECT** |
| `interview_feedback`            | id (PK), tenant_id, interview_id (FK), person_id (FK), rating, comments, strengths, weaknesses, recommendation, created_at, updated_at                                   | ✅  | 3        | —                                   | `/dashboard/candidaturas/:id/entrevistas`    | **CONNECT** |
| `interview_followups`           | id (PK), tenant_id, interview_id (FK), person_id (FK), message, due_at, responded_at, status, created_at, updated_at                                                     | ✅  | 2        | —                                   | `/dashboard/candidaturas/:id/entrevistas`    | **CONNECT** |
| `skills`                        | id (PK), tenant_id, name, category, created_at, updated_at                                                                                                               | ✅  | 3        | —                                   | `/dashboard/vagas/:id/habilidades`           | **CONNECT** |
| `stage_templates`               | id (PK), tenant_id, name, stages_json, created_at, updated_at                                                                                                            | ✅  | 3        | —                                   | `/dashboard/etapas`                          | **CONNECT** |
| `candidate_job_alerts`          | id (PK), tenant_id, person_id (FK), name, keywords, city, state, contract_type, work_mode, salary_min/max, frequency, is_active, last_sent_at, created_at, updated_at    | ✅  | 4        | —                                   | `/candidato/alertas`                         | **CONNECT** |

### 4.4 CRM / Commercial Module

| Table                        | Colunas (PK/FK)                                                                                                                       | RLS | Policies | Repository               | Route                                                                                           | Status      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --- | -------- | ------------------------ | ----------------------------------------------------------------------------------------------- | ----------- |
| `companies`                  | id (PK), name, slug, type, status, created_at, updated_at, tenant_id, metadata                                                        | ✅  | 4        | `companiesRepository.ts` | `/dashboard/empresas`, `/dashboard/clientes`, `/dashboard/parceiros`, `/dashboard/fornecedores` | **KEEP**    |
| `company_relationship_types` | id (PK), name, description, created_at                                                                                                | ✅  | 1        | —                        | internal (used by company_relationships)                                                        | **KEEP**    |
| `company_relationships`      | id (PK), tenant_id, company_id (FK), related_company_id (FK), relationship_type, status, started_at, ended_at, created_at, updated_at | ✅  | 3        | —                        | `/dashboard/relacionamentos`                                                                    | **CONNECT** |
| `company_contacts`           | id (PK), tenant_id, company_id (FK), person_id (FK), role_name, email, phone, created_at, updated_at                                  | ✅  | 3        | —                        | `/dashboard/empresas/:id/contatos`                                                              | **CONNECT** |
| `company_locations`          | id (PK), tenant_id, company_id (FK), name, address, city, state, zip_code, created_at, updated_at                                     | ✅  | 4        | —                        | `/dashboard/empresas/:id`                                                                       | **CONNECT** |
| `company_social_links`       | id (PK), company_id (FK), platform, url, created_at, updated_at                                                                       | ✅  | 4        | —                        | `/dashboard/empresas/:id`                                                                       | **CONNECT** |
| `company_services`           | id (PK), tenant_id, company_id (FK), service_id (FK), name, description, status, created_at, updated_at, metadata                     | ✅  | 3        | —                        | `/dashboard/empresas/:id/servicos`                                                              | **CONNECT** |
| `leads`                      | id (PK), tenant_id, company_id (FK), name, email, phone, source, status, created_at, updated_at                                       | ✅  | 3        | `leadsRepository.ts`     | `/dashboard/clientes/leads`                                                                     | **KEEP**    |
| `interactions`               | id (PK), tenant_id, company_id (FK), person_id (FK), type, subject, notes, interaction_at, created_at, updated_at                     | ✅  | 3        | —                        | `/dashboard/clientes`                                                                           | **CONNECT** |
| `quotes`                     | id (PK), tenant_id, company_id (FK), title, status, total_amount, issued_at, valid_until, created_at, updated_at                      | ✅  | 3        | `quotesRepository.ts`    | `/dashboard/faturamento/orcamentos`                                                             | **KEEP**    |
| `quote_items`                | id (PK), quote_id (FK), description, quantity, unit_price, total_price, created_at                                                    | ✅  | 3        | —                        | `/dashboard/faturamento/orcamentos/:id`                                                         | **CONNECT** |
| `contracts`                  | id (PK), tenant_id, company_id (FK), title, status, start_date, end_date, value, created_at, updated_at                               | ✅  | 3        | `contractsRepository.ts` | `/dashboard/contratos`, `/dashboard/gestao/contratos`                                           | **KEEP**    |
| `contract_status_history`    | id (PK), contract_id (FK), status, changed_at, actor_person_id (FK), metadata                                                         | ✅  | 2        | —                        | `/dashboard/contratos/:id`                                                                      | **CONNECT** |
| `customers`                  | id (PK), tenant_id, company_id (FK), customer_status, created_at, updated_at                                                          | ✅  | 3        | —                        | `/dashboard/clientes/ativos`                                                                    | **CONNECT** |

### 4.5 RH Module

| Table                     | Colunas (PK/FK)                                                                                          | RLS | Policies | Repository               | Route                                    | Status      |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | --- | -------- | ------------------------ | ---------------------------------------- | ----------- |
| `employees`               | id (PK), tenant_id, employee_code, hire_date, termination_date, salary, status, created_at, updated_at   | ✅  | 3        | `employeesRepository.ts` | `/dashboard/funcionarios`                | **KEEP**    |
| `employee_contracts`      | id (PK), employee_id (FK), contract_type, start_date, end_date, salary, file_url, created_at, updated_at | ✅  | 3        | —                        | `/dashboard/funcionarios/:id/contratos`  | **CONNECT** |
| `employee_documents`      | id (PK), employee_id (FK), document_type, file_url, issue_date, expiry_date, created_at, updated_at      | ✅  | 3        | —                        | `/dashboard/funcionarios/:id/documentos` | **CONNECT** |
| `employee_positions`      | id (PK), employee_id (FK), position_id (FK), start_date, end_date, created_at, updated_at                | ✅  | 3        | —                        | `/dashboard/funcionarios/:id`            | **CONNECT** |
| `employee_status_history` | id (PK), employee_id (FK), status, start_date, end_date, notes, created_at, updated_at                   | ✅  | 3        | —                        | `/dashboard/funcionarios/:id`            | **CONNECT** |
| `departments`             | id (PK), tenant_id, name, description, created_at, updated_at                                            | ✅  | 3        | —                        | `/dashboard/gestao/equipes`              | **CONNECT** |
| `positions`               | id (PK), tenant_id, name, description, department_id (FK), created_at, updated_at                        | ✅  | 3        | —                        | `/dashboard/gestao/equipes`              | **CONNECT** |

### 4.6 Finance Module

| Table                                 | Colunas (PK/FK)                                                                                                            | RLS | Policies | Repository                           | Route                                                               | Status      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --- | -------- | ------------------------------------ | ------------------------------------------------------------------- | ----------- |
| `financial_transactions`              | id (PK), tenant_id, account_id (FK), category_id (FK), type, amount, description, transaction_date, created_at, updated_at | ✅  | 3        | `financialTransactionsRepository.ts` | `/dashboard/financeiro`                                             | **KEEP**    |
| `financial_accounts`                  | id (PK), tenant_id, name, type, balance, currency, created_at, updated_at                                                  | ✅  | 3        | —                                    | `/dashboard/financeiro/bancos`                                      | **CONNECT** |
| `financial_categories`                | id (PK), tenant_id, name, type, parent_id (FK), created_at, updated_at                                                     | ✅  | 3        | —                                    | `/dashboard/financeiro`                                             | **CONNECT** |
| `financial_installments`              | id (PK), tenant_id, transaction_id (FK), due_date, amount, status, created_at, updated_at                                  | ✅  | 2        | —                                    | `/dashboard/financeiro/contas-pagar`                                | **CONNECT** |
| `financial_installment_payments`      | id (PK), installment_id (FK), amount, payment_date, method, created_at                                                     | ✅  | 2        | —                                    | `/dashboard/financeiro/contas-receber`                              | **CONNECT** |
| `financial_installment_cancellations` | id (PK), installment_id (FK), reason, amount, cancelled_at, created_at                                                     | ✅  | 2        | —                                    | `/dashboard/financeiro`                                             | **CONNECT** |
| `accounts_payable`                    | id (PK), tenant_id, description, due_date, amount, status, category_id, created_at, updated_at                             | ✅  | 3        | `accountsPayableRepository.ts`       | `/dashboard/financeiro/contas-pagar`                                | **KEEP**    |
| `accounts_receivable`                 | id (PK), tenant_id, description, due_date, amount, status, category_id, created_at, updated_at                             | ✅  | 3        | `accountsReceivableRepository.ts`    | `/dashboard/financeiro/contas-receber`                              | **KEEP**    |
| `invoices`                            | id (PK), tenant_id, company_id (FK), invoice_number, issue_date, due_date, total_amount, status, created_at, updated_at    | ✅  | 3        | `invoicesRepository.ts`              | `/dashboard/faturamento/faturas`, `/dashboard/fiscal/notas-fiscais` | **KEEP**    |
| `invoice_items`                       | id (PK), invoice_id (FK), description, quantity, unit_price, total_price, created_at                                       | ✅  | 3        | —                                    | `/dashboard/faturamento/faturas/:id`                                | **CONNECT** |
| `payments`                            | id (PK), tenant_id, invoice_id (FK), amount, payment_date, method, status, created_at, updated_at                          | ✅  | 3        | `paymentsRepository.ts`              | `/dashboard/faturamento/vendas`                                     | **KEEP**    |
| `receipts`                            | id (PK), tenant_id, payment_id (FK), receipt_number, issued_at, file_url, created_at                                       | ✅  | 3        | —                                    | `/dashboard/financeiro`                                             | **CONNECT** |
| `cost_centers`                        | id (PK), tenant_id, code, name, description, budget, created_at, updated_at                                                | ✅  | 3        | —                                    | `/dashboard/financeiro/centro-custos`                               | **CONNECT** |
| `bank_reconciliations`                | id (PK), tenant_id, account_id (FK), period, status, reconciled_at, created_at, updated_at                                 | ✅  | 3        | —                                    | `/dashboard/financeiro/bancos`                                      | **CONNECT** |

### 4.7 Fiscal Module

| Table                            | Colunas (PK/FK)                                                                                              | RLS | Policies | Repository | Route                                 | Status      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ | --- | -------- | ---------- | ------------------------------------- | ----------- |
| `fiscal_configurations`          | id (PK), tenant_id, provider, api_key, environment, created_at, updated_at                                   | ✅  | 3        | —          | `/dashboard/fiscal/notas-fiscais`     | **CONNECT** |
| `fiscal_integrations`            | id (PK), tenant_id, provider, api_config, is_active, created_at, updated_at                                  | ✅  | 3        | —          | `/dashboard/fiscal/notas-fiscais`     | **CONNECT** |
| `fiscal_documents`               | id (PK), tenant_id, document_type, document_number, issue_date, total_amount, status, created_at, updated_at | ✅  | 3        | —          | `/dashboard/fiscal/notas-fiscais`     | **CONNECT** |
| `fiscal_document_items`          | id (PK), fiscal_document_id (FK), description, quantity, unit_price, total_price, created_at                 | ✅  | 3        | —          | `/dashboard/fiscal/notas-fiscais/:id` | **CONNECT** |
| `fiscal_document_events`         | id (PK), fiscal_document_id (FK), event_type, event_at, status, protocol, created_at                         | ✅  | 2        | —          | `/dashboard/fiscal/notas-fiscais/:id` | **CONNECT** |
| `fiscal_document_status_history` | id (PK), fiscal_document_id (FK), status, changed_at, actor_person_id (FK), metadata                         | ✅  | 2        | —          | `/dashboard/fiscal/notas-fiscais/:id` | **CONNECT** |
| `fiscal_api_requests`            | id (PK), fiscal_document_id (FK), method, endpoint, request_body, response_body, status_code, created_at     | ✅  | 3        | —          | internal                              | **CONNECT** |
| `fiscal_api_responses`           | id (PK), fiscal_document_id (FK), response_body, status_code, created_at                                     | ✅  | 2        | —          | internal                              | **CONNECT** |
| `tax_rates`                      | id (PK), tenant_id, tax_type, rate, effective_from, effective_to, created_at, updated_at                     | ✅  | 3        | —          | `/dashboard/fiscal/retencoes`         | **CONNECT** |
| `tax_calculations`               | id (PK), fiscal_document_id (FK), tax_type, rate, base_amount, tax_amount, created_at                        | ✅  | 3        | —          | `/dashboard/fiscal/notas-fiscais/:id` | **CONNECT** |

### 4.8 Accounting Module

| Table                          | Colunas (PK/FK)                                                                         | RLS | Policies | Repository | Route                                   | Status      |
| ------------------------------ | --------------------------------------------------------------------------------------- | --- | -------- | ---------- | --------------------------------------- | ----------- |
| `accounting_chart_of_accounts` | id (PK), tenant_id, code, name, type, created_at, updated_at                            | ✅  | 3        | —          | `/dashboard/contabilidade/plano-contas` | **CONNECT** |
| `accounting_entries`           | id (PK), tenant_id, account_id (FK), description, debit, credit, created_at, updated_at | ✅  | 3        | —          | `/dashboard/contabilidade/lancamentos`  | **CONNECT** |
| `accounting_trial_balance`     | id (PK), tenant_id, account_id (FK), period, debit_balance, credit_balance, created_at  | ✅  | 3        | —          | `/dashboard/contabilidade/balancetes`   | **CONNECT** |

### 4.9 Services / Operations Module

| Table                          | Colunas (PK/FK)                                                                                                                          | RLS | Policies | Repository                   | Route                                  | Status      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --- | -------- | ---------------------------- | -------------------------------------- | ----------- |
| `services`                     | id (PK), tenant_id, name, description, category, status, slug, short_description, card_image_url, hero_image_url, created_at, updated_at | ✅  | 4        | `servicesRepository.ts`      | `/dashboard/servicos`                  | **KEEP**    |
| `service_orders`               | id (PK), tenant_id, company_service_id (FK), status, scheduled_at, completed_at, quantity, value, notes, created_at, updated_at          | ✅  | 3        | `serviceOrdersRepository.ts` | `/dashboard/servicos/ordens`           | **KEEP**    |
| `service_order_items`          | id (PK), tenant_id, service_order_id (FK), description, quantity, unit_price, created_at, updated_at                                     | ✅  | 3        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `service_order_status_history` | id (PK), service_order_id (FK), status, changed_at, actor_person_id (FK), metadata                                                       | ✅  | 3        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `service_executions`           | id (PK), tenant_id, service_order_id (FK), executed_by (FK), started_at, finished_at, notes, created_at, updated_at                      | ✅  | 3        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `service_occurrences`          | id (PK), tenant_id, service_order_id (FK), description, occurred_at, created_at                                                          | ✅  | 4        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `service_acceptances`          | id (PK), tenant_id, service_order_id (FK), person_id (FK), accepted_at, notes, created_at                                                | ✅  | 3        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `service_attachments`          | id (PK), tenant_id, service_order_id (FK), file_url, mime_type, uploaded_at                                                              | ✅  | 3        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `service_sla`                  | id (PK), tenant_id, service_order_id (FK), sla_type, start_at, due_at, completed_at, created_at                                          | ✅  | 4        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `work_orders`                  | id (PK), tenant_id, service_order_id (FK), title, description, status, scheduled_start/end, created_at, updated_at                       | ✅  | 4        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `work_order_assignments`       | id (PK), tenant_id, work_order_id (FK), person_id (FK), assigned_at, created_at, updated_at                                              | ✅  | 4        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `work_order_attachments`       | id (PK), tenant_id, work_order_id (FK), file_url, uploaded_at, created_at                                                                | ✅  | 3        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `work_order_checklists`        | id (PK), tenant_id, work_order_id (FK), item_text, is_checked, created_at, updated_at                                                    | ✅  | 4        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `work_order_materials`         | id (PK), tenant_id, work_order_id (FK), product_id (FK), quantity, unit, created_at                                                      | ✅  | 4        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `work_order_occurrences`       | id (PK), tenant_id, work_order_id (FK), description, occurred_at, created_at                                                             | ✅  | 4        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `work_order_acceptances`       | id (PK), tenant_id, work_order_id (FK), person_id (FK), accepted_at, notes, created_at                                                   | ✅  | 3        | —                            | `/dashboard/servicos/ordens/:id`       | **CONNECT** |
| `material_issues`              | id (PK), tenant_id, product_id (FK), quantity, issued_at, issued_by (FK), notes, created_at                                              | ✅  | 4        | —                            | `/dashboard/almoxarifado/entradas`     | **CONNECT** |
| `material_issue_items`         | id (PK), material_issue_id (FK), product_id (FK), quantity, unit, created_at                                                             | ✅  | 4        | —                            | `/dashboard/almoxarifado/entradas/:id` | **CONNECT** |
| `material_returns`             | id (PK), tenant_id, product_id (FK), quantity, returned_at, returned_by (FK), notes, created_at                                          | ✅  | 4        | —                            | `/dashboard/almoxarifado/saidas`       | **CONNECT** |
| `material_return_items`        | id (PK), material_return_id (FK), product_id (FK), quantity, unit, created_at                                                            | ✅  | 4        | —                            | `/dashboard/almoxarifado/saidas/:id`   | **CONNECT** |
| `third_party_custody`          | id (PK), tenant_id, third_party_id (FK→companies), custody_date, notes, created_at, updated_at                                           | ✅  | 3        | —                            | `/dashboard/almoxarifado/custodia`     | **CONNECT** |
| `third_party_custody_items`    | id (PK), custody_id (FK), product_id (FK), quantity, unit, created_at                                                                    | ✅  | 2        | —                            | `/dashboard/almoxarifado/custodia/:id` | **CONNECT** |

### 4.10 Supply / Stock Module

| Table                   | Colunas (PK/FK)                                                                                         | RLS | Policies | Repository                    | Route                               | Status      |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | --- | -------- | ----------------------------- | ----------------------------------- | ----------- |
| `products`              | id (PK), tenant_id, name, category, unit, status, created_at, updated_at                                | ✅  | 3        | `productsRepository.ts`       | `/dashboard/estoque/produtos`       | **KEEP**    |
| `product_categories`    | id (PK), tenant_id, name, description, created_at, updated_at                                           | ✅  | 3        | —                             | `/dashboard/estoque/produtos`       | **CONNECT** |
| `stock_movements`       | id (PK), tenant_id, product_id (FK), type, quantity, location_from, location_to, created_at, updated_at | ✅  | 2        | `stockMovementsRepository.ts` | `/dashboard/estoque/movimentacoes`  | **KEEP**    |
| `stock_balances`        | id (PK), tenant_id, product_id (FK), warehouse_id (FK), quantity, created_at, updated_at                | ✅  | 1        | —                             | `/dashboard/estoque`                | **CONNECT** |
| `stock_entries`         | id (PK), tenant_id, product_id (FK), quantity, entry_date, source, created_at, updated_at               | ✅  | 2        | —                             | `/dashboard/almoxarifado/entradas`  | **CONNECT** |
| `stock_inventory`       | id (PK), tenant_id, warehouse_id (FK), counted_at, status, created_at, updated_at                       | ✅  | 3        | —                             | `/dashboard/estoque`                | **CONNECT** |
| `stock_inventory_items` | id (PK), inventory_id (FK), product_id (FK), quantity_system, quantity_counted, created_at              | ✅  | 3        | —                             | `/dashboard/estoque/inventario/:id` | **CONNECT** |
| `stock_lots`            | id (PK), tenant_id, product_id (FK), lot_number, quantity, expiry_date, created_at                      | ✅  | 3        | —                             | `/dashboard/estoque/produtos/:id`   | **CONNECT** |
| `warehouses`            | id (PK), tenant_id, name, address, created_at, updated_at                                               | ✅  | 3        | —                             | `/dashboard/estoque`                | **CONNECT** |
| `warehouse_locations`   | id (PK), warehouse_id (FK), name, description, created_at                                               | ✅  | 3        | —                             | `/dashboard/estoque`                | **CONNECT** |

### 4.11 Support Module

| Table                           | Colunas (PK/FK)                                                                                                                         | RLS | Policies | Repository                    | Route                                         | Status      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --- | -------- | ----------------------------- | --------------------------------------------- | ----------- |
| `support_tickets`               | id (PK), tenant_id, category_id (FK), title, description, status, priority, assignee_person_id (FK), sla_due_at, created_at, updated_at | ✅  | 3        | `supportTicketsRepository.ts` | `/dashboard/suporte/chamados`                 | **KEEP**    |
| `support_ticket_categories`     | id (PK), tenant_id, name, description, created_at, updated_at                                                                           | ✅  | 3        | —                             | `/dashboard/suporte/chamados`                 | **CONNECT** |
| `support_ticket_assignments`    | id (PK), tenant_id, ticket_id (FK), person_id (FK), assigned_at, created_at                                                             | ✅  | 3        | —                             | `/dashboard/suporte/chamados/:id`             | **CONNECT** |
| `support_ticket_messages`       | id (PK), tenant_id, ticket_id (FK), person_id (FK), content, created_at, updated_at                                                     | ✅  | 3        | —                             | `/dashboard/suporte/chamados/:id`             | **CONNECT** |
| `support_ticket_status_history` | id (PK), tenant_id, ticket_id (FK), status, changed_at, metadata                                                                        | ✅  | 2        | —                             | `/dashboard/suporte/chamados/:id`             | **CONNECT** |
| `faqs`                          | id (PK), tenant_id, category, question, answer, sort_order, is_active, created_at, updated_at                                           | ✅  | 4        | —                             | `/suporte` (public), `/dashboard/suporte/faq` | **CONNECT** |
| `feedback`                      | id (PK), tenant_id, entity_type, entity_id, person_id (FK), rating, comment, category, created_at, updated_at                           | ✅  | 4        | —                             | `/dashboard/suporte/feedback`                 | **CONNECT** |
| `customer_feedback`             | id (PK), tenant_id, company_id (FK), rating, comment, responded_at, created_at                                                          | ✅  | 4        | —                             | `/dashboard`                                  | **CONNECT** |
| `customer_ratings`              | id (PK), tenant_id, entity_type, entity_id, person_id (FK), rating, comment, created_at                                                 | ✅  | 4        | —                             | `/dashboard`                                  | **CONNECT** |

### 4.12 Communications Module

| Table                      | Colunas (PK/FK)                                                                         | RLS | Policies | Repository | Route                                   | Status      |
| -------------------------- | --------------------------------------------------------------------------------------- | --- | -------- | ---------- | --------------------------------------- | ----------- |
| `notifications`            | id (PK), tenant_id, person_id (FK), type, title, message, is_read, metadata, created_at | ✅  | 2        | —          | `/dashboard/notificacoes`               | **CONNECT** |
| `notification_deliveries`  | id (PK), notification_id (FK), channel, status, delivered_at, error_message             | ✅  | 1        | —          | internal                                | **CONNECT** |
| `notification_preferences` | id (PK), tenant_id, person_id (FK), channel, enabled, created_at, updated_at            | ✅  | 3        | —          | `/dashboard/configuracoes/notificacoes` | **CONNECT** |
| `chat_rooms`               | id (PK), tenant_id, name, type, created_at, updated_at                                  | ✅  | 3        | —          | `/dashboard/chat`                       | **CONNECT** |
| `chat_participants`        | id (PK), room_id (FK), person_id (FK), joined_at, role, created_at                      | ✅  | 2        | —          | `/dashboard/chat`                       | **CONNECT** |
| `chat_messages`            | id (PK), room_id (FK), sender_id (FK), content, sent_at, created_at                     | ✅  | 2        | —          | `/dashboard/chat`                       | **CONNECT** |
| `chat_handoffs`            | id (PK), room_id (FK), from_person_id (FK), to_person_id (FK), reason, created_at       | ✅  | 2        | —          | `/dashboard/chat`                       | **CONNECT** |
| `email_messages`           | id (PK), tenant_id, to_email, subject, body, status, sent_at, created_at                | ✅  | 2        | —          | internal                                | **CONNECT** |
| `email_templates`          | id (PK), tenant_id, name, subject, body_html, body_text, created_at, updated_at         | ✅  | 3        | —          | `/dashboard/configuracoes`              | **CONNECT** |

### 4.13 AI & Automation Module

| Table                   | Colunas (PK/FK)                                                                                                                                                                                              | RLS | Policies | Repository | Route                          | Status      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | -------- | ---------- | ------------------------------ | ----------- |
| `ai_conversations`      | id (PK), tenant_id, model, status, created_at, updated_at                                                                                                                                                    | ✅  | 3        | —          | `/dashboard/ia/assistente`     | **CONNECT** |
| `ai_messages`           | id (PK), conversation_id (FK), role, content, tokens, created_at                                                                                                                                             | ✅  | 2        | —          | `/dashboard/ia/assistente/:id` | **CONNECT** |
| `ai_usage`              | id (PK), tenant_id, person_id (FK), model, tokens_used, cost, usage_date, created_at                                                                                                                         | ✅  | 3        | —          | `/dashboard/ia/assistente`     | **CONNECT** |
| `automation_jobs`       | id (PK), tenant_id, name, description, trigger_type, trigger_config, action_type, action_config, is_active, last_run_at, next_run_at, run_count, failure_count, actor_person_id (FK), created_at, updated_at | ✅  | 3        | —          | `/dashboard/ia/automacoes`     | **CONNECT** |
| `automation_executions` | id (PK), job_id (FK), tenant_id, status, started_at, finished_at, output, error_message, created_at                                                                                                          | ✅  | 2        | —          | `/dashboard/ia/automacoes/:id` | **CONNECT** |
| `automation_templates`  | id (PK), tenant_id, name, description, trigger_config, action_config, created_at, updated_at                                                                                                                 | ✅  | 3        | —          | `/dashboard/ia/automacoes`     | **CONNECT** |
| `tasks`                 | id (PK), tenant_id, title, description, status, related_entity_type, related_entity_id, assignee_person_id (FK), created_at, updated_at                                                                      | ✅  | 3        | —          | `/dashboard`                   | **CONNECT** |
| `task_comments`         | id (PK), tenant_id, task_id (FK), person_id (FK), content, created_at, updated_at                                                                                                                            | ✅  | 3        | —          | `/dashboard/tasks/:id`         | **CONNECT** |
| `task_attachments`      | id (PK), task_id (FK), file_url, file_name, mime_type, uploaded_at, created_by (FK)                                                                                                                          | ✅  | 3        | —          | `/dashboard/tasks/:id`         | **CONNECT** |
| `task_status_history`   | id (PK), task_id (FK), status, changed_at, actor_person_id (FK), metadata                                                                                                                                    | ✅  | 3        | —          | `/dashboard/tasks/:id`         | **CONNECT** |

### 4.14 Reports / Dashboard Module

| Table                      | Colunas (PK/FK)                                                                              | RLS | Policies | Repository | Route                       | Status      |
| -------------------------- | -------------------------------------------------------------------------------------------- | --- | -------- | ---------- | --------------------------- | ----------- |
| `report_definitions`       | id (PK), tenant_id, name, description, query_config, created_by (FK), created_at, updated_at | ✅  | 3        | —          | `/dashboard/relatorios`     | **CONNECT** |
| `report_executions`        | id (PK), report_id (FK), tenant_id, executed_at, result_count, file_url, created_at          | ✅  | 2        | —          | `/dashboard/relatorios/:id` | **CONNECT** |
| `report_schedules`         | id (PK), report_id (FK), tenant_id, frequency, next_run, last_run, created_at                | ✅  | 2        | —          | `/dashboard/relatorios/:id` | **CONNECT** |
| `dashboard_layouts`        | id (PK), tenant_id, name, layout_config, is_default, created_by (FK), created_at, updated_at | ✅  | 3        | —          | `/dashboard`                | **CONNECT** |
| `dashboard_widgets`        | id (PK), layout_id (FK), widget_type, config, position, created_at, updated_at               | ✅  | 3        | —          | `/dashboard`                | **CONNECT** |
| `page_templates`           | id (PK), tenant_id, name, slug, content, created_at, updated_at                              | ✅  | 2        | —          | `/dashboard`                | **CONNECT** |
| `media_assets`             | id (PK), tenant_id, name, file_url, mime_type, alt_text, created_at, updated_at              | ✅  | 4        | —          | `/dashboard`                | **CONNECT** |
| `candidate_portal_modules` | id (PK), tenant_id, name, is_visible, sort_order, created_at, updated_at                     | ✅  | 2        | —          | `/candidato/*`              | **KEEP**    |

### 4.15 Integrations / Platform Module

| Table                     | Colunas (PK/FK)                                                                                                                      | RLS | Policies | Repository | Route                                        | Status      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --- | -------- | ---------- | -------------------------------------------- | ----------- |
| `integration_connections` | id (PK), tenant_id, provider, config, is_active, created_at, updated_at                                                              | ✅  | 2        | —          | `/dashboard/integracoes`                     | **CONNECT** |
| `integration_credentials` | id (PK), connection_id (FK), tenant_id, encrypted_credentials, created_at, updated_at                                                | ✅  | 1        | —          | `/dashboard/integracoes`                     | **CONNECT** |
| `integration_errors`      | id (PK), connection_id (FK), error_message, error_code, occurred_at, created_at                                                      | ✅  | 1        | —          | `/dashboard/integracoes`                     | **CONNECT** |
| `integration_events`      | id (PK), connection_id (FK), tenant_id, event_type, payload, created_at                                                              | ✅  | 1        | —          | `/dashboard/integracoes`                     | **CONNECT** |
| `integration_sync_jobs`   | id (PK), connection_id (FK), tenant_id, name, schedule, last_run_at, next_run_at, created_at                                         | ✅  | 2        | —          | `/dashboard/integracoes`                     | **CONNECT** |
| `integration_sync_runs`   | id (PK), sync_job_id (FK), tenant_id, started_at, finished_at, status, created_at                                                    | ✅  | 1        | —          | `/dashboard/integracoes`                     | **CONNECT** |
| `integration_webhooks`    | id (PK), tenant_id, provider, webhook_url, secret, is_active, created_at, updated_at                                                 | ✅  | 1        | —          | `/dashboard/integracoes`                     | **CONNECT** |
| `provider_configs`        | id (PK), tenant_id, provider, config, created_at, updated_at                                                                         | ✅  | 1        | —          | `/dashboard/configuracoes`                   | **CONNECT** |
| `providers`               | id (PK), name, type, config_schema, created_at, updated_at                                                                           | ✅  | 1        | —          | `/dashboard/configuracoes`                   | **CONNECT** |
| `password_policies`       | id (PK), tenant_id, name, min_length, require_uppercase, require_lowercase, require_numbers, require_special, created_at, updated_at | ✅  | 3        | —          | `/dashboard/configuracoes/seguranca`         | **CONNECT** |
| `sessions`                | id (PK), tenant_id, person_id (FK), refresh_token_hash, user_agent, ip_address, expires_at, created_at                               | ✅  | 2        | —          | `/dashboard/configuracoes/seguranca/sessoes` | **CONNECT** |

### 4.16 Event Sourcing / Outbox Module

| Table                | Colunas (PK/FK)                                                                                                                                        | RLS | Policies | Repository | Route                  | Status      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | -------- | ---------- | ---------------------- | ----------- |
| `domain_events`      | id (PK), tenant_id, event_type, aggregate_type, aggregate_id, actor_person_id (FK), payload, correlation_id, causation_id, idempotency_key, created_at | ✅  | 1        | —          | `/dashboard/auditoria` | **CONNECT** |
| `event_outbox`       | id (PK), tenant_id, event_id (FK), status, attempts, correlation_id, available_at, processed_at, last_error, created_at, updated_at                    | ✅  | 1        | —          | internal               | **CONNECT** |
| `event_deliveries`   | id (PK), tenant_id, event_id (FK), delivery_target, status, delivered_at, error_message, created_at                                                    | ✅  | 1        | —          | internal               | **CONNECT** |
| `event_participants` | id (PK), tenant_id, event_id (FK), person_id (FK), role, created_at                                                                                    | ✅  | 3        | —          | `/dashboard`           | **CONNECT** |

### 4.17 Storage / Files Module

| Table              | Colunas (PK/FK)                                                                                                             | RLS | Policies | Repository | Route        | Status                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | --- | -------- | ---------- | ------------ | ------------------------------------------- |
| `files`            | id (PK), tenant_id, bucket, file_name, storage_path, mime_type, size, uploaded_by (FK), uploaded_at, created_at, updated_at | ✅  | 2        | —          | `/dashboard` | **CONNECT**                                 |
| `file_uploads`     | id (PK), tenant_id, file_name, storage_path, mime_type, size, uploaded_by (FK), uploaded_at, created_at                     | ✅  | 2        | —          | `/dashboard` | **CONNECT** (possible duplicate of `files`) |
| `file_access_logs` | id (PK), file_id (FK), person_id (FK), access_type, accessed_at, created_at                                                 | ✅  | 2        | —          | internal     | **CONNECT**                                 |

### 4.18 Content / Site Module (IGNORED - Protected)

| Table                        | Colunas (PK/FK)                                                                               | RLS | Policies | Repository | Route                  | Status      |
| ---------------------------- | --------------------------------------------------------------------------------------------- | --- | -------- | ---------- | ---------------------- | ----------- |
| `footer_configs`             | id (PK), key, value, created_at, updated_at                                                   | ✅  | 2        | —          | public site            | **IGNORED** |
| `global_navigation_links`    | id (PK), label, href, target, sort_order, is_active, created_at                               | ✅  | 2        | —          | public site            | **IGNORED** |
| `page_templates`             | id (PK), tenant_id, name, slug, content, created_at, updated_at                               | ✅  | 2        | —          | `/dashboard`           | **CONNECT** |
| `blog_categories`            | id (PK), name, slug, created_at, updated_at                                                   | ✅  | 1        | —          | public site            | **IGNORED** |
| `blog_posts`                 | id (PK), category_id (FK), title, slug, content, status, published_at, created_at, updated_at | ✅  | 1        | —          | public site            | **IGNORED** |
| `company_relationship_types` | id (PK), name, description, created_at                                                        | ✅  | 1        | —          | internal               | **KEEP**    |
| `activity_logs`              | id (PK), tenant_id, actor_person_id (FK), action, entity_type, entity_id, details, created_at | ✅  | 2        | —          | `/dashboard/auditoria` | **CONNECT** |
| `validation_results`         | id (PK), validation_type, result, details, created_at                                         | ✅  | 3        | —          | internal               | **CONNECT** |

---

## 5. Existing Repositories (60 files in `src/repositories/`)

| Repository                           | Tables Consumed                  | Status                                                                       |
| ------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------- |
| `accountsPayableRepository.ts`       | accounts_payable                 | **KEEP**                                                                     |
| `accountsReceivableRepository.ts`    | accounts_receivable              | **KEEP**                                                                     |
| `applicationsRepository.ts`          | applications                     | **KEEP**                                                                     |
| `auditLogsRepository.ts`             | audit_logs                       | **KEEP**                                                                     |
| `bankReconciliationsRepository.ts`   | bank_reconciliations             | **KEEP**                                                                     |
| `blogCategoriesRepository.ts`        | blog_categories                  | **IGNORED** (public site)                                                    |
| `blogPostsRepository.ts`             | blog_posts                       | **IGNORED** (public site)                                                    |
| `candidatesRepository.ts`            | candidates, people               | **KEEP**                                                                     |
| `companiesRepository.ts`             | companies, company_relationships | **KEEP**                                                                     |
| `companyServicesRepository.ts`       | company_services                 | **KEEP**                                                                     |
| `contractsRepository.ts`             | contracts                        | **KEEP**                                                                     |
| `costCentersRepository.ts`           | cost_centers                     | **KEEP**                                                                     |
| `dashboardLayoutsRepository.ts`      | dashboard_layouts                | **KEEP**                                                                     |
| `domainEventsRepository.ts`          | domain_events                    | **KEEP**                                                                     |
| `employeesRepository.ts`             | employees                        | **KEEP**                                                                     |
| `filesRepository.ts`                 | files                            | **KEEP**                                                                     |
| `financialAccountsRepository.ts`     | financial_accounts               | **KEEP**                                                                     |
| `financialCategoriesRepository.ts`   | financial_categories             | **KEEP**                                                                     |
| `financialInstallmentsRepository.ts` | financial_installments           | **KEEP**                                                                     |
| `financialTransactionsRepository.ts` | financial_transactions           | **KEEP**                                                                     |
| `footerConfigsRepository.ts`         | footer_configs                   | **IGNORED** (public site)                                                    |
| `invoicesRepository.ts`              | invoices                         | **KEEP**                                                                     |
| `jobMatchesRepository.ts`            | job_matches                      | **KEEP**                                                                     |
| `jobsRepository.ts`                  | jobs                             | **KEEP**                                                                     |
| `leadsRepository.ts`                 | leads                            | **KEEP**                                                                     |
| `navigationRepository.ts`            | global_navigation_links          | **IGNORED** (public site)                                                    |
| `notificationsRepository.ts`         | notifications                    | **KEEP**                                                                     |
| `pageTemplatesRepository.ts`         | page_templates                   | **KEEP**                                                                     |
| `paymentsRepository.ts`              | payments                         | **KEEP**                                                                     |
| `permissionRepository.ts`            | permissions                      | **KEEP**                                                                     |
| `recruitmentDemandsRepository.ts`    | recruitment_demands              | **KEEP**                                                                     |
| `recruitmentProcessesRepository.ts`  | recruitment_processes            | **KEEP**                                                                     |
| `recruitmentStagesRepository.ts`     | recruitment_stages               | **KEEP**                                                                     |
| `rolesRepository.ts`                 | roles                            | **KEEP**                                                                     |
| `serviceOrdersRepository.ts`         | service_orders                   | **KEEP**                                                                     |
| `servicesRepository.ts`              | services                         | **KEEP**                                                                     |
| `suppliersRepository.ts`             | suppliers                        | **DEPRECATE** (table doesn't exist — uses companies + company_relationships) |
| `partnersRepository.ts`              | partners                         | **DEPRECATE** (table doesn't exist — uses companies + company_relationships) |
| `stockMovementsRepository.ts`        | stock_movements                  | **KEEP**                                                                     |
| `supabaseRepository.ts`              | — (base)                         | **KEEP**                                                                     |
| `supportTicketsRepository.ts`        | support_tickets                  | **KEEP**                                                                     |
| `taskCommentsRepository.ts`          | task_comments                    | **KEEP**                                                                     |
| `tasksRepository.ts`                 | tasks                            | **KEEP**                                                                     |
| `usersRepository.ts`                 | people                           | **KEEP**                                                                     |
| `validationResultsRepository.ts`     | validation_results               | **KEEP**                                                                     |
| `companyContactsRepository.ts`       | company_contacts                 | **KEEP**                                                                     |
| `companyLocationsRepository.ts`      | company_locations                | **KEEP**                                                                     |
| `companyRelationshipRepository.ts`   | company_relationships            | **KEEP**                                                                     |
| `dashboardWidgetsRepository.ts`      | dashboard_widgets                | **KEEP**                                                                     |
| `eventsRepository.ts`                | domain_events                    | **KEEP** (duplicate name, different file)                                    |
| `feedbackRepository.ts`              | feedback, customer_feedback      | **KEEP**                                                                     |
| `financialTransactionsRepository.ts` | financial_transactions           | **KEEP**                                                                     |
| `interviewsRepository.ts`            | interviews                       | **KEEP**                                                                     |
| `mediaAssetsRepository.ts`           | media_assets                     | **KEEP**                                                                     |
| `oauthRepository.ts`                 | integration_connections          | **KEEP**                                                                     |
| `profilesRepository.ts`              | people                           | **KEEP** (alias)                                                             |
| `quotesRepository.ts`                | quotes                           | **KEEP**                                                                     |
| `reportsRepository.ts`               | report_definitions               | **KEEP**                                                                     |
| `sessionsRepository.ts`              | sessions                         | **KEEP**                                                                     |

---

## 6. Frontend File × Route × Module × Table Cross-Reference

### 6.1 Portal / Dashboard Shell (Global spine — DO NOT MODIFY)

| File                                        | Component                               | Tables                                              | RBAC Context                | Status                                        |
| ------------------------------------------- | --------------------------------------- | --------------------------------------------------- | --------------------------- | --------------------------------------------- |
| `src/main.tsx:9-27`                         | Global providers (Auth, Account, Intro) | —                                                   | AuthContext, AccountContext | **PROTECTED**                                 |
| `src/contexts/AuthContext.tsx`              | Auth context                            | auth.users                                          | —                           | **PROTECTED**                                 |
| `src/contexts/AccountContext.tsx`           | Account context                         | people, tenant_memberships, roles, role_assignments | —                           | **PROTECTED**                                 |
| `src/components/portal/PortalShell.tsx`     | Global portal shell                     | —                                                   | AccountContext wrapper      | **KEEP**                                      |
| `src/components/portal/PortalSidebar.tsx`   | Global sidebar                          | PORTAL_MODULES metadata                             | ModuleRegistry              | **REFACTOR** (consolidate with ModuleSidebar) |
| `src/components/portal/PortalHeader.tsx`    | Portal header                           | —                                                   | AccountContext              | **KEEP**                                      |
| `src/components/portal/PortalFooter.tsx`    | Footer                                  | —                                                   | —                           | **PROTECTED**                                 |
| `src/components/portal/ModuleWorkspace.tsx` | Workspace container                     | —                                                   | ModuleContext               | **REFACTOR** (resolve ModuleSidebar conflict) |
| `src/components/portal/ModuleSidebar.tsx`   | Module contextual sidebar               | PORTAL_MODULES metadata                             | ModuleRegistry              | **REFACTOR**                                  |
| `src/components/portal/ModuleRegistry.ts`   | Module definitions + RBAC               | —                                                   | Permission checking         | **KEEP** (metadata source)                    |
| `src/components/portal/MetroTiles.tsx`      | Metro launcher grid                     | module stats via lib/module-stats.ts                | ModuleRegistry              | **KEEP**                                      |
| `src/components/portal/MetroTileGrid.tsx`   | Virtualized grid                        | —                                                   | —                           | **KEEP**                                      |

### 6.2 Authenticated Portal Pages (Dashboard)

| File                                          | Route                   | Tables                                                                                     | Repository           | Permission           | Status   |
| --------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ | -------------------- | -------------------- | -------- |
| `src/pages/dashboard/DashboardHome.tsx`       | `/dashboard`            | jobs, candidates, companies, financial_transactions, accounts_payable, accounts_receivable | module-stats.ts      | none (auto-redirect) | **KEEP** |
| `src/pages/dashboard/ModuleDashboardPage.tsx` | `/dashboard/{module}`   | PORTAL_MODULES metadata                                                                    | —                    | dynamic per module   | **KEEP** |
| `src/pages/dashboard/VisaoGeral.tsx`          | `/dashboard/analitico`  | domain_events, financial_transactions                                                      | —                    | `domain_events.read` | **KEEP** |
| `src/pages/dashboard/Vagas.tsx`               | `/dashboard/vagas`      | jobs                                                                                       | jobsRepository       | `jobs.read`          | **KEEP** |
| `src/pages/dashboard/Candidatos.tsx`          | `/dashboard/candidatos` | candidates + people                                                                        | candidatesRepository | `candidates.read`    | **KEEP** |
| `src/pages/dashboard/Empresas.tsx`            | `/dashboard/empresas`   | companies                                                                                  | companiesRepository  | `companies.read`     | **KEEP** |

### 6.3 Candidate Portal (Protected — separate cell)

| File                   | Route          | Tables                                 | Repository                      | Permission     | Status        |
| ---------------------- | -------------- | -------------------------------------- | ------------------------------- | -------------- | ------------- |
| `features/candidato/*` | `/candidato/*` | candidates, applications, jobs, people | CandidateContext + repositories | candidato role | **PROTECTED** |

### 6.4 Public Site (IGNORED — Protected)

| File                           | Route             | Tables                           | Status        |
| ------------------------------ | ----------------- | -------------------------------- | ------------- |
| `src/pages/Home.tsx`           | `/`               | —                                | **IGNORED**   |
| `src/pages/Vagas.tsx`          | `/vagas`          | jobs (currently mock)            | **IGNORED**   |
| `src/pages/VagaDetalhe.tsx`    | `/vagas/:slug`    | jobs (currently mock)            | **IGNORED**   |
| `src/pages/Empresas.tsx`       | `/empresas`       | companies (currently mock)       | **IGNORED**   |
| `src/pages/Clientes.tsx`       | `/clientes`       | companies (currently mock)       | **IGNORED**   |
| `src/pages/Parceiros.tsx`      | `/parceiros`      | companies (currently mock)       | **IGNORED**   |
| `src/pages/Fornecedores.tsx`   | `/fornecedores`   | companies (currently mock)       | **IGNORED**   |
| `src/pages/Servicos.tsx`       | `/servicos`       | services (currently mock)        | **IGNORED**   |
| `src/pages/ServicoDetalhe.tsx` | `/servicos/:slug` | services (currently mock)        | **IGNORED**   |
| `src/pages/Suporte.tsx`        | `/suporte`        | support_tickets (currently mock) | **IGNORED**   |
| `src/pages/Contato.tsx`        | `/contato`        | —                                | **IGNORED**   |
| `src/pages/Login.tsx`          | `/login`          | auth.users                       | **IGNORED**   |
| `src/components/Footer.tsx`    | all public pages  | footer_configs                   | **PROTECTED** |

### 6.5 Hooks (23 files in `src/hooks/`)

| Hook                      | Consumer      | Tables          | Status   |
| ------------------------- | ------------- | --------------- | -------- |
| `useRealtimeChat`         | chat features | chat_*          | **KEEP** |
| `useGlobalDashboardStats` | DashboardHome | module-stats.ts | **KEEP** |
| (21 others)               | various       | various         | **KEEP** |

### 6.6 Services (3 files in `src/services/`)

| Service   | Consumer | Tables  | Status   |
| --------- | -------- | ------- | -------- |
| (3 files) | various  | various | **KEEP** |

---

## 7. Routing Contract (D1)

**Source of truth: `src/App.tsx`** — explicit `<Route>` definitions.

- `PORTAL_MODULES[]features` in `ModuleRegistry.ts` = metadata (permissions, sidebar, order)
- `MODULE_PAGE_MAP`/`PAGE_COMPONENTS` = **DEAD CODE** (verified: zero imports anywhere)
- `ComingSoonPage` = replaced with inline `EmptyState` in `App.tsx:743` inside `ModuleDashboardPage`'s `path="*"` route

### Active Routes

| Rota                          | Página                | Module           | Permission              |
| ----------------------------- | --------------------- | ---------------- | ----------------------- |
| `/`                           | `Home`                | —                | public                  |
| `/vagas`                      | `Vagas`               | recrutamento     | public (currently mock) |
| `/vagas/:slug`                | `VagaDetalhe`         | recrutamento     | public (currently mock) |
| `/empresas`                   | `Empresas`            | crm              | public (currently mock) |
| `/servicos`                   | `Servicos`            | services         | public (currently mock) |
| `/suporte`                    | `Suporte`             | support          | public (currently mock) |
| `/login`                      | `Login`               | auth             | public                  |
| `/dashboard`                  | `DashboardHome`       | inicio           | auto-redirect           |
| `/dashboard/analitico`        | `VisaoGeral`          | gestao-saas      | `domain_events.read`    |
| `/dashboard/{module}`         | `ModuleDashboardPage` | dynamic          | per-module              |
| `/dashboard/global`           | (dashboard global)    | admin-master     | `domain_events.read`    |
| `/dashboard/tenants`          | —                     | tenants          | `tenants.read`          |
| `/dashboard/usuarios`         | —                     | usuarios         | `people.read`           |
| `/dashboard/roles-permissoes` | —                     | roles-permissoes | `roles.read`            |
| `/candidato/*`                | CandidatePortal       | candidato        | candidato role          |

---

## 8. Data Integrity Matrix (Live DB vs Docs)

### Discrepancies Found

| Issue                    | Live DB                 | Existing Doc                              | Resolution                                              |
| ------------------------ | ----------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `roles` row count        | 53                      | 18 (SUPABASE-REAL-SCHEMA)                 | Docs outdated — live DB is truth                        |
| `permissions` row count  | 230                     | 1479 (SUPABASE-REAL-SCHEMA)               | Docs outdated — permissions were normalized             |
| `role_permissions` count | 739                     | 668                                       | Docs outdated                                           |
| `partners` table         | ❌ not in public schema | referenced by `partnersRepository.ts`     | **DEPRECATE** repository                                |
| `suppliers` table        | ✅ EXISTS               | referenced by `suppliersRepository.ts`    | **REUSE** (exists, not in docs list)                    |
| `suppliersRepository.ts` | —                       | V21-FRONTEND-MAP says table doesn't exist | CONFLICT — table exists, repository may be wrong        |
| `partnersRepository.ts`  | —                       | same                                      | CONFLICT — table doesn't exist, repository is dead code |

### Orphaned Code (exists in frontend, no DB table)

| Frontend File                             | Table Expected | DB Exists? | Action                                                |
| ----------------------------------------- | -------------- | ---------- | ----------------------------------------------------- |
| `src/repositories/suppliersRepository.ts` | `suppliers`    | ✅ EXISTS  | **REFACTOR** — verify it actually queries `suppliers` |
| `src/repositories/partnersRepository.ts`  | `partners`     | ❌ NO      | **DEPRECATE** — dead code                             |
| `MODULE_PAGE_MAP` (removed)               | —              | —          | Confirmed dead code (zero imports)                    |
| `PAGE_COMPONENTS` (removed)               | —              | —          | Confirmed dead code (zero imports)                    |

---

## 9. Classification Summary

| Status        | Count (tables) | Notes                                                                                                 |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| **KEEP**      | ~45            | Core identity, RBAC, and key business tables with existing repositories                               |
| **REUSE**     | ~30            | Tables with existing repositories that are working correctly                                          |
| **CONNECT**   | ~135           | Tables in DB but no repository/hook/Page yet — priority for Phase 2                                   |
| **REFACTOR**  | ~5             | Working code that needs controlled reorganization (ModuleSidebar, PortalSidebar, companiesRepository) |
| **MOVE**      | 0              | No physical moves needed yet                                                                          |
| **MERGE**     | 1              | `files` vs `file_uploads` — possible duplicate                                                        |
| **DEPRECATE** | 1              | `partnersRepository.ts` (table doesn't exist)                                                         |
| **MISSING**   | ~50            | Frontend needs hooks/repositories for tables that exist in DB                                         |
| **IGNORED**   | ~12            | Public site tables (footer_configs, blog_*, global_navigation_links, etc.)                            |
| **PROTECTED** | ~8             | Global spine, public site files, footer                                                               |

---

## 10. Next Actions (no code changes yet)

1. **P2 complete**: MODULE_PAGE_MAP/PAGE_COMPONENTS confirmed as dead code ✅
2. **P3 in progress**: Frontend cross-reference completed (this document)
3. **P4**: Fix `partnersRepository.ts` dead code (DEPRECATE)
4. **P5**: Verify `suppliersRepository.ts` is querying real `suppliers` table
5. **P6**: Create the "Arquitetura Definitiva" document (Fase B) defining the three-tier portal structure
6. **P7**: Only then begin Portal Recovery — fix `ModuleSidebar`/`PortalSidebar` conflict
7. **P8**: Checkpoint 24H — tests, typecheck, lint, build, diff audit, commit

---

**Document Version:** 2026-09-30  
**Empresa:** J&S Empregos LTDA  
**Next Review:** After Portal Recovery Phase 1
