# C1.3 — Reconciliação: Banco Canônico V2.1 ↔ Frontend

## 1. Tabelas do Schema V2.1

| #   | Tabela                          | Escopo | Descrição                                        |
| --- | ------------------------------- | ------ | ------------------------------------------------ |
| 1   | `tenants`                       | global | Tenants / organizações SaaS                      |
| 2   | `people`                        | global | Identidade canônica de pessoas                   |
| 3   | `tenant_memberships`            | tenant | Vínculo person ↔ tenant                          |
| 4   | `company_types`                 | global | Natureza jurídica                                |
| 5   | `companies`                     | global | Entidades jurídicas / comerciais                 |
| 6   | `company_relationship_types`    | global | Tipo de relacionamento (client/partner/supplier) |
| 7   | `company_relationships`         | tenant | Relacionamento company ↔ tenant                  |
| 8   | `company_contacts`              | tenant | Contatos de empresa                              |
| 9   | `skills`                        | global | Catálogo de habilidades                          |
| 10  | `candidates`                    | tenant | Contexto de recrutamento da pessoa               |
| 11  | `candidate_skills`              | tenant | Habilidades do candidato                         |
| 12  | `candidate_preferences`         | tenant | Preferências de busca do candidato               |
| 13  | `candidate_profile_views`       | tenant | Visualizações de perfil                          |
| 14  | `jobs`                          | tenant | Vagas de emprego                                 |
| 15  | `job_skills`                    | tenant | Habilidades requeridas pela vaga                 |
| 16  | `job_matches`                   | tenant | Matching candidato ↔ vaga                        |
| 17  | `applications`                  | tenant | Candidaturas                                     |
| 18  | `application_status_history`    | tenant | Histórico imutável de status                     |
| 19  | `application_profile_snapshots` | tenant | Snapshot do perfil na candidatura                |
| 20  | `talent_pool_memberships`       | tenant | Banco de talentos                                |
| 21  | `roles`                         | global | Papéis de autorização                            |
| 22  | `permissions`                   | global | Permissões canônicas                             |
| 23  | `role_permissions`              | global | Vínculo role ↔ permission                        |
| 24  | `role_assignments`              | global | Atribuição de role a person                      |
| 25  | `role_resource_permissions`     | global | Matriz de autorização                            |
| 26  | `files`                         | tenant | Arquivos / documentos                            |
| 27  | `file_access_logs`              | tenant | Auditoria de acesso a arquivos                   |
| 28  | `domain_events`                 | tenant | Eventos de domínio (outbox)                      |
| 29  | `notifications`                 | tenant | Notificações                                     |
| 30  | `notification_deliveries`       | tenant | Entregas por canal                               |
| 31  | `notification_preferences`      | tenant | Preferências de notificação                      |
| 32  | `first_login_state`             | tenant | Estado de primeiro acesso                        |
| 33  | `legal_acceptances`             | tenant | Aceites legais (LGPD/termos)                     |

## 2. Repositories Existentes

| Repository                             | Tabela(s)                                                  | Status               |
| -------------------------------------- | ---------------------------------------------------------- | -------------------- |
| `candidates.repository.ts`             | candidates, candidate_skills                               | OK                   |
| `companies.repository.ts`              | companies, company_relationships, company_contacts         | OK                   |
| `financial-transactions.repository.ts` | _(finance/fiscal/accounting tables não existem no schema)_ | ⚠️ Precisa validação |
| `jobs.repository.ts`                   | jobs, job_skills                                           | OK                   |
| `leads.repository.ts`                  | leads _(tabela não existe no schema)_                      | ⚠️ GAP               |
| `partners.repository.ts`               | partners _(tabela não existe no schema)_                   | ⚠️ GAP               |
| `recruitment-processes.repository.ts`  | applications, application_status_history                   | OK                   |
| `reports.repository.ts`                | reports _(tabela não existe no schema)_                    | ⚠️ GAP               |
| `service-catalog.repository.ts`        | services _(tabela não existe no schema)_                   | ⚠️ GAP               |
| `services.repository.ts`               | services _(tabela não existe no schema)_                   | ⚠️ GAP               |
| `settings.repository.ts`               | settings _(tabela não existe no schema)_                   | ⚠️ GAP               |
| `stock-movements.repository.ts`        | stock_movements _(tabela não existe no schema)_            | ⚠️ GAP               |
| `suppliers.repository.ts`              | suppliers _(tabela não existe no schema)_                  | ⚠️ GAP               |
| `support-tickets.repository.ts`        | support_tickets _(tabela não existe no schema)_            | ⚠️ GAP               |
| `users.repository.ts`                  | people (como users)                                        | OK                   |

## 3. Páginas Existentes

