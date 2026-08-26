# C14 — DATABASE × UI MATRIX

## Objetivo

Mapear cada tabela do schema canônico V2.1/V2.2 para sua respectiva camada frontend:
repositório, hook, página, rota, módulo e permissão.

## Como ler esta matriz

- **Status**: `CONNECTED` = frontend já consulta; `MISSING_PAGE` = sem página; `MISSING_REPOSITORY` = sem repo; `ORPHAN_REPOSITORY` = repo sem tabela; `UNDER_CONSTRUCTION` = página placeholder.
- **Prioridade**: ordem sugerida de implementação.

---

## 1. IDENTIDADE / CORE

| Tabela             | Domínio | Tenant Scoped | PK  | FKs                  | Campos principais        | Status UI | Repository       | Página                      | Rota                                      | Módulo              | Permission   | Status | Prioridade |
| ------------------ | ------- | ------------- | --- | -------------------- | ------------------------ | --------- | ---------------- | --------------------------- | ----------------------------------------- | ------------------- | ------------ | ------ | ---------- |
| tenants            | core    | global        | id  | —                    | name, slug, plan, status | CONNECTED | —                | TenantsPage, OnboardingPage | /dashboard/tenants, /dashboard/onboarding | tenants, onboarding | tenants.read | OK     | 1          |
| people             | core    | global        | id  | auth_user_id         | full_name, email, status | CONNECTED | users.repository | RhPage, UsuariosPage        | /dashboard/rh, /dashboard/usuarios        | rh, usuarios        | people.read  | OK     | 1          |
| tenant_memberships | core    | tenant        | id  | tenant_id, person_id | membership_role, status  | CONNECTED | —                | (interno AuthContext)       | —                                         | —                   | tenant.read  | OK     | 1          |

## 2. CRM / EMPRESAS

| Tabela                     | Domínio | Tenant Scoped | PK  | FKs                                         | Campos principais                      | Status UI    | Repository                     | Página                     | Rota                                     | Módulo             | Permission     | Status | Prioridade |
| -------------------------- | ------- | ------------- | --- | ------------------------------------------- | -------------------------------------- | ------------ | ------------------------------ | -------------------------- | ---------------------------------------- | ------------------ | -------------- | ------ | ---------- |
| companies                  | crm     | global        | id  | company_type_id, created_by                 | legal_name, trading_name, cnpj, status | CONNECTED    | companies.repository           | ClientesPage, EmpresasPage | /dashboard/clientes, /dashboard/empresas | clientes, empresas | companies.read | OK     | 1          |
| company_types              | crm     | global        | id  | —                                           | code, name                             | MISSING_PAGE | —                              | —                          | —                                        | —                  | —              | GAP    | 3          |
| company_relationship_types | crm     | global        | id  | —                                           | code, name                             | MISSING_PAGE | —                              | —                          | —                                        | —                  | —              | GAP    | 3          |
| company_relationships      | crm     | tenant        | id  | company_id, tenant_id, relationship_type_id | status, started_at, ended_at           | MISSING_PAGE | companies.repository (parcial) | —                          | —                                        | —                  | companies.read | GAP    | 2          |
| company_contacts           | crm     | tenant        | id  | company_id, person_id, tenant_id            | role, is_primary                       | MISSING_PAGE | companies.repository (parcial) | —                          | —                                        | —                  | companies.read | GAP    | 3          |

## 3. RECRUTAMENTO / RH

