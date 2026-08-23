# AUDITORIA V2.1 — RESULTADO

Gerado em: 2026-08-23T07:57:34.082Z

## Projeto

- Banco conectado: postgres
- Host retornado: ::1
- Porta retornada: 5432
- Timezone do banco: UTC
- Data/hora UTC da consulta: 2026-08-23T10:56:39.838Z

> Observação: o host retornado foi ::1 (loopback), não o hostname esperado do Supabase remoto. Isso sugere que a conexão pode ter sido resolvida para localhost/proxy local, não diretamente ao cluster remoto.

## Deploy

STATUS: INCONCLUSIVO
DATA: não foi possível confirmar data/hora exata de deploy.
EVIDÊNCIA: a connection string aponta para o projeto Supabase, mas o host retornado foi ::1, não confirmando inequivocamente o ambiente remoto. Migration history não pôde ser lida em formato confiável.

## Contagem

| Categoria                  | Quantidade |
| -------------------------- | ---------- |
| Tabelas                    | 199        |
| Views                      | 2          |
| Sequences                  | 0          |
| Functions                  | 210        |
| Triggers                   | 67         |
| Indexes                    | 607        |
| Tabelas com RLS habilitado | 199        |
| Policies                   | 553        |

## Tabelas

Total no remoto: 199

### Tabelas canônicas esperadas vs remoto

| Status                | Quantidade |
| --------------------- | ---------- |
| Esperadas (canônico)  | 67         |
| Encontradas no remoto | 199        |
| Faltando no remoto    | 6          |
| Extras no remoto      | 138        |

#### Faltando

- favorite_jobs
- curricula
- inventory_items
- tax_entries
- pos_sessions
- storage_objects

#### Extras

- administrative_approvals
- administrative_documents
- administrative_requests
- administrative_tasks
- ai_conversations
- ai_messages
- ai_usage
- application_profile_snapshots
- automation_executions
- automation_jobs
- automation_templates
- calendar_events
- calendar_integrations
- calendars
- candidate_courses
- candidate_documents
- candidate_education
- candidate_experiences
- candidate_languages
- candidate_processes
- candidate_profile_views
- candidate_skills
- company_contacts
- company_locations
- company_relationships
- company_services
- contract_status_history
- cost_centers
- customer_feedback
- customer_ratings
- customers
- dashboard_layouts
- dashboard_widgets
- data_deletion_requests
- data_export_requests
- data_retention_policies
- departments
- document_links
- document_versions
- email_messages
- email_templates
- employee_contracts
- employee_documents
- employee_positions
- employee_status_history
- epi_deliveries
- epi_delivery_items
- epi_return_items
- epi_returns
- event_deliveries
- event_outbox
- event_participants
- faqs
- feedback
- file_access_logs
- files
- first_login_state
- fiscal_document_events
- integration_sync_jobs
- interactions
- interview_feedback
- interview_participants
- interviews
- job_matches
- job_skills
- leads
- legal_acceptances
- material_issue_items
- material_issues
- material_return_items
- material_returns
- meeting_room_reservations
- meeting_rooms
- notification_deliveries
- notification_preferences
- password_policies
- pos_cashiers
- positions
- privacy_requests
- product_categories
- products
- purchase_quotation_items
- purchase_quotations
- purchase_receipt_divergences
- purchase_receipt_items
- purchase_receipts
- purchase_request_items
- purchase_requests
- purchase_status_history
- quote_items
- quotes
- receipts
- recruitment_demands
- recruitment_processes
- recruitment_stages
- report_definitions
- report_executions
- report_schedules
- sale_items
- sales
- security_events
- service_acceptances
- service_attachments
- service_executions
- service_occurrences
- service_order_items
- service_order_status_history
- service_sla
- services
- sessions
- stage_templates
- stock_balances
- stock_entries
- stock_inventory
- stock_inventory_items
- stock_lots
- support_ticket_assignments
- support_ticket_categories
- support_ticket_messages
- support_ticket_status_history
- talent_pool_memberships
- task_attachments
- task_comments
- task_status_history
- tenant_settings
- third_party_custody
- third_party_custody_items
- validation_results
- warehouse_locations
- warehouses
- webhook_deliveries
- work_order_acceptances
- work_order_assignments
- work_order_attachments
- work_order_checklists
- work_order_materials
- work_order_occurrences
- work_orders

## RBAC

Roles canônicos encontrados: 16

| Nome               | Scope  |
| ------------------ | ------ |
| admin_master       | global |
| commercial         | tenant |
| facilities_manager | tenant |
| finance            | tenant |
| finance_manager    | tenant |
| it_admin           | tenant |
| lawyer             | tenant |
| operations_manager | tenant |
| operator           | tenant |
| recruiter          | tenant |
| rh_manager         | tenant |
| security_manager   | tenant |
| stock_manager      | tenant |
| support            | tenant |
| tenant_admin       | tenant |
| viewer             | tenant |

- OK: role legada 'member' não encontrada.

## Multi-tenancy

Tabelas com coluna tenant_id: 181

Tabelas operacionais tenant-scoped sem tenant_id ou com divergências precisam ser validadas contra o schema canônico.

## RLS

Tabelas com RLS habilitado: 199
Tabelas com RLS desabilitado: 0

## Functions / Triggers

Functions: 210
Triggers: 67

Verificação detalhada de definições não foi possível porque o armazenamento de definitions no relatório cru foi omitido para legibilidade.

## Indexes

Total: 607

Listagem de indexes não foi incluída no relatório resumido.

## LGPD

Tabelas LGPD relevantes encontradas: consents, audit_logs, data_deletion_requests, data_export_requests, privacy_requests, data_retention_policies.

## Legado

Nenhuma tabela de legado óbvia (profiles, user_profiles, profiles_old, tenant_memberships_old) encontrada.

## Divergências

### Estrutural

- A conexão retornou host ::1 em vez do hostname Supabase esperado. Não há confirmação inequívoca de que o banco consultado é o projeto remoto.
- Migration history não pôde ser validada de forma confiável.
- 6 tabelas canônicas esperadas não foram encontradas no remoto.
- 138 tabelas extras existem no remoto.

## Conclusão

D) INCONCLUSIVO

Motivo:

- Não há evidência objetiva de que o banco consultado é o projeto Supabase remoto correto.
- A contagem de 199 tabelas não é suficiente para confirmar deploy V2.1.
- Falta validação inequívoca de estrutura, RLS, policies, triggers, functions, indexes, roles e migrations.
