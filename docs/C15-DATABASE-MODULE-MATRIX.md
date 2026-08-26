# C1.5 — Database × Module Matrix

## Objetivo

Cruzar as tabelas do banco com os módulos do `ModuleRegistry` e os repositórios existentes.

## Regra

- Se a tabela existe no banco, o módulo pode existir.
- Se não existir tabela correspondente, o módulo não deve ser criado.
- Se o módulo existir mas não houver tabela no schema tipado, investigar antes de implementar UI.

## Módulos × Tabelas × Status

| Módulo           | Tabela(s) principal(is)                                                                                    | No banco | No database.ts                 | Repository                                   | Rota | UI             | Observação                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | -------------------------------------------- | ---- | -------------- | ----------------------------- |
| inicio           | people / jobs / candidates / applications / domain_events                                                  | sim      | sim                            | parcial                                      | sim  | sim            | DashboardHome com dados reais |
| tenants          | tenants / tenant_memberships                                                                               | sim      | sim                            | nao                                          | sim  | sim            |                               |
| clientes         | companies / company_relationships / leads / budget_requests                                                | sim      | empresas/leads/budget_requests | parcial                                      | sim  | parcial        | UI com mock removida          |
| onboarding       | tenants / tenant_memberships / roles                                                                       | sim      | sim                            | nao                                          | sim  | sim            |                               |
| assinaturas      | finance_* / invoices / subscriptions                                                                       | sim      | nao                            | nao                                          | sim  | sob construcao | Reconciliar schema financeiro |
| gestao-saas      | domain_events / tenants / people                                                                           | sim      | nao                            | nao                                          | sim  | sob construcao |                               |
| usuarios         | people / roles / role_assignments                                                                          | sim      | sim                            | users                                        | sim  | sim            |                               |
| roles-permissoes | roles / permissions / role_permissions                                                                     | sim      | sim                            | nao                                          | sim  | sim            |                               |
| auditoria        | audit_logs / security_events / domain_events                                                               | sim      | nao                            | nao                                          | sim  | sim            |                               |
| documentos       | files / document_versions / document_links                                                                 | sim      | nao                            | nao                                          | sim  | sob construcao |                               |
| contratos        | contracts / contract_versions                                                                              | sim      | nao                            | nao                                          | sim  | sob construcao |                               |
| termos           | legal_acceptances / first_login_state                                                                      | sim      | sim                            | nao                                          | sim  | sim            |                               |
| rh               | people / employees / candidates                                                                            | sim      | parcial                        | users / candidates                           | sim  | parcial        |                               |
| recrutamento     | jobs / applications / recruitment_processes / recruitment_stages                                           | sim      | sim                            | jobs / candidates / recruitment-processes    | sim  | parcial        |                               |
| financeiro       | financial_transactions / accounts_payable / accounts_receivable / financial_accounts / invoices / payments | sim      | financial_transactions         | nao                                          | sim  | sob construcao |                               |
| fiscal           | fiscal_documents / fiscal_document_items / tax_rates / tax_calculations                                    | sim      | nao                            | nao                                          | sim  | sob construcao |                               |
| contabilidade    | accounting_chart_of_accounts / accounting_entries / accounting_trial_balance                               | sim      | nao                            | nao                                          | sim  | sob construcao |                               |
| gestao           | companies / company_relationships / contracts / service_orders                                             | sim      | parcial                        | companies / partners / recruitment-processes | sim  | parcial        |                               |
| estoque          | stock_movements / stock_balances / stock_entries / stock_inventory / warehouses / products                 | sim      | stock_movements                | nao                                          | sim  | sob construcao |                               |
| servicos         | services / service_orders / service_executions / service_occurrences / support_tickets                     | sim      | services                       | partners                                     | sim  | parcial        |                               |
| suporte          | support_tickets / support_ticket_messages / support_ticket_assignments / faq                               | sim      | support_tickets                | nao                                          | sim  | sob construcao |                               |
| relatorios       | report_definitions / report_executions / report_schedules                                                  | sim      | report_definitions             | nao                                          | sim  | sob construcao |                               |
| ia               | ai_conversations / ai_messages / ai_usage / automations / automation_jobs                                  | sim      | nao                            | nao                                          | sim  | sob construcao |                               |

## Tabelas confirmadas no banco mas fora do schema tipado atual

- accounts_payable
- accounts_receivable
- financial_accounts
- financial_transactions
- financial_installments
- fiscal_documents
- fiscal_document_items
- tax_rates
- tax_calculations
- stock_balances
- stock_entries
- stock_inventory
- warehouses
- products
- purchase_orders
- purchase_requests
- purchase_quotations
- purchase_receipts
- service_executions
- service_occurrences
- support_ticket_messages
- support_ticket_assignments
- report_executions
- report_schedules
- automation_jobs
- automation_executions
- automation_templates
- ai_conversations
- ai_messages
- ai_usage
- audit_logs
- security_events
- domain_events
- event_outbox
- event_deliveries
- notifications
- notification_deliveries
- notification_preferences
- chat_rooms
- chat_messages
- email_messages
- tasks
- task_comments
- task_attachments
- invoices
- payments
- receipts
- sales
- quotes
- pos_*
- documents / document_versions / document_links
- contracts / contract_versions
- accounting_chart_of_accounts
- accounting_entries
- accounting_trial_balance
- company_contacts
- company_relationship_types
- employees
- candidate_experiences
- candidate_education
- candidate_courses
- candidate_languages
- candidate_documents
- candidate_skills
- candidate_profile_views
- skills
- consents
- sessions
- files

## Observação

Esta matriz não deve ser usada para criar páginas de forma indiscriminada.
Ela serve para identificar o que já pode ser implementado com base em tabela + permission + rota reais.
