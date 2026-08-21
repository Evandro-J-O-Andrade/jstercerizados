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
5. `03b_crm_commercial.sql` (leads, customers, quotes, quote_items, sales, sale_items)

### PHASE 03 — Recruitment Base

5. `04_rh_recruitment.sql`

### PHASE 04 — Service Orders (NEW)

6. `04b_service_orders.sql` (service_orders, service_order_items, service_acceptances, service_executions, service_attachments, service_order_status_history)

### PHASE 05 — Services/Contracts

7. `05_services_contracts.sql` (services, contracts, contract_status_history)

### PHASE 06 — Products

8. `06_products.sql` (products)

### PHASE 07 — Suppliers/Purchasing

9. `06_suppliers_purchasing.sql`

### PHASE 08 — Inventory/Custody

10. `07_inventory_custody.sql` (sem products)

### PHASE 09 — Chat/Notifications/Events

11. `09_chat.sql`
12. `10_notifications_events.sql`

### PHASE 10 — Audit/Security

13. `11_audit_security.sql`

### PHASE 11 — Custody

14. `12_custody.sql`

### PHASE 12 — Tasks

15. `14_tasks.sql`

### PHASE 13 — Support Tickets (NEW)

16. `14b_support_tickets.sql` (support_ticket_categories, support_tickets, support_ticket_messages, support_ticket_assignments, support_ticket_status_history)

### PHASE 14 — Support Base

17. `15_support.sql` (reservado para extensões futuras)

### PHASE 15 — Storage/Documents

18. `18_storage_documents.sql`

### PHASE 16 — LGPD

19. `20_lgpd.sql`

### PHASE 17 — Functions/Triggers

20. `21_functions_triggers.sql`

### PHASE 18 — RLS Base

21. `22_rls.sql` (políticas para tabelas criadas antes deste arquivo)

### PHASE 19 — Indexes Base

22. `23_indexes.sql` (índices para tabelas criadas antes deste arquivo)

### PHASE 20 — RLS Remaining (NEW)

23. `45_rls_remaining.sql` (políticas para tabelas criadas após 22_rls.sql)

### PHASE 21 — Indexes Remaining (NEW)

24. `45_indexes.sql` (índices para tabelas criadas após 23_indexes.sql)

### PHASE 22 — Validation/Errors

25. `25_validation.sql`
26. `26_error_codes.sql`

### PHASE 23 — Finance

27. `27_finance.sql`

### PHASE 24 — Fiscal Base

28. `28_fiscal.sql`

### PHASE 25 — POS

29. `29_pos.sql`

### PHASE 26 — Recruitment/Talent Pool

30. `30_recruitment.sql`
31. `35_recruitment_talent_pool.sql`

### PHASE 27 — Automation

32. `31_automation.sql`

### PHASE 28 — Seed

33. `32_seed.sql`

### PHASE 29 — Employees

34. `33_employees.sql`

### PHASE 30 — CRM Services Extended

35. `34_crm_services.sql` (company_services, interactions, recruitment_demands)

### PHASE 31 — Inventory Extended

36. `36_inventory.sql`

### PHASE 32 — Purchasing Extended

37. `37_purchasing.sql`

### PHASE 33 — Fiscal RPCs

38. `39_fiscal.sql`

### PHASE 34 — Tasks Extended

39. `40_tasks_support.sql` (task_comments, task_attachments, task_status_history)

### PHASE 35 — Chat/Security Extended

40. `41_chat_security.sql`

### PHASE 36 — Automation Extended

41. `42_automation.sql`

### PHASE 37 — Notifications Extended

42. `43_notifications.sql`

### PHASE 38 — Reports/Views

43. `44_reports_views.sql`

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
03b_crm_commercial (leads, customers, quotes, quote_items, sales, sale_items)
    ↓
04_rh_recruitment (candidates, jobs, applications, interviews)
    ↓
04b_service_orders (service_orders, service_order_items, service_acceptances, service_executions, service_attachments, service_order_status_history)
    ↓
05_services_contracts (services, contracts, contract_status_history)
    ↓
