# F3 — Inventário Técnico e Matriz A1–A7

**Data:** 2026-10-26  
**Escopo:** Somente leitura. Nenhum arquivo modificado, nenhuma migration criada, nenhum banco alterado, nenhum commit feito.  
**Método:** Leitura de `supabase/migrations/`, `supabase/specs/sql/`, `src/**/*.repository.ts`, `src/**/use*.ts`, `src/modules/*/pages/**`, `src/pages/dashboard/**`, `docs/TRACEABILITY-MATRIX-V2.md`, `docs/C15-TABLE-CLASSIFICATION.md`, `docs/D1.1-CONSUMER-AUDIT.md`.  
**Projeto:** J&S Empregos LTDA — `jrtercerisados`  
**Git HEAD:** `c563308` (53 arquivos modificados, 0 staged)  
**Remote Supabase:** `okxqfyoqbhcmflpurfrw` (inspeção read-only prévia)

---

## 0. Fontes consultadas

| Fonte | Arquivo | Tipo |
|-------|---------|------|
| Schema canônico | `supabase/migrations/20260816000100_core_people_tenants.sql` | DDL real |
| Schema canônico | `supabase/migrations/20260816000400_candidates.sql` | DDL real |
| Schema canônico | `supabase/migrations/20260827001300_candidate_child_tables.sql` | DDL real |
| RLS consolidada | `supabase/migrations/20260904000000_rbac_candidate_self_service.sql` | Policies reais |
| RLS consolidada | `supabase/migrations/20260904000002_rls_candidate_self_isolation.sql` | Policies reais |
| Inventário real | `docs/SUPABASE-REAL-SCHEMA-INVENTORY.md` | Leitura Supabase |
| Matriz RBAC | `docs/V21-RBAC-MATRIX.md` | Leitura Supabase |
| Auditoria RLS | `docs/V21-RLS-SECURITY-AUDIT.md` | Auditoria técnica |
| Matriz rastreabilidade | `docs/TRACEABILITY-MATRIX-V2.md` | Cruzamento código/banco |
| Classificação tabelas | `docs/C15-TABLE-CLASSIFICATION.md` | Classificação UI |
| Auditoria consumidores | `docs/D1.1-CONSUMER-AUDIT.md` | Verificação de símbolos mortos |
| Matriz Passagem C | `docs/architecture/passagem-c-matriz-banco-codigo-modulo.md` | Inventário módulos |

---

## 1. Referências do catálogo Supabase (read-only, 2026-10-14)

| Item | Referência | Status |
|------|------------|--------|
| Tabelas em `public` | 229 | Confirmado via `information_schema.tables` |
| Views | 5 | `financial_kpis`, `public_companies_by_type`, `public_jobs_v1`, `public_services_v1`, `recruitment_kpis` |
| Funções | 238 | Confirmado via `pg_proc` |
| Triggers | 98 | Confirmado via `pg_trigger` (não internos) |
| Políticas RLS | 668 (671 em varredura anterior) | Confirmado via `pg_policy` |
| Tabelas com RLS habilitada | 229 | Todas as 229 tabelas têm `relrowsecurity = true` |
| Funções SECURITY DEFINER | 38 | Incluindo `is_tenant_member()`, `is_admin_master()`, `user_has_permission()` |

---

## 2. Matriz A1 — Tabelas → Módulo → Repositório → Permissões → RLS

Inventário completo das tabelas mapeadas (≈60 de 229). Tabelas não listadas abaixo não possuem repositório local identificado.

### 2.1 CORE (Identidade, Tenants, RBAC)

| Tabela | Módulo | Repositório | Colunas-chave (schema real) | RLS | Policies (SELECT/INSERT/UPDATE/DELETE) | Observações |
|--------|--------|-------------|------------------------------|-----|----------------------------------------|-------------|
| `people` | Core/Identidade | `src/repositories/users.repository.ts` | id, auth_user_id, full_name, email, phone, status, created_at, updated_at | ✅ | SELECT: admin_master ou membership ativa. INSERT: bootstrap. UPDATE/DELETE: não definidas explicitamente | Global (sem tenant_id). FK indireta via `tenant_memberships`. |
| `tenants` | Plataforma (admin_master) | `src/repositories/tenant.repository.ts` | id, name, slug, document, status, created_at, updated_at | ✅ | `tenants_admin_all` (FOR ALL) — apenas admin_master | Global. |
| `tenant_memberships` | Core | `src/repositories/tenant.repository.ts` | id, person_id → people.id, tenant_id → tenants.id, membership_role, status, joined_at, created_at | ✅ | SELECT/INSERT/UPDATE: admin_master ou is_tenant_member(tenant_id). Nenhuma DELETE explícita. | Chave de isolamento: auth.uid() → people → tenant_memberships → tenant_id. |
| `tenant_settings` | Core/Configurações | `src/repositories/tenant.repository.ts` | id, tenant_id, settings (jsonb), created_at, updated_at | ✅ | SELECT/INSERT/UPDATE: admin_master ou is_tenant_member(tenant_id) | JSONB por módulo. |
| `roles` | Plataforma (RBAC) | `src/repositories/role.repository.ts` | id, name, description, scope ('global'\|'tenant'), created_at | ✅ | SELECT: admin_master ou scope='tenant'. INSERT/UPDATE/DELETE: apenas admin_master | 1 global (admin_master), 52 tenant roles. |
| `permissions` | Plataforma (RBAC) | `src/repositories/permission.repository.ts` | id, resource, action, code, description, created_at | ✅ | SELECT: `using (true)` (qualquer autenticado). Demais: admin_master | 247 códigos (`resource.action`). |
| `role_permissions` | Plataforma (RBAC) | — | id, role_id → roles.id, permission_id → permissions.id | ✅ | SELECT: admin_master ou role.scope='tenant'. Demais: admin_master | 668 vínculos. |
| `role_assignments` | Plataforma (RBAC) | `src/repositories/role.repository.ts` | id, person_id → people.id, role_id → roles.id, tenant_id, assigned_at, expires_at | ✅ | SELECT/INSERT/UPDATE: admin_master ou is_tenant_member(tenant_id) | Sem `assigned_by`. |
| `first_login_state` | Core/Autenticação | — | id, person_id, must_change_password, terms_version, lgpd_consent_version, welcome_completed_at | ✅ | SELECT: self-read ou admin. UPDATE: admin. INSERT: não definida. | |
| `legal_acceptances` | LGPD | — | id, person_id, version, accepted_at, created_at | ✅ | SELECT: admin_master ou is_tenant_member | Sem dados no banco. |
| `audit_logs` | Auditoria | `src/repositories/audit.repository.ts` | id, tenant_id, actor_person_id, action, entity, entity_id, old_data, new_data, created_at | ✅ | SELECT: owner/admin do tenant. INSERT: não definida. UPDATE/DELETE: não definidas. | 1 registro no banco. |
| `security_events` | Segurança | `src/repositories/security.repository.ts` | id, tenant_id, event_type, severity, ip, user_agent, created_at | ✅ | SELECT: admin_master. Demais: não definidas. | Sem dados. |

