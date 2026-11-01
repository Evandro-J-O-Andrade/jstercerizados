# AUDITORIA COMPLETA — Módulos × Células × Rotas × Permissões

**Projeto:** J&S Empregos LTDA (jrtercerisados)  
**Data:** 2026-10-31  
**Ambiente:** Supabase (leitura apenas)  
**Branch:** `main`  
**Escopo:** Mapeamento de todos os 26 módulos, 20 células, rotas e permissões

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Módulos registrados em `module-routes.ts` | 17 |
| Módulos no `PORTAL_MODULES` (ModuleRegistry) | 26 |
| Células registradas em `register-cells.ts` | 20 |
| Pastas em `src/modules/` | 18 |
| Módulos com `manifest.ts` | 17 (todos) |
| Módulos com `types/index.ts` | 17 (todos) |
| Módulos com `permissions/index.ts` | 17 (todos) |
| Módulos com `routes/` | 17 (todos) |
| Módulos com `cellContract.ts` | 18 (todos) |
| Módulos com `index.ts` | 18 (todos) |
| Rotas no `App.tsx` vs módulos em `module-routes.ts` | 100% correspondentes |
| Módulos órfãos (sem rota em App.tsx) | 0 |
| Módulos duplicados (`media` / `midia`) | 1 |

---

## 1. Inventário do Banco de Dados

| Item | Quantidade |
|------|-----------|
| Tabelas em `public` | 221 |
| Views | 5 |
| Funções | 233 |
| Triggers | 84 |
| Políticas RLS | 602 |
| Tabelas com RLS habilitada | 221 |

### Tabelas sem `tenant_id` (22)

`people`, `permissions`, `roles`, `role_permissions`, `tenants`, `chat_handoffs`, `chat_messages`, `chat_participants`, `first_login_state`, entre outras.

---

## 2. Módulos Registrados — Matriz Completa

### 2.1 Módulos no `module-routes.ts` (17)