06_products (products)
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
14b_support_tickets (support_ticket_categories, support_tickets, support_ticket_messages, support_ticket_assignments, support_ticket_status_history)
    ↓
15_support (reservado)
    ↓
18_storage_documents (files, file_access_logs, document_versions, document_links, administrative_*)
    ↓
20_lgpd (consents, privacy_requests, data_export_requests, data_deletion_requests, data_retention_policies)
    ↓
21_functions_triggers (stock_balances, stock_entries, purchase_receipts, purchase_receipt_items, functions, triggers)
    ↓
22_rls (RLS policies para tabelas até 21)
    ↓
23_indexes (indexes para tabelas até 21)
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
34_crm_services (company_services, interactions, recruitment_demands)
    ↓
36_inventory (warehouses, warehouse_locations, product_categories, stock_lots, stock_inventory, stock_inventory_items)
    ↓
37_purchasing (purchase_requests, purchase_request_items, purchase_quotations, purchase_quotation_items, purchase_status_history, purchase_receipt_divergences)
    ↓
39_fiscal (fiscal_integrations, fiscal_emit_invoice, fiscal_cancel_invoice)
    ↓
40_tasks_support (task_comments, task_attachments, task_status_history)
    ↓
41_chat_security (ai_usage, sessions, password_policies)
    ↓
42_automation (automation_templates)
    ↓
43_notifications (notification_preferences)
    ↓
44_reports_views (report_definitions, report_executions, report_schedules, dashboard_widgets, dashboard_layouts)
    ↓
45_rls_remaining (RLS policies para tabelas 27-44)
    ↓
45_indexes (indexes para tabelas 27-44)
```

---

## Arquivos ausentes

Os arquivos `08`, `13`, `16`, `17`, `19`, `24`, `38` permanecem ausentes. Sua ausência deve ser confirmada como intencional ou providenciada.

---

## Alterações Fase 1A/1B/2 Aplicadas

1. `06_products.sql` criado, `06b_products.sql` removido
2. `04b_service_orders.sql` criado, tabelas de service_orders movidas de `34_crm_services.sql`
3. `14b_support_tickets.sql` criado, tabelas de support_tickets movidas de `40_tasks_support.sql`
4. `05_services_contracts.sql` ajustado (removido service_order_status_history)
5. `15_support.sql` ajustado (removido support_ticket_status_history)
6. `34_crm_services.sql` ajustado (removidas tabelas de service_orders)
7. `40_tasks_support.sql` ajustado (removidas tabelas de support_tickets)
8. `22_rls.sql` reestruturado (removidas policies para tabelas 27-44 e segundo lote duplicado)
9. `45_rls_remaining.sql` criado com RLS para todas as tabelas 27-44
10. `23_indexes.sql` reestruturado (removidos índices para tabelas 27-44)
11. `45_indexes.sql` criado com índices para tabelas 27-44
12. `27_finance.sql` ajustado (FK accounts_receivable.invoice_id, proteção financial_reversal())
13. `35_recruitment_talent_pool.sql` ajustado (proteção match_candidates_to_demand())
14. Trigger `trg_set_updated_at_support_tickets` movido para `14b_support_tickets.sql`
15. `03b_crm_commercial.sql` criado (leads, customers, quotes, quote_items, sales, sale_items)
16. `45_rls_remaining.sql` ajustado (adicionadas RLS para tabelas comerciais)
17. `45_indexes.sql` ajustado (adicionados índices para tabelas comerciais)
18. `39_fiscal.sql` ajustado (fiscal_emit_invoice e fiscal_cancel_invoice com validação de tenant e permissão)

---

## Pré-requisitos

- Aprovação de `docs/V21-GAP-CLOSURE-MATRIX.md`
- Aprovação de `docs/V21-GAP-CLOSURE-DEPENDENCY-GRAPH.md`
- PostgreSQL/Docker disponível para runtime gate

## Bloqueado até

- Revisão e aprovação da matriz de gap closure
- Confirmação de que nenhuma tabela adicional é necessária
- Re-auditoria completa pós-fix
- Validação de runtime no Supabase