| Tabela                        | Domínio     | Tenant Scoped | PK  | FKs                                       | Campos principais                     | Status UI    | Repository                                 | Página                 | Rota                           | Módulo              | Permission               | Status | Prioridade |
| ----------------------------- | ----------- | ------------- | --- | ----------------------------------------- | ------------------------------------- | ------------ | ------------------------------------------ | ---------------------- | ------------------------------ | ------------------- | ------------------------ | ------ | ---------- |
| candidates                    | recruitment | tenant        | id  | person_id, tenant_id                      | headline, status, source              | CONNECTED    | candidates.repository                      | CandidatosPage         | /dashboard/candidatos          | candidatos          | candidates.read          | OK     | 1          |
| candidate_skills              | recruitment | tenant        | id  | candidate_id, skill_id                    | proficiency, years_experience         | MISSING_PAGE | candidates.repository (parcial)            | —                      | —                              | —                   | candidates.read          | GAP    | 3          |
| candidate_preferences         | recruitment | tenant        | id  | candidate_id                              | desired_roles, salary_min, work_modes | MISSING_PAGE | —                                          | —                      | —                              | —                   | candidates.read          | GAP    | 4          |
| candidate_profile_views       | recruitment | tenant        | id  | candidate_id, tenant_id, viewer_person_id | source, viewed_at                     | MISSING_PAGE | —                                          | —                      | —                              | —                   | candidates.read          | GAP    | 4          |
| skills                        | recruitment | global        | id  | —                                         | code, name, category                  | MISSING_PAGE | —                                          | —                      | —                              | —                   | skills.read (não existe) | GAP    | 3          |
| jobs                          | recruitment | tenant        | id  | tenant_id, company_relationship_id        | title, status, work_mode, salary_min  | CONNECTED    | jobs.repository                            | VagasPage              | /dashboard/vagas               | vagas               | jobs.read                | OK     | 1          |
| job_skills                    | recruitment | tenant        | id  | job_id, skill_id                          | required_level, is_required           | CONNECTED    | jobs.repository (parcial)                  | —                      | —                              | —                   | jobs.read                | OK     | 2          |
| job_matches                   | recruitment | tenant        | id  | candidate_id, job_id, tenant_id           | score, reasons, is_eligible           | MISSING_PAGE | —                                          | —                      | —                              | —                   | jobs.read                | GAP    | 3          |
| applications                  | recruitment | tenant        | id  | tenant_id, job_id, candidate_id           | current_stage, applied_at, notes      | CONNECTED    | recruitment-processes.repository           | ProcessosSeletivosPage | /dashboard/processos-seletivos | processos-seletivos | applications.read        | OK     | 1          |
| application_status_history    | recruitment | tenant        | id  | application_id                            | stage, previous_stage, changed_at     | CONNECTED    | recruitment-processes.repository (parcial) | —                      | —                              | —                   | applications.read        | OK     | 2          |
| application_profile_snapshots | recruitment | tenant        | id  | application_id                            | snapshot_data, captured_at            | CONNECTED    | recruitment-processes.repository (parcial) | —                      | —                              | —                   | applications.read        | OK     | 2          |
| talent_pool_memberships       | recruitment | tenant        | id  | candidate_id, tenant_id                   | status, source, consent_status        | MISSING_PAGE | —                                          | —                      | —                              | —                   | talent_pool.read         | GAP    | 3          |

## 4. RBAC / SEGURANÇA

| Tabela                    | Domínio | Tenant Scoped | PK  | FKs                           | Campos principais            | Status UI    | Repository | Página                             | Rota                                              | Módulo                      | Permission   | Status | Prioridade |
| ------------------------- | ------- | ------------- | --- | ----------------------------- | ---------------------------- | ------------ | ---------- | ---------------------------------- | ------------------------------------------------- | --------------------------- | ------------ | ------ | ---------- |
| roles                     | rbac    | global        | id  | —                             | name, is_global, description | CONNECTED    | —          | RolesPermissoesPage, SegurancaPage | /dashboard/roles-permissoes, /dashboard/seguranca | roles-permissoes, seguranca | roles.read   | OK     | 1          |
| permissions               | rbac    | global        | id  | —                             | name, module, description    | CONNECTED    | —          | RolesPermissoesPage                | /dashboard/roles-permissoes                       | roles-permissoes            | roles.read   | OK     | 1          |
| role_permissions          | rbac    | global        | id  | role_id, permission_id        | granted_at, granted_by       | CONNECTED    | —          | RolesPermissoesPage                | /dashboard/roles-permissoes                       | roles-permissoes            | roles.read   | OK     | 2          |
| role_assignments          | rbac    | global        | id  | person_id, role_id, tenant_id | assigned_at, expires_at      | MISSING_PAGE | —          | —                                  | —                                                 | —                           | roles.manage | GAP    | 3          |
| role_resource_permissions | rbac    | global        | id  | role_id                       | resource, action, allowed    | MISSING_PAGE | —          | —                                  | —                                                 | —                           | roles.manage | GAP    | 3          |

## 5. STORAGE / DOCUMENTOS

