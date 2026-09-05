# Auditoria Master de Completude — Fase 4: MATRIZ DOMÍNIO × TABELA × CRUD × REPO × HOOK × PÁGINA × ROLE

**Data:** 2026-09-03
**Inputs:** `audit-master-db.md` (215 tabelas), `audit-master-frontend.md` (gerado por agent), `audit-master-candidate-e2e.md` (este repo), grep de rotas/hooks/repos.

---

## Legenda

- 🟢 OK contrato bate, dados fluem
- 🟡 Parcial (UI ok, mas DB vazio ou mock ativo)
- 🔴 Backend pronto, sem UI / tela quebrada
- 🔵 UI pronta, sem backend
- ⚠️ Quebrado (dessincronia schema↔tipo / RLS leak / tela preta)
- ⚪ Não precisa / não se aplica

---

## 1. Domínios × Tabelas × Status de cobertura

### 1.1 IDENTIDADE & AUTH

| Tabela               | RLS                | Policies                      | FKs                      | Frontend                            | Status            |
| -------------------- | ------------------ | ----------------------------- | ------------------------ | ----------------------------------- | ----------------- |
| `auth.users`         | (Supabase)         | (Supabase)                    | —                        | `useAuth`, `AuthContext`            | 🟢                |
| `people`             | 🟢                 | `people_member_read`          | n/a (sem FKs explícitas) | `usersRepository.findAll/ById`      | 🟢                |
| `tenant_memberships` | 🟢                 | `tenant_memberships_member_*` | n/a                      | `AuthContext` (carrega memberships) | 🟢                |
| `role_assignments`   | 🟢                 | `role_assignments_member_*`   | n/a                      | `AuthContext`                       | 🟢                |
| `roles`              | n/a (sem RLS? ver) | —                             | —                        | `useRoleList` (auth)                | 🟢                |
| `permissions`        | n/a                | —                             | —                        | `usePermissionList`                 | 🟢                |
| `legal_acceptances`  | 🟢                 | implícito                     | `people`                 | `AuthContext`                       | 🟢                |
| `legal_documents`    | 🟢                 | implícito                     | n/a                      | —                                   | ⚪ (auto-managed) |
| `first_login_states` | 🟢                 | implícito                     | `people`                 | `AuthContext.firstLoginState`       | 🟢                |

### 1.2 CANDIDATOS (domínio principal)

| Tabela                    | RLS            | Linhas          | Repo                                 | Hook            | Páginas                                                                          | Status                                  |
| ------------------------- | -------------- | --------------- | ------------------------------------ | --------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| `candidates`              | 🟢             | 8 (4 com login) | `candidatesRepository`               | `useCandidates` | `DashboardCandidato` ⚠️, `CandidatosPage`, `CandidatoDetalhe`, `BancoDeTalentos` | ⚠️ (3 desalinhamentos schema↔tipo)      |
| `candidate_skills`        | 🟢             | 0 (provável)    | `candidate-skills.repository`        | —               | `CandidatoHabilidades`                                                           | 🔴 DB sem dados; sem hook; sem feedback |
| `candidate_experiences`   | 🟢             | 0 (provável)    | `candidate-experiences.repository`   | —               | `CandidatoExperiencias`                                                          | 🔴 mesmo                                |
| `candidate_education`     | 🟢             | 0               | `candidate-education.repository`     | —               | `CandidatoFormacao`                                                              | 🔴 mesmo                                |
| `candidate_courses`       | 🟢             | 0               | `candidate-courses.repository`       | —               | (sem página dedicada)                                                            | 🔴                                      |
| `candidate_languages`     | 🟢             | 0               | `candidate-languages.repository`     | —               | `CandidatoIdiomas`                                                               | 🔴                                      |
| `candidate_documents`     | 🟢             | 0               | `candidate-documents.repository`     | —               | `CandidatoDocumentos`                                                            | 🔴 storage path vazio, sem upload       |
| `candidate_profile_views` | 🟢             | 0               | `candidate-profile-views.repository` | —               | `CandidatoVisualizacoes`                                                         | 🔴                                      |
| `candidate_preferences`   | **NÃO EXISTE** | —               | (frontend referencia)                | —               | `CandidatoPreferencias`                                                          | ⚠️ schema gap                           |
| `talent_pool_memberships` | 🟢             | 0               | `talent-pool.repository`             | —               | `BancoDeTalentos`                                                                | 🟡                                      |