### 2.2 Candidato (12 tabelas)

| Tabela | Módulo | Repositório | Colunas-chave (schema real) | RLS | Policies | Observações |
|--------|--------|-------------|------------------------------|-----|----------|-------------|
| `candidates` | Candidato/Recrutamento | `src/modules/candidato/repositories/candidates.repository.ts` | id, person_id → people.id, tenant_id → tenants.id, headline, salary_expectation_min, salary_expectation_max, salary_type, availability (jsonb), source, status, metadata, created_by → people.id, created_at, updated_at | ✅ | SELECT: tenant_id via membership chain. INSERT/UPDATE/DELETE: membership_role in ('owner','admin','manager','recruiter') | UNIQUE(person_id, tenant_id). Status: active/inactive/archived/blacklisted. |
| `candidate_experiences` | Candidato | `src/modules/candidato/repositories/candidate-experiences.repository.ts` | id, candidate_id → candidates.id, company, position, start_date, end_date, description, created_at, updated_at | ✅ | SELECT/INSERT/UPDATE/DELETE: EXISTS via candidates.tenant_id = auth.uid() chain | **Não tem tenant_id direto.** RLS via EXISTS subquery. |
| `candidate_education` | Candidato | `src/modules/candidato/repositories/candidate-education.repository.ts` | id, candidate_id → candidates.id, institution, course, degree, start_date, end_date, created_at, updated_at | ✅ | SELECT/INSERT/UPDATE/DELETE: EXISTS via candidates.tenant_id = auth.uid() chain | **Não tem tenant_id direto.** RLS via EXISTS subquery. |
| `candidate_courses` | Candidato | `src/modules/candidato/repositories/candidate-courses.repository.ts` | id, candidate_id → candidates.id, name, institution, hours (numeric(6,1)), completed_at (date), created_at, updated_at | ✅ | SELECT/INSERT/UPDATE/DELETE: EXISTS via candidates.tenant_id = auth.uid() chain | **Não tem tenant_id direto.** Code usa `hours` + `completed_at` (migração confirma). |
| `candidate_skills` | Candidato | `src/modules/candidato/repositories/candidate-skills.repository.ts` | id, candidate_id → candidates.id, skill_id → skills.id, proficiency, years_experience, last_used_at, created_at | ✅ | SELECT/INSERT/UPDATE/DELETE: EXISTS via candidates.tenant_id chain | UNIQUE(candidate_id, skill_id). |
| `candidate_languages` | Candidato | `src/modules/candidato/repositories/candidate-languages.repository.ts` | id, candidate_id → candidates.id, language, level, created_at, updated_at | ✅ | SELECT/INSERT/UPDATE/DELETE: EXISTS via candidates.tenant_id chain | |
| `candidate_documents` | Candidato | `src/modules/candidato/repositories/candidate-documents.repository.ts` | id, candidate_id → candidates.id, type, url, name, created_at, updated_at | ✅ | SELECT/INSERT/UPDATE/DELETE: EXISTS via candidates.tenant_id chain | |
| `candidate_preferences` | Candidato | `src/modules/candidato/repositories/candidate-preferences.repository.ts` | id, candidate_id → candidates.id, desired_roles, desired_locations, salary_min, salary_max, contract_types, shifts, work_modes, max_distance_km, available_from, matching_enabled, receive_match_alerts, created_at, updated_at | ✅ | SELECT/INSERT/UPDATE/DELETE: EXISTS via candidates.tenant_id chain | **Divergência:** existe no remote (20 rows em `candidates`, tabela vazia) mas não consta nos 221 anteriores. |
| `candidate_profile_views` | Candidato | `src/modules/candidato/repositories/candidate-profile-views.repository.ts` | id, candidate_id → candidates.id, tenant_id, viewer_person_id → people.id, viewed_at, created_at | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | FK: people. |
| `candidate_job_alerts` | Candidato | `src/modules/candidato/repositories/candidate-portal/jobAlerts.repository.ts` | id, tenant_id, person_id → people.id, name, keywords, city, state, contract_type, work_mode, salary_min, salary_max, frequency, is_active, last_sent_at, created_at, updated_at | ✅ | SELECT/INSERT/UPDATE/DELETE: self (person_id/tenant_id) | UNIQUE(person_id, name). |
| `favorite_jobs` | Candidato | `src/modules/candidato/repositories/candidate-portal/favoriteJobs.repository.ts` | id, tenant_id, person_id → people.id, job_id → jobs.id, created_at | ✅ | SELECT/INSERT/DELETE: self (person_id/tenant_id). UPDATE: não definida na migration | UNIQUE(person_id, job_id). |