| Tabela           | Domínio | Tenant Scoped | PK  | FKs                        | Campos principais                       | Status UI    | Repository | Página         | Rota                  | Módulo     | Permission | Status | Prioridade |
| ---------------- | ------- | ------------- | --- | -------------------------- | --------------------------------------- | ------------ | ---------- | -------------- | --------------------- | ---------- | ---------- | ------ | ---------- |
| files            | storage | tenant        | id  | tenant_id, owner_person_id | provider, bucket, object_key, mime_type | CONNECTED    | —          | DocumentosPage | /dashboard/documentos | documentos | files.read | OK     | 1          |
| file_access_logs | storage | tenant        | id  | file_id, person_id         | access_type, ip_address, status         | MISSING_PAGE | —          | —              | —                     | —          | audit.read | GAP    | 4          |

## 6. EVENTOS / AUDITORIA

| Tabela        | Domínio | Tenant Scoped | PK  | FKs                        | Campos principais                | Status UI | Repository | Página                                       | Rota                                         | Módulo                 | Permission                     | Status | Prioridade |
| ------------- | ------- | ------------- | --- | -------------------------- | -------------------------------- | --------- | ---------- | -------------------------------------------- | -------------------------------------------- | ---------------------- | ------------------------------ | ------ | ---------- |
| domain_events | audit   | tenant        | id  | tenant_id, actor_person_id | event_name, payload, occurred_at | CONNECTED | —          | AuditoriaPage, GestaoSaaSPage, DashboardHome | /dashboard/auditoria, /dashboard/gestao-saas | auditoria, gestao-saas | audit.read, domain_events.read | OK     | 1          |

## 7. NOTIFICAÇÕES

| Tabela                   | Domínio       | Tenant Scoped | PK  | FKs                            | Campos principais                   | Status UI    | Repository | Página | Rota | Módulo | Permission         | Status | Prioridade |
| ------------------------ | ------------- | ------------- | --- | ------------------------------ | ----------------------------------- | ------------ | ---------- | ------ | ---- | ------ | ------------------ | ------ | ---------- |
| notifications            | notifications | tenant        | id  | tenant_id, recipient_person_id | notification_type, title, status    | MISSING_PAGE | —          | —      | —    | —      | notifications.read | GAP    | 2          |
| notification_deliveries  | notifications | tenant        | id  | notification_id                | channel, status, provider           | MISSING_PAGE | —          | —      | —    | —      | notifications.read | GAP    | 3          |
| notification_preferences | notifications | tenant        | id  | person_id                      | notification_type, channel, enabled | MISSING_PAGE | —          | —      | —    | —      | notifications.read | GAP    | 3          |

## 8. FIRST ACCESS / LEGAL

| Tabela            | Domínio | Tenant Scoped | PK        | FKs                  | Campos principais                                         | Status UI | Repository | Página                          | Rota                               | Módulo       | Permission     | Status | Prioridade |
| ----------------- | ------- | ------------- | --------- | -------------------- | --------------------------------------------------------- | --------- | ---------- | ------------------------------- | ---------------------------------- | ------------ | -------------- | ------ | ---------- |
| first_login_state | auth    | tenant        | person_id | —                    | must_change_password, terms_version, welcome_completed_at | CONNECTED | —          | (interno AuthRoute/AuthWelcome) | —                                  | —            | —              | OK     | 1          |
| legal_acceptances | auth    | tenant        | id        | person_id, tenant_id | document_type, document_version, accepted_at              | CONNECTED | —          | TermosPage, LgpdPage            | /dashboard/termos, /dashboard/lgpd | termos, lgpd | documents.read | OK     | 1          |

## 9. CHAT (LEGACY)

| Tabela        | Domínio | Tenant Scoped | PK  | FKs                    | Campos principais         | Status UI | Repository | Página               | Rota | Módulo | Permission   | Status | Prioridade |
| ------------- | ------- | ------------- | --- | ---------------------- | ------------------------- | --------- | ---------- | -------------------- | ---- | ------ | ------------ | ------ | ---------- |
| chat_rooms    | chat    | tenant        | id  | tenant_id, assigned_to | visitor_id, status, area  | CONNECTED | —          | (interno ChatWidget) | —    | —      | support.read | OK     | 2          |
| chat_messages | chat    | tenant        | id  | tenant_id, room_id     | role, content, created_at | CONNECTED | —          | (interno ChatWidget) | —    | —      | support.read | OK     | 2          |

---

## 2. REPOSITORIES ÓRFÃOS