**Achei Fase 4.2:**

- `candidatesRepository.findAll(tenantId)` carrega TODOS + filtra client-side → causa plausível de tela preta por payload/spinner.
- `DashboardCandidato` chama `applicationsRepository.findAll(tenantId, { search: person.id })` mas `findAll` não filtra por `search` no `candidate` join; filtra `notes.ilike / job.title.ilike`. Person.id é UUID; nunca bate → lista sempre vazia.
- `exp.position` / `exp.company` lidos mas DB tem `role` / `company_name`.
- `applications.status` (DB) vs `current_stage` (frontend).

### 1.3 EMPRESA / RELACIONAMENTO

| Tabela                    | RLS                         | Linhas     | Repo                  | Hook                                                           | Páginas                                                                                            | Status            |
| ------------------------- | --------------------------- | ---------- | --------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------- |
| `companies`               | 🟢                          | 30+        | `companiesRepository` | `useCompaniesPublic`, `useCompanyPublic`, `useCompaniesByType` | `Clientes` 🟢, `Parceiros` 🟢, `Fornecedores` 🟢, `Empresas` (público), `EmpresasPage` (dashboard) | 🟢 (Bloco 8/9 ok) |
| `company_relationships`   | 🟢                          | n          | (usado por jobs view) | —                                                              | `CompanyRelationshipsPage`                                                                         | 🟢                |
| `company_social_links`    | 🟢                          | n          | (join em companies)   | —                                                              | —                                                                                                  | 🟢                |
| `media_assets`            | 🟢                          | 4+ (logos) | (join em companies)   | —                                                              | `SafeImage` (fallback)                                                                             | 🟢 (Bloco 8.1)    |
| `suppliers` (view/filtro) | via `company_relationships` | n          | `suppliersRepository` | `useSuppliers`                                                 | `Fornecedores` (dashboard)                                                                         | 🟡                |

### 1.4 VAGAS

| Tabela                  | RLS                       | Linhas | Repo             | Hook                                                          | Páginas                                                             | Status       |
| ----------------------- | ------------------------- | ------ | ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- | ------------ |
| `jobs`                  | 🟢 (público p/ published) | 20     | `jobsRepository` | `useJobs`, `usePublicJobsAsVagas`, `usePublicJobBySlugAsVaga` | `Vagas` 🟢, `VagaDetalhe` 🟢, `VagasPage` (dashboard), `JobMatches` | 🟢 (Bloco 9) |
| `public_jobs_v1` (view) | via `jobs`                | 19     | mesma            | mesma                                                         | mesma                                                               | 🟢           |

### 1.5 RECRUTAMENTO

| Tabela                       | RLS | Linhas | Repo                                     | Hook | Páginas                                                              | Status                                                 |
| ---------------------------- | --- | ------ | ---------------------------------------- | ---- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| `applications`               | 🟢  | **0**  | `applicationsRepository`                 | —    | `CandidaturasPage`, `ApplicationDetailPage`, `DashboardCandidato` ⚠️ | ⚠️ schema drift (`status`↔`current_stage`) + sem dados |
| `application_status_history` | 🟢  | 0      | `applicationsRepository.addHistoryEntry` | —    | —                                                                    | 🔴 sem uso                                             |
| `recruitment_processes`      | 🟢  | 0      | `recruitment-processes.repository`       | —    | `ProcessosSeletivosPage`                                             | 🔴 sem hook, sem dados                                 |
| `recruitment_stages`         | 🟢  | 0      | `recruitment-stages.repository`          | —    | `EtapasPage`                                                         | 🔴                                                     |
| `job_matches`                | 🟢  | 0      | `job-matches.repository`                 | —    | `JobMatches`                                                         | 🔴                                                     |
| `talent_pool_memberships`    | 🟢  | 0      | `talent-pool.repository`                 | —    | `BancoDeTalentos`                                                    | 🟡                                                     |

