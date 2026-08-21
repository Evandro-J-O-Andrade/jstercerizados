# V2.1 — Gap Closure Dependency Graph

**Branch:** `feat/database-v21-local-rebuild`  
**Commit base:** `19431c3`  
**Data:** 2026-08-21  
**Modo:** READ-ONLY — análise

## Objetivo

Definir a ordem correta de implementação dos gaps classificados em `docs/V21-GAP-CLOSURE-MATRIX.md`, baseada em dependências funcionais.

## Dependências funcionais

```text
00_extensions
   ↓
01_core (tenants, people, tenant_memberships)
   ↓
02_rbac (roles, permissions, role_permissions, role_assignments)
   ↓
03_crm (companies, company_relationships, company_contacts)
   ↓
├── 04_employees (employees, departments, positions, employee_positions)
│     ↓
│   ├── 05_recruitment (candidates, applications, interviews)
│   │     ↓
│   │   ├── 05a_talent_pool (talent_pool_memberships, job_matches)
│   │     ↓
│   │   └── 05b_recruitment_advanced (skills, recruitment_processes, stages)
│   │
│   └── 07_services (services, company_services, contracts)
│         ↓
│       └── 07a_service_orders (service_orders, items, executions)
│
├── 10_inventory (products, categories, warehouses, locations, stock_movements, stock_balances)
│     ↓
│   ├── 10a_stock_lots (stock_lots)
│   │     ↓
│   │   └── 10b_inventory (stock_inventory, inventory_items)
│   │
│   └── 10c_purchasing (purchase_requests, quotations, orders, receipts, divergences)
│         ↓
│       └── 10d_purchasing_history (purchase_status_history)
│
├── 20_finance (financial_categories, cost_centers, accounts_receivable, accounts_payable, invoices, invoice_items, financial_transactions, payments, receipts, bank_reconciliations, financial_installments)
│     ↓
│   ├── 20a_finance_functions (competence triggers, reversal functions)
│   │
│   └── 20b_financial_kpis (views)
│
├── 21_fiscal (fiscal_configurations, fiscal_integrations, fiscal_documents, items, events, status_history, api_requests, api_responses, tax_rates, tax_calculations)
│     ↓
│   └── 21a_fiscal_rpcs (emission, cancellation)
│
├── 29_pos (pos_terminals, cashiers, operators, sessions, sales, items, payments, cancellations, returns, cash_movements, daily_closures)
│     ↓
│   └── 29a_pos_integrations (stock, finance, fiscal triggers)
│
└── 30_tasks_support (tasks, comments, attachments, status_history, support_tickets, categories, messages, assignments)
```

## Ordem de implementação recomendada

### Fase 01 — Core/RBAC

- 02-01 a 02-07: RBAC RPCs

### Fase 02 — Employees

- 02-01 a 02-07: employees, departments, positions, employee_positions, contracts, documents, status_history

### Fase 03 — CRM/Services/Contracts

- 13-01 a 13-05: company_services, service_order_items, acceptances, executions, attachments
- 15-01 a 15-02: interactions, recruitment_demands

### Fase 04 — Recruitment/Talent Pool

- 03-01 a 03-05: talent_pool_memberships, job_matches, candidate_profile_views, recruitment_kpis
- 03-05: matching function

### Fase 05 — Inventory/Almoxarifado

- 04-01 a 04-02: warehouses, warehouse_locations
- 04-07: product_categories
- 04-08: stock_lots
- 04-04 a 04-05: stock_inventory, inventory_items

### Fase 06 — Purchasing

- 05-01 a 05-02: purchase_requests, request_items
- 05-03 a 05-04: purchase_quotations, quotation_items
- 05-06: purchase_status_history
- 05-05: purchase_receipt_divergences

### Fase 07 — Finance

- 06-01 a 06-02: invoices, invoice_items
- 06-03: financial_accounts
- 06-09: EXTEND cost_center_id NOT NULL
- 06-07: competence triggers
- 06-03: installment protection triggers
- 06-10: reversal function
- 06-06: financial_kpis view

### Fase 08 — Fiscal

- 07-01: fiscal_integrations
- 07-02: fiscal RPCs

### Fase 09 — POS

- 16-09: POS integration triggers (stock, finance, fiscal)
- 16-10: daily closure validation
- 16-11: operator RLS

### Fase 10 — Tasks/Support

- 09-01 a 09-03: task comments, attachments, status_history
- 09-04 a 09-06: ticket categories, messages, assignments

### Fase 11 — Chat/Security

- 10-01: ai_usage
- 11-01: sessions
- 11-02: password_policies

### Fase 12 — Automation

- 12-01: automation_templates

### Fase 13 — Notifications

- 14-01: notification_preferences

### Fase 14 — Reports/Views

- 08-01 a 08-06: report/dashboard configs
- 08-07: report views

### Fase 15 — Functions/Triggers/RLS

- 16-02 a 16-05, 16-07 a 16-08, 16-12: triggers e functions faltantes

### Fase 16 — Validation

- 25_validation.sql atualizado

---

## Bloqueios

| Bloqueio                                          | Motivo                    | Resolução                               |
| ------------------------------------------------- | ------------------------- | --------------------------------------- |
| `invoices` antes de `financial_transactions`      | FK                        | Implementar invoices na Fase 07         |
| `purchase_quotations` antes de `purchase_orders`  | Dependência de fluxo      | Implementar quotations na Fase 06       |
| `stock_inventory` antes de `stock_lots`           | Dependência de lote       | Implementar lots na Fase 05             |
| `fiscal_integrations` antes de `fiscal_documents` | Dependência de integração | Implementar integrations na Fase 08     |
| POS integration antes de Finance/Fiscal           | Dependência de domínio    | Implementar POS integrations na Fase 09 |

---

## Observações

- `CONSOLIDATE` não cria tabela: usa estruturas existentes.
- `VIEW` não cria tabela operacional.
- `CONFIG` cria tabela de configuração, não operacional.
- `NOT_REQUIRED` não cria nada.