| Repository             | Tabela referenciada    | Tabela existe? | Ação                                 | Prioridade |
| ---------------------- | ---------------------- | -------------- | ------------------------------------ | ---------- |
| financial-transactions | financial_transactions | NÃO            | Remover                              | 1          |
| leads                  | leads                  | NÃO            | Remover                              | 1          |
| partners               | partners               | NÃO            | Reapontar para company_relationships | 1          |
| reports                | reports                | NÃO            | Remover                              | 1          |
| service-catalog        | service_catalog        | NÃO            | Remover                              | 1          |
| services               | services               | NÃO            | Remover                              | 1          |
| settings               | settings               | NÃO            | Remover                              | 1          |
| stock-movements        | stock_movements        | NÃO            | Remover                              | 1          |
| suppliers              | suppliers              | NÃO            | Reapontar para company_relationships | 1          |
| support-tickets        | support_tickets        | NÃO            | Remover                              | 1          |

---

## 3. PÁGINAS UNDER CONSTRUCTION (SEM DADOS REAIS)

| Página            | Tabela necessária       | Existe? | Ação                              | Prioridade |
| ----------------- | ----------------------- | ------- | --------------------------------- | ---------- |
| Financeiro        | finance.*               | NÃO     | Remover módulo ou aguardar schema | 2          |
| Fiscal            | fiscal.*                | NÃO     | Remover módulo ou aguardar schema | 2          |
| Contabilidade     | accounting.*            | NÃO     | Remover módulo ou aguardar schema | 2          |
| Servicos          | services                | NÃO     | Remover módulo ou aguardar schema | 2          |
| Estoque           | stock_movements         | NÃO     | Remover módulo ou aguardar schema | 2          |
| Suporte           | support_tickets         | NÃO     | Remover módulo ou aguardar schema | 2          |
| Relatorios        | reports                 | NÃO     | Remover módulo ou aguardar schema | 2          |
| Configuracoes     | settings                | NÃO     | Remover módulo ou aguardar schema | 2          |
| IaPage            | ia.*                    | NÃO     | Remover módulo                    | 2          |
| IntegracoesPage   | integrations.*          | NÃO     | Remover módulo                    | 2          |
| MonitoramentoPage | monitoring.*            | NÃO     | Remover módulo                    | 2          |
| CatalogoPage      | service_catalog/modules | NÃO     | Remover módulo                    | 2          |
| ContratosPage     | contracts               | NÃO     | Remover módulo                    | 2          |
| AssinaturasPage   | subscriptions           | NÃO     | Remover módulo                    | 2          |

---

## 4. QUERIES COM ERRO 400 CONHECIDAS

| Página/Componente | Query                | Erro | Causa provável                             | Ação           | Prioridade |
| ----------------- | -------------------- | ---- | ------------------------------------------ | -------------- | ---------- |
| DashboardHome     | companies count      | 400  | RLS ou coluna ausente                      | Investigar     | 1          |
| DashboardHome     | permissions count    | 400  | permissions não tem tenant_id              | Corrigir query | 1          |
| DocumentosPage    | files select         | 400  | Coluna tenant_id pode não existir na query | Corrigir query | 1          |
| AuditoriaPage     | domain_events select | 400  | RLS ou tenant_id                           | Investigar     | 1          |

---

## 5. MATRIZ MÓDULO → TABELA → PERMISSÃO

| Módulo             | Tabela(s)                            | Permission(s)              | Status           |
| ------------------ | ------------------------------------ | -------------------------- | ---------------- |
| inicio             | —                                    | —                          | OK               |
| tenants            | tenants                              | tenants.read               | OK               |
| clientes           | companies, company_relationships     | companies.read             | OK               |
| onboarding         | tenants                              | tenants.read               | OK               |
| assinaturas        | —                                    | finance.read               | GAP (sem tabela) |
| gestao-saas        | domain_events                        | domain_events.read         | OK               |
| usuarios           | people                               | people.read                | OK               |
| roles-permissoes   | roles, permissions, role_permissions | roles.read                 | OK               |
| auditoria          | domain_events                        | audit.read                 | OK               |
| documentos         | files                                | files.read                 | OK               |
| contratos          | —                                    | contracts.read             | GAP (sem tabela) |
| termos             | legal_acceptances                    | documents.read             | OK               |
| rh                 | people                               | people.read                | OK               |
| recrutamento       | jobs, candidates, applications       | jobs.read, candidates.read | OK               |
| financeiro         | —                                    | finance.dashboard.read     | GAP (sem tabela) |
| fiscal             | —                                    | fiscal.dashboard.read      | GAP (sem tabela) |
| contabilidade      | —                                    | accounting.dashboard.read  | GAP (sem tabela) |
| gestao             | companies, people, jobs              | companies.read             | OK               |
| estoque            | —                                    | stock_movements.read       | GAP (sem tabela) |
| servicos           | —                                    | —                          | GAP (sem tabela) |
| suporte            | —                                    | support_tickets.read       | GAP (sem tabela) |
| relatorios         | —                                    | domain_events.read         | OK (parcial)     |
| ia                 | —                                    | —                          | GAP              |
| configuracoes-saas | —                                    | tenant.manage              | OK (parcial)     |
| integracoes        | —                                    | integrations.manage        | GAP              |
| preferencias       | —                                    | —                          | GAP              |
| minha-conta        | —                                    | —                          | OK               |
| seguranca-conta    | —                                    | —                          | OK               |

