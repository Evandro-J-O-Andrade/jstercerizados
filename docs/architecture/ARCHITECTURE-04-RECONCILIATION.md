# Database ↔ Frontend Reconciliation

> **Status:** Generated from Supabase direct query (2026-10-02)
> **Banco:** `okxqfyoqbhcmflpurfrw`

## 1. Inventário do Banco

```text
Supabase (okxqfyoqbhcmflpurfrw)
├── Schemas: public, auth, realtime, storage
├── 221 tabelas public
├── 5 views public
├── 713 indexes public
├── 233 public functions
├── 600 policies
├── 1 enum
├── 66 triggers não-internos
├── 53 application roles
├── 230 permissions
├── 739 role_permissions
├── 34 SECURITY DEFINER functions
├── 7 SECURITY DEFINER without explicit search_path
├── 18 SECURITY DEFINER with anon/authenticated exposure
└── RLS: 221/221 tables active
```

## 2. Tabelas por domínio

### 2.1 Identity / Platform

| Tabela             | Repositorio | Módulo   |
| ------------------ | :---------: | :------- |
| people             |     📦      | platform |
| tenants            |     📦      | platform |
| tenant_memberships |     📦      | platform |
| tenant_settings    |     📦      | platform |
| roles              |     📦      | platform |
| permissions        |     📦      | platform |
| role_permissions   |     📦      | platform |
| role_assignments   |     📦      | platform |

### 2.2 RH (Candidate / Recruitment / Employee)

```text
candidates, candidate_documents, candidate_experiences, candidate_education,
candidate_courses, candidate_languages, candidate_skills, candidate_processes,
candidate_job_alerts, candidate_profile_views, favorite_jobs,
skills, job_skills, job_matches, talent_pool_memberships,
jobs, applications, application_status_history, application_profile_snapshots,
recruitment_demands, recruitment_processes, recruitment_stages, stage_templates,
interviews, interview_participants, interview_feedback, interview_followups,
employees, employee_positions, employee_contracts, employee_documents,
employee_status_history, positions, departments
```

### 2.3 Comercial/CRM

```text
companies, company_relationships, company_relationship_types, company_contacts,
company_locations, company_social_links, company_services, leads, customers,
interactions, quotes, quote_items, sales, sale_items, contracts, contract_status_history
```

### 2.4 Serviços

```text
services, service_sla, company_services, service_orders, service_order_items,
service_order_status_history, service_acceptances, service_executions,
service_attachments, service_occurrences, customer_feedback, customer_ratings, feedback
```

### 2.5 Operações

```text
work_orders, work_order_assignments, work_order_materials, work_order_checklists,
work_order_attachments, work_order_occurrences, work_order_acceptances
```

### 2.6 Estoque/Supply Chain

```text
products, product_categories, warehouses, warehouse_locations, stock_balances,
stock_entries, stock_movements, stock_lots, stock_inventory, stock_inventory_items,
purchase_orders, purchase_order_items, purchase_requests, purchase_request_items,
purchase_quotations, purchase_quotation_items, purchase_status_history,
purchase_receipts, purchase_receipt_items, purchase_receipt_divergences,
suppliers, third_party_custody, third_party_custody_items, material_issues,
material_issue_items, material_returns, material_return_items,
epi_deliveries, epi_delivery_items, epi_returns, epi_return_items
```

### 2.7 Financeiro

```text
financial_categories, cost_centers, financial_accounts, financial_transactions,
accounts_receivable, accounts_payable, financial_installments,
financial_installment_payments, financial_installment_cancellations,
payments, receipts, bank_reconciliations, invoices, invoice_items
```

### 2.8 Fiscal

```text
fiscal_configurations, tax_rates, tax_calculations, fiscal_documents,
fiscal_document_items, fiscal_document_status_history, fiscal_document_events,
fiscal_api_requests, fiscal_api_responses, fiscal_integrations
```

### 2.9 POS

```text
pos_terminals, pos_cashiers, pos_operators, pos_cashier_sessions,
pos_sales, pos_sale_items, pos_payments, pos_cancellations, pos_returns,
pos_cash_movements, pos_daily_closures
```

### 2.10 Suporte/Atendimento