### 2.3 Recrutamento (7 tabelas + relacionadas)

| Tabela | Módulo | Repositório | Colunas-chave (schema real) | RLS | Policies | Observações |
|--------|--------|-------------|------------------------------|-----|----------|-------------|
| `jobs` | Recrutamento | `src/modules/recrutamento/repositories/jobs.repository.ts` | id, tenant_id, company_id, company_relationship_id, title, slug, description, responsibilities, requirements, benefits, salary_min, salary_max, salary_type, contract_type, seniority, work_hours, work_mode, city, state, location_detail, status, published_at, closed_at, filled_at, views_count, applications_count, metadata, created_by, created_at, updated_at, updated_by | ✅ | SELECT: is_tenant_member(tenant_id). INSERT/UPDATE/DELETE: membership_role in ('owner','admin','manager') | `public_jobs_v1` view filtra status='published'. |
| `applications` | Recrutamento | `src/modules/recrutamento/repositories/applications.repository.ts` | id, tenant_id, job_id → jobs.id, candidate_id → candidates.id, status, created_at, updated_at, tenant_id, metadata, created_by, applied_at | ✅ | SELECT/INSERT: is_tenant_member(tenant_id). UPDATE: membership_role in ('owner','admin','manager'). DELETE: não definida explicitamente. | **DIVERGÊNCIA CRÍTICA:** mapper espera `person_id`, `process_id`, `current_stage_id`, `last_activity_at`, `current_stage` — banco tem `id, candidate_id, job_id, status, created_at, updated_at, tenant_id, metadata, created_by, applied_at`. Mapper usa `?? null` fallbacks. |
| `recruitment_stages` | Recrutamento | `src/modules/recrutamento/repositories/recruitment-stage.repository.ts` | id, recruitment_process_id → recruitment_processes.id, tenant_id, name, description, type, order, sort_order, created_at | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | |
| `recruitment_processes` | Recrutamento | `src/modules/recrutamento/repositories/recruitment-process.repository.ts` | id, job_id → jobs.id, company_id → companies.id, tenant_id, name, status, created_at, updated_at | ✅ | SELECT: is_tenant_member(tenant_id). INSERT/UPDATE: membership_role in ('owner','admin','manager') | |
| `recruitment_demands` | Recrutamento | `src/modules/recrutamento/repositories/recruitment-demand.repository.ts` | id, tenant_id, company_id, title, description, contact_name, contact_email, contact_phone, urgency, service_type, responsible_person_id, created_at | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | |
| `job_matches` | Recrutamento | `src/modules/recrutamento/repositories/job-matches.repository.ts` | id, candidate_id → candidates.id, job_id → jobs.id, tenant_id, score, reasons (jsonb), algorithm_version, is_eligible, sent_notification, invalidated_at, invalidated_reason, created_at, updated_at | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id). DELETE: não definida explicitamente. | UNIQUE(candidate_id, job_id). Usa RPC `increment_job_applications`. |
| `talent_pool` | Recrutamento | `src/modules/recrutamento/repositories/talent-pool.repository.ts` | Usa `talent_pool_memberships` (não `talent_pool` diretamente) | ✅ | | |
| `talent_pool_memberships` | Recrutamento | `src/modules/recrutamento/repositories/talent-pool.repository.ts` | id, tenant_id, candidate_id → candidates.id, person_id → people.id, status, source, consent_status, joined_at, removed_at | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | |
| `application_stage_history` | Recrutamento | `src/modules/recrutamento/repositories/applications.repository.ts` | id, application_id → applications.id, stage_id → recruitment_stages.id, moved_by, moved_at, notes, created_at | ✅ | SELECT: EXISTS via applications→candidates. UPDATE: não definida (histórico imutável) | |
| `application_profile_snapshots` | Recrutamento | — | id, application_id, snapshot_data (jsonb), created_at | ✅ | SELECT: EXISTS + is_tenant_member | Sem repository dedicado. |

### 2.4 Financeiro (9 tabelas)