---

## 6. ENTIDADES SEM PÁGINA (PRECISAM SER CRIADAS)

| Entidade                    | Tabela                        | Domínio       | Repository existente             | Página sugerida             | Prioridade |
| --------------------------- | ----------------------------- | ------------- | -------------------------------- | --------------------------- | ---------- |
| Relacionamentos comerciais  | company_relationships         | CRM           | companies.repository             | CompanyRelationshipsPage    | 2          |
| Contatos de empresas        | company_contacts              | CRM           | companies.repository             | CompanyContactsPage         | 3          |
| Habilidades                 | skills                        | Recruitment   | —                                | SkillsPage                  | 3          |
| Skills de candidato         | candidate_skills              | Recruitment   | candidates.repository            | CandidateSkillsPage         | 3          |
| Preferências de candidato   | candidate_preferences         | Recruitment   | —                                | CandidatePreferencesPage    | 4          |
| Visualizações de perfil     | candidate_profile_views       | Recruitment   | —                                | CandidateProfileViewsPage   | 4          |
| Matching vaga-candidato     | job_matches                   | Recruitment   | —                                | JobMatchesPage              | 3          |
| Banco de talentos           | talent_pool_memberships       | Recruitment   | —                                | TalentPoolPage              | 3          |
| Histórico de status         | application_status_history    | Recruitment   | recruitment-processes.repository | ApplicationDetailPage       | 2          |
| Snapshots de perfil         | application_profile_snapshots | Recruitment   | recruitment-processes.repository | ApplicationDetailPage       | 2          |
| Notificações                | notifications                 | Notifications | —                                | NotificationsPage           | 2          |
| Entregas de notificação     | notification_deliveries       | Notifications | —                                | NotificationDeliveriesPage  | 3          |
| Preferências de notificação | notification_preferences      | Notifications | —                                | NotificationPreferencesPage | 3          |
| Logs de acesso a arquivos   | file_access_logs              | Storage       | —                                | FileAccessLogsPage          | 4          |
| Atribuições de role         | role_assignments              | RBAC          | —                                | RoleAssignmentsPage         | 3          |
| Matriz RBAC                 | role_resource_permissions     | RBAC          | —                                | RbacMatrixPage              | 3          |

---

## 7. GAPS CRÍTICOS

1. **10 repositories órfãos** referenciam tabelas que não existem.
2. **8 páginas "under construction"** sem dados reais.
3. **16 entidades sem página** no frontend.
4. **4 queries com HTTP 400** conhecidas.
5. **ModuleRegistry contém módulos sem tabela correspondente** (financeiro, fiscal, contabilidade, estoque, suporte, servicos, relatorios, configuracoes).
6. **Permissões referenciam módulos sem implementação** (finance.dashboard.read, fiscal.dashboard.read, accounting.dashboard.read, stock_movements.read, support_tickets.read).

---

## 8. ORDEM DE CORREÇÃO/IMPLEMENTAÇÃO

### Fase 1 — Reconciliação (sem novas telas)

1. Remover repositories órfãos
2. Corrigir queries 400
3. Remover módulos inexistentes do ModuleRegistry
4. Corrigir permissões órfãs

### Fase 2 — Páginas essenciais

5. ApplicationDetailPage
6. CompanyRelationshipsPage
7. SkillsPage
8. NotificationsPage
9. CandidateSkillsPage

### Fase 3 — Dashboard Enterprise

10. Implementar data layer (hooks/services)
11. Refinar DashboardHome
12. Gráficos reais
13. Atividade recente real

### Fase 4 — Módulos restantes

14. Implementar páginas faltantes restantes
15. Formulários dinâmicos
16. Relatórios
