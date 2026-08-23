# V2.1 — Domain Map

**Data:** 2026-08-23  
**Branch:** main  
**Commit base:** ae735a7 / 2bb4128  
**Fonte:** Supabase remoto + migrations locais

---

## 1. Objetivo

Mapear as tabelas/domínios do V2.1 para suportar a construção dos módulos do frontend, sem inventar entidades.

---

## 2. Administração / SaaS

```text
tenants
people
tenant_memberships
roles
permissions
role_permissions
role_assignments
audit_logs
security_events
tenant_settings
administrative_approvals
administrative_documents
administrative_requests
administrative_tasks
```

---

## 3. RH

```text
employees
employee_contracts
employee_documents
employee_positions
employee_status_history
departments
positions
```

---

## 4. Recrutamento

```text
candidates
candidate_courses
candidate_documents
candidate_education
candidate_experiences
candidate_languages
candidate_processes
candidate_profile_views
candidate_skills
applications
application_status_history
application_profile_snapshots
jobs
job_matches
job_skills
recruitment_demands
recruitment_processes
recruitment_stages
interviews
interview_feedback
interview_participants
talent_pool_memberships
```

---

## 5. Comercial / CRM

```text
leads
companies
company_contacts
company_locations
company_relationships
company_services
customers
interactions
quotes
quote_items
contracts
contract_status_history
```

---

## 6. Financeiro

```text
accounts_payable
accounts_receivable
financial_accounts
financial_categories
financial_installments
financial_installment_payments
financial_transactions
payments
bank_reconciliations
cost_centers
```

---

## 7. Fiscal

```text
fiscal_configurations
fiscal_documents
fiscal_document_items
fiscal_document_events
fiscal_document_status_history
fiscal_integrations
fiscal_api_requests
fiscal_api_responses
tax_calculations
tax_rates
invoices
invoice_items
```

---

## 8. Compras

```text
purchase_requests
purchase_request_items
purchase_quotations
purchase_quotation_items
purchase_orders
purchase_order_items
purchase_receipts
purchase_receipt_items
purchase_receipt_divergences
purchase_status_history
```

---

## 9. Estoque

```text
products
product_categories
stock_balances
stock_entries
stock_inventory
stock_inventory_items
stock_lots
stock_movements
warehouses
warehouse_locations
```

---

## 10. Serviços / Operações

```text
services
service_orders
service_order_items
service_order_status_history
service_occurrences
service_executions
service_acceptances
service_attachments
service_sla
work_orders
work_order_assignments
work_order_attachments
work_order_checklists
work_order_materials
work_order_occurrences
work_order_acceptances
```

---

## 11. Facilities / Segurança / EPI

```text
epi_deliveries
epi_delivery_items
epi_returns
epi_return_items
third_party_custody
third_party_custody_items
```

---

## 12. Suporte

```text
support_tickets
support_ticket_assignments
support_ticket_categories
support_ticket_messages
support_ticket_status_history
```

---

## 13. IA / Automação

```text
ai_conversations
ai_messages
ai_usage
automation_executions
automation_jobs
automation_templates
```

---

## 14. Comunicação

```text
chat_rooms
chat_messages
chat_participants
chat_handoffs
notifications
notification_deliveries
notification_preferences
email_messages
email_templates
```

---

## 15. Agenda

```text
calendars
calendar_events
calendar_integrations
meeting_rooms
meeting_room_reservations
```

---

## 16. Relatórios / Dashboards

```text
report_definitions
report_executions
report_schedules
dashboard_layouts
dashboard_widgets
```

---

## 17. LGPD / Privacidade

```text
consents
privacy_requests
data_deletion_requests
data_export_requests
data_retention_policies
legal_acceptances
```

---

**Fim do documento.**
