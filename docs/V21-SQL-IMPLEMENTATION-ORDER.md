# V2.1 — SQL Implementation Order

**Branch:** `feat/database-v21-local-rebuild`  
**Commit base:** `19431c3`  
**Data:** 2026-08-21  
**Modo:** READ-ONLY — planejamento

## AVISO

Este documento é **planejamento**. Nenhum SQL será implementado até aprovação explícita.

## Ordem de implementação

### PHASE 01 — Core/RBAC RPCs

- `user_has_permission()`
- `user_permissions()`

### PHASE 02 — Employees

- `employees`
- `departments`
- `positions`
- `employee_positions`
- `employee_contracts`
- `employee_documents`
- `employee_status_history`

### PHASE 03 — CRM/Services/Contracts

- `company_services`
- `service_order_items`
- `service_acceptances`
- `service_executions`
- `service_attachments`
- `interactions`
- `recruitment_demands`

### PHASE 04 — Recruitment/Talent Pool

- `talent_pool_memberships`
- `job_matches`
- `candidate_profile_views`
- `recruitment_kpis` (view)
- matching function

### PHASE 05 — Inventory/Almoxarifado

- `warehouses`
- `warehouse_locations`
- `product_categories`
- `stock_lots`
- `stock_inventory`
- `stock_inventory_items`

### PHASE 06 — Purchasing

- `purchase_requests`
- `purchase_request_items`
- `purchase_quotations`
- `purchase_quotation_items`
- `purchase_status_history`
- `purchase_receipt_divergences`

### PHASE 07 — Finance

- `invoices`
- `invoice_items`
- `financial_accounts`
- EXTEND `cost_center_id` NOT NULL
- competence triggers
- installment protection triggers
- reversal function
- `financial_kpis` (view)

### PHASE 08 — Fiscal

- `fiscal_integrations`
- fiscal RPCs

### PHASE 09 — POS

- POS integration triggers
- daily closure validation
- operator RLS

### PHASE 10 — Tasks/Support

- `task_comments`
- `task_attachments`
- `task_status_history`
- `support_ticket_categories`
- `support_ticket_messages`
- `support_ticket_assignments`

### PHASE 11 — Chat/Security

- `ai_usage`
- `sessions`
- `password_policies`

### PHASE 12 — Automation

- `automation_templates`

### PHASE 13 — Notifications

- `notification_preferences`

### PHASE 14 — Reports/Views

- `report_definitions`
- `report_executions`
- `report_schedules`
- `report_recipients`
- `dashboard_widgets`
- `dashboard_layouts`
- report views

### PHASE 15 — Functions/Triggers/RLS

- Todas as triggers e functions faltantes

### PHASE 16 — Validation

- `25_validation.sql` atualizado

---

## Pré-requisitos

- Aprovação de `docs/V21-GAP-CLOSURE-MATRIX.md`
- Aprovação de `docs/V21-GAP-CLOSURE-DEPENDENCY-GRAPH.md`
- PostgreSQL/Docker disponível para runtime gate

## Bloqueado até

- Revisão e aprovação da matriz de gap closure
- Confirmação de que nenhuma tabela adicional é necessária