### 1.6 FUNCIONÁRIOS

| Tabela                                                              | RLS | Linhas | Repo                  | Páginas                                                                        | Status |
| ------------------------------------------------------------------- | --- | ------ | --------------------- | ------------------------------------------------------------------------------ | ------ |
| `employees`                                                         | 🟢  | n      | `employeesRepository` | `FuncionariosPage`, `FuncionarioDetalhe`                                       | 🟡     |
| `employee_skills/languages/experiences/education/documents/courses` | 🟢  | 0      | repos próprios        | `Experiencias`, `Formacao`, `Cursos`, `Idiomas`, `Habilidades`, `DocumentosRh` | 🔴     |
| `employee_managers` (FK self)                                       | 🟢  | —      | implícito             | —                                                                              | ⚪     |

### 1.7 SERVIÇOS

| Tabela                      | RLS | Linhas | Repo                              | Hook                                          | Páginas                                                    | Status                                     |
| --------------------------- | --- | ------ | --------------------------------- | --------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `services`                  | 🟢  | n      | `servicesRepository`              | `usePublicServices`, `usePublicServiceBySlug` | `Servicos` 🟢, `ServicoDetalhe` 🟢, `Servicos` (dashboard) | 🟢 (Bloco 9)                               |
| `public_services_v1` (view) | via | n      | mesma                             | mesma                                         | mesma                                                      | 🟢                                         |
| `service_orders`            | 🟢  | 0      | `servicesRepository` (findOrders) | —                                             | `Servicos` (dashboard)                                     | 🔴                                         |
| `service_executions`        | 🟢  | 0      | mesma                             | —                                             | —                                                          | 🔴                                         |
| `service_process_steps`     | 🟢  | 0      | —                                 | —                                             | —                                                          | 🔴 (migration 20260903170010 não aplicada) |

### 1.8 FINANCEIRO

| Tabela                                                                 | RLS | Linhas | Repo                                      | Páginas                                              | Status |
| ---------------------------------------------------------------------- | --- | ------ | ----------------------------------------- | ---------------------------------------------------- | ------ |
| `accounts_payable/receivable`                                          | 🟢  | 0      | `accounts-payable/-receivable.repository` | `FinanceiroPage`                                     | 🔴     |
| `cash_flow`, `bank_accounts`, `cost_centers`                           | 🟢  | 0      | repos                                     | `BancosPage`, `CentroCustosPage`, `FluxoDeCaixaPage` | 🔴     |
| `invoices`, `invoice_items`                                            | 🟢  | 0      | `invoice.repository`                      | `FaturamentoPage`                                    | 🔴     |
| `payments`, `receipts`, `financial_transactions`                       | 🟢  | 0      | repos                                     | —                                                    | 🔴     |
| `bank_reconciliations`                                                 | 🟢  | 0      | repo                                      | `Conciliacao`                                        | 🔴     |
| `financial_installments`, `financial_accounts`, `financial_categories` | 🟢  | 0      | repos                                     | `Parcelamentos`, `ContasFinanceiras`, `Categorias`   | 🔴     |
| `fiscal_documents`                                                     | 🟢  | 0      | `fiscal.repository`                       | `FiscalPage`                                         | 🔴     |
| `accounting_entries`                                                   | 🟢  | 0      | `accounting.repository`                   | `ContabilidadePage`                                  | 🔴     |
| `sales`, `quotes`                                                      | 🟢  | 0      | `billing.repository`                      | —                                                    | 🔴     |

### 1.9 ESTOQUE / ALMOXARIFADO

| Tabela                                     | RLS | Linhas | Repo                   | Páginas        | Status |
| ------------------------------------------ | --- | ------ | ---------------------- | -------------- | ------ |
| `products`, `stock_movements`              | 🟢  | 0      | `stock.repository`     | `Estoque`      | 🔴     |
| `warehouse_entries/issues/returns/custody` | 🟢  | 0      | `warehouse.repository` | `Almoxarifado` | 🔴     |
| `epi`                                      | 🟢  | 0      | mesma                  | —              | 🔴     |