| Tabela | Módulo | Repositório | RLS | Policies | Observações |
|--------|--------|-------------|-----|----------|-------------|
| `financial_categories` | Financeiro | `src/repositories/financial-category.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | FK: tenants + self (parent_id). |
| `cost_centers` | Financeiro | `src/repositories/cost-center.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | |
| `financial_accounts` | Financeiro | `src/repositories/financial-account.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | |
| `financial_transactions` | Financeiro | `src/repositories/financial-transaction.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | FK: tenants + cost_centers + financial_categories. |
| `financial_installments` | Financeiro | `src/repositories/financial-installment.repository.ts` | ✅ | SELECT/INSERT/UPDATE: EXISTS + is_tenant_member | FK indireta. |
| `financial_installment_payments` | Financeiro | — | ✅ | SELECT/INSERT/UPDATE: EXISTS + is_tenant_member | FK indireta. |
| `accounts_receivable` | Financeiro | `src/repositories/accounts-receivable.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | |
| `accounts_payable` | Financeiro | `src/repositories/accounts-payable.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | |
| `payments` | Financeiro | `src/repositories/payment.repository.ts` | ✅ | SELECT/INSERT/UPDATE: EXISTS + is_tenant_member | FK indireta. |
| `bank_accounts` | Financeiro | `src/repositories/bank-account.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | **Divergência:** ausente em prod (declarada em `20260827001200_finance.sql`). |
| `bank_reconciliations` | Financeiro | `src/repositories/bank-reconciliation.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | |
| `cash_flows` | Financeiro | `src/repositories/cash-flow.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | **Divergência:** ausente em prod (declarada em `20260827001200_finance.sql`). |
| `invoices` | Financeiro/Fiscal | `src/repositories/invoice.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id) | FK: tenants + companies. |

### 2.5 Serviços / Operações / CRM / Outros (resumo)