```text
support_ticket_categories, support_tickets, support_ticket_messages,
support_ticket_assignments, support_ticket_status_history,
tasks, task_comments, task_attachments, task_status_history
```

### 2.11 Comunicação (transversal)

```text
chat_rooms, chat_participants, chat_messages, chat_handoffs,
notifications, notification_deliveries, notification_preferences,
email_templates, email_messages
```

### 2.12 Calendário (transversal)

```text
calendar_integrations, calendars, calendar_events, event_participants,
meeting_rooms, meeting_room_reservations
```

### 2.13 Documentos (DUAS gerações — reconciliar)

```text
files, file_access_logs, document_versions, document_links  (canônico?)
file_uploads, media_assets                                 (legado?)
candidate_documents, employee_documents, administrative_documents (scope?)
```

### 2.14 LGPD/Privacidade (transversal)

```text
consents, privacy_requests, data_export_requests, data_deletion_requests,
data_retention_policies, legal_acceptances, first_login_state,
security_events, audit_logs, activity_logs
```

### 2.15 Eventos/Automação (transversal)

```text
domain_events, event_outbox, event_deliveries, webhook_deliveries,
automation_jobs, automation_executions, automation_templates
```

### 2.16 Relatórios/Dashboards

```text
report_definitions, report_executions, report_schedules,
dashboard_widgets, dashboard_layouts
```

### 2.17 IA

```text
ai_conversations, ai_messages, ai_usage
```

### 2.18 Integrações

```text
providers, provider_configs, integration_connections, integration_credentials,
integration_events, integration_webhooks, integration_sync_runs,
integration_errors, integration_sync_jobs
```

### 2.19 CMS (site público — PROTEGIDO)

```text
blog_categories, blog_posts, faqs, page_templates, services, media_assets,
company_social_links, footer_configs, candidate_portal_modules,
global_navigation_links
```

### 2.20 Infraestrutura

```text
Auth: 27 tables (auth.users, identities, sessions, refresh_tokens, etc.)
Realtime: 3 tables (messages, subscription, schema_migrations)
Storage: 8 tables (buckets, objects, s3_multipart_uploads, etc.)
```

## 3. Gaps identificados (tabelas documentadas como não existentes)

```text
12 tabelas documentadas como GAP (verificar antes de implementar):
- accounting_entries
- bank_accounts
- candidate_preferences
- cash_flows
- chart_of_accounts
- curriculos
- epis
- support_faqs
- warehouse_custodies
- warehouse_entries
- warehouse_issues
- warehouse_returns
```

## 4. Módulos ativos

| Módulo     | Routes | Cell Completa | Dashboard | Sidebar | Permissions | Status  |
| :--------- | :----: | :-----------: | :-------: | :-----: | :---------: | :-----: |
| rh         |   20   |    parcial    |    ✅     |   ✅    |     ✅      |  ATIVO  |
| servicos   |   8    |      ✅       |    ✅     |   ✅    |     ✅      |  ATIVO  |
| estoque    |   8    |      ✅       |    ✅     |   ✅    |     ✅      |  ATIVO  |
| fiscal     |   6    |      ✅       |    ✅     |   ✅    |     ✅      |  ATIVO  |
| suporte    |   5    |      ✅       |    ✅     |   ✅    |     ✅      |  ATIVO  |
| financeiro |   7    |      ✅       |    ✅     |   ✅    |     ✅      |  ATIVO  |
| operacoes  |   7    |      ✅       |    ✅     |   ✅    |     ✅      |  ATIVO  |
| empresas   |   8    |      ✅       |    ✅     |   ✅    |     ✅      |  ATIVO  |
| pos        |   6    |      ✅       |    ✅     |   ✅    |     ✅      |  ATIVO  |
| sistema    |   0    |      ❌       |    ❌     |   ❌    |     ❌      | PENDING |

## 5. RBAC reconciliação

```text
230 permissions (banco)
↓
53 roles (banco)
↓
739 role_permissions (banco)
↓
37 role_assignments (banco)
↓
admin_master: 96/230 (NÃO "todas")

Frontend: useAccount().activePermissions
↓
MODULE_PERMISSION_MAP (fonte única)
↓
ModuleRouter → PermissionGuard
```