### 1.10 SUPORTE

| Tabela             | RLS | Linhas | Repo                 | Páginas                         | Status                         |
| ------------------ | --- | ------ | -------------------- | ------------------------------- | ------------------------------ |
| `support_tickets`  | 🟢  | 0      | `support.repository` | `Suporte` (público + dashboard) | 🟡 público ok, dashboard vazio |
| `support_messages` | 🟢  | 0      | mesma                | —                               | 🔴                             |

### 1.11 NOTIFICAÇÕES & COMUNICAÇÃO

| Tabela                        | RLS | Linhas | Repo                      | Páginas            | Status |
| ----------------------------- | --- | ------ | ------------------------- | ------------------ | ------ |
| `notifications`               | 🟢  | 0      | `notification.repository` | `NotificacoesPage` | 🔴     |
| `chat_rooms`, `chat_messages` | 🟢  | 0      | `useRealtimeChat`         | (chat widgets)     | 🔴     |
| `email_logs`, `sms_logs`      | 🟢  | 0      | —                         | —                  | ⚪     |

### 1.12 INTEGRAÇÕES & AUDITORIA

| Tabela                           | RLS | Linhas | Repo                  | Páginas                          | Status |
| -------------------------------- | --- | ------ | --------------------- | -------------------------------- | ------ |
| `audit_logs`                     | 🟢  | 0      | `audit.repository`    | `AuditoriaPage`, `RbacAuditPage` | 🔴     |
| `security_events`                | 🟢  | 0      | `security.repository` | `SegurancaPage`, `SessoesPage`   | 🔴     |
| `integration_*`                  | 🟢  | 0      | —                     | `IntegracoesPage`                | 🔴     |
| `webhooks`, `webhook_deliveries` | 🟢  | 0      | —                     | —                                | 🔴     |

### 1.13 DOCUMENTOS & MÍDIA

| Tabela                | RLS | Linhas | Repo                             | Páginas               | Status           |
| --------------------- | --- | ------ | -------------------------------- | --------------------- | ---------------- |
| `media_assets`        | 🟢  | 4+     | (join)                           | (via `SafeImage`)     | 🟢 (Bloco 11 OK) |
| `candidate_documents` | 🟢  | 0      | `candidate-documents.repository` | `CandidatoDocumentos` | 🔴 sem upload UI |
| `employee_documents`  | 🟢  | 0      | `employee-documents.repository`  | `DocumentosRh`        | 🔴               |

### 1.14 RELATÓRIOS

| Páginas                                                                                                          | Repo | Status                                        |
| ---------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------- |
| `RelatoriosPage` (hub)                                                                                           | —    | 🟡 hub vazio                                  |
| `RelatorioFinanceiro/Rh/Recrutamento/Crm/Faturamento/Fiscal/Contabilidade/Estoque/Almoxarifado/Servicos/Suporte` | —    | 🔴 todas com `EmptyState` (sem implementação) |

### 1.15 CONFIG / ADMIN

| Páginas                                                                                                                               | Status                                  |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `ConfiguracoesPage`, `LgpdPage`, `TermosPage`, `MonitoramentoPage`, `GestaoPage`, `GestaoSaaSPage`, `CatalogoPage`, `AssinaturasPage` | 🟡/🔴 (admin master; sem dados de seed) |

---

## 2. Matriz: Permissão × Rota × Página