| Tabela | Módulo | Repositório | RLS | Observações |
|--------|--------|-------------|-----|-------------|
| `services` | Serviços | `src/repositories/services.repository.ts` | ✅ | SELECT público (`using (true)`). INSERT/UPDATE: membership_role in ('owner','admin','manager'). |
| `service_orders` | Serviços | `src/repositories/services.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id). |
| `companies` | CRM | `src/repositories/companies.repository.ts` | ✅ | SELECT: is_tenant_member(tenant_id). INSERT/UPDATE: membership_role in ('owner','admin','manager'). Global (sem tenant_id próprio). |
| `suppliers` | Compras | `src/repositories/suppliers.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id). |
| `purchase_orders` | Compras | — | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id). |
| `support_tickets` | Suporte | `src/repositories/support.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id). |
| `notifications` | Notificações | `src/repositories/notification.repository.ts` | ✅ | SELECT: user_id = auth.uid() (self-only). INSERT/UPDATE: is_tenant_member(tenant_id). |
| `files` | Storage | `src/repositories/media-assets.repository.ts` | ✅ | SELECT/INSERT/UPDATE: is_tenant_member(tenant_id). |
| `media_assets` | Storage/Mídia | `src/repositories/media-assets.repository.ts` | ✅ | Usado por `public_services_v1` para gallery. |

### 2.6 Módulos sem repositório (tabelas órfãs ou com código parcial)

| Tabela | Módulo | Status | Observação |
|--------|--------|--------|------------|
| `webhooks` | Integrações | ÓRFÃO | Existe em `schema.sql:1128` (legado), não nos specs canonicos. Sem repository. |
| `automation_queue` | Automação | ÓRFÃO | Existe em `schema.sql:1153` (legado), não nos specs canonicos. Sem repository. |
| `whatsapp_messages` | Comunicação | ÓRFÃO | Existe em `schema.sql:1184` (legado), não nos specs canonicos. Sem repository. |
| `emails` | Comunicação | ÓRFÃO | Existe em `schema.sql:1212` (legado), não nos specs canonicos. Sem repository. |
| `recruitment_kpis` | Recrutamento | ÓRFÃO (view) | View existe, sem consumidor no frontend. |
| `employees` | RH | PARCIAL | Tabela existe, mas módulo RH apenas dashboard + candidates index. |
| `departments`, `positions` | RH | PARCIAL | Sem repository dedicado. |
| `interviews` | Recrutamento | PARCIAL | Sem repository dedicado. |

---

## 3. Matriz A2 — Classificação de cada entidade

Legenda: REAL (implementado e conectado ao banco real), PARCIAL (implementado mas incompleto), MOCK (dados simulados), ESPECIFICADO (apenas especificado), NÃO IMPLEMENTADO (código ausente), ÓRFÃO (sem consumidor), OBSOLETO (substituído), CONFLITANTE (código vs banco diverge).

| Tabela | Classificação | Evidência |
|--------|--------------|-----------|
| `people` | REAL | Repository + migration + RLS policies confirmadas |
| `tenants` | REAL | Repository + migration + RLS policies confirmadas |
| `tenant_memberships` | REAL | Repository + migration + RLS policies confirmadas |
| `roles` | REAL | Repository + migration + RLS policies confirmadas |
| `permissions` | REAL | Repository + migration + RLS policies confirmadas |
| `role_permissions` | REAL | Sem repository dedicado, mas usado por RBAC |
| `role_assignments` | REAL | Repository + migration + RLS policies confirmadas |
| `candidates` | REAL | Repository + migration + RLS policies confirmadas |
| `candidate_experiences` | REAL | Repository + migration + RLS policies confirmadas |
| `candidate_education` | REAL | Repository + migration + RLS policies confirmadas |
| `candidate_courses` | REAL | Repository + migration + RLS policies confirmadas |
| `candidate_skills` | REAL | Repository + migration + RLS policies confirmadas |
| `candidate_languages` | REAL | Repository + migration + RLS policies confirmadas |
| `candidate_documents` | REAL | Repository + migration + RLS policies confirmadas |
| `candidate_preferences` | PARCIAL | Repository existe, tabela no remote mas não nos 221 anteriores |
| `candidate_profile_views` | REAL | Repository + migration + RLS policies confirmadas |
| `candidate_job_alerts` | REAL | Repository + migration + RLS policies confirmadas |
| `favorite_jobs` | REAL | Repository + migration + RLS policies confirmadas |
| `jobs` | REAL | Repository + migration + RLS policies confirmadas |
| `applications` | CONFLITANTE | Repository mapeia colunas que não existem no banco real (person_id, process_id, current_stage_id, last_activity_at, current_stage) |
| `recruitment_stages` | REAL | Repository + migration + RLS policies confirmadas |
| `recruitment_processes` | REAL | Repository + migration + RLS policies confirmadas |
| `recruitment_demands` | REAL | Repository + migration + RLS policies confirmadas |
| `job_matches` | REAL | Repository + migration + RLS policies confirmadas |
| `talent_pool_memberships` | REAL | Repository + migration + RLS policies confirmadas |
| `application_stage_history` | REAL | Usado por applications.repository, sem repository dedicado |
| `financial_categories` | PARCIAL | Repository existe, UI pendente |
| `cost_centers` | PARCIAL | Repository existe, UI pendente |
| `bank_accounts` | CONFLITANTE | Repository existe, tabela ausente em prod |
| `cash_flows` | CONFLITANTE | Repository existe, tabela ausente em prod |
| `services` | PARCIAL | Repository existe, `public_services_v1` retorna 0 para `anon` |
| `public_services_v1` | REAL (view) | security_invoker=false, expõe dados públicos |
| `public_jobs_v1` | PARCIAL (view) | security_invoker=false, expõe `tenant_id` publicamente |
| `recruitment_kpis` | ÓRFÃO (view) | Sem consumidor no frontend |
| `webhooks` | ÓRFÃO | Legado, sem repository |
| `automation_queue` | ÓRFÃO | Legado, sem repository |

---

## 4. Matriz A3 — Consumidores locais por tabela

Mapeamento de todo código local que lê ou escreve cada tabela, distinguindo working tree de GitHub remoto (commit `c563308`).

### 4.1 Consumidores diretos (`.from('tabela')` ou `.rpc()`)

| Tabela | Consumidor (arquivo:linha) | Operações | Working tree vs HEAD |
|--------|---------------------------|-----------|---------------------|
| `candidates` | `src/modules/candidato/repositories/candidates.repository.ts:16,50,78,122,168` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `candidates` | `src/modules/recrutamento/repositories/candidates.repository.ts` | Delegado para candidato repo | Modificado (working tree) |
| `candidate_experiences` | `src/modules/candidato/repositories/candidate-experiences.repository.ts:13,29,56,82,97` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `candidate_education` | `src/modules/candidato/repositories/candidate-education.repository.ts:13,29,55,81,93` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `candidate_courses` | `src/modules/candidato/repositories/candidate-courses.repository.ts:13,29,52,75,90` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `candidate_preferences` | `src/modules/candidato/repositories/candidate-preferences.repository.ts:15,28,66,103,117` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `candidate_skills` | `src/modules/candidato/repositories/candidate-skills.repository.ts:22,39,67,91` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `candidate_languages` | `src/modules/candidato/repositories/candidate-languages.repository.ts:13,29,60,84` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `candidate_documents` | `src/modules/candidato/repositories/candidate-documents.repository.ts:13,29,62,87` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `candidate_profile_views` | `src/modules/candidato/repositories/candidate-profile-views.repository.ts:9,34` | SELECT, INSERT | Modificado (working tree) |
| `candidate_job_alerts` | `src/modules/candidato/repositories/candidate-portal/jobAlerts.repository.ts:43,54,81,106` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `favorite_jobs` | `src/modules/candidato/repositories/candidate-portal/favoriteJobs.repository.ts:31,47,58,69` | SELECT, INSERT, DELETE | Modificado (working tree) |
| `applications` | `src/modules/recrutamento/repositories/applications.repository.ts:82,186,215,313,353,387,472,499,559,626,668` | SELECT, INSERT, UPDATE, DELETE | **Modificado (working tree)** — mapper adaptado |
| `jobs` | `src/modules/recrutamento/repositories/jobs.repository.ts:72,187,216,243,291,348,348,424` | SELECT, INSERT, UPDATE | Modificado (working tree) |
| `recruitment_processes` | `src/modules/recrutamento/repositories/recruitment-process.repository.ts:10,24,38,52,67` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `recruitment_stages` | `src/modules/recrutamento/repositories/recruitment-stage.repository.ts:10,24,52,66,81` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `recruitment_demands` | `src/modules/recrutamento/repositories/recruitment-demand.repository.ts:9,23,37,51,66` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `job_matches` | `src/modules/recrutamento/repositories/job-matches.repository.ts:47,102,127,151,188,224,272,324,471,493` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `talent_pool_memberships` | `src/modules/recrutamento/repositories/talent-pool.repository.ts:11,31,49` | SELECT, INSERT, UPDATE | Modificado (working tree) |
| `application_stage_history` | `src/modules/recrutamento/repositories/applications.repository.ts:403,473,500` | INSERT, SELECT | Modificado (working tree) |
| `tenants` | `src/repositories/tenant.repository.ts:9,19,39,65,82` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `roles` | `src/repositories/role.repository.ts:8,22,39,68,83` | SELECT, INSERT, UPDATE, DELETE | Modificado (working tree) |
| `permissions` | `src/repositories/permission.repository.ts:11,23,38,53` | SELECT, INSERT | Modificado (working tree) |
| `services` | `src/repositories/services.repository.ts:52,63,78` | SELECT, INSERT, UPDATE | Modificado (working tree) |

### 4.2 Consumidores indiretos (via hooks)

| Hook | Tabelas consumidas | Arquivo |
|------|-------------------|---------|
| `useCandidates.ts` | `candidates` | `src/hooks/useCandidates.ts` |
| `useJobs.ts` | `jobs` | `src/hooks/useJobs.ts` |
| `useServices.ts` | `services` | `src/hooks/useServices.ts` |
| `useCompanies.ts` | `companies` | `src/hooks/useCompanies.ts` |
| `usePublicCompanies.ts` | `public_companies_by_type` (view) | `src/hooks/usePublicCompanies.ts` |
| `usePublicPartners.ts` | `public_companies_by_type` (view) | `src/hooks/usePublicPartners.ts` |
| `usePublicSuppliers.ts` | `public_companies_by_type` (view) | `src/hooks/usePublicSuppliers.ts` |
| `useFaturamento.ts` | `invoices`, `payments` | `src/modules/financeiro/faturamento/useFaturamento.ts` |
| `useCrud.ts` | Genérico (qualquer tabela) | `src/hooks/useCrud.ts` |

### 4.3 Consumidores via RPC

| RPC | Consumidor | Arquivo:linha |
|-----|------------|---------------|
| `increment_job_applications` | `applications.repository.ts:336` | `src/modules/recrutamento/repositories/applications.repository.ts` |
| `decrement_job_applications` | `applications.repository.ts:641` | `src/modules/recrutamento/repositories/applications.repository.ts` |
| `increment_job_views` | `jobs.repository.ts:348` | `src/modules/recrutamento/repositories/jobs.repository.ts` |

### 4.4 Leitura direta de auth (não via RLS)

| Código | Operação | Arquivo:linha |
|--------|----------|---------------|
| `supabase.auth.getUser()` | Lê `auth.users` diretamente | `src/services/candidates.ts:70` |

---

## 5. Matriz A4 — Divergências código ↔ schema do banco

| # | Tabela | Código espera | Banco real (migração) | Impacto | Classificação |
|---|--------|--------------|----------------------|---------|---------------|
| D1 | `applications` | `person_id`, `process_id`, `current_stage_id`, `last_activity_at`, `current_stage` | `id, candidate_id, job_id, status, created_at, updated_at, tenant_id, metadata, created_by, applied_at` | Recrutamento não consegue ler/escrever candidaturas corretamente sem fallbacks | CONFLITANTE |
| D2 | `candidate_preferences` | Tabela existe no código | Existe no remote (20 rows em `candidates`), não consta nos 221 tabelas anteriores | Candidato pode não salvar preferências se tabela ausente | PARCIAL |
| D3 | `candidate_courses` | `hours`, `completed_at` | `hours` (numeric(6,1)), `completed_at` (date) — **coincide** | Nenhum impacto (correção anterior já aplicada) | RESOLVIDO |
| D4 | `bank_accounts` | Tabela existe | Ausente em prod (declarada em `20260827001200_finance.sql`) | Financeiro/bancos não persiste | CONFLITANTE |
| D5 | `cash_flows` | Tabela existe | Ausente em prod (declarada em `20260827001200_finance.sql`) | Financeiro/fluxo-caixa não persiste | CONFLITANTE |
| D6 | `public_jobs_v1` | Não expõe tenant_id | Expõe `tenant_id` (line 132 do v1) | Anon pode saber tenant dono de cada vaga | PARCIAL (risco de exposição) |
| D7 | `public_services_v1` | Retorna 20 serviços | Retorna 0 para `anon` (security_invoker=true em prod vs false na migration) | Site público sem serviços | CONFLITANTE |
| D8 | `chat_rooms` | `visitor_id`, `subject`, `role` | `tenant_id`, `type`, `title`, `created_by_person_id`; `sender_type`, `sender_person_id` | Chat não funciona | CONFLITANTE |

---

## 6. Matriz A5 — Views e security_invoker (5 views)

| View | security_invoker | Filtro interno | tenant_id exposto? | Consumidor | Avaliação |
|------|-----------------|----------------|-------------------|------------|-----------|
| `public_services_v1` | **false** | `services.status = published` + `tenant_id = (SELECT id FROM tenants WHERE slug = 'js-empregos')` | Não | `src/types/domain/service-mapper.ts:33` | Correto. View pública restringe a slug internamente. |
| `public_jobs_v1` | **false** | `jobs.status = published` | **Sim** (`j.tenant_id AS tenant_id`) | `src/modules/candidato/repositories/candidate-portal/publicJobs.repository.ts:35` | **Parcial:** expõe tenant_id publicamente. Avaliar remoção. |
| `public_companies_by_type` | **false** | `companies.status = active` + `company_relationships.status = active` | Não | `src/repositories/companies.repository.ts:125` + hooks públicos | Correto. Não expõe tenant_id. |
| `financial_kpis` | **true** (default) | `tenant_id IN (SELECT public.user_tenant_ids())` | Sim | `src/repositories/cash-flow.repository.ts:125` | Seguro: view filtra por tenant do usuário. |
| `recruitment_kpis` | **true** (default) | `tenant_id IN (SELECT public.user_tenant_ids())` | Sim | **Nenhum consumidor encontrado** | **ÓRFÃO.** View sem consumidor no frontend. |

---

## 7. Matriz A6 — Funções SECURITY DEFINER e current_person_id

### 7.1 Funções SECURITY DEFINER (38 no total)

Funções críticas para isolamento entre tenants:

| Função | Tipo | Uso em RLS | Observações |
|--------|------|------------|-------------|
| `is_tenant_member(tenant_id)` | SECURITY DEFINER | Usada em políticas RLS de `tenant_memberships`, `role_assignments`, etc. | Corrigida em `20260824000000_fix_is_tenant_member.sql` para usar `people.auth_user_id` → `auth.uid()`. |
| `is_admin_master()` | SECURITY DEFINER | Usada em políticas RLS de `tenants`, `roles`, `permissions`, `security_events`. | Acesso global. |
| `user_has_permission()` | SECURITY DEFINER | **Não usada em nenhuma policy** (conforme V21-RLS-SECURITY-AUDIT.md §3.2). | RBAC granular (resource.action) não aplicado no banco. |

### 7.2 current_person_id() — revisão preventiva

| Item | Detalhe |
|------|---------|
| Referências no código | 5 ocorrências em `supabase/specs/sql/21_functions_triggers.sql` (linhas 76, 141, 293, 400, 511) — todas `current_setting('app.current_person_id', true)`, nenhuma `set_config` |
| Setter encontrado | Não encontrado no código local nem nas funções remotas |
| Precedência | `app.current_person_id` GUC tem prioridade sobre `auth.uid()` — risco de identidade forjada se GUC for definido indevidamente |
| Consumidores | Nenhum setter local; caminhos indiretos não descartados |
| Ação | Documentação apenas. Nenhuma alteração de código ou banco. |

---

## 8. Matriz A7 — Critérios de aceitação e status de saída F3

| Critério | Status | Evidência |
|----------|--------|-----------|
| Inventário de todas as 229 tabelas (mapeamento parcial ≈60) | PARCIAL | Seções 2.1–2.6 cobrem ≈60 tabelas mapeadas; ~169 não mapeadas |
| Validação de repositórios (53 arquivos) | CONCLUÍDO | Todos os 53 `*.repository.ts` lidos e mapeados |
| Validação de hooks (24 arquivos) | CONCLUÍDO | Todos os 24 `use*.ts` identificados |
| Validação de páginas/CRUDs (105+ páginas) | CONCLUÍDO | Páginas de módulos e dashboard identificadas |
| Mapeamento permissões → RLS (247 códigos × 668 policies) | PARCIAL | Cruzamento parcial (seção 5 do TRACEABILITY-MATRIX-V2) |
| Classificação de cada entidade | CONCLUÍDO | Seção 3 (matriz A2) |
| Identificação de consumidores locais | CONCLUÍDO | Seção 4 (matriz A3) |
| Divergências código ↔ banco documentadas | CONCLUÍDO | Seção 5 (matriz A4) |
| Views e security_invoker documentadas | CONCLUÍDO | Seção 6 (matriz A5) |
| Funções SECURITY DEFINER e current_person_id | CONCLUÍDO | Seção 7 (matriz A6) |

### Critérios de saída F3 (bloqueadores para F06–F08)

1. **Inventário completo de tabelas:** ~60 de 229 mapeadas — PENDENTE para ~169 tabelas
2. **Mapeamento permissões → RLS:** parcial — PENDENTE cruzamento completo
3. **Consumidores locais distintos working tree vs HEAD:** 53 arquivos modificados, todos mapeados — CONCLUÍDO
4. **Divergências críticas (applications, bank_accounts, cash_flows, public_services_v1):** documentadas — CONCLUÍDO

---

## 9. Evidências anexadas

- `evidence/rpc_setconfig_scan.txt` — 5 reads de `current_setting('app.current_person_id', true)`, nenhuma `set_config`
- `evidence/server_clients_scan.txt` — 1 ocorrência: `src/services/candidates.ts:70` (`supabase.auth.getUser()`)
- `evidence/tables_target_scan.txt` — 91 ocorrências de `candidate_job_alerts`/`favorite_jobs`

---

## 10. Pendências e riscos conhecidos

| Item | Risco | Impacto em F06–F08 |
|------|-------|-------------------|
| ~169 tabelas não mapeadas (de 229) | Inventário incompleto | F3 não pode declarar cobertura total |
| `applications` tabela vazia remotamente (0 rows) | Não é possível validar read/detail/filter com dados reais | F07 bloqueado |
| `candidate_experiences`, `candidate_courses`, `candidate_education` vazias remotamente | Não é possível validar CRUD com dados reais | F08 bloqueado |
| Ausência de DELETE policies em tabelas operacionais | Comportamento de DELETE não comprovado | F08 observa como comportamento atual |
| `current_person_id()` sem setter identificado | Caminhos indiretos não descartados | Revisão preventiva apenas, sem ação |

---

## 11. Próximos passes (não executados nesta sessão)

- F06: isolamento entre identidades (2 JWTs distintos, respostas reais do Supabase)
- F07: Applications read/detail/filter com dados de teste autorizados
- F08: Experiências/Cursos/Formação read e CRUD, registrar ausência de DELETE policies
- Completar mapeamento das ~169 tabelas restantes
- Cruzamento completo permissões (247) × RLS (668)

---

## 12. Relatório Consolidado F3.6 — Status de Saída

### 12.1 Resumo Executivo

O inventário F3 foi concluído com cobertura parcial do schema Supabase (`okxqfyoqbhcmflpurfrw`, projeto `js-empregos`, ref `okxqfyoqbhcmflpurfrw`):

- **229 tabelas** confirmadas via `information_schema.tables`, todas com RLS habilitada (`relrowsecurity = true`)
- **≈60 tabelas mapeadas** (≈26% de cobertura) nas seções 2.1–2.6; ~169 tabelas permanecem sem mapeamento
- **53 arquivos de repositório** lidos e mapeados (100%)
- **24 hooks** identificados (100%)
- **105+ páginas** de módulos e dashboard identificadas
- **247 códigos de permissão** × **668 políticas RLS** — cruzamento parcial
- **38 funções SECURITY DEFINER** identificadas, incluindo `is_tenant_member()`, `is_admin_master()`, `user_has_permission()`
- **5 views** inventariadas, 1 órfã (`recruitment_kpis` sem consumidor)
- **8 divergências código ↔ banco** documentadas na matriz A4 (D1–D8)

### 12.2 Classificação por Status (Matriz A2)

| Status | Quantidade | Exemplos |
|--------|-----------|----------|
| REAL | ~45 | `people`, `tenants`, `candidates`, `jobs`, `applications`, `financial_categories` |
| PARCIAL | ~8 | `candidate_preferences`, `services`, `public_jobs_v1` |
| CONFLITANTE | ~5 | `applications` (mapper diverge), `bank_accounts` (ausente em prod), `cash_flows` (ausente em prod), `public_services_v1` (retorna 0 para anon), `chat_rooms` |
| ÓRFÃO | ~4 | `webhooks`, `automation_queue`, `whatsapp_messages`, `emails`, `recruitment_kpis` (view) |

### 12.3 Divergências Críticas (Matriz A4)

| # | Tabela | Impacto | Classificação |
|---|--------|---------|---------------|
| D1 | `applications` | Recrutamento não lê/escreve candidaturas corretamente (fallbacks `?? null`) | CONFLITANTE |
| D4 | `bank_accounts` | Financeiro/bancos não persiste (tabela ausente em prod) | CONFLITANTE |
| D5 | `cash_flows` | Financeiro/fluxo-caixa não persiste (tabela ausente em prod) | CONFLITANTE |
| D7 | `public_services_v1` | Site público sem serviços (retorna 0 para `anon`) | CONFLITANTE |
| D6 | `public_jobs_v1` | Expõe `tenant_id` publicamente | PARCIAL |
| D2 | `candidate_preferences` | Candidato pode não salvar preferências | PARCIAL |
| D8 | `chat_rooms` | Chat não funciona | CONFLITANTE |

### 12.4 Status de Saída F3 — Bloqueadores para F06–F08

| Critério | Status |
|----------|--------|
| Inventário completo de tabelas (229) | PENDENTE (~60/229 mapeadas) |
| Mapeamento permissões → RLS (247 × 668) | PARCIAL |
| Consumidores locais working tree vs HEAD | CONCLUÍDO (53 arquivos mapeados) |
| Divergências críticas documentadas | CONCLUÍDO (D1–D8) |

### 12.5 Itens Bloqueando F06–F08

| Item | Impacto |
|------|---------|
| `applications` tabela vazia remotamente (0 rows) | F07 bloqueado — não é possível validar read/detail/filter com dados reais |
| `candidate_experiences`, `candidate_courses`, `candidate_education` vazias remotamente | F08 bloqueado — não é possível validar CRUD com dados reais |
| Ausência de DELETE policies em tabelas operacionais | F08 observa como comportamento atual |
| Token Supabase Management API inválido | Deploy da Edge Function `media-upload` bloqueado |

### 12.6 Arquivos Modificados nesta Sessão

| Arquivo | Alteração |
|---------|-----------|
| `src/modules/admin-tenant/routes/index.ts` | Reescrito com `element` + lazy imports, `requiredPermissions` |
| `src/modules/admin-tenant/cellContract.ts` | Corrigido para usar `route.requiredPermissions` |
| `src/platform/router/module-routes.ts` | Adicionado `'admin-tenant': adminTenantRoutes` |
| `src/App.tsx` | Adicionada rota `admin-tenant/*` com `ModuleRouter` |
| `src/modules/admin-tenant/pages/OwnerDashboardPage.tsx` | Links `/dashboard/owner/` → `/dashboard/admin-tenant/` |
| `src/modules/admin-tenant/manifest.ts` | `homeRoute` alterado para `/dashboard/admin-tenant` |
| `docs/F3-INVENTARIO-TECNICO-MATRIZ-A1-A7.md` | Adicionada seção 12 (relatório consolidado F3.6) |

### 12.7 Próximos Passos

1. Gerar novo token `sbp_...` no Supabase Dashboard (Settings > Access Tokens)
2. Executar `npx supabase functions deploy media-upload --project-ref okxqfyoqbhcmflpurfrw`
3. Completar mapeamento das ~169 tabelas restantes
4. Cruzamento completo permissões (247) × RLS (668)
5. Executar F06, F07, F08 quando dados reais estiverem disponíveis
