# C1.5 — Route × Permission Matrix

## Objetivo

Cruzar rotas administrativas com permissões reais.

## Rotas administrativas conhecidas

| Rota                        | Módulo           | Tabela principal                                                | Permission                  | UI                                      | Status         |
| --------------------------- | ---------------- | --------------------------------------------------------------- | --------------------------- | --------------------------------------- | -------------- |
| /dashboard                  | inicio           | people / jobs / candidates / applications                       | dashboard.read              | DashboardHome                           | real           |
| /dashboard/tenants          | tenants          | tenants / tenant_memberships                                    | tenants.read                | TenantsPage                             | real           |
| /dashboard/clientes         | clientes         | companies / company_relationships / leads                       | companies.read              | ClientesPage                            | real           |
| /dashboard/onboarding       | onboarding       | tenants / tenant_memberships                                    | tenants.read                | OnboardingPage                          | real           |
| /dashboard/assinaturas      | assinaturas      | finance_* / invoices                                            | finance.read                | AssinaturasPage                         | sob construcao |
| /dashboard/gestao-saas      | gestao-saas      | domain_events / tenants                                         | domain_events.read          | GestaoSaaSPage                          | sob construcao |
| /dashboard/usuarios         | usuarios         | people / roles / role_assignments                               | people.read                 | UsuariosPage                            | real           |
| /dashboard/roles-permissoes | roles-permissoes | roles / permissions / role_permissions                          | roles.read                  | RolesPermissoesPage                     | real           |
| /dashboard/auditoria        | auditoria        | audit_logs / security_events / domain_events                    | audit.read                  | AuditoriaPage                           | real           |
| /dashboard/documentos       | documentos       | files / document_versions / document_links                      | files.read                  | DocumentosPage                          | sob construcao |
| /dashboard/contratos        | contratos        | contracts / contract_versions                                   | contracts.read              | ContratosPage                           | sob construcao |
| /dashboard/termos           | termos           | legal_acceptances / first_login_state                           | documents.read              | TermosPage                              | real           |
| /dashboard/rh               | rh               | people / employees / candidates                                 | people.read                 | RhPage                                  | parcial        |
| /dashboard/recrutamento     | recrutamento     | jobs / applications / recruitment_processes                     | jobs.read / candidates.read | Vagas / Candidatos / ProcessosSeletivos | parcial        |
| /dashboard/financeiro       | financeiro       | financial_transactions / accounts_payable / accounts_receivable | finance.dashboard.read      | FinanceiroPage                          | sob construcao |
| /dashboard/fiscal           | fiscal           | fiscal_documents / fiscal_document_items / tax_rates            | fiscal.dashboard.read       | FiscalPage                              | sob construcao |
| /dashboard/contabilidade    | contabilidade    | accounting_chart_of_accounts / accounting_entries               | accounting.dashboard.read   | ContabilidadePage                       | sob construcao |
| /dashboard/gestao           | gestao           | companies / company_relationships / contracts / service_orders  | companies.read              | GestaoPage                              | parcial        |
| /dashboard/estoque          | estoque          | stock_movements / stock_balances / products                     | stock_movements.read        | EstoquePage                             | sob construcao |
| /dashboard/servicos         | servicos         | services / service_orders / support_tickets                     | service_orders.read         | ServicosPage                            | parcial        |
| /dashboard/suporte          | suporte          | support_tickets / support_ticket_messages                       | support_tickets.read        | SuportePage                             | sob construcao |
| /dashboard/relatorios       | relatorios       | report_definitions / report_executions / report_schedules       | reports.read                | RelatoriosPage                          | sob construcao |
| /dashboard/ia               | ia               | ai_conversations / ai_messages / automations                    | ai.read                     | IaPage                                  | sob construcao |

## Observação

Rotas só devem existir se houver permissão correspondente no banco.
