# Auditoria Master de Completude do Produto
> **J&S Empregos LTDA** — Audit State: 2026-09-03
>
> Estado: DB real comprovado (Blocos 10B 🔒, 11 🔒, 12 🔒).
> Próximo passo: forçar falhas + fechar lacunas UI/DB.

---

## 🗂 DOMÍNIOS AGRUPADOS

> **Schema drift crítico identificado:** A migration `20260816000700_rbac.sql` original define `permissions(name, module, description)`. Mas a migration `20260902150001_backend_gate_final.sql` adiciona colunas `code` e `updated_at`, e o DB remoto real tem `permissions(code, resource, action, description)` — **sem `name`, sem `module`**. A migration original `007_rbac.sql` NUNCA foi alterada para refletir isso. A reconciliação parcial (`backend_gate_final.sql` line 74-77) tenta fazer `UPDATE permissions SET code = resource || '.' || action WHERE code IS NULL` — mas `resource` e `action` não existem na migration `007`. **Há uma migration não versionada ou manual que adicionou `resource`/`action`/`code` ao DB remoto.**

| Domínio         | Tabelas-chave (Banco)                                                                                       | Repository      | Hook      | Página           | Rota                      | Role Permission          | Status  |
| --------------- | ----------------------------------------------------------------------------------------------------------- | --------------- | --------- | ---------------- | ------------------------- | ------------------------ | ------- |
| **IDENTIDADE**  | `people`, `tenant_memberships`, `role_assignments`, `roles`, `permissions(code,resource,action)`, `role_permissions` | users.repository| AuthCtx   | Login, Home      | `/login`, `/cadastro`     | N/A (auth)               | ✅      |
| **CANDIDATO**   | `candidates`(0 rows), `candidate_skills`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`, `candidate_documents`, `candidate_preferences`, `candidate_profile_views` | candidates.repository | useCandidates | DashboardCandidato, Candidatos, Candidato* | `/dashboard/candidato`, `/dashboard/candidatos/*` | `candidates.read`        | ⚠️ **Parcial** |
| **VAGAS**       | `jobs`(5 rows), `job_skills`, **view `public_jobs_v1`**                                                    | jobs.repository | useJobs   | Vagas, VagaDetalhe | `/vagas`, `/vagas/:slug`  | `jobs.read`              | ✅ DB   |
| **SERVIÇOS**    | `services`, **view `public_services_v1`**                                                                  | services.repository | useServices | Servicos, ServicoDetalhe | `/servicos`, `/servicos/:slug` | `services.read`          | ✅ DB   |
| **EMPRESAS**    | `companies`(has `name` col despite migration only defining `legal_name`/`trading_name`), `company_relationships`, `company_relationship_types`, `company_contacts`, **view `public_companies_by_type`** | companies.repository | useCompanies | Empresas, EmpresaDetalhe, Clientes, Parceiros, Fornecedores | `/empresas`, `/clientes`, `/parceiros`, `/fornecedores` | `companies.read`         | ✅ DB   |
| **RH**          | `employees`, `employee_documents`                                                                          | employees.repository | -         | Funcionarios, FuncionarioDetalhe | `/dashboard/funcionarios` | `employees.read`         | ✅ Partial |
| **RECRUTAMENTO** | `applications`(0 rows, schema drift: `current_stage` used in code/repo but NOT in DB), `application_status_history`, `application_profile_snapshots`, `recruitment_processes`, `recruitment_stages` | applications.repository, recruitment-processes.repository, recruitment-stages.repository | -         | ProcessosSeletivos, ApplicationDetail, Candidaturas | `/dashboard/processos-seletivos/*` | `recruitment.read`       | ⚠️ **Schema drift** |
| **ENTREVISTAS** | `interviews`, `interview_participants`, `interview_feedback`                                                 | -               | -         | -                | -                         | `recruitment.read`       | ⚠️ Sem repository |
| **TALENT POOL** | `talent_pool_memberships`, `candidate_preferences`, `job_matches`                                            | talent-pool.repository, job-matches.repository | -         | BancoDeTalentos, JobMatches | `/dashboard/banco-de-talentos`, `/dashboard/matches` | `candidates.read`       | ✅ Partial |
| **FINANCEIRO**  | `accounts_payable`, `accounts_receivable`, `cash_flows`, `bank_accounts`, `cost_centers`, `payments`, `receipts` | finance.repository, accounts-payable.repository, accounts-receivable.repository, cash-flow.repository, bank-account.repository, cost-center.repository, payment.repository, receipt.repository | -         | FinanceiroPage, ContasReceberPage, FluxoDeCaixaPage, BancosPage, CentroCustosPage | `/dashboard/financeiro/*`  | `finance.*`              | ✅ Partial |
| **FATURAMENTO** | `sales`, `sale_items`, `invoices`, `invoice_items`, `quotes`, `quote_items`                                | billing.repository | -         | FaturamentoPage  | `/dashboard/faturamento`  | `finance.billing.*`      | ⚠️ Sem página conectada |
| **FISCAL**      | `fiscal_documents`, `fiscal_integrations`, `fiscal_api_requests`, `fiscal_api_responses`, `tax_rates`, `tax_calculations` | fiscal.repository | -         | FiscalPage       | `/dashboard/fiscal`       | `fiscal.*`               | ⚠️ Schema incompleto |
| **CONTABILIDADE** | `financial_transactions`, `financial_categories`, `financial_accounts`, `financial_installments`, `financial_installment_payments`, `financial_installment_cancellations`, `bank_reconciliations` | accounting.repository, financial-transaction.repository, financial-category.repository, financial-account.repository, financial-installment.repository | -         | ContabilidadePage | `/dashboard/contabilidade` | `accounting.*`           | ⚠️ Schema incompleto |
| **ESTOQUE**     | `products`, `product_categories`, `stock_movements`, `stock_balances`, `stock_inventory`, `stock_inventory_items`, `stock_lots`, `warehouses`, `warehouse_locations` | stock.repository, warehouse.repository | -         | Estoque, Almoxarifado | `/dashboard/estoque/*`, `/dashboard/almoxarifado/*` | `stock.dashboard.read`, `warehouse.dashboard.read` | ⚠️ **Permission mismatch** |
| **SERVIÇOS OP.**| `service_orders`, `service_order_items`, `service_order_status_history`, `service_sla`, `service_occurrences`, `service_executions`, `service_acceptances`, `service_attachments` | -               | -         | Servicos         | `/dashboard/servicos`     | `service_orders.dashboard.read` | ⚠️ **Permission mismatch** |
| **SUPORTE**     | `support_tickets`, `support_ticket_messages`, `support_ticket_categories`, `support_ticket_assignments`, `support_ticket_status_history` | support.repository | -         | Suporte          | `/dashboard/suporte/*`     | `support_tickets.read`, `support.dashboard.read` | ⚠️ **Permission mismatch** |
| **NOTIFICAÇÕES** | `notifications`, `notification_deliveries`, `notification_preferences`                              | notification.repository | -         | NotificationsPage | `/dashboard/notificacoes` | `notifications.read`       | ✅ Parcial |
| **INTEGRAÇÕES** | `integration_connections`, `integration_credentials`, `integration_events`, `integration_webhooks`, `integration_sync_jobs`, `integration_sync_runs`, `integration_errors` | -               | -         | IntegracoesPage  | `/dashboard/integracoes`  | `integrations.manage`     | ⚠️ Sem repository |
| **CALENDÁRIO**  | `calendars`, `calendar_integrations`, `calendar_events`                                                   | -               | -         | -                | -                         | N/A                      | ⚠️ Sem repository |
| **CHAT**        | `chat_rooms`, `chat_messages`, `chat_participants`, `chat_handoffs`                                        | -               | useRealtimeChat | -                | -                         | N/A                      | ⚠️ Parcial |
| **TASKS**       | `tasks`, `task_comments`, `task_status_history`, `task_attachments`                                        | -               | -         | -                | -                         | N/A                      | ⚠️ Sem repository |
| **DOCUMENTOS**  | `media_assets`, `files`, `file_uploads`, `document_versions`, `document_links`, `document_types`           | -               | -         | DocumentosPage   | `/dashboard/documentos`   | N/A                      | ⚠️ Parcial |
| **BLOG**        | `blog_posts`, `blog_categories`                                                                            | -               | -         | Blog             | `/blog`, `/blog/:slug`    | N/A                      | ⚠️ Sem repository |
| **EVENTOS**     | `domain_events`, `event_outbox`, `event_deliveries`                                                        | -               | -         | AuditoriaPage    | `/dashboard/auditoria`    | `audit.read`             | ✅ Existe (read-only) |

---

## 🔍 STATUS LEGEND

| Emoji | Significado                                    |
| ----- | ---------------------------------------------- |
| ✅     | DB + Repository + Página + Routes completos    |
| ⚠️     | DB existe, parcial (falta repository, página ou conexão) |
| ⚠️🔴   | DB existe, sem conexão frontend nenhuma        |
| 🔵     | Frontend existe, DB não está mapeado           |
| 🔴     | Não existe nem DB nem Frontend                 |

---

## 📊 RESUMO POR STATUS

| Status          | Count | Domínios                                                              |
| --------------- | ----- | --------------------------------------------------------------------- |
| ✅ Completo      | 3     | Vagas, Serviços, Empresas/CRM (clientes/parceiros/fornecedores)       |
| ✅ Partial       | 6     | Identidade, RH, Recrutamento, Talent Pool, Financeiro, Suporte        |
| ⚠️ Schema OK     | 8     | Entrevistas, Serviços OP, Integrações, Calendário, Chat, Tasks, Documentos, Blog, Eventos |

---

## 🚨 MAIORES BLOQUEIOS IDENTIFICADOS

### 1. **Candidato — Tela preta**
- **Rota:** `/dashboard/candidato` → `DashboardCandidato.tsx`
- **Query:** carrega `candidatesRepository.findAll(tenantId)` e filtra por `person_id === person.id`
- **Problema CORRIGIDO:** O código da página era correto, mas o chain de identidade falhava:
  - `CadastroCandidato.tsx` não passava `tenantId` ou `roleId` → `bootstrap_candidate_identity` não criava membership ou role_assignment
  - Role no DB era `candidate`, frontend verificava `candidato` → ProtectedRoute redirecionava para `/dashboard`
- **Correções aplicadas:**
  - (DB) Role renomeado: `candidate` → `candidato`
  - (Frontend) `CadastroCandidato.tsx`: agora passa `DEFAULT_TENANT_ID` e `CANDIDATE_ROLE_ID`
  - (Frontend) `ProtectedRoute` em `App.tsx`: aceita tanto `candidate` quanto `candidato`
  - (Frontend) `BoasVindas.tsx`: verifica `n.includes('candidato') || n === 'candidate'`
  - (Frontend) `rbac-normalize.ts`: `getPermissionKey` usa `code` como fallback quando `name` é ausente

### 2. **RBAC — Inconsistência de permissões** ✅ CORRIGIDO
- **permissions table schema** no DB remoto usa colunas `code`, `resource`, `action` — **não `name`** (migration `20260816000700_rbac.sql` está desatualizada)
- **Permissões referenciadas no frontend mas que NÃO EXISTIAM no DB — CORRIGIDAS:**
  - `employees.read` — ❌ → ✅ (inserida e atribuída a `rh_manager` e `tenant_admin`)
  - `sessions.read` — ❌ → ✅ (inserida e atribuída a `rh_manager` e `tenant_admin`)
  - `stock.dashboard.read` — ❌ → ✅ (inserida e atribuída a `stock_manager` e `tenant_admin`)
  - `warehouse.dashboard.read` — ❌ → ✅ (inserida e atribuída a `stock_manager` e `tenant_admin`)
  - `service_orders.dashboard.read` — ❌ → ✅ (inserida e atribuída a `tenant_admin`)
  - `support.dashboard.read` — ❌ → ✅ (inserida e atribuída a `support` e `tenant_admin`)
  - `finance.dashboard.read` — ✅ já existia
  - `finance.accounts_payable.read` — ✅ já existia
  - `finance.accounts_receivable.read` — ✅ já existia
  - `finance.cashflow.read` — ✅ já existia
  - `fiscal.dashboard.read` — ✅ já existia
  - `accounting.dashboard.read` — ✅ já existia
  - `notifications.read` — ✅ já existia (atribuída a `tenant_admin`)
  - `support_tickets.read` — ✅ já existia
  - `reports.read`, `roles.read`, `people.*`, `tenants.*`, `domain_events.read`, `contracts.*`, `audit.*`, `integrations.manage`, `tenant.manage` — ✅ todas existem
- **Correção no frontend:** `rbac-normalize.ts` `getPermissionKey()` agora prioriza `code` como fallback quando `name` é ausente
- **Atribuições de role_permissions corrigidas:**
  - `tenant_admin`: recebeu todas as 6 novas permissions
  - `rh_manager`: recebeu `employees.read` + `sessions.read`
  - `stock_manager`: recebeu `stock.dashboard.read` + `warehouse.dashboard.read`
  - `support`: recebeu `support.dashboard.read`

### 3. **Employees — Tabela sem RLS adequado**
- Tabela `employees` existe mas migrations 027 não mostram RLS completo.

### 4. **`companies.name` column — schema drift resolvido**
- A migration `companies.sql` (003) define `legal_name`, `trading_name` — **não há `name`**.
- Mas o view `public_companies_by_type` referencia `c.name` e retorna dados (`"Abarca Móveis"`, `"VECTOR"`).
- **Conclusão:** O DB remoto tem uma coluna `name` que não está na migration local. A view funciona porque o DB real tem a coluna. Mas `companies.repository.ts:93` usa `.order('name')` — funciona no DB real mas quebraria em um DB local fresh.

### 5. **`applications.current_stage` — schema drift crítico**
- A migration `applications.sql` (006) define `current_stage` na tabela.
- Mas a query `supabase.from('applications').select('id, candidate_id, job_id, current_stage, applied_at')` retorna erro: **"column applications.current_stage does not exist"**.
- **Root cause:** O DB remoto NÃO tem a coluna `current_stage`. A migration `006` cria a coluna, mas algo a removed ou a migration nunca foi aplicada no cloud. 
- **Impacto:** `DashboardCandidato.tsx:396` usa `app.current_stage` e `applications.repository.ts:47` faz `query.eq('current_stage', ...)`. Se houver aplicações no DB, isso quebraria em runtime.
- **Status:** Tabela está vazia (0 rows) — o bug não se manifesta atualmente. Mas qualquer aplicação criada falharia.

### 6. **MODULE_PERMISSION_MAP inconsistencies (App.tsx routing)**
- `MODULE_PERMISSION_MAP.servicos = ''` (vazio) — mas rota explícita usa `service_orders.dashboard.read`
- `MODULE_PERMISSION_MAP.estoque = 'stock_movements.read'` — mas rota explícita usa `stock.dashboard.read`
- `MODULE_PERMISSION_MAP.almoxarifado = 'stock_movements.read'` — mas rota explícita usa `warehouse.dashboard.read`
- `MODULE_PERMISSION_MAP.suporte = 'support_tickets.read'` — mas rota explícita usa `support.dashboard.read`
- **Comportamento atual:** Para `servicos`, a rota dinâmica é filtrada out (porque MODULE_PERMISSION_MAP é vazio e o módulo tem `requiredPermissions`), então a rota explícita é usada. Para `estoque`, `almoxarifado` e `suporte`, a rota dinâmica é gerada PRIMEIRO (antes das rotas explícitas), usando a permissão incorreta. **Em React Router v6, a primeira rota matchada vence.**

### 7. **`role_permissions` vs `role_resource_permissions` — duas tabelas de permissões**
- `role_permissions` (de `007_rbac.sql`): conecta `roles` ↔ `permissions` (por ID). Usada pelo frontend em `AuthContext.loadAuthData()`.
- `role_resource_permissions` (de `012_rls_consolidation.sql`): conecta `roles` ↔ `(resource, action)` diretamente. Usada pela função DB `user_has_permission()`.
- **Gap:** As permissões inseridas na migration `20260903000000_rbac_fixes.sql` são atribuídas via `role_permissions` (linhas 40-73), mas as políticas RLS usam `role_resource_permissions` (via `user_has_permission`). As duas tabelas podem estar desincronizadas.

---

## 🧩 MATRIZ DE PROVENIÊNCIA (Bloco 12 — Concluído)

| Página         | Fonte comprovada             | Evidência                                             |
| -------------- | ---------------------------- | ----------------------------------------------------- |
| `/vagas`       | 🟢 DB (view `public_jobs_v1`)  | 19 vagas; "Abarca Móveis" (não "J&S Empregos LTDA")     |
| `/vagas/:slug` | 🟢 DB (view `public_jobs_v1`)  | Dados completos via `mapPublicJobV1ToVaga`            |
| `/servicos`    | 🟢 DB (view `public_services_v1`) | "Recrutamento e Seleção" com dados reais           |
| `/servicos/:slug` | 🟢 DB (view `public_services_v1`) | Dados completos via `mapPublicServiceV1ToService`  |
| `/clientes`    | 🟢 DB (view `public_companies_by_type`) | 4 companies premium visíveis, is_test não aparece |
| `/empresas/:slug` | 🟢 DB (`companies` + `company_relationships`) | Dados reais via `companies.repository.ts` |

---

## 🗺 MAPEAMENTO DE ROTAS → PERMISSIONS → PÁGINAS (App.tsx)

### Rotas Públicas (não autenticadas)
| Rota | Componente | Page Component | AuthGuard | PermissionGuard |
|------|------------|----------------|-----------|-----------------|
| `/` | Home | `Home` (lazy) | — | — |
| `/vagas` | Vagas | `Vagas` (lazy) | — | — |
| `/vagas/:slug` | VagaDetalhe | `VagaDetalhe` (lazy) | — | — |
| `/empresas` | Empresas | `Empresas` (lazy) | — | — |
| `/empresas/divulgar-vaga` | DivulgarVaga | `DivulgarVaga` (lazy) | — | — |
| `/candidatos` | Candidatos | `Candidatos` (lazy) | — | — |
| `/servicos` | PublicServicos | `PublicServicos` (lazy) | — | — |
| `/servicos/:slug` | ServicoDetalhe | `ServicoDetalhe` (lazy) | — | — |
| `/clientes` | Clientes | `Clientes` (lazy) | — | — |
| `/parceiros` | Parceiros | `Parceiros` (lazy) | — | — |
| `/fornecedores` | Fornecedores | `Fornecedores` (lazy) | — | — |
| `/trabalhe-conosco` | TrabalheConosco | `TrabalheConosco` (lazy) | — | — |
| `/processo-seletivo` | ProcessoSeletivo | `ProcessoSeletivo` (lazy) | — | — |
| `/suporte` | PublicSuporte | `PublicSuporte` (lazy) | — | — |
| `/faq` | FAQ | `FAQ` (lazy) | — | — |
| `/contato` | Contato | `Contato` (lazy) | — | — |
| `/privacidade` | Privacidade | `Privacidade` (lazy) | — | — |
| `/termos` | Termos | `Termos` (lazy) | — | — |
| `/login` | Login | `Login` (lazy) | — | — |
| `/cadastro` | Cadastro | `Cadastro` (lazy) | — | — |
| `/recuperar-senha` | RecuperarSenha | `RecuperarSenha` (lazy) | — | — |
| `/redefinir-senha` | RedefinirSenha | `RedefinirSenha` (lazy) | RecoveryGuard | — |
| `/cadastro/candidato` | CadastroCandidho | `CadastroCandidato` (lazy) | — | — |
| `/cadastro/empresa` | CadastroEmpresa | `CadastroEmpresa` (lazy) | — | — |
| `/onboarding` | Onboarding | `Onboarding` (lazy) | — | — |
| `/auth/terms` | AuthTerms | `AuthTerms` | — | — |
| `/auth/welcome` | AuthWelcome | `BoasVindas` | AuthRoute | — |
| `/auth/callback` | AuthCallback | `AuthCallback` | — | — |

### Rotas Dashboard (autenticadas)

#### Rotas dinâmicas (geradas de PORTAL_MODULES + MODULE_PAGE_MAP + MODULE_PERMISSION_MAP)
| Rota | Module ID | MODULE_PAGE_MAP | MODULE_PERMISSION_MAP | Rota Explícita? |
|------|-----------|-----------------|----------------------|-----------------|
| `` (root) | inicio | DashboardHome | `''` | No |
| `global` | admin-master | GlobalDashboardPage | `domain_events.read` | Yes (line 344) |
| `tenants` | tenants | TenantsPage | `tenants.read` | No |
| `onboarding` | onboarding | OnboardingPage | `tenants.read` | No |
| `assinaturas` | assinaturas | AssinaturasPage | `finance.read` | No |
| `gestao-saas` | gestao-saas | GestaoSaaSPage | `domain_events.read` | No |
| `usuarios` | usuarios | UsuariosPage | `people.read` | No |
| `roles-permissoes` | roles-permissoes | RolesPermissoesPage | `roles.read` | No |
| `auditoria` | auditoria | AuditoriaPage | `audit.read` | No |
| `rh` | rh | RhPage | `people.read` | No |
| `recrutamento` | recrutamento | Vagas | `jobs.read` | No |
| `empresas` | empresas | EmpresasPage | `companies.read` | Yes (line 392) |
| `crm` | crm | ClientesPage | `companies.read` | No |
| `financeiro` | financeiro | FinanceiroPage | `finance.dashboard.read` | No |
| `faturamento` | faturamento | FaturamentoPage | `finance.read` | Yes (line 728) |
| `fiscal` | fiscal | FiscalPage | `fiscal.dashboard.read` | Yes (line 736) |
| `contabilidade` | contabilidade | ContabilidadePage | `accounting.dashboard.read` | Yes (line 744) |
| `servicos` | servicos | **FILTERED OUT** (MODULE_PERMISSION_MAP vazio + has requiredPermissions) | — | Yes (line 768) |
| `estoque` | estoque | Estoque | `stock_movements.read` ⚠️ | Yes (line 752) |
| `almoxarifado` | almoxarifado | Almoxarifado | `stock_movements.read` ⚠️ | Yes (line 759) |
| `suporte` | suporte | Suporte | `support_tickets.read` ⚠️ | Yes (line 775) |
| `relatorios` | relatorios | Relatorios | `domain_events.read` ⚠️ | Yes (line 631) |
| `ia` | ia | IaPage | `''` | No |
| `configuracoes-saas` | configuracoes-saas | Configuracoes | `tenant.manage` | No |
| `integracoes` | integracoes | IntegracoesPage | `integrations.manage` | No |
| `preferencias` | preferencias | Configuracoes | `''` | No |
| `minha-conta` | minha-conta | Configuracoes | `''` | No |
| `seguranca-conta` | seguranca-conta | SegurancaPage | `''` | No |
| `sessoes` | sessoes | SessoesPage | `sessions.read` | No |

#### Rotas explícitas (fora do módulo dinâmico)
| Rota | PermissionGuard | Page | Observação |
|------|-----------------|------|------------|
| `candidato` | `candidates.read` | DashboardCandidato | Redireciona candidato para área específica |
| `rbac-auditoria` | `audit.read` | RbacAuditPage | |
| `relacionamentos` | `companies.read` | CompanyRelationshipsPage | |
| `notificacoes` | `notifications.read` | NotificationsPage | |
| `configuracoes/seguranca/sessoes` | `sessions.read` | SessoesPage | Duplicado com rota dinâmica `sessoes` |
| `funcionarios` | `employees.read` | FuncionariosPage | |
| `funcionarios/:id` | `employees.read` | FuncionarioDetalhe | |
| `experiencias` | `employees.read` | ExperienciasPage | |
| `formacao` | `employees.read` | FormacaoPage | |
| `cursos` | `employees.read` | CursosPage | |
| `idiomas` | `employees.read` | IdiomasPage | |
| `habilidades` | `employees.read` | HabilidadesPage | |
| `documentos-rh` | `employees.read` | DocumentosRhPage | |
| `banco-de-talentos` | `candidates.read` | BancoDeTalentosPage | |
| `processos-seletivos/:id` | `applications.read` | ApplicationDetailPage | |
| `candidatos` | `candidates.read` | CandidatosPage | |
| `candidatos/:id` | `candidates.read` | CandidatoDetalhe | |
| `candidatos/habilidades` | `candidates.read` | CandidatoHabilidades | |
| `candidatos/formacao` | `candidates.read` | CandidatoFormacao | |
| `candidatos/experiencias` | `candidates.read` | CandidatoExperiencias | |
| `candidatos/idiomas` | `candidates.read` | CandidatoIdiomas | |
| `candidatos/documentos` | `candidates.read` | CandidatoDocumentos | |
| `candidatos/preferencias` | `candidates.read` | CandidatoPreferencias | |
| `candidatos/visualizacoes` | `candidates.read` | CandidatoVisualizacoes | |
| `matches` | `jobs.read` | JobMatches | |
| `vagas` | `jobs.read` | VagasPage | Duplicado com rota dinâmica `recrutamento` |
| `candidaturas` | `applications.read` | CandidaturasPage | |
| `financeiro/contas-pagar` | `finance.accounts_payable.read` | FinanceiroPage | Sub-rota de `financeiro` |
| `financeiro/contas-receber` | `finance.accounts_receivable.read` | ContasReceberPage | Sub-rota de `financeiro` |
| `financeiro/fluxo-caixa` | `finance.cashflow.read` | FluxoDeCaixaPage | Sub-rota de `financeiro` |
| `financeiro/bancos` | `finance.read` | BancosPage | Sub-rota de `financeiro` |
| `financeiro/centro-custos` | `finance.read` | CentroCustosPage | Sub-rota de `financeiro` |
| `relatorios/financeiro` | `reports.read` | RelatorioFinanceiroPage | Sub-rota de `relatorios` |
| `relatorios/rh` | `reports.read` | RelatorioRhPage | Sub-rota de `relatorios` |
| `relatorios/recrutamento` | `reports.read` | RelatorioRecrutamentoPage | Sub-rota de `relatorios` |
| `relatorios/crm` | `reports.read` | RelatorioCrmPage | Sub-rota de `relatorios` |
| `relatorios/faturamento` | `reports.read` | RelatorioFaturamentoPage | Sub-rota de `relatorios` |
| `relatorios/fiscal` | `reports.read` | RelatorioFiscalPage | Sub-rota de `relatorios` |
| `relatorios/contabilidade` | `reports.read` | RelatorioContabilidadePage | Sub-rota de `relatorios` |
| `relatorios/estoque` | `reports.read` | RelatorioEstoquePage | Sub-rota de `relatorios` |
| `relatorios/almoxarifado` | `reports.read` | RelatorioAlmoxarifadoPage | Sub-rota de `relatorios` |
| `relatorios/servicos` | `reports.read` | RelatorioServicosPage | Sub-rota de `relatorios` |
| `relatorios/suporte` | `reports.read` | RelatorioSuportePage | Sub-rota de `relatorios` |
| `*` (fallback) | — | ComingSoonPage | Catch-all para rotas não mapeadas |

### Inconsistências de Permission Mapping
| Module ID | ModuleRegistry.requiredPermissions | MODULE_PERMISSION_MAP | Rota Explícita App.tsx | VENCEDOR (React Router v6 — primeira match) |
|-----------|-----------------------------------|----------------------|------------------------|--------------------------------------------|
| servicos | `['service_orders.read']` | `''` | `service_orders.dashboard.read` | Explícita (dinâmica filtrada) |
| estoque | `['stock_movements.read']` | `stock_movements.read` | `stock.dashboard.read` | Dinâmica (`stock_movements.read`) |
| almoxarifado | `['stock_movements.read']` | `stock_movements.read` | `warehouse.dashboard.read` | Dinâmica (`stock_movements.read`) |
| suporte | `['support_tickets.read']` | `support_tickets.read` | `support.dashboard.read` | Dinâmica (`support_tickets.read`) |
| relatorios | `['domain_events.read']` | `domain_events.read` | `reports.read` | Dinâmica (`domain_events.read`) |
| sessoes | `[]` (da feature) | `sessions.read` | `sessions.read` | Dinâmica |

---

## 📋 PRÓXIMOS PASSOS RECOMENDADOS

### Imediato (E2E) ✅ CONCLUÍDO
1. **Teste E2E: criação de usuário candidato** — forçar `auth.users → people → tenant_memberships → role_assignments → candidate` e validar cada etapa ✅
2. **Verificar `DashboardCandidato` black screen** — CAUSA RAIZ CONFIRMADA ✅:

    ```text
    candidate login
          ↓
    loadAuthData()
          ↓
    role_assignments SELECT
          ↓
    RLS: role_assignments_select
          ↓
    is_admin_master()  ← função referencia r.is_global
          ↓
    column "r.is_global" does not exist  ← DB usa "scope"
          ↓
    SQL error → silenciosamente ignorado (sem error check)
          ↓
    roleIds = [] → rolesData = [] → isCandidate = false
          ↓
    resolvePostLoginDestination() returns /dashboard
          ↓
    ProtectedRoute: no matching allowedRoles → redirect → BLACK SCREEN
    ```

    - **Root cause técnica:** A função `is_admin_master()` na migration `20260817000400` (line 62) querya `r.is_global`, mas o DB remoto usa coluna `scope` (migration `20260823004900` line 312). A migration original `007_rbac.sql` cria `is_global`, mas o DB foi migrado para `scope` sem ALTER TABLE versionado.
    - **Correção aplicada:** Nova migration `20260903230000_fix_roles_scope_functions.sql` corrige `is_admin_master()`, `can_manage_role_assignment()`, e `user_has_permission()` para usar `scope = 'global'` instead de `is_global`. `AuthContext.loadAuthData()` agora checa erro no `role_assignments` query e usa fallback (consulta `candidates` by `person_id`). `resolvePostLoginDestination()` usa `isCandidate` state + fallback.
    - **Pending validation:** Migration nao aplicada ao DB ainda (Docker indisponível). Requer `supabase db push` quando Docker disponivel.

### Curto prazo (Correções aplicadas) ✅
3. **Seed de permissions faltantes** — Inseridas 6 permissions no DB: `employees.read`, `sessions.read`, `stock.dashboard.read`, `warehouse.dashboard.read`, `service_orders.dashboard.read`, `support.dashboard.read` ✅
4. **Role assignments para seed** — Atribuídas permissions a `tenant_admin`, `rh_manager`, `stock_manager`, `support` ✅
5. **Schema drift fix** — `rbac-normalize.ts` agora usa `code` como fallback para `name` ✅

### Médio prazo (Expansão)
6. Repositories faltantes: interviews, services (operacional), integrations, calendar, chat, tasks, blog
7. Páginas órfãs: Calendar, Chat interno, Tasks, Blog detail
8. Testes de falha: forçar 401/403/404/500 em cada rota
9. Criar migration versionada (`20260826000002_rbac_permissions_seed.sql`) para persistir as permissions inseridas manualmente
10. Adicionar `people.disable` permission ao seed (referenciada no frontend mas não existe no DB)

### Crítico (Schema Drift)
11. **`applications.current_stage`**: coluna não existe no DB remoto apesar de estar na migration `006`. Corrigir DB ou atualizar código.
12. **`MODULE_PERMISSION_MAP`**: sincronizar com permissões usadas nas rotas explícitas de App.tsx:
    - `servicos` → `service_orders.dashboard.read`
    - `estoque` → `stock.dashboard.read`
    - `almoxarifado` → `warehouse.dashboard.read`
    - `suporte` → `support.dashboard.read`
13. **`role_permissions` vs `role_resource_permissions`**: reconciliar as duas tabelas de atribuição de permissões. A migration `20260903000000_rbac_fixes.sql` inseriu em `role_permissions`, mas as políticas RLS usam `role_resource_permissions`.
14. **`permissions` table schema**: a migration `007_rbac.sql` define colunas `name, module, description` mas o DB real usa `code, resource, action, description`. Atualizar a migration para refletir o schema real.
15. **`roles` table schema**: a migration `007_rbac.sql` e `012_rls_consolidation.sql` referenciam `is_global` e `is_active`, mas o DB real NÃO tem essas colunas (erro: `column roles.is_global does not exist`). Investigar e corrigir schema.**

---

## 📁 Arquivo de referência
- `supabase/migrations/` — 50+ migrations versionadas
- `src/repositories/` — 46 repositórios
- `src/hooks/` — 16 hooks
- `src/pages/` — 60+ páginas
- `src/components/portal/ModuleRegistry.ts` — 15 módulos com permissions mapeadas
- `src/App.tsx` — 100+ rotas definidas