# V2.1 — SQL Implementation Order

**Branch:** `feat/database-v21-local-rebuild`  
**Commit base:** `19431c3`  
**Data:** 2026-08-21  
**Modo:** READ-ONLY — planejamento atualizado

## AVISO

Este documento é **planejamento**. Nenhum SQL será implementado até aprovação explícita.

## Ordem de implementação

### PHASE 01 — Extensions/Core/RBAC

1. `00_extensions.sql`
2. `01_core.sql`
3. `02_rbac.sql`

### PHASE 02 — CRM/Organizations

4. `03_crm.sql`

### PHASE 03 — Recruitment Base

5. `04_rh_recruitment.sql`

### PHASE 04 — Services/Contracts

6. `05_services_contracts.sql`

### PHASE 05 — Suppliers/Purchasing

7. `06b_products.sql` (products movido para resolver dependency)
8. `06_suppliers_purchasing.sql`

### PHASE 06 — Inventory/Custody

9. `07_inventory_custody.sql` (sem products)

### PHASE 07 — Chat/Notifications/Events

10. `09_chat.sql`
11. `10_notifications_events.sql`

### PHASE 08 — Audit/Security

12. `11_audit_security.sql`

### PHASE 09 — Custody

13. `12_custody.sql`

### PHASE 10 — Tasks

14. `14_tasks.sql`

### PHASE 11 — Support Base

15. `15_support.sql` (sem support_tickets)

### PHASE 12 — Storage/Documents

16. `18_storage_documents.sql`

### PHASE 13 — LGPD

17. `20_lgpd.sql`

### PHASE 14 — Functions/Triggers/RLS

18. `21_functions_triggers.sql`
19. `22_rls.sql`
20. `23_indexes.sql`

### PHASE 15 — Validation/Errors

21. `25_validation.sql`
22. `26_error_codes.sql`

### PHASE 16 — Finance

23. `27_finance.sql`

### PHASE 17 — Fiscal Base

24. `28_fiscal.sql`

### PHASE 18 — POS

25. `29_pos.sql`

### PHASE 19 — Recruitment/Talent Pool

26. `30_recruitment.sql`
27. `35_recruitment_talent_pool.sql`

### PHASE 20 — Automation

28. `31_automation.sql`

### PHASE 21 — Seed

29. `32_seed.sql`

### PHASE 22 — Employees

30. `33_employees.sql`

### PHASE 23 — CRM Services Extended

31. `34_crm_services.sql` (service_orders canônico)

### PHASE 24 — Inventory Extended

32. `36_inventory.sql`

### PHASE 25 — Purchasing Extended

33. `37_purchasing.sql`

### PHASE 26 — Fiscal RPCs

34. `39_fiscal.sql`

### PHASE 27 — Tasks/Support Extended

35. `40_tasks_support.sql` (support_tickets canônico)

### PHASE 28 — Chat/Security Extended

36. `41_chat_security.sql`

### PHASE 29 — Automation Extended

37. `42_automation.sql`

### PHASE 30 — Notifications Extended

38. `43_notifications.sql`

### PHASE 31 — Reports/Views

39. `44_reports_views.sql`

---

## Dependency Graph Resumido

```
00_extensions
    ↓
01_core (people, tenants, tenant_memberships, tenant_settings)
    ↓
02_rbac (roles, permissions, role_permissions, role_assignments)
    ↓
03_crm (companies, company_relationships, company_contacts)
    ↓
04_rh_recruitment (candidates, jobs, applications, interviews)
    ↓
05_services_contracts (services, service_order_status_history, contracts, contract_status_history)
    ↓
06b_products (products)
    ↓
06_suppliers_purchasing (suppliers, purchase_orders, purchase_order_items)
    ↓
07_inventory_custody (stock_movements)
    ↓
09_chat (chat_rooms, chat_participants, chat_messages, ai_conversations, ai_messages, chat_handoffs)
    ↓
10_notifications_events (notifications, notification_deliveries, domain_events, event_outbox, event_deliveries)
    ↓
11_audit_security (audit_logs, security_events, first_login_state, legal_acceptances)
    ↓
12_custody (third_party_custody, third_party_custody_items)
    ↓
14_tasks (tasks)
    ↓
15_support (support_ticket_status_history)
    ↓
18_storage_documents (files, file_access_logs, document_versions, document_links, administrative_*)
    ↓
20_lgpd (consents, privacy_requests, data_export_requests, data_deletion_requests, data_retention_policies)
    ↓
21_functions_triggers (stock_balances, stock_entries, purchase_receipts, purchase_receipt_items, functions, triggers)
    ↓
22_rls (RLS policies para todas as tabelas acima)
    ↓
23_indexes (indexes)
    ↓
25_validation (validation_results)
    ↓
26_error_codes (error codes)
    ↓
27_finance (financial_categories, cost_centers, accounts_receivable, accounts_payable, payments, receipts, financial_transactions, bank_reconciliations, financial_installments, invoices, invoice_items, financial_accounts)
    ↓
28_fiscal (fiscal_configurations, tax_rates, tax_calculations, fiscal_documents, fiscal_document_items, fiscal_document_status_history, fiscal_api_requests, fiscal_api_responses, fiscal_document_events)
    ↓
29_pos (pos_terminals, pos_cashiers, pos_operators, pos_cashier_sessions, pos_sales, pos_sale_items, pos_payments, pos_cancellations, pos_returns, pos_cash_movements, pos_daily_closures)
    ↓
30_recruitment (skills, candidate_*, job_skills, stage_templates, recruitment_processes, recruitment_stages, candidate_processes, application_profile_snapshots, interview_participants, interview_feedback)
    ↓
35_recruitment_talent_pool (talent_pool_memberships, job_matches, candidate_profile_views, recruitment_kpis, match_candidates_to_demand)
    ↓
31_automation (webhook_deliveries, automation_jobs, automation_executions)
    ↓
32_seed (seed data)
    ↓
33_employees (departments, positions, employees, employee_positions, employee_contracts, employee_documents, employee_status_history)
    ↓
34_crm_services (company_services, service_orders canônico, service_order_items, service_acceptances, service_executions, service_attachments, interactions, recruitment_demands)
    ↓
36_inventory (warehouses, warehouse_locations, product_categories, stock_lots, stock_inventory, stock_inventory_items)
    ↓
37_purchasing (purchase_requests, purchase_request_items, purchase_quotations, purchase_quotation_items, purchase_status_history, purchase_receipt_divergences)
    ↓
39_fiscal (fiscal_integrations, fiscal_emit_invoice, fiscal_cancel_invoice)
    ↓
40_tasks_support (task_comments, task_attachments, task_status_history, support_ticket_categories, support_tickets canônico, support_ticket_messages, support_ticket_assignments)
    ↓
41_chat_security (ai_usage, sessions, password_policies)
    ↓
42_automation (automation_templates)
    ↓
43_notifications (notification_preferences)
    ↓
44_reports_views (report_definitions, report_executions, report_schedules, dashboard_widgets, dashboard_layouts)
```

---

## Arquivos ausentes

Os arquivos `08`, `13`, `16`, `17`, `19`, `24`, `38` permanecem ausentes. Sua ausência deve ser confirmada como intencional ou providenciada.

---

## Pré-requisitos

- Aprovação de `docs/V21-GAP-CLOSURE-MATRIX.md`
- Aprovação de `docs/V21-GAP-CLOSURE-DEPENDENCY-GRAPH.md`
- PostgreSQL/Docker disponível para runtime gate

## Bloqueado até

- Revisão e aprovação da matriz de gap closure
- Confirmação de que nenhuma tabela adicional é necessária