| Permissão                            | Rotas afetadas                                                                                                                                                                                                                                                                                                                                                              | Páginas    | Cobertura                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `candidates.read`                    | `/dashboard/candidato`, `/dashboard/candidatos`, `/dashboard/candidatos/:id`, `/dashboard/candidatos/habilidades`, `/dashboard/candidatos/experiencias`, `/dashboard/candidatos/formacao`, `/dashboard/candidatos/idiomas`, `/dashboard/candidatos/documentos`, `/dashboard/candidatos/preferencias`, `/dashboard/candidatos/visualizacoes`, `/dashboard/banco-de-talentos` | 11 páginas | ⚠️ candidatos: 3 bugs schema; 4 candidatos não logam; preferências não tem tabela |
| `people.read`                        | `/dashboard/funcionarios`, `/:id`, `experiencias`, `formacao`, `cursos`, `idiomas`, `habilidades`, `documentos-rh`, `/dashboard/rh`                                                                                                                                                                                                                                         | 9 páginas  | 🔴 sem hook, sem seed, sem feedback                                               |
| `recruitment.read`                   | `/dashboard/recrutamento` (via `processos-seletivos`), `/dashboard/processos-seletivos`, `/dashboard/processos-seletivos/:id`, `/dashboard/etapas`, `/dashboard/candidaturas`                                                                                                                                                                                               | 5 páginas  | 🔴                                                                                |
| `jobs.read`                          | `/dashboard/vagas`, `/dashboard/matches`                                                                                                                                                                                                                                                                                                                                    | 2          | 🟢                                                                                |
| `companies.read`                     | `/dashboard/empresas`, `/dashboard/relacionamentos`                                                                                                                                                                                                                                                                                                                         | 2          | 🟢                                                                                |
| `notifications.read`                 | `/dashboard/notificacoes`                                                                                                                                                                                                                                                                                                                                                   | 1          | 🔴                                                                                |
| `audit.read`                         | `/dashboard/auditoria`, `/dashboard/rbac-auditoria`                                                                                                                                                                                                                                                                                                                         | 2          | 🔴                                                                                |
| `sessions.read`                      | `/dashboard/configuracoes/seguranca/sessoes`                                                                                                                                                                                                                                                                                                                                | 1          | 🔴                                                                                |
| `finance.dashboard.read` + variantes | `/dashboard/financeiro/*` (12+ páginas)                                                                                                                                                                                                                                                                                                                                     | 12+        | 🔴                                                                                |
| `stock.dashboard.read`               | `/dashboard/estoque`                                                                                                                                                                                                                                                                                                                                                        | 1          | 🔴                                                                                |
| `warehouse.dashboard.read`           | `/dashboard/almoxarifado`                                                                                                                                                                                                                                                                                                                                                   | 1          | 🔴                                                                                |
| `service_orders.dashboard.read`      | `/dashboard/servicos`                                                                                                                                                                                                                                                                                                                                                       | 1          | 🔴                                                                                |
| `support.dashboard.read`             | `/dashboard/suporte`                                                                                                                                                                                                                                                                                                                                                        | 1          | 🔴                                                                                |
| `reports.read`                       | `/dashboard/relatorios/*` (11)                                                                                                                                                                                                                                                                                                                                              | 11         | 🔴 todas `EmptyState`                                                             |
| `tenants.read`                       | `/dashboard/tenants`, `/dashboard/onboarding`                                                                                                                                                                                                                                                                                                                               | 2          | 🟡                                                                                |
| `roles.read`                         | `/dashboard/roles-permissoes`                                                                                                                                                                                                                                                                                                                                               | 1          | 🟡                                                                                |
| `companies.read`                     | `/dashboard/relacionamentos`                                                                                                                                                                                                                                                                                                                                                | 1          | 🟡                                                                                |
| `domain_events.read`                 | `/dashboard/global`, `/dashboard/gestao-saas`                                                                                                                                                                                                                                                                                                                               | 2          | 🟡                                                                                |

---

## 3. Resumo executivo