| Página                    | Tabela(s) usadas                                                                            | Tipo              | Status      |
| ------------------------- | ------------------------------------------------------------------------------------------- | ----------------- | ----------- |
| `DashboardHome.tsx`       | tenants, people, companies, jobs, candidates, applications, domain_events                   | Real              | OK          |
| `VisaoGeral.tsx`          | jobs, candidates, companies                                                                 | Real              | OK (legacy) |
| `TenantsPage.tsx`         | tenants                                                                                     | Real              | OK          |
| `ClientesPage.tsx`        | companies                                                                                   | Real              | OK          |
| `Empresas.tsx`            | companies                                                                                   | Real              | OK (legacy) |
| `RhPage.tsx`              | people                                                                                      | Real              | OK          |
| `Usuarios.tsx`            | people                                                                                      | Real              | OK (legacy) |
| `Vagas.tsx`               | jobs                                                                                        | Real              | OK (legacy) |
| `Candidatos.tsx`          | candidates                                                                                  | Real              | OK (legacy) |
| `Fornecedores.tsx`        | companies (supplier relationships)                                                          | Real              | OK          |
| `Parceiros.tsx`           | companies (partner relationships)                                                           | Real              | OK          |
| `ProcessosSeletivos.tsx`  | applications                                                                                | Real              | OK (legacy) |
| `Servicos.tsx`            | services _(não existe)_                                                                     | UnderConstruction | GAP         |
| `Estoque.tsx`             | stock_movements _(não existe)_                                                              | UnderConstruction | GAP         |
| `Suporte.tsx`             | support_tickets _(não existe)_                                                              | UnderConstruction | GAP         |
| `Relatorios.tsx`          | reports _(não existe)_                                                                      | UnderConstruction | GAP         |
| `Configuracoes.tsx`       | settings _(não existe)_                                                                     | UnderConstruction | GAP         |
| `DocumentosPage.tsx`      | files                                                                                       | Real              | OK          |
| `TermosPage.tsx`          | legal_acceptances                                                                           | Real              | OK          |
| `LgpdPage.tsx`            | legal_acceptances                                                                           | Real              | OK          |
| `SegurancaPage.tsx`       | roles                                                                                       | Real              | OK          |
| `OnboardingPage.tsx`      | tenants                                                                                     | Real              | OK          |
| `GestaoSaaSPage.tsx`      | domain_events                                                                               | Real              | OK          |
| `RolesPermissoesPage.tsx` | roles, permissions                                                                          | Real              | OK          |
| `AuditoriaPage.tsx`       | domain_events                                                                               | Real              | OK          |
| `GestaoPage.tsx`          | companies, people, jobs                                                                     | Real              | OK          |
| `RbacAuditPage.tsx`       | people, roles, permissions, role_permissions, tenants, tenant_memberships, role_assignments | Real              | OK          |
| `FinanceiroPage.tsx`      | —                                                                                           | UnderConstruction | GAP         |
| `FiscalPage.tsx`          | —                                                                                           | UnderConstruction | GAP         |
| `ContabilidadePage.tsx`   | —                                                                                           | UnderConstruction | GAP         |
| `IntegracoesPage.tsx`     | —                                                                                           | UnderConstruction | GAP         |
| `MonitoramentoPage.tsx`   | —                                                                                           | UnderConstruction | GAP         |
| `CatalogoPage.tsx`        | —                                                                                           | UnderConstruction | GAP         |
| `ContratosPage.tsx`       | —                                                                                           | UnderConstruction | GAP         |
| `AssinaturasPage.tsx`     | —                                                                                           | UnderConstruction | GAP         |
| `IaPage.tsx`              | —                                                                                           | UnderConstruction | GAP         |

## 4. Matriz de Reconciliação

### 4.1 Tabelas COM página correspondente

| Tabela            | Página                                       | Repository                       | Dados | Ação   |
| ----------------- | -------------------------------------------- | -------------------------------- | ----- | ------ |
| tenants           | TenantsPage, OnboardingPage                  | direto                           | sim   | manter |
| people            | RhPage, Usuarios                             | users.repository                 | sim   | manter |
| companies         | ClientesPage, Empresas, GestaoPage           | companies.repository             | sim   | manter |
| candidates        | Candidatos                                   | candidates.repository            | sim   | manter |
| jobs              | Vagas, VisaoGeral                            | jobs.repository                  | sim   | manter |
| applications      | ProcessosSeletivos                           | recruitment-processes.repository | sim   | manter |
| domain_events     | AuditoriaPage, GestaoSaaSPage, DashboardHome | direto                           | sim   | manter |
| files             | DocumentosPage                               | direto                           | sim   | manter |
| roles             | SegurancaPage, RolesPermissoesPage           | direto                           | sim   | manter |
| permissions       | RolesPermissoesPage                          | direto                           | sim   | manter |
| legal_acceptances | TermosPage, LgpdPage                         | direto                           | sim   | manter |
| first_login_state | AuthRoute, AuthWelcome                       | direto                           | sim   | manter |

### 4.2 Tabelas SEM página correspondente

