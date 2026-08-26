# C1.7-C — Cloud Reconciliation

## Objetivo

Reconciliar o schema físico do Supabase Cloud com o inventário canônico de 32 tabelas e confirmar a verdade do banco antes de implementar UI.

## Fonte da verdade

- **Projeto:** J&S Empregos LTDA
- **Supabase Project:** `js-empregos` (`okxqfyoqbhcmflpurfrw`)
- **Schema:** `public`
- **Método:** Dump do schema remoto via `pg` (`information_schema` + `pg_catalog`)
- **Data da extração:** 2026-08-26

## Contagem física confirmada no Cloud

| Objeto       | Qtd                                      |
| ------------ | ---------------------------------------- |
| Tabelas      | 199                                      |
| Colunas      | 1.938                                    |
| Enums        | 1 (`business_error_code`)                |
| Views        | 2 (`financial_kpis`, `recruitment_kpis`) |
| Foreign Keys | 507                                      |
| Primary Keys | 200                                      |
| Índices      | 784                                      |
| Policies RLS | 553                                      |

## Inventário canônico (migrations locais)

| Objeto            | Qtd                       |
| ----------------- | ------------------------- |
| Tabelas canônicas | 32                        |
| Enums canônicos   | 1 (`business_error_code`) |
| Policies RLS      | confirmadas por tabela    |

## Divergência principal

| Item         | Canônico | Cloud   |
| ------------ | -------- | ------- |
| Tabelas      | 32       | **199** |
| Enums        | 1        | 1       |
| RLS Policies | ~50      | 553     |

### Implicação

O schema local não representa a totalidade do banco físico. Existem **167 tabelas adicionais** no Cloud que não possuem migration de criação canônica correspondente.

## Tabelas canônicas faltando no Cloud (2)

- `candidate_preferences`
- `role_resource_permissions`

## Tabelas novas no Cloud sem correspondência canônica (167)

Classificação preliminar por domínio:

### admin (4)

- administrative_approvals
- administrative_documents
- administrative_requests
- administrative_tasks

### ai (3)

- ai_conversations
- ai_messages
- ai_usage

### audit_security (3)

- audit_logs
- domain_events
- security_events

### auth (2)

- first_login_state
- legal_acceptances

### automation_integrations (8)

- automation_executions
- automation_jobs
- automation_templates
- event_deliveries
- event_outbox
- event_participants
- integration_sync_jobs
- webhook_deliveries

### calendar_meetings (5)

- calendar_events
- calendar_integrations
- calendars
- meeting_room_reservations
- meeting_rooms

### contracts (2)

- contracts
- contract_status_history

### core (10)

- consents
- data_deletion_requests
- data_export_requests
- data_retention_policies
- password_policies
- people
- privacy_requests
- sessions
- tenant_memberships
- tenants

### crm (9)

- companies
- company_contacts
- company_locations
- company_relationships
- company_services
- customer_feedback
- customer_ratings
- customers
- leads

### dashboard (2)

- dashboard_layouts
- dashboard_widgets

### desconhecido (4)

- document_links
- document_versions
- interactions
- tenant_settings

### feedback (1)

- feedback

### finance (12)

- accounts_payable
- accounts_receivable
- bank_reconciliations
- cost_centers
- financial_accounts
- financial_categories
- financial_installment_cancellations
- financial_installment_payments
- financial_installments
- financial_transactions
- payments
- receipts

### fiscal (12)

- fiscal_api_requests
- fiscal_api_responses
- fiscal_configurations
- fiscal_document_events
- fiscal_document_items
- fiscal_document_status_history
- fiscal_documents
- fiscal_integrations
- invoice_items
- invoices
- tax_calculations
- tax_rates

### hr (11)

- departments
- employee_contracts
- employee_documents
- employee_positions
- employee_status_history
- employees
- epi_deliveries
- epi_delivery_items
- epi_return_items
- epi_returns
- positions

### knowledge (1)

- faqs

### materials (4)

- material_issue_items
- material_issues
- material_return_items
- material_returns

### notifications (5)

- email_messages
- email_templates
- notification_deliveries
- notification_preferences
- notifications

### operations (3)

- third_party_custody
- third_party_custody_items
- validation_results

### purchasing (11)

- purchase_order_items
- purchase_orders
- purchase_quotation_items
- purchase_quotations
- purchase_receipt_divergences
- purchase_receipt_items
- purchase_receipts
- purchase_request_items
- purchase_requests
- purchase_status_history
- suppliers

### rbac (4)

- permissions
- role_assignments
- role_permissions
- roles

### recruitment (23)

- application_profile_snapshots
- application_status_history
- applications
- candidate_courses
- candidate_documents
- candidate_education
- candidate_experiences
- candidate_languages
- candidate_processes
- candidate_profile_views
- candidate_skills
- candidates
- interview_feedback
- interview_participants
- interviews
- job_matches
- job_skills
- jobs
- recruitment_demands
- recruitment_processes
- recruitment_stages
- stage_templates
- talent_pool_memberships

### reports (3)

- report_definitions
- report_executions
- report_schedules

### sales_pos (15)

- pos_cancellations
- pos_cash_movements
- pos_cashier_sessions
- pos_cashiers
- pos_daily_closures
- pos_operators
- pos_payments
- pos_returns
- pos_sale_items
- pos_sales
- pos_terminals
- quote_items
- quotes
- sale_items
- sales

### service_field (15)

- service_acceptances
- service_attachments
- service_executions
- service_occurrences
- service_order_items
- service_order_status_history
- service_orders
- service_sla
- work_order_acceptances
- work_order_assignments
- work_order_attachments
- work_order_checklists
- work_order_materials
- work_order_occurrences
- work_orders

### stock (11)

- product_categories
- products
- services
- stock_balances
- stock_entries
- stock_inventory
- stock_inventory_items
- stock_lots
- stock_movements
- warehouse_locations
- warehouses

### storage (2)

- file_access_logs
- files

### support_chat (7)

- chat_handoffs
- chat_participants
- support_ticket_assignments
- support_ticket_categories
- support_ticket_messages
- support_ticket_status_history
- support_tickets

### tasks (4)

- task_attachments
- task_comments
- task_status_history
- tasks

## Views estratégicas confirmadas (2)

| View               | Provável propósito                            |
| ------------------ | --------------------------------------------- |
| `financial_kpis`   | KPIs agregados para dashboard financeira      |
| `recruitment_kpis` | KPIs agregados para dashboard de recrutamento |

## Observações importantes

1. **199 tabelas** no Cloud é a contagem definitiva do schema físico atual.
2. A divergência com o inventário canônico (32) não é apenas documental: existem migrations locais faltando ou nunca aplicadas no Cloud.
3. Várias tabelas do Cloud **não existem no inventário canônico** e precisam ser avaliadas uma a uma.
4. **RLS está massivamente presente:** 553 policies indicam que o isolamento por `tenant_id` e RBAC está implementado no Cloud em muito mais tabelas do que o inventário local previa.
5. A regra de isolamento (`people` não é usuários globais, `tenant_id` acompanha domínios, RBAC em múltiplas camadas) **deve ser verificada tabela por tabela** antes de qualquer implementação de UI.

## Próximos passos (C1.7-C)

1. Mapear cada tabela desconhecida para domínio → módulo → permission → rota → UI.
2. Identificar tabelas legadas ou obsoletas para eventual remoção ou arquivamento.
3. Fechar matriz de reconciliação definitiva antes de iniciar C1.7-A.