| # | ID | Módulo | Pasta | Rota Base | Manifest | Types | Permissions | Routes | CellContract | Index |
|---|----|--------|-------|-----------|----------|-------|-------------|--------|--------------|-------|
| 1 | `rh` | Recursos Humanos | `rh/` | `/dashboard/rh` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | `candidato` | Área do Candidato | `candidato/` | `/candidato` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | `recrutamento` | Recrutamento | `recrutamento/` | `/dashboard/recrutamento` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | `servicos` | Serviços | `servicos/` | `/dashboard/servicos` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 | `estoque` | Estoque | `estoque/` | `/dashboard/estoque` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | `fiscal` | Fiscal | `fiscal/` | `/dashboard/fiscal` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7 | `suporte` | Suporte | `suporte/` | `/dashboard/suporte` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | `financeiro` | Financeiro | `financeiro/` | `/dashboard/financeiro` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | `contabilidade` | Contabilidade | `contabilidade/` | `/dashboard/contabilidade` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10 | `pos` | PDV | `pos/` | `/dashboard/pos` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 11 | `operacoes` | Operações | `operacoes/` | `/dashboard/operacoes` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 12 | `empresas` | Empresas | `empresas/` | `/dashboard/empresas` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 13 | `admin` | Administração | `admin/` | `/dashboard/admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 14 | `media` | Mídia | `media/` | `/dashboard/media` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 15 | `ava` | AVA | `ava/` | `/dashboard/ava` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 16 | `admin-tenant` | Admin Tenant | `admin-tenant/` | `/dashboard/admin-tenant` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 17 | — | *não mapeado* | `midia/` | — | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 2.2 Módulos no `PORTAL_MODULES` (26)

| ID | Título | Categoria | Escopo | Rota | Permissão | Status |
|----|--------|-----------|--------|------|-----------|--------|
| `admin-master` | Visão Global | plataforma | global | `/dashboard/global` | `domain_events.read` | 🟢 Implementado |
| `inicio` | Início | início | tenant | `/dashboard` | — | 🟢 Implementado |
| `tenants` | Tenants | plataforma | global | `/dashboard/tenants` | `tenants.read` | 🟢 Implementado |
| `onboarding` | Onboarding | plataforma | global | `/dashboard/onboarding` | `tenants.read` | 🟡 Parcial |
| `assinaturas` | Assinaturas | plataforma | global | `/dashboard/assinaturas` | `finance.read` | 🟡 Parcial |
| `gestao-saas` | Gestão SaaS | plataforma | global | `/dashboard/gestao-saas` | `domain_events.read` | 🟡 Parcial |
| `usuarios` | Usuários | segurança | global | `/dashboard/usuarios` | `people.read` | 🟢 Implementado |
| `roles-permissoes` | Roles & Permissões | segurança | global | `/dashboard/roles-permissoes` | `roles.read` | 🟢 Implementado |
| `auditoria` | Auditoria | segurança | global | `/dashboard/auditoria` | `audit.read` | 🟡 Parcial |
| `contratos` | Contratos | documentos | tenant | `/dashboard/contratos` | `contracts.read` | 🔴 Não implementado |
| `rh` | Recursos Humanos | negócio | tenant | `/dashboard/rh` | `people.read` | 🟡 Parcial |
| `recrutamento` | Recrutamento | negócio | tenant | `/dashboard/recrutamento` | `jobs.read`, `candidates.read` | 🟡 Parcial |
| `empresas` | CRM | negócio | tenant | `/dashboard/empresas` | `companies.read` | 🟢 Implementado |
| `crm` | CRM | negócio | tenant | `/dashboard/crm` | `companies.read` | 🔴 Não implementado |
| `financeiro` | Financeiro | negócio | tenant | `/dashboard/financeiro` | `finance.dashboard.read` | 🟡 Parcial |
| `faturamento` | Faturamento | negócio | tenant | `/dashboard/faturamento` | `finance.read` | 🔴 Não implementado |
| `fiscal` | Fiscal | negócio | tenant | `/dashboard/fiscal` | `fiscal.dashboard.read` | 🟡 Parcial |
| `contabilidade` | Contabilidade | negócio | tenant | `/dashboard/contabilidade` | `accounting.dashboard.read` | 🟡 Parcial |
| `estoque` | Estoque | negócio | tenant | `/dashboard/estoque` | `stock_movements.read` | 🟡 Parcial |
| `servicos` | Serviços | negócio | tenant | `/dashboard/servicos` | `service_orders.read` | 🟡 Parcial |
| `suporte` | Suporte | negócio | tenant | `/dashboard/suporte` | `support_tickets.read` | 🟡 Parcial |
| `relatorios` | Relatórios | negócio | tenant | `/dashboard/relatorios` | `reports.read` | 🔴 Não implementado |
| `ia` | IA & Automação | ia | tenant | `/dashboard/ia` | — | 🔴 Não implementado |
| `integracoes` | Integrações | plataforma | global | `/dashboard/integracoes` | `integrations.manage` | 🔴 Não implementado |
| `configuracoes-saas` | Configurações SaaS | plataforma | global | `/dashboard/configuracoes` | `tenant.manage` | 🔴 Não implementado |
| `preferencias` | Preferências | conta | tenant | `/dashboard/configuracoes/preferencias` | — | 🔴 Não implementado |
| `minha-conta` | Minha conta | conta | tenant | `/dashboard/configuracoes/conta` | — | 🟢 Implementado |
| `seguranca-conta` | Segurança | conta | tenant | `/dashboard/configuracoes/seguranca` | — | 🟢 Implementado |
| `candidato` | Área do Candidato | negócio | tenant | `/candidato` | `candidates.self.read` | 🟢 Implementado |
| `ava` | AVA | negócio | tenant | `/dashboard/ava` | `ava.read` | 🟡 Parcial |
| `admin` | Administração | — | tenant | `/dashboard/admin` | `admin.read` | 🟢 Implementado |
| `media` | Mídia | — | tenant | `/dashboard/media` | `media.read` | 🟢 Implementado |

### 2.3 Módulo órfão / duplicado

| Pasta | Status | Observação |
|-------|--------|------------|
| `midia/` | ⚠️ Duplicado | Estrutura diferente (não segue padrão cellContract/routes/permissions). Não está em `module-routes.ts` nem em `register-cells.ts`. Avaliar remoção ou fusão com `media/`. |

---

## 3. Células Registradas (20)

| # | ID | Nome | Módulo | Ativo | Permissões | Rotas |
|---|----|------|--------|-------|------------|-------|
| 1 | `candidato` | Candidato | candidato | ✅ | 23 | 21 |
| 2 | `recrutamento` | Recrutamento | recrutamento | ✅ | 42 | 6 |
| 3 | `empresas` | Empresas | empresas | ✅ | 9 | 5 |
| 4 | `admin` | Administração | admin | ✅ | 18 | 13 |
| 5 | `media` | Mídia | media | ✅ | 7 | 4 |
| 6 | `rh` | RH | rh | ✅ | 10 | 13 |
| 7 | `financeiro` | Financeiro | financeiro | ✅ | 11 | 11 |
| 8 | `contabilidade` | Contabilidade | contabilidade | ✅ | 15 | 4 |
| 9 | `suporte` | Suporte | suporte | ✅ | 7 | 4 |
| 10 | `estoque` | Estoque | estoque | ✅ | 8 | 6 |
| 11 | `ava` | AVA | ava | ✅ | 2 | 1 |
| 12 | `servicos` | Serviços | servicos | ✅ | 14 | 7 |
| 13 | `fiscal` | Fiscal | fiscal | ✅ | 7 | 4 |
| 14 | `operacoes` | Operações | operacoes | ✅ | 7 | 6 |
| 15 | `pos` | PDV | pos | ✅ | 7 | 6 |
| 16 | `admin-master` | Admin Master Global | admin-master | ✅ | 12 | 10 |
| 17 | `admin-tenant` | Admin Tenant — Proprietário | admin-tenant | ✅ | 18 | 7 |
| 18 | `core` | Core | core | ✅ | — | — |
| 19 | `integracoes` | Integrações | integracoes | ✅ | — | — |

---

## 4. Matriz Banco × Módulo × Célula × Rota × Permissão

### 4.1 Identidade & Auth

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `auth.users` | Supabase | admin | admin | `/dashboard/admin/*` | `admin.read` | 🟢 |
| `people` | ✅ | rh / admin | rh / admin | `/dashboard/rh/funcionarios` | `people.read` | 🟢 |
| `tenant_memberships` | ✅ | admin | admin | `/dashboard/admin/tenants` | `admin.tenants.read` | 🟢 |
| `role_assignments` | ✅ | admin | admin | `/dashboard/admin/roles-permissoes` | `admin.roles.read` | 🟢 |
| `roles` | n/a | admin | admin | `/dashboard/admin/roles-permissoes` | `admin.roles.read` | 🟢 |
| `permissions` | n/a | admin | admin | `/dashboard/admin/roles-permissoes` | `admin.permissions.read` | 🟢 |
| `legal_acceptances` | ✅ | auth | core | `/auth/terms` | — | 🟢 |

### 4.2 Candidatos (Domínio Principal)

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `candidates` | ✅ | candidato / recrutamento | candidato / recrutamento | `/candidato/*`, `/dashboard/recrutamento/candidatos` | `candidates.self.read`, `candidates.read` | ⚠️ |
| `candidate_skills` | ✅ | candidato | candidato | `/candidato/habilidades` | `candidates.self.read` | 🔴 |
| `candidate_experiences` | ✅ | candidato | candidato | `/candidato/experiencia` | `candidates.self.read` | 🔴 |
| `candidate_education` | ✅ | candidato | candidato | `/candidato/formacao` | `candidates.self.read` | 🔴 |
| `candidate_courses` | ✅ | candidato | candidato | `/candidato/cursos` | `candidates.self.read` | 🔴 |
| `candidate_languages` | ✅ | candidato | candidato | `/candidato/idiomas` | `candidates.self.read` | 🔴 |
| `candidate_documents` | ✅ | candidato | candidato | `/candidato/documentos` | `candidate_documents.read` | 🔴 |
| `candidate_profile_views` | ✅ | candidato | candidato | `/candidato/perfil` | `candidates.self.read` | 🔴 |
| `candidate_preferences` | NÃO EXISTE | candidato | candidato | `/candidato/preferencias` | `candidates.self.update` | ⚠️ |
| `talent_pool_memberships` | ✅ | recrutamento | recrutamento | `/dashboard/recrutamento/talent-pool` | `talent_pool.read` | 🟡 |

### 4.3 Empresa / Relacionamento

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `companies` | ✅ | empresas / crm | empresas | `/dashboard/empresas` | `companies.read` | 🟢 |
| `company_relationships` | ✅ | empresas / crm | empresas | `/dashboard/relacionamentos` | `companies.read` | 🟢 |
| `company_social_links` | ✅ | empresas | empresas | (join em companies) | `companies.read` | 🟢 |
| `media_assets` | ✅ | media / crm | media | `/dashboard/media/*` | `media_assets.read` | 🟢 |

### 4.4 Vagas

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `jobs` | ✅ | recrutamento / crm | recrutamento / empresas | `/dashboard/recrutamento/vagas`, `/dashboard/empresas` | `jobs.read`, `companies.read` | 🟢 |
| `public_jobs_v1` (view) | via `jobs` | recrutamento | recrutamento | `/vagas` (público) | — | 🟢 |

### 4.5 Recrutamento

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `applications` | ✅ | recrutamento / candidato | recrutamento / candidato | `/dashboard/recrutamento/candidaturas`, `/candidato/candidaturas` | `applications.read` | ⚠️ |
| `application_status_history` | ✅ | recrutamento | recrutamento | (sem página dedicada) | `applications.history.read` | 🔴 |
| `recruitment_processes` | ✅ | recrutamento | recrutamento | `/dashboard/recrutamento/processos-seletivos` | `recruitment.read` | 🔴 |
| `recruitment_stages` | ✅ | recrutamento | recrutamento | `/dashboard/recrutamento/etapas` | `recruitment.stage.manage` | 🔴 |
| `job_matches` | ✅ | recrutamento | recrutamento | `/dashboard/recrutamento/matches` | `talent_pool.match` | 🔴 |
| `recruitment_demands` | ✅ | recrutamento | recrutamento | `/dashboard/recrutamento/demandas` | `recruitment_demands.read` | 🔴 |

### 4.6 Funcionários

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `employees` | ✅ | rh | rh | `/dashboard/rh/funcionarios` | `people.read` | 🟡 |
| `employee_skills/.../documents/courses` | ✅ | rh | rh | `/dashboard/rh/funcionarios/*` | `people.read` | 🔴 |

### 4.7 Serviços

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `services` | ✅ | servicos / crm | servicos / empresas | `/dashboard/servicos` | `service_orders.read` | 🟢 |
| `public_services_v1` (view) | via `services` | servicos | servicos | `/servicos` (público) | — | 🟢 |
| `service_orders` | ✅ | servicos | servicos | `/dashboard/servicos/ordens` | `service_orders.read` | 🔴 |
| `service_executions` | ✅ | servicos | servicos | `/dashboard/servicos/execucoes` | `service_executions.read` | 🔴 |
| `service_process_steps` | ✅ | servicos | servicos | (migration não aplicada) | — | 🔴 |

### 4.8 Financeiro

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `accounts_payable/receivable` | ✅ | financeiro | financeiro | `/dashboard/financeiro/contas-pagar`, `/dashboard/financeiro/contas-receber` | `finance.accounts_payable.read` | 🔴 |
| `cash_flow`, `bank_accounts`, `cost_centers` | ✅ | financeiro | financeiro | `/dashboard/financeiro/fluxo-caixa`, `/dashboard/financeiro/bancos`, `/dashboard/financeiro/centros-custo` | `finance.cashflow.read` | 🔴 |
| `invoices`, `invoice_items` | ✅ | financeiro | financeiro | `/dashboard/faturamento/*` | `finance.billing.read` | 🔴 |
| `payments`, `receipts`, `financial_transactions` | ✅ | financeiro | financeiro | `/dashboard/financeiro/transacoes` | `finance.read` | 🔴 |
| `bank_reconciliations` | ✅ | financeiro | financeiro | `/dashboard/financeiro/conciliacao` | `finance.cashflow.read` | 🔴 |
| `financial_installments`, `financial_accounts`, `financial_categories` | ✅ | financeiro | financeiro | `/dashboard/financeiro/parcelamentos`, `/dashboard/financeiro/categoria` | `finance.read` | 🔴 |
| `fiscal_documents` | ✅ | fiscal | fiscal | `/dashboard/fiscal/documentos` | `fiscal.documents.read` | 🔴 |
| `accounting_entries` | ✅ | contabilidade | contabilidade | `/dashboard/contabilidade/lancamentos` | `accounting.entries.read` | 🔴 |
| `sales`, `quotes` | ✅ | financeiro / pos | financeiro / pos | `/dashboard/pos/vendas` | `pos_sales.read` | 🔴 |

### 4.9 Estoque / Almoxarifado

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `products`, `stock_movements` | ✅ | estoque | estoque | `/dashboard/estoque/produtos`, `/dashboard/estoque/movimentos` | `stock.read` | 🔴 |
| `warehouse_entries/issues/returns/custody` | ✅ | estoque | estoque | `/dashboard/estoque/almoxarifados` | `stock.read` | 🔴 |
| `epi` | ✅ | estoque | estoque | (sem rota dedicada) | `stock.read` | 🔴 |

### 4.10 Suporte

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `support_tickets` | ✅ | suporte | suporte | `/dashboard/suporte/tickets` | `support_tickets.read` | 🟡 |
| `support_messages` | ✅ | suporte | suporte | (sem página dedicada) | `support_tickets.read` | 🔴 |

### 4.11 Notificações & Comunicação

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `notifications` | ✅ | suporte / admin | suporte / admin | `/dashboard/notificacoes` | `notifications.read` | 🔴 |
| `chat_rooms`, `chat_messages` | ✅ | suporte | suporte | (chat widgets) | — | 🔴 |
| `email_logs`, `sms_logs` | ✅ | — | — | — | — | ⚪ |

### 4.12 Integrações & Auditoria

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `audit_logs` | ✅ | admin | admin | `/dashboard/admin/auditoria` | `admin.audit.read` | 🔴 |
| `security_events` | ✅ | admin | admin | `/dashboard/admin/seguranca` | `admin.security.read` | 🔴 |
| `integration_*` | ✅ | admin | admin | `/dashboard/admin/integracoes` | `admin.integrations.read` | 🔴 |
| `webhooks`, `webhook_deliveries` | ✅ | admin | admin | (sem página dedicada) | — | 🔴 |

### 4.13 Documentos & Mídia

| Tabela | RLS | Módulo | Célula | Rota | Permissão | Status |
|--------|-----|--------|--------|------|-----------|--------|
| `media_assets` | ✅ | media | media | `/dashboard/media/assets` | `media_assets.read` | 🟢 |
| `candidate_documents` | ✅ | candidato | candidato | `/candidato/documentos` | `candidate_documents.read` | 🔴 |
| `employee_documents` | ✅ | rh | rh | `/dashboard/rh/documentos-rh` | `people.read` | 🔴 |

### 4.14 Relatórios

| Página | Módulo | Célula | Rota | Permissão | Status |
|--------|--------|--------|------|-----------|--------|
| `RelatoriosPage` (hub) | relatorios | — | `/dashboard/relatorios` | `reports.read` | 🟡 |
| 11 páginas de relatório | relatorios | — | `/dashboard/relatorios/*` | `reports.read` | 🔴 |

### 4.15 Config / Admin

| Página | Módulo | Célula | Rota | Permissão | Status |
|--------|--------|--------|------|-----------|--------|
| `ConfiguracoesPage` | admin | admin | `/dashboard/admin/*` | `admin.read` | 🟡 |
| `LgpdPage` | admin | admin | (sem rota dedicada) | — | 🔴 |
| `TermosPage` | auth | core | `/auth/terms` | — | 🟢 |
| `MonitoramentoPage` | admin | admin | (sem rota dedicada) | — | 🔴 |
| `GestaoPage` | admin-master | admin-master | `/dashboard/global` | `domain_events.read` | 🟡 |
| `GestaoSaaSPage` | gestao-saas | admin-master | `/dashboard/gestao-saas` | `domain_events.read` | 🟡 |
| `CatalogoPage` | servicos / empresas | servicos / empresas | `/dashboard/servicos/catalogo` | `service_orders.read` | 🟡 |
| `AssinaturasPage` | assinaturas | admin | `/dashboard/admin/assinaturas` | `admin.subscriptions.read` | 🟡 |

---

## 5. Top 10 Gaps (Ordem de Bloqueio)

| # | Gap | Severidade | Blocker para |
|---|-----|-----------|--------------|
| 1 | Candidatos sem `auth_user_id` (4 de 8) | 🔴 P0 | Login do candidato |
| 2 | `candidate_preferences` não existe | 🔴 P0 | Página `/candidato/preferencias` 404 |
| 3 | `applications.status` ↔ frontend `current_stage` | 🔴 P0 | Lista de candidaturas, mapa quebrado |
| 4 | `candidate_experiences` schema drift | 🔴 P0 | `DashboardCandidato`, `CandidatoExperiencias` |
| 5 | `AuthContext.currentTenantId` pode ser `null` | 🔴 P0 | Tela preta `/dashboard/candidato` |
| 6 | `candidatesRepository.findAll(tenantId)` carrega todos | 🟠 P1 | Performance/UX de RH, Recrutador e Candidato |
| 7 | `DashboardCandidato` filtro incorreto | 🟠 P1 | Lista de candidaturas sempre vazia |
| 8 | Zero `applications` no DB | 🟠 P1 | "Suas candidaturas" sempre vazio |
| 9 | Zero dados em 60+ tabelas | 🟠 P1 | Dashboard pages com `EmptyState` |
| 10 | Sem feedback (ErrorBoundary, NotFoundState, Skeleton) | 🟡 P2 | UX de falha |

---

## 6. Módulos Sem Implementação (🔴)

| ID | Título | Motivo |
|----|--------|--------|
| `contratos` | Contratos | Sem célula, sem rotas, sem páginas |
| `crm` | CRM | Sobrepõe `empresas`; sem célula própria |
| `faturamento` | Faturamento | Sobrepõe `financeiro`; sem célula própria |
| `relatorios` | Relatórios | Hub vazio; 11 páginas `EmptyState` |
| `ia` | IA & Automação | Sem implementação backend |
| `integracoes` | Integrações | Sem implementação backend |
| `configuracoes-saas` | Configurações SaaS | Sem implementação |
| `preferencias` | Preferências | Sem implementação |

---

## 7. Módulo Duplicado / Órfão

| Pasta | Problema | Ação Sugerida |
|-------|----------|---------------|
| `midia/` | Estrutura não segue padrão `cellContract`/`routes`/`permissions`. Não registrado em `module-routes.ts` nem `register-cells.ts`. | Fundir em `media/` ou remover. |

---

## 8. Estrutura de Arquivos por Módulo (padrão aplicado)

Cada módulo implementado segue esta estrutura:

```
src/modules/<id>/
├── index.ts                  # Exportação pública
├── manifest.ts               # Manifesto da célula (CellRegistry)
├── types/index.ts            # Tipos de domínio + ModuleMeta
├── permissions/index.ts      # Permissões do módulo
├── cellContract.ts           # Contrato da célula (CellContract)
├── routes/index.ts           # Rotas do módulo (ModuleRoute[])
└── (outros: pages, services, repositories, components, dashboard)
```

**Módulos que seguem o padrão (17/18):**
admin, admin-master, admin-tenant, ava, candidato, contabilidade, empresas, estoque, financeiro, fiscal, media, operacoes, pos, recrutamento, rh, servicos, suporte

**Módulo fora do padrão:**
- `midia/` — estrutura própria, não registrada

---

## 9. Correspondência App.tsx × module-routes.ts

| Rota em App.tsx | Módulo | Status |
|-----------------|--------|--------|
| `/dashboard/admin-tenant/*` | admin-tenant | ✅ |
| `/dashboard/operacoes/*` | operacoes | ✅ |
| `/dashboard/pos/*` | pos | ✅ |
| `/dashboard/media/*` | media | ✅ |
| `/dashboard/ava/*` | ava | ✅ |
| `/dashboard/recrutamento/*` | recrutamento | ✅ |
| `/dashboard/fiscal/*` | fiscal | ✅ |
| `/dashboard/estoque/*` | estoque | ✅ |
| `/dashboard/suporte/*` | suporte | ✅ |
| `/dashboard/financeiro/*` | financeiro | ✅ |
| `/dashboard/empresas/*` | empresas | ✅ |
| `/dashboard/contabilidade/*` | contabilidade | ✅ |
| `/dashboard/admin/*` | admin | ✅ |
| `/dashboard/rh` | rh | ✅ |
| `/dashboard/candidatos` | recrutamento | ✅ |
| `/dashboard/vagas` | recrutamento | ✅ |
| `/dashboard/servicos` | servicos | ✅ |
| `/dashboard/almoxarifado` | estoque | ✅ |
| `/dashboard/tenants` | admin / admin-master | ✅ |
| `/dashboard/onboarding` | admin | ✅ |
| `/dashboard/assinaturas` | admin | ✅ |
| `/dashboard/gestao-saas` | admin-master | ✅ |
| `/dashboard/roles-permissoes` | admin | ✅ |
| `/dashboard/usuarios` | admin | ✅ |
| `/dashboard/auditoria` | admin | ✅ |
| `/dashboard/ia` | ava | ✅ |
| `/dashboard/integracoes` | admin | ✅ |
| `/dashboard/configuracoes/seguranca` | admin | ✅ |
| `/dashboard/*` (fallback) | ModuleRouter genérico | ✅ |
| `/candidato/*` | candidato | ✅ |

**Correspondência:** 100% — todos os módulos em `module-routes.ts` têm rota correspondente em `App.tsx`.

---

## 10. Legenda de Status

- 🟢 OK — contrato bate, dados fluem
- 🟡 Parcial — UI ok, mas DB vazio ou mock ativo
- 🔴 Backend pronto, sem UI / tela quebrada
- 🔵 UI pronta, sem backend
- ⚠️ Quebrado — dessincronia schema↔tipo / RLS leak / tela preta
- ⚪ Não precisa / não se aplica

---

**Próximos passos:**
1. Criar `candidate_preferences` no banco (migração)
2. Alinhar `applications.status` ↔ `current_stage`
3. Popular dados seed para módulos 🔴
4. Implementar módulos não implementados (contratos, faturamento, relatórios, IA, integrações)
5. Resolver duplicado `midia/` vs `media/`