| Tabela                        | Motivo                                    | Ação sugerida                        |
| ----------------------------- | ----------------------------------------- | ------------------------------------ |
| application_status_history    | Usado internamente por ProcessosSeletivos | Página de detalhe da candidatura     |
| application_profile_snapshots | Usado internamente                        | Página de detalhe da candidatura     |
| candidate_skills              | Sem página própria                        | Página de perfil do candidato        |
| candidate_preferences         | Sem página própria                        | Página de preferências               |
| candidate_profile_views       | Sem página própria                        | Página de analytics de perfil        |
| company_types                 | Sem página própria                        | Página de cadastro de tipos          |
| company_relationship_types    | Sem página própria                        | Página de configuração               |
| company_relationships         | Sem página própria                        | Página de relacionamentos comerciais |
| company_contacts              | Sem página própria                        | Página de contatos da empresa        |
| skills                        | Sem página própria                        | Página de catálogo de habilidades    |
| job_matches                   | Sem página própria                        | Página de matching                   |
| talent_pool_memberships       | Sem página própria                        | Página de banco de talentos          |
| role_assignments              | Sem página própria                        | Página de atribuições                |
| role_resource_permissions     | Sem página própria                        | Página de matriz RBAC                |
| files (file_access_logs)      | Sem página própria                        | Página de auditoria de arquivos      |
| notifications                 | Sem página própria                        | Página de notificações               |
| notification_deliveries       | Sem página própria                        | Página de entregas                   |
| notification_preferences      | Sem página própria                        | Página de preferências               |

### 4.3 Repositories com GAP (referenciam tabelas que não existem)

| Repository                             | Problema                                              | Ação sugerida                         |
| -------------------------------------- | ----------------------------------------------------- | ------------------------------------- |
| `financial-transactions.repository.ts` | Não há tabela `financial_transactions`                | Remover ou aguardar schema financeiro |
| `leads.repository.ts`                  | Não há tabela `leads`                                 | Remover ou aguardar schema CRM        |
| `partners.repository.ts`               | Não há tabela `partners` (usa company_relationships)  | Reapontar para company_relationships  |
| `reports.repository.ts`                | Não há tabela `reports`                               | Remover ou aguardar schema            |
| `service-catalog.repository.ts`        | Não há tabela `service_catalog`                       | Remover ou aguardar schema            |
| `services.repository.ts`               | Não há tabela `services`                              | Remover ou aguardar schema            |
| `settings.repository.ts`               | Não há tabela `settings`                              | Remover ou aguardar schema            |
| `stock-movements.repository.ts`        | Não há tabela `stock_movements`                       | Remover ou aguardar schema            |
| `suppliers.repository.ts`              | Não há tabela `suppliers` (usa company_relationships) | Reapontar para company_relationships  |
| `support-tickets.repository.ts`        | Não há tabela `support_tickets`                       | Remover ou aguardar schema            |

## 5. Gaps Críticos

1. **Repositories órfãos**: 10 repositories referenciam tabelas que não existem no schema V2.1.
2. **Páginas UnderConstruction sem dados**: 8 páginas estão como "em construção" sem conexão real com banco.
3. **Tabelas sem página**: 16 tabelas não têm interface frontend.
4. **ModuleRegistry vs Schema**: Alguns módulos no registry não correspondem a tabelas reais (ex: `financeiro` sem tabelas financeiras).

## 6. Proposta de Ordem de Implementação

### Fase 1 — Reconciliação Imediata (sem novas telas)

- [ ] Remover/ajustar repositories órfãos (`financial-transactions`, `leads`, `reports`, `service-catalog`, `services`, `settings`, `stock-movements`, `support-tickets`)
- [ ] Reapontar `partners.repository.ts` e `suppliers.repository.ts` para `company_relationships`
- [ ] Corrigir queries 400 em `DocumentosPage.tsx`, `AuditoriaPage.tsx`, etc.
- [ ] Validar todas as queries do DashboardHome contra RLS

### Fase 2 — Páginas Faltantes Essenciais

- [ ] `CompanyRelationshipsPage` — relacionamentos comerciais
- [ ] `CompanyContactsPage` — contatos de empresas
- [ ] `CandidateSkillsPage` — habilidades de candidatos
- [ ] `ApplicationDetailPage` — detalhe da candidatura com histórico
- [ ] `SkillsPage` — catálogo de habilidades

### Fase 3 — Módulos UnderConstruction com Dados Reais

- [ ] `Servicos` → `services` (criar tabela ou remover módulo)
- [ ] `Estoque` → `stock_movements` (criar tabela ou remover módulo)
- [ ] `Suporte` → `support_tickets` (criar tabela ou remover módulo)
- [ ] `Financeiro` → aguardar schema financeiro ou remover módulo
- [ ] `Fiscal` → aguardar schema fiscal ou remover módulo
- [ ] `Contabilidade` → aguardar schema contábil ou remover módulo

### Fase 4 — Analytics e Relatórios

- [ ] `ReportsPage` — relatórios consolidados
- [ ] `NotificationsPage` — centro de notificações
- [ ] `TalentPoolPage` — banco de talentos