| Domínio             | Tabelas                    | Páginas         | Hooks                 | Repos                  | Status geral                             |
| ------------------- | -------------------------- | --------------- | --------------------- | ---------------------- | ---------------------------------------- |
| Auth/Identidade     | 9                          | 11              | `useAuth` (implícito) | `users.repo`           | 🟢                                       |
| Candidatos          | 9                          | 11              | `useCandidates`       | 9 repos                | ⚠️ (3 bugs + 4 sem login + preferências) |
| Empresas            | 4                          | 6               | 4 hooks               | `companies.repository` | 🟢                                       |
| Vagas               | 1+1 view                   | 4               | 4 hooks               | `jobs.repository`      | 🟢                                       |
| Recrutamento        | 6                          | 5               | —                     | 4 repos                | ⚠️ (schema drift + 0 dados)              |
| Funcionários        | 7                          | 9               | —                     | 7 repos                | 🔴                                       |
| Serviços            | 5                          | 3               | 2 hooks               | `services.repository`  | 🟢 público, 🔴 admin                     |
| Financeiro          | 15+                        | 12+             | —                     | 12+ repos              | 🔴                                       |
| Estoque/almox.      | 4                          | 2               | —                     | 2 repos                | 🔴                                       |
| Suporte             | 2                          | 2               | —                     | 1 repo                 | 🟡 público, 🔴 dashboard                 |
| Notificações/chat   | 4                          | 1               | `useRealtimeChat`     | 1 repo                 | 🔴                                       |
| Auditoria/segurança | 3                          | 4               | —                     | 2 repos                | 🔴                                       |
| Documentos/mídia    | 3                          | 2               | —                     | 2 repos                | 🟡 (media_assets ok, uploads não)        |
| Relatórios          | (views)                    | 11              | —                     | —                      | 🔴                                       |
| Config/admin        | (n/a)                      | 8               | —                     | —                      | 🟡                                       |
| **TOTAL**           | **~70 entidades cobertas** | **~90 páginas** | **~21 hooks**         | **~50 repos**          | **~15% 🟢 / 25% 🟡 / 60% 🔴⚠️**          |

---

## 4. Top 10 gaps (ordem de bloqueio)

| #   | Gap                                                                                                                         | Severidade | Blocker para                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------- |
| 1   | **Candidatos sem `auth_user_id` (4 de 8)**                                                                                  | 🔴 P0      | Login do candidato                            |
| 2   | **`candidate_preferences` não existe**                                                                                      | 🔴 P0      | Página /dashboard/candidatos/preferencias 404 |
| 3   | **`applications.status` ↔ frontend `current_stage`**                                                                        | 🔴 P0      | Lista de candidaturas, mapa quebrado          |
| 4   | **`candidate_experiences` schema drift** (`role`/`company_name` vs `position`/`company`)                                    | 🔴 P0      | `DashboardCandidato`, `CandidatoExperiencias` |
| 5   | **`AuthContext.currentTenantId` pode ser `null`** (não definido após login de candidato)                                    | 🔴 P0      | Tela preta `/dashboard/candidato`             |
| 6   | **`candidatesRepository.findAll(tenantId)` carrega todos + filtra client-side**                                             | 🟠 P1      | Performance/UX de RH, Recrutador e Candidato  |
| 7   | **DashboardCandidato usa `search: person.id` que não bate** (filtro é `notes/title.ilike`)                                  | 🟠 P1      | Lista de candidaturas sempre vazia            |
| 8   | **Zero `applications` no DB**                                                                                               | 🟠 P1      | "Suas candidaturas" sempre vazio              |
| 9   | **Zero dados em `recruitment_processes/stages`, `job_matches`, `employee_*`, `stock_*`, `warehouse_*`, `accounts_*`, etc.** | 🟠 P1      | 60+ dashboard pages com `EmptyState`          |
| 10  | **Sem feedback (ErrorBoundary, NotFoundState, Skeleton) em 50+ dashboard pages**                                            | 🟡 P2      | UX de falha                                   |

---

## 5. Conclusão

- **215 tabelas mapeadas**, **193 com tenant_id**, **584 policies**, **RLS habilitada em 100%**.
- **5 views públicas** suficientes para o site público; **225 RPCs** disponíveis.
- **~50 repositories** + **~21 hooks** no frontend; **~90 páginas** (26 públicas + ~64 dashboard).
- **Cobertura real (com dados + sem bug):** ~15% do dashboard; **~70% do público**.
- **Causa-raiz da tela preta do candidato:** combinação de (a) `AuthContext.currentTenantId` indefinido + (b) `candidatesRepository.findAll` pesado + (c) ausência de fallback em `!tenantId`.

**Próximo:** montar plano de fechamento na ordem: P0 candidato → P0 candidate_preferences → P0 schema alignment → P1 seed → P1 feedback em todas as rotas → P1 TDD de falhas.
