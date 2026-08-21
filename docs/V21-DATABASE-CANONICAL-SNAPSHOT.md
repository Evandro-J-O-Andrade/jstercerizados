# V2.1 — Database Canonical Snapshot

**Projeto:** J&S Empregos LTDA  
**Versão:** V2.1  
**Branch:** `feat/database-v21-local-rebuild`  
**Commit:** `7c2aa30`  
**Data do snapshot:** 2026-08-21  
**Status:** IMPLEMENTED / UNDER AUDIT

---

## Como usar este documento

Este snapshot representa **a estrutura real implementada** do banco V2.1 no commit `7c2aa30`. Ele serve como:

- Mapa de reconstrução
- Referência de auditoria
- Contrato fonte para frontend/integrações
- Base para detecção de drift em migrações futuras

**Não modificar o SQL com base apenas neste documento.** Alterações devem seguir o processo de auditoria e aprovação.

---

## Sumário

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [Domínios do Banco](#2-domínios-do-banco)
3. [Inventário de Tabelas](#3-inventário-de-tabelas)
4. [Relationship Map](#4-relationship-map)
5. [Tenant Isolation](#5-tenant-isolation)
6. [RBAC](#6-rbac)
7. [Functions](#7-functions)
8. [Triggers](#8-triggers)
9. [Views](#9-views)
10. [Enums / Types](#10-enums--types)
11. [Extensions](#11-extensions)
12. [Indexes](#12-indexes)
13. [RLS Policies](#13-rls-policies)
14. [Financeiro](#14-financeiro)
15. [Fiscal](#15-fiscal)
16. [RH / Recruitment](#16-rh--recruitment)
17. [CRM / Services](#17-crm--services)
18. [Inventory / Almoxarifado](#18-inventory--almoxarifado)
19. [Purchasing](#19-purchasing)
20. [POS / Sales](#20-pos--sales)
21. [Tasks / Support](#21-tasks--support)
22. [Chat](#22-chat)
23. [Automation](#23-automation)
24. [Notifications](#24-notifications)
25. [Reports / Dashboards](#25-reports--dashboards)
26. [Documents / Storage](#26-documents--storage)
27. [Audit / Security / LGPD](#27-audit--security--lgpd)
28. [Events](#28-events)
29. [Seed / Configuration](#29-seed--configuration)
30. [Business Flow Matrix](#30-business-flow-matrix)
31. [Frontend Contract](#31-frontend-contract)
32. [Storage](#32-storage)
33. [Implementation Traceability](#33-implementation-traceability)
34. [Known Gaps](#34-known-gaps)
35. [Reconstruction Guide](#35-reconstruction-guide)
36. [Snapshot Integrity](#36-snapshot-integrity)
37. [Status Final](#37-status-final)

---

## 1. Arquitetura Geral

```
auth.users (Supabase Auth)
    ↓
people
    ↓
tenant_memberships
    ↓
role_assignments
    ↓
roles
    ↓
permissions
```

### Regras de Isolamento

- **GLOBAL**: Estruturas compartilhadas entre tenants (ex: `roles`, `permissions`, `skills` quando aplicável).
- **TENANT**: Toda estrutura operacional contém `tenant_id UUID NOT NULL`.
- **Isolamento**: RLS obrigatório em todas as tabelas TENANT. Apenas membros ativos do tenant podem acessar seus dados.
- **Admin Master**: Usuários com `role_assignments` vinculado a `roles` com `scope = 'global'` e `name = 'admin_master'` bypassam filtros de tenant onde permitido.

---

## 2. Domínios do Banco

| #   | Domínio                   | Status | Tabelas                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Core / Tenancy            | ✅     | `people`, `tenants`, `tenant_memberships`, `tenant_settings`                                                                                                                                                                                                                                                      |
| 02  | Identity / People         | ✅     | `people`                                                                                                                                                                                                                                                                                                          |
| 03  | RBAC                      | ✅     | `roles`, `permissions`, `role_permissions`, `role_assignments`                                                                                                                                                                                                                                                    |
| 04  | Organizations / Companies | ✅     | `companies`, `company_relationships`, `company_contacts`                                                                                                                                                                                                                                                          |
| 05  | CRM                       | ✅     | `company_services`, `interactions`, `recruitment_demands`                                                                                                                                                                                                                                                         |
| 06  | Customers                 | ⚠️     | Não há entidade `customers` separada; `companies` cumpre duplo papel                                                                                                                                                                                                                                              |
| 07  | Suppliers                 | ✅     | `suppliers`                                                                                                                                                                                                                                                                                                       |
| 08  | Services                  | ✅     | `services`, `service_orders`, `service_order_items`, `service_order_status_history`                                                                                                                                                                                                                               |
| 09  | Contracts                 | ✅     | `contracts`, `contract_status_history`                                                                                                                                                                                                                                                                            |
| 10  | Recruitment               | ✅     | `jobs`, `applications`, `application_status_history`, `interviews`                                                                                                                                                                                                                                                |
| 11  | Candidates                | ✅     | `candidates`                                                                                                                                                                                                                                                                                                      |
| 12  | Talent Pool               | ✅     | `talent_pool_memberships`, `job_matches`, `candidate_profile_views`                                                                                                                                                                                                                                               |
| 13  | Employees                 | ✅     | `employees`, `departments`, `positions`, `employee_positions`, `employee_contracts`, `employee_documents`, `employee_status_history`                                                                                                                                                                              |
| 14  | Documents / Storage       | ✅     | `files`, `file_access_logs`, `document_versions`, `document_links`                                                                                                                                                                                                                                                |
| 15  | Commercial                | ⚠️     | Não implementado como domínio separado                                                                                                                                                                                                                                                                            |
| 16  | Quotes / Budgets          | ⚠️     | Não implementado como domínio separado                                                                                                                                                                                                                                                                            |
| 17  | Sales                     | ✅     | `invoices`, `invoice_items`                                                                                                                                                                                                                                                                                       |
| 18  | POS                       | ✅     | `pos_terminals`, `pos_cashiers`, `pos_operators`, `pos_cashier_sessions`, `pos_sales`, `pos_sale_items`, `pos_payments`, `pos_cancellations`, `pos_returns`, `pos_cash_movements`, `pos_daily_closures`                                                                                                           |
| 19  | Finance                   | ✅     | `financial_categories`, `cost_centers`, `accounts_receivable`, `accounts_payable`, `payments`, `receipts`, `financial_transactions`, `bank_reconciliations`, `financial_installments`, `financial_installment_payments`, `financial_installment_cancellations`, `invoices`, `invoice_items`, `financial_accounts` |
| 20  | Accounts Payable          | ✅     | `accounts_payable`, `payments` (compartilhado)                                                                                                                                                                                                                                                                    |
| 21  | Accounts Receivable       | ✅     | `accounts_receivable`, `receipts` (compartilhado)                                                                                                                                                                                                                                                                 |
| 22  | Fiscal                    | ✅     | `fiscal_configurations`, `tax_rates`, `tax_calculations`, `fiscal_documents`, `fiscal_document_items`, `fiscal_document_status_history`, `fiscal_api_requests`, `fiscal_api_responses`, `fiscal_document_events`, `fiscal_integrations`                                                                           |
| 23  | Accounting                | ⚠️     | Não implementado como domínio separado                                                                                                                                                                                                                                                                            |
| 24  | Purchasing                | ✅     | `purchase_requests`, `purchase_request_items`, `purchase_quotations`, `purchase_quotation_items`, `purchase_orders`, `purchase_order_items`, `purchase_receipts`, `purchase_receipt_items`, `purchase_receipt_divergences`, `purchase_status_history`                                                             |
| 25  | Inventory                 | ✅     | `products`, `stock_movements`, `stock_balances`, `stock_entries`                                                                                                                                                                                                                                                  |
| 26  | Warehouses                | ✅     | `warehouses`, `warehouse_locations`                                                                                                                                                                                                                                                                               |
| 27  | Almoxarifado              | ✅     | `product_categories`, `stock_lots`, `stock_inventory`, `stock_inventory_items`                                                                                                                                                                                                                                    |
| 28  | Custody / Assets          | ✅     | `third_party_custody`, `third_party_custody_items`                                                                                                                                                                                                                                                                |
| 29  | Tasks                     | ✅     | `tasks`, `task_comments`, `task_attachments`, `task_status_history`                                                                                                                                                                                                                                               |
| 30  | Support                   | ✅     | `support_ticket_categories`, `support_tickets`, `support_ticket_messages`, `support_ticket_assignments`, `support_ticket_status_history`                                                                                                                                                                          |
| 31  | Notifications             | ✅     | `notifications`, `notification_deliveries`, `notification_preferences`                                                                                                                                                                                                                                            |
| 32  | Human Chat                | ✅     | `chat_rooms`, `chat_participants`, `chat_messages`                                                                                                                                                                                                                                                                |
| 33  | AI Chat                   | ✅     | `ai_conversations`, `ai_messages`, `ai_usage`                                                                                                                                                                                                                                                                     |
| 34  | Chat Handoff              | ✅     | `chat_handoffs`                                                                                                                                                                                                                                                                                                   |
| 35  | Automation                | ✅     | `automation_templates`, `automation_jobs`, `automation_executions`, `webhook_deliveries`                                                                                                                                                                                                                          |
| 36  | Webhooks                  | ✅     | `webhook_deliveries`                                                                                                                                                                                                                                                                                              |
| 37  | Domain Events             | ✅     | `domain_events`, `event_outbox`, `event_deliveries`                                                                                                                                                                                                                                                               |
| 38  | Audit                     | ✅     | `audit_logs`                                                                                                                                                                                                                                                                                                      |
| 39  | Security                  | ✅     | `security_events`, `first_login_state`, `password_policies`, `sessions`                                                                                                                                                                                                                                           |
| 40  | LGPD                      | ✅     | `consents`, `privacy_requests`, `data_export_requests`, `data_deletion_requests`, `data_retention_policies`, `legal_acceptances`                                                                                                                                                                                  |
| 41  | Reports                   | ✅     | `report_definitions`, `report_executions`, `report_schedules`                                                                                                                                                                                                                                                     |
| 42  | Dashboards                | ✅     | `dashboard_widgets`, `dashboard_layouts`                                                                                                                                                                                                                                                                          |
| 43  | Integrations              | ✅     | `fiscal_integrations`                                                                                                                                                                                                                                                                                             |
| 44  | Administration            | ✅     | `administrative_requests`, `administrative_tasks`, `administrative_approvals`, `administrative_documents`                                                                                                                                                                                                         |
| 45  | Configuration             | ✅     | `tenant_settings`, `fiscal_configurations`, `automation_templates`                                                                                                                                                                                                                                                |
| 46  | Search                    | ❌     | NÃO IMPLEMENTADO                                                                                                                                                                                                                                                                                                  |
| 47  | Error Management          | ✅     | `validation_results`                                                                                                                                                                                                                                                                                              |

---

## 3. Inventário de Tabelas

### 01 — Core / Tenancy

#### `people`

- **Domínio:** Core / Identity
- **Finalidade:** Perfil base de qualquer pessoa no sistema (física, independentemente de papel).
- **Escopo:** GLOBAL
- **tenant_id:** N/A
- **Primary Key:** `id UUID PK`
- **Columns:**
  | Coluna       | Tipo        | Null | Default            | FK  | Observação                |
  | ------------ | ----------- | ---- | ------------------ | --- | ------------------------- |
  | id           | uuid        | NO   | uuid_generate_v4() | —   | PK                        |
  | auth_user_id | uuid        | YES  | —                  | —   | Vinculo com Supabase Auth |
  | full_name    | text        | NO   | —                  | —   | Nome completo             |
  | email        | text        | NO   | —                  | —   | Email único               |
  | phone        | text        | YES  | —                  | —   | Telefone                  |
  | status       | text        | NO   | 'active'           | —   | active/inactive           |
  | created_at   | timestamptz | NO   | now()              | —   | —                         |
  | updated_at   | timestamptz | NO   | now()              | —   | —                         |
- **Indexes:** PK (id)
- **RLS:** Habilitado
- **Origem:** `01_core.sql`

#### `tenants`

- **Domínio:** Core / Tenancy
- **Finalidade:** Tenant (cliente SaaS).
- **Escopo:** GLOBAL
- **tenant_id:** N/A
- **Primary Key:** `id UUID PK`
- **Columns:**
  | Coluna     | Tipo        | Null | Default            | FK  | Observação      |
  | ---------- | ----------- | ---- | ------------------ | --- | --------------- |
  | id         | uuid        | NO   | uuid_generate_v4() | —   | PK              |
  | name       | text        | NO   | —                  | —   | Nome do tenant  |
  | slug       | text        | NO   | —                  | —   | Slug único      |
  | status     | text        | NO   | 'active'           | —   | active/inactive |
  | created_at | timestamptz | NO   | now()              | —   | —               |
  | updated_at | timestamptz | NO   | now()              | —   | —               |
- **Constraints:** `uq_tenants_slug` (slug UNIQUE)
- **Indexes:** PK (id), `uq_tenants_slug`
- **RLS:** Habilitado
- **Origem:** `01_core.sql`

#### `tenant_memberships`

- **Domínio:** Core / Tenancy
- **Finalidade:** Associação entre `people` e `tenants`.
- **Escopo:** GLOBAL
- **tenant_id:** Não possui (tabela de junção)
- **Primary Key:** `id UUID PK`
- **Columns:**
  | Coluna     | Tipo        | Null | Default            | FK          | Observação      |
  | ---------- | ----------- | ---- | ------------------ | ----------- | --------------- |
  | id         | uuid        | NO   | uuid_generate_v4() | —           | PK              |
  | person_id  | uuid        | NO   | —                  | people(id)  | Pessoa          |
  | tenant_id  | uuid        | NO   | —                  | tenants(id) | Tenant          |
  | status     | text        | NO   | 'active'           | —           | active/inactive |
  | joined_at  | timestamptz | NO   | now()              | —           | —               |
  | created_at | timestamptz | NO   | now()              | —           | —               |
  | updated_at | timestamptz | NO   | now()              | —           | —               |
- **Constraints:** `uq_tenant_membership_person_tenant` (person_id, tenant_id UNIQUE)
- **Indexes:** PK (id), `uq_tenant_membership_person_tenant`, `idx_tenant_memberships_person_id`, `idx_tenant_memberships_tenant_id`
- **RLS:** Habilitado
- **Origem:** `01_core.sql`

#### `tenant_settings`

- **Domínio:** Core / Tenancy
- **Finalidade:** Configurações por tenant (chave-valor JSONB).
- **Escopo:** TENANT
- **tenant_id:** `tenant_id UUID NOT NULL`
- **Primary Key:** `id UUID PK`
- **Columns:**
  | Coluna     | Tipo        | Null | Default            | FK          | Observação |
  | ---------- | ----------- | ---- | ------------------ | ----------- | ---------- |
  | id         | uuid        | NO   | uuid_generate_v4() | —           | PK         |
  | tenant_id  | uuid        | NO   | —                  | tenants(id) | Tenant     |
  | key        | text        | NO   | —                  | —           | Chave      |
  | value      | jsonb       | NO   | '{}'::jsonb        | —           | Valor      |
  | created_at | timestamptz | NO   | now()              | —           | —          |
  | updated_at | timestamptz | NO   | now()              | —           | —          |
- **Constraints:** `uq_tenant_settings_tenant_key` (tenant_id, key UNIQUE)
- **Indexes:** PK (id), `uq_tenant_settings_tenant_key`, `idx_tenant_settings_tenant_id`
- **RLS:** Habilitado
- **Origem:** `01_core.sql`

---

## 4. Relationship Map

```
people
 ├── candidates
 ├── employees
 ├── chat_participants
 ├── ai_conversations (owner)
 ├── tenant_memberships
 ├── role_assignments
 ├── notifications
 ├── tasks
 ├── support_ticket_messages
 ├── support_ticket_assignments
 ├── purchase_requests (requester)
 ├── service_executions
 ├── service_acceptances
 ├── pos_sales (operator)
 ├── pos_cashier_sessions (operator)
 ├── pos_operators
 └── sessions

tenants
 ├── tenant_memberships
 ├── tenant_settings
 ├── companies
 ├── roles (indireto via assignments)
 ├── departments
 ├── positions
 ├── employees
 ├── warehouses
 ├── product_categories
 ├── stock_inventory
 ├── purchase_requests
 ├── invoices
 ├── fiscal_configurations
 ├── pos_terminals
 ├── notification_preferences
 └── report_definitions

companies
 ├── company_relationships
 ├── company_contacts
 ├── services (company_services)
 ├── service_orders
 ├── contracts
 ├── suppliers
 ├── purchase_requests
 ├── invoices
 └── recruitment_demands

employees
 ├── employee_positions
 ├── employee_contracts
 ├── employee_documents
 └── employee_status_history

service_orders
 ├── service_order_items
 ├── service_acceptances
 ├── service_executions
 ├── service_attachments
 └── service_order_status_history

purchase_orders
 ├── purchase_order_items
 ├── purchase_receipts
 └── purchase_status_history

purchase_receipts
 ├── purchase_receipt_items
 ├── purchase_receipt_divergences
 └── stock_movements (via reference_id)

invoices
 ├── invoice_items
 ├── accounts_receivable
 └── financial_transactions (via origin_document)

fiscal_documents
 ├── fiscal_document_items
 ├── fiscal_document_status_history
 ├── fiscal_api_requests
 └── fiscal_document_events

stock_inventory
 ├── stock_inventory_items
 └── stock_lots

products
 ├── stock_movements
 ├── pos_sale_items
 ├── stock_lots
 └── stock_balances
```

---

## 5. Tenant Isolation

| Table                               | Scope  | tenant_id     | RLS        | Policy                                               |
| ----------------------------------- | ------ | ------------- | ---------- | ---------------------------------------------------- |
| people                              | GLOBAL | N/A           | ✅         | admin_master / tenant-member via membership          |
| tenants                             | GLOBAL | N/A           | ✅         | admin_master                                         |
| tenant_memberships                  | GLOBAL | N/A           | ✅         | admin_master / membership                            |
| tenant_settings                     | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| roles                               | GLOBAL | N/A           | ✅         | admin_master / tenant-member                         |
| permissions                         | GLOBAL | N/A           | ✅         | admin_master                                         |
| role_permissions                    | GLOBAL | N/A           | ✅         | admin_master                                         |
| role_assignments                    | TENANT | UUID NULLABLE | ✅         | admin_master / tenant-member                         |
| companies                           | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| company_relationships               | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| company_contacts                    | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| candidates                          | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| jobs                                | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| applications                        | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| application_status_history          | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| interviews                          | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| services                            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| service_orders                      | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| service_order_status_history        | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| contracts                           | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| contract_status_history             | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| suppliers                           | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| purchase_orders                     | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| purchase_order_items                | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| products                            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| stock_movements                     | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| chat_rooms                          | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| chat_participants                   | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| chat_messages                       | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| ai_conversations                    | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| ai_messages                         | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| chat_handoffs                       | TENANT | ❌ Ausente    | ✅         | is_tenant_member(tenant_id) — depende de FK indireto |
| notifications                       | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| notification_deliveries             | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| domain_events                       | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| event_outbox                        | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| event_deliveries                    | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| audit_logs                          | TENANT | UUID NOT NULL | ✅         | admin_master / tenant-member                         |
| security_events                     | TENANT | UUID NOT NULL | ✅         | admin_master / tenant-member                         |
| first_login_state                   | TENANT | UUID NOT NULL | ✅         | admin_master / tenant-member                         |
| legal_acceptances                   | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| third_party_custody                 | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| third_party_custody_items           | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| tasks                               | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| files                               | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| file_access_logs                    | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| document_versions                   | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| document_links                      | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| administrative_requests             | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| administrative_tasks                | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| administrative_approvals            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| administrative_documents            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| consents                            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| privacy_requests                    | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| data_export_requests                | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| data_deletion_requests              | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| data_retention_policies             | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| stock_balances                      | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| stock_entries                       | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| purchase_receipts                   | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| purchase_receipt_items              | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| validation_results                  | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| financial_categories                | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| cost_centers                        | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| accounts_receivable                 | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| accounts_payable                    | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| payments                            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| receipts                            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| financial_transactions              | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| bank_reconciliations                | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| financial_installments              | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| financial_installment_payments      | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| financial_installment_cancellations | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| invoices                            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| invoice_items                       | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| financial_accounts                  | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| fiscal_configurations               | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| tax_rates                           | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| tax_calculations                    | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| fiscal_documents                    | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| fiscal_document_items               | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| fiscal_document_status_history      | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| fiscal_api_requests                 | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| fiscal_api_responses                | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| fiscal_document_events              | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_terminals                       | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_cashiers                        | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_operators                       | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| pos_cashier_sessions                | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_sales                           | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_sale_items                      | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_payments                        | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_cancellations                   | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_returns                         | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_cash_movements                  | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| pos_daily_closures                  | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| skills                              | TENANT | UUID NULLABLE | ❌ SEM RLS | —                                                    |
| candidate_documents                 | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| candidate_experiences               | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| candidate_education                 | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| candidate_courses                   | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| candidate_languages                 | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| candidate_skills                    | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| job_skills                          | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| stage_templates                     | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| recruitment_processes               | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| recruitment_stages                  | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| candidate_processes                 | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| application_profile_snapshots       | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| interview_participants              | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| interview_feedback                  | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| webhook_deliveries                  | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| automation_jobs                     | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| automation_executions               | TENANT | UUID NOT NULL | ❌ SEM RLS | —                                                    |
| departments                         | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| positions                           | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| employees                           | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| employee_positions                  | TENANT | ❌ Ausente    | ✅         | FK indireta via employees                            |
| employee_contracts                  | TENANT | ❌ Ausente    | ✅         | FK indireta via employees                            |
| employee_documents                  | TENANT | ❌ Ausente    | ✅         | FK indireta via employees                            |
| employee_status_history             | TENANT | ❌ Ausente    | ✅         | FK indireta via employees                            |
| company_services                    | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| service_order_items                 | TENANT | UUID NOT NULL | ✅         | FK indireta via service_orders                       |
| service_acceptances                 | TENANT | UUID NOT NULL | ✅         | FK indireta via service_orders                       |
| service_executions                  | TENANT | UUID NOT NULL | ✅         | FK indireta via service_orders                       |
| service_attachments                 | TENANT | UUID NOT NULL | ✅         | FK indireta via service_orders                       |
| interactions                        | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| recruitment_demands                 | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| talent_pool_memberships             | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| job_matches                         | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| candidate_profile_views             | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| warehouses                          | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| warehouse_locations                 | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| product_categories                  | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| stock_lots                          | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| stock_inventory                     | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| stock_inventory_items               | TENANT | UUID NOT NULL | ✅         | FK indireta via stock_inventory                      |
| purchase_requests                   | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| purchase_request_items              | TENANT | UUID NOT NULL | ✅         | FK indireta via purchase_requests                    |
| purchase_quotations                 | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| purchase_quotation_items            | TENANT | UUID NOT NULL | ✅         | FK indireta via purchase_quotations                  |
| purchase_status_history             | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| purchase_receipt_divergences        | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| fiscal_integrations                 | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| task_comments                       | TENANT | UUID NOT NULL | ✅         | FK indireta via tasks                                |
| task_attachments                    | TENANT | UUID NOT NULL | ✅         | FK indireta via tasks                                |
| task_status_history                 | TENANT | UUID NOT NULL | ✅         | FK indireta via tasks                                |
| support_ticket_categories           | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| support_tickets                     | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| support_ticket_messages             | TENANT | UUID NOT NULL | ✅         | FK indireta via support_tickets                      |
| support_ticket_assignments          | TENANT | UUID NOT NULL | ✅         | FK indireta via support_tickets                      |
| ai_usage                            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| sessions                            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| password_policies                   | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| automation_templates                | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| notification_preferences            | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| report_definitions                  | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| report_executions                   | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| report_schedules                    | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| dashboard_widgets                   | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |
| dashboard_layouts                   | TENANT | UUID NOT NULL | ✅         | is_tenant_member(tenant_id)                          |

---

## 6. RBAC

### Tabelas

#### `roles`

- **Escopo:** GLOBAL
- **Finalidade:** Papéis do sistema (admin_master, admin_tenant, manager, operator, etc.)
- **Origem:** `02_rbac.sql`

#### `permissions`

- **Escopo:** GLOBAL
- **Finalidade:** Permissões granulares (resource + action)
- **Constraints:** `uq_permission_resource_action` (resource, action UNIQUE)
- **Origem:** `02_rbac.sql`

#### `role_permissions`

- **Escopo:** GLOBAL
- **Finalidade:** Associação role ↔ permission
- **Constraints:** `uq_role_permission` (role_id, permission_id UNIQUE)
- **Origem:** `02_rbac.sql`

#### `role_assignments`

- **Escopo:** TENANT
- **Finalidade:** Associação person ↔ role por tenant
- **tenant_id:** UUID NULLABLE
- **Constraints:** `uq_role_assignment_person_role_tenant` (person_id, role_id, tenant_id UNIQUE)
- **Origem:** `02_rbac.sql`

### Functions

#### `user_has_permission(p_auth_user_id uuid, p_resource text, p_action text, p_tenant_id uuid) → boolean`

- **Schema:** public
- **Security:** SECURITY DEFINER
- **search_path:** public, pg_temp
- **Finalidade:** Verifica se usuário possui permissão específica
- **Dependências:** `people`, `role_assignments`, `role_permissions`, `permissions`
- **Origem:** `21_functions_triggers.sql` (Fase 01)

#### `user_permissions(p_auth_user_id uuid, p_tenant_id uuid) → table(resource, action, description)`

- **Schema:** public
- **Security:** SECURITY DEFINER
- **search_path:** public, pg_temp
- **Finalidade:** Lista todas as permissões do usuário em um tenant
- **Dependências:** `people`, `role_assignments`, `role_permissions`, `permissions`
- **Origem:** `21_functions_triggers.sql` (Fase 01)

#### `is_tenant_member(p_tenant_id uuid) → boolean`

- **Schema:** public
- **Security:** SECURITY DEFINER
- **search_path:** public, pg_temp
- **Finalidade:** Helper RLS — verifica membership ativa
- **Dependências:** `tenant_memberships`
- **Origem:** `22_rls.sql`

#### `is_admin_master() → boolean`

- **Schema:** public
- **Security:** SECURITY DEFINER
- **search_path:** public, pg_temp
- **Finalidade:** Helper RLS — verifica se é admin master global
- **Dependências:** `role_assignments`, `roles`
- **Origem:** `22_rls.sql`

#### `user_tenant_ids() → setof uuid`

- **Schema:** public
- **Security:** SECURITY DEFINER
- **search_path:** public, pg_temp
- **Finalidade:** Lista tenant_ids do usuário logado
- **Dependências:** `tenant_memberships`
- **Origem:** `22_rls.sql`

---

## 8. Triggers

| Tabela               | Trigger                                 | Evento        | Timing | Function                     | Objetivo                   | Origem                      |
| -------------------- | --------------------------------------- | ------------- | ------ | ---------------------------- | -------------------------- | --------------------------- |
| `tenant_memberships` | `trg_set_updated_at_tenant_memberships` | INSERT/UPDATE | BEFORE | `set_updated_at`             | Atualiza `updated_at`      | `21_functions_triggers.sql` |
| `role_assignments`   | `trg_set_updated_at_role_assignments`   | INSERT/UPDATE | BEFORE | `set_updated_at`             | Atualiza `updated_at`      | `21_functions_triggers.sql` |
| `companies`          | `trg_set_updated_at_companies`          | INSERT/UPDATE | BEFORE | `set_updated_at`             | Atualiza `updated_at`      | `21_functions_triggers.sql` |
| `products`           | `trg_set_updated_at_products`           | INSERT/UPDATE | BEFORE | `set_updated_at`             | Atualiza `updated_at`      | `21_functions_triggers.sql` |
| `suppliers`          | `trg_set_updated_at_suppliers`          | INSERT/UPDATE | BEFORE | `set_updated_at`             | Atualiza `updated_at`      | `21_functions_triggers.sql` |
| `purchase_orders`    | `trg_set_updated_at_purchase_orders`    | INSERT/UPDATE | BEFORE | `set_updated_at`             | Atualiza `updated_at`      | `21_functions_triggers.sql` |
| `contracts`          | `trg_set_updated_at_contracts`          | INSERT/UPDATE | BEFORE | `set_updated_at`             | Atualiza `updated_at`      | `21_functions_triggers.sql` |
| `stock_movements`    | `trg_audit_stock_movements`             | INSERT        | AFTER  | `stock_movement_insert`      | Processa movimentação      | `21_functions_triggers.sql` |
| `stock_balances`     | `trg_audit_stock_balances`              | UPDATE        | AFTER  | `audit_log_insert`           | Auditoria                  | `21_functions_triggers.sql` |
| `purchase_receipts`  | `trg_audit_purchase_receipts`           | UPDATE        | AFTER  | `purchase_receipt_confirm`   | Confirma recebimento       | `21_functions_triggers.sql` |
| `consents`           | `trg_audit_consents`                    | UPDATE        | AFTER  | `lgpd_consent_register`      | Registra LGPD              | `21_functions_triggers.sql` |
| `domain_events`      | `trg_domain_event_to_outbox`            | INSERT        | AFTER  | `event_outbox_enqueue`       | Enfileira evento           | `21_functions_triggers.sql` |
| `people`             | `trg_audit_data_deletion_requests`      | DELETE        | BEFORE | `lgpd_legal_hold_check`      | Verifica retenção legal    | `21_functions_triggers.sql` |
| `pos_daily_closures` | `trg_pos_daily_closure_validate`        | UPDATE        | BEFORE | `pos_daily_closure_validate` | Valida fechamento de caixa | `29_pos.sql`                |

---

## 9. Views

| View               | Finalidade                      | Tabelas utilizadas       | Campos principais                                      | Origem                           |
| ------------------ | ------------------------------- | ------------------------ | ------------------------------------------------------ | -------------------------------- |
| `financial_kpis`   | KPIs financeiros por tenant     | `financial_transactions` | tenant_id, total_credit, total_debit, balance          | `27_finance.sql`                 |
| `recruitment_kpis` | KPIs de recrutamento por tenant | `recruitment_demands`    | tenant_id, open_demands, closed_demands, total_demands | `35_recruitment_talent_pool.sql` |

---

## 10. Enums / Types

Sem enums nativos. Campos enumerados via `text` + CHECK:

- `people.status`: 'active', 'inactive'
- `roles.scope`: 'global', 'tenant'
- `service_orders.status`: 'pending', 'in_progress', 'completed', 'cancelled'
- `pos_sales.status`: 'draft', 'confirmed', 'cancelled', 'returned'
- `invoices.status`: 'draft', 'emitted', 'cancelled', 'paid'
- `fiscal_documents.status`: 'pending', 'authorized', 'rejected', 'cancelled'
- `pos_daily_closures.status`: 'pending', 'approved', 'discrepancy'

---

## 11. Extensions

| Extension   | Used by                        |
| ----------- | ------------------------------ |
| `uuid-ossp` | Geração de UUIDs nas tabelas   |
| `pgcrypto`  | `gen_random_uuid()` em funções |

---

## 12. Indexes

Principais índices aplicados sobre `tenant_id`, chaves de busca e relacionamentos:

- Core: `people.auth_user_id`, `people.email`, `tenant_memberships.person_id/tenant_id`, `tenant_settings.tenant_id`
- RBAC: `role_permissions.role_id/permission_id`, `role_assignments.person_id/tenant_id`
- CRM: `companies.tenant_id/slug`, `company_relationships/company_contacts.company_id`
- Recruitment: `candidates/jobs/applications/interviews.tenant_id`, `applications.candidate_id/job_id`, `interviews.candidate_id/job_id`
- Services: `services/service_orders/contracts.tenant_id`, `service_order_status_history.service_order_id`, `contract_status_history.contract_id`
- Purchasing: `suppliers/purchase_orders/purchase_receipts.tenant_id`, `purchase_order/request/quotation_items.*_id`
- Inventory: `products.tenant_id/sku`, `stock_movements.tenant_id/product_id`, `stock_balances.tenant_id/product_id`
- Chat/AI: `chat_rooms.tenant_id`, `chat_participants/messages.room_id`, `ai_conversations.tenant_id`, `ai_messages.conversation_id`
- Notifications/Events: `notifications.tenant_id/person_id`, `notification_deliveries.notification_id`, `event_outbox.status/created_at`, `event_deliveries.destination/status`
- Audit/Security: `audit_logs.tenant_id/table_name`, `security_events.tenant_id`, `consents.person_id`
- Finance: `cost_centers/financial_transactions/accounts_receivable/accounts_payable/payments/receipts/bank_reconciliations/financial_installments/invoices.tenant_id`, `financial_transactions.tenant_id/type/competence_date`, `invoice_items.invoice_id`
- Fiscal: `fiscal_documents.tenant_id/number`, `fiscal_document_items.document_id`, `fiscal_api_requests.document_id`
- POS: `pos_terminals/cashiers/operators/sessions/sales.tenant_id`, `pos_cashiers.terminal_id`, `pos_sessions.cashier_id/status`, `pos_sales.session_id/status`, `pos_sale/payment/cancellation/return/cash_movement/daily_closure.*_id`
- Recruitment/Employees: `recruitment_demands/talent_pool_memberships.tenant_id`, `job_matches.demand_id`, `departments/positions/employees.tenant_id`
- Inventory/Warehouses: `warehouses.tenant_id`, `warehouse_locations.warehouse_id`, `product_categories.tenant_id`, `stock_lots.tenant_id/product_id`, `stock_inventory.tenant_id`, `stock_inventory_items.inventory_id`
- Purchasing: `purchase_requests/quotations.tenant_id`, `purchase_request/request/quotation_items.*_id`
- Reports: `report_definitions/widgets.tenant_id`, `report_executions/schedules.report_id`, `dashboard_layouts.person_id`
- Outros: `files.tenant_id`, `file_access_logs/document_versions/document_links.*_id`, `automation_jobs.tenant_id`, `automation_executions.job_id`, `validation_results.gate/suite`

---

## 13. RLS Policies

### Padrão geral

- Tabelas TENANT com `tenant_id`: policies usam `is_tenant_member(tenant_id)`.
- Tabelas com FK indireta: policies usam subquery para confirmar tenant do pai.
- Tabelas GLOBALS: policies restritas a `is_admin_master()`.
- DELETE: sem policies DELETE explícitas para tabelas operacionais; apenas tabelas globais possuem `FOR ALL`.

#### Financeiro

| Tabela                                | Operação             | Policy                                         | USING                         | WITH CHECK |
| ------------------------------------- | -------------------- | ---------------------------------------------- | ----------------------------- | ---------- |
| `financial_categories`                | SELECT/INSERT/UPDATE | `financial_categories_member_*`                | `is_tenant_member(tenant_id)` | idem       |
| `cost_centers`                        | SELECT/INSERT/UPDATE | `cost_centers_member_*`                        | `is_tenant_member(tenant_id)` | idem       |
| `accounts_receivable`                 | SELECT/INSERT/UPDATE | `accounts_receivable_member_*`                 | `is_tenant_member(tenant_id)` | idem       |
| `accounts_payable`                    | SELECT/INSERT/UPDATE | `accounts_payable_member_*`                    | `is_tenant_member(tenant_id)` | idem       |
| `payments`                            | SELECT/INSERT/UPDATE | `payments_member_*`                            | `is_tenant_member(tenant_id)` | idem       |
| `receipts`                            | SELECT/INSERT/UPDATE | `receipts_member_*`                            | `is_tenant_member(tenant_id)` | idem       |
| `financial_transactions`              | SELECT/INSERT/UPDATE | `financial_transactions_member_*`              | `is_tenant_member(tenant_id)` | idem       |
| `bank_reconciliations`                | SELECT/INSERT/UPDATE | `bank_reconciliations_member_*`                | `is_tenant_member(tenant_id)` | idem       |
| `financial_installments`              | SELECT/INSERT/UPDATE | `financial_installments_member_*`              | `is_tenant_member(tenant_id)` | idem       |
| `financial_installment_payments`      | SELECT/INSERT        | `financial_installment_payments_member_*`      | via `installments`            | idem       |
| `financial_installment_cancellations` | SELECT/INSERT        | `financial_installment_cancellations_member_*` | via `installments`            | idem       |
| `invoices`                            | SELECT/INSERT/UPDATE | `invoices_member_*`                            | `is_tenant_member(tenant_id)` | idem       |
| `invoice_items`                       | SELECT/INSERT/UPDATE | `invoice_items_member_*`                       | via `invoices`                | idem       |
| `financial_accounts`                  | SELECT/INSERT/UPDATE | `financial_accounts_member_*`                  | `is_tenant_member(tenant_id)` | idem       |

#### Fiscal

| Tabela                           | Operação             | Policy                                    | USING                         | WITH CHECK |
| -------------------------------- | -------------------- | ----------------------------------------- | ----------------------------- | ---------- |
| `fiscal_configurations`          | SELECT/INSERT/UPDATE | `fiscal_configurations_member_*`          | `is_tenant_member(tenant_id)` | idem       |
| `tax_rates`                      | SELECT/INSERT/UPDATE | `tax_rates_member_*`                      | `is_tenant_member(tenant_id)` | idem       |
| `tax_calculations`               | SELECT/INSERT/UPDATE | `tax_calculations_member_*`               | `is_tenant_member(tenant_id)` | idem       |
| `fiscal_documents`               | SELECT/INSERT/UPDATE | `fiscal_documents_member_*`               | `is_tenant_member(tenant_id)` | idem       |
| `fiscal_document_items`          | SELECT/INSERT/UPDATE | `fiscal_document_items_member_*`          | via `fiscal_documents`        | idem       |
| `fiscal_document_status_history` | SELECT/INSERT        | `fiscal_document_status_history_member_*` | via `fiscal_documents`        | idem       |
| `fiscal_api_requests`            | SELECT/INSERT/UPDATE | `fiscal_api_requests_member_*`            | via `fiscal_documents`        | idem       |
| `fiscal_api_responses`           | SELECT/INSERT/UPDATE | `fiscal_api_responses_member_*`           | via `fiscal_api_requests`     | idem       |
| `fiscal_document_events`         | SELECT/INSERT        | `fiscal_document_events_member_*`         | via `fiscal_documents`        | idem       |
| `fiscal_integrations`            | SELECT/INSERT/UPDATE | `fiscal_integrations_member_*`            | `is_tenant_member(tenant_id)` | idem       |

#### POS

| Tabela          | Operação             | Policy                   | USING                         | WITH CHECK |
| --------------- | -------------------- | ------------------------ | ----------------------------- | ---------- |
| `pos_operators` | SELECT/INSERT/UPDATE | `pos_operators_member_*` | `is_tenant_member(tenant_id)` | idem       |

#### Tasks / Support

| Tabela                       | Operação             | Policy                                | USING                         | WITH CHECK |
| ---------------------------- | -------------------- | ------------------------------------- | ----------------------------- | ---------- |
| `tasks`                      | SELECT/INSERT/UPDATE | `tasks_member_*`                      | `is_tenant_member(tenant_id)` | idem       |
| `task_comments`              | SELECT/INSERT/UPDATE | `task_comments_member_*`              | via `tasks`                   | idem       |
| `task_attachments`           | SELECT/INSERT        | `task_attachments_member_*`           | via `tasks`                   | idem       |
| `task_status_history`        | SELECT/INSERT        | `task_status_history_member_*`        | via `tasks`                   | idem       |
| `support_ticket_categories`  | SELECT/INSERT/UPDATE | `support_ticket_categories_member_*`  | `is_tenant_member(tenant_id)` | idem       |
| `support_tickets`            | SELECT/INSERT/UPDATE | `support_tickets_member_*`            | `is_tenant_member(tenant_id)` | idem       |
| `support_ticket_messages`    | SELECT/INSERT        | `support_ticket_messages_member_*`    | via `support_tickets`         | idem       |
| `support_ticket_assignments` | SELECT/INSERT        | `support_ticket_assignments_member_*` | via `support_tickets`         | idem       |

#### Chat / AI

| Tabela              | Operação             | Policy                       | USING                         | WITH CHECK |
| ------------------- | -------------------- | ---------------------------- | ----------------------------- | ---------- |
| `chat_rooms`        | SELECT/INSERT        | `chat_rooms_member_*`        | via `ai_conversations`/FK     | idem       |
| `chat_participants` | SELECT/INSERT        | `chat_participants_member_*` | via FK                        | idem       |
| `chat_messages`     | SELECT/INSERT        | `chat_messages_member_*`     | via FK                        | idem       |
| `ai_conversations`  | SELECT/INSERT/UPDATE | `ai_conversations_member_*`  | `is_tenant_member(tenant_id)` | idem       |
| `ai_messages`       | SELECT/INSERT        | `ai_messages_member_*`       | via `ai_conversations`        | idem       |
| `chat_handoffs`     | SELECT/INSERT        | `chat_handoffs_member_*`     | via FK                        | idem       |
| `ai_usage`          | SELECT/INSERT        | `ai_usage_member_*`          | `is_tenant_member(tenant_id)` | idem       |

#### Notifications / Events

| Tabela                     | Operação             | Policy                              | USING                         | WITH CHECK |
| -------------------------- | -------------------- | ----------------------------------- | ----------------------------- | ---------- |
| `notifications`            | SELECT/INSERT/UPDATE | `notifications_member_*`            | `is_tenant_member(tenant_id)` | idem       |
| `notification_deliveries`  | SELECT/INSERT        | `notification_deliveries_member_*`  | via `notifications`           | idem       |
| `domain_events`            | SELECT/INSERT        | `domain_events_member_*`            | `is_tenant_member(tenant_id)` | idem       |
| `event_outbox`             | SELECT/INSERT/UPDATE | `event_outbox_member_*`             | `is_tenant_member(tenant_id)` | idem       |
| `event_deliveries`         | SELECT/INSERT/UPDATE | `event_deliveries_member_*`         | `is_tenant_member(tenant_id)` | idem       |
| `notification_preferences` | SELECT/INSERT/UPDATE | `notification_preferences_member_*` | `is_tenant_member(tenant_id)` | idem       |

#### Storage / Documents

| Tabela                     | Operação             | Policy                              | USING                         | WITH CHECK |
| -------------------------- | -------------------- | ----------------------------------- | ----------------------------- | ---------- |
| `files`                    | SELECT/INSERT/UPDATE | `files_member_*`                    | `is_tenant_member(tenant_id)` | idem       |
| `file_access_logs`         | SELECT/INSERT        | `file_access_logs_member_*`         | via `files`                   | idem       |
| `document_versions`        | SELECT/INSERT/UPDATE | `document_versions_member_*`        | via `files`/`tenant_id`       | idem       |
| `document_links`           | SELECT/INSERT/UPDATE | `document_links_member_*`           | via `files`/`tenant_id`       | idem       |
| `administrative_requests`  | SELECT/INSERT/UPDATE | `administrative_requests_member_*`  | `is_tenant_member(tenant_id)` | idem       |
| `administrative_tasks`     | SELECT/INSERT/UPDATE | `administrative_tasks_member_*`     | `is_tenant_member(tenant_id)` | idem       |
| `administrative_approvals` | SELECT/INSERT/UPDATE | `administrative_approvals_member_*` | `is_tenant_member(tenant_id)` | idem       |
| `administrative_documents` | SELECT/INSERT/UPDATE | `administrative_documents_member_*` | `is_tenant_member(tenant_id)` | idem       |

#### Audit / Security / LGPD

| Tabela                    | Operação             | Policy                             | USING                         | WITH CHECK |
| ------------------------- | -------------------- | ---------------------------------- | ----------------------------- | ---------- |
| `audit_logs`              | SELECT               | `audit_logs_member_read`           | `is_tenant_member(tenant_id)` | —          |
| `security_events`         | SELECT/INSERT/UPDATE | `security_events_member_*`         | `is_tenant_member(tenant_id)` | idem       |
| `first_login_state`       | SELECT/INSERT/UPDATE | `first_login_state_member_*`       | `is_tenant_member(tenant_id)` | idem       |
| `legal_acceptances`       | SELECT/INSERT/UPDATE | `legal_acceptances_member_*`       | `is_tenant_member(tenant_id)` | idem       |
| `consents`                | SELECT/INSERT/UPDATE | `consents_member_*`                | `is_tenant_member(tenant_id)` | idem       |
| `privacy_requests`        | SELECT/INSERT/UPDATE | `privacy_requests_member_*`        | `is_tenant_member(tenant_id)` | idem       |
| `data_export_requests`    | SELECT/INSERT/UPDATE | `data_export_requests_member_*`    | `is_tenant_member(tenant_id)` | idem       |
| `data_deletion_requests`  | SELECT/INSERT/UPDATE | `data_deletion_requests_member_*`  | `is_tenant_member(tenant_id)` | idem       |
| `data_retention_policies` | SELECT/INSERT/UPDATE | `data_retention_policies_member_*` | `is_tenant_member(tenant_id)` | idem       |

#### Automation / Reports

| Tabela                 | Operação             | Policy                          | USING                         | WITH CHECK |
| ---------------------- | -------------------- | ------------------------------- | ----------------------------- | ---------- |
| `automation_templates` | SELECT/INSERT/UPDATE | `automation_templates_member_*` | `is_tenant_member(tenant_id)` | idem       |
| `report_definitions`   | SELECT/INSERT/UPDATE | `report_definitions_member_*`   | `is_tenant_member(tenant_id)` | idem       |
| `report_executions`    | SELECT/INSERT        | `report_executions_member_*`    | `is_tenant_member(tenant_id)` | idem       |
| `report_schedules`     | SELECT/INSERT/UPDATE | `report_schedules_member_*`     | `is_tenant_member(tenant_id)` | idem       |
| `dashboard_widgets`    | SELECT/INSERT/UPDATE | `dashboard_widgets_member_*`    | `is_tenant_member(tenant_id)` | idem       |
| `dashboard_layouts`    | SELECT/INSERT/UPDATE | `dashboard_layouts_member_*`    | `is_tenant_member(tenant_id)` | idem       |
| `sessions`             | SELECT/INSERT        | `sessions_member_*`             | `is_tenant_member(tenant_id)` | idem       |
| `password_policies`    | SELECT/INSERT/UPDATE | `password_policies_member_*`    | `is_tenant_member(tenant_id)` | idem       |

---

## 14. Financeiro

Fluxo: `companies/suppliers → purchase_requests → purchase_orders → receipts → accounts_payable → payments → financial_transactions → cost_centers/financial_categories` e `customers/companies → invoices → invoice_items → accounts_receivable → receipts → financial_transactions`.

Tabelas:

- `financial_categories`, `cost_centers`
- `accounts_receivable`, `accounts_payable`
- `payments`, `receipts`
- `financial_transactions`
- `bank_reconciliations`
- `financial_installments`, `financial_installment_payments`, `financial_installment_cancellations`
- `invoices`, `invoice_items`
- `financial_accounts`

RPCs: `financial_reversal`
Views: `financial_kpis`

---

## 15. Fiscal

Tabelas:

- `fiscal_configurations`
- `tax_rates`, `tax_calculations`
- `fiscal_documents`, `fiscal_document_items`, `fiscal_document_status_history`
- `fiscal_api_requests`, `fiscal_api_responses`
- `fiscal_document_events`
- `fiscal_integrations`

RPCs: `fiscal_emit_invoice`, `fiscal_cancel_invoice`

Aviso: integração fiscal externa deve ser feita por camada de serviço; funções aqui são orquestração/registro.

---

## 16. RH / Recruitment

### Recruitment

- `candidates`
- `jobs`, `applications`, `application_status_history`, `interviews`
- `skills`, `candidate_skills`, `job_skills`
- `candidate_documents`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`
- `stage_templates`, `recruitment_processes`, `recruitment_stages`, `candidate_processes`
- `application_profile_snapshots`, `interview_participants`, `interview_feedback`
- `talent_pool_memberships`, `job_matches`, `candidate_profile_views`
- `recruitment_demands`

RPCs: `match_candidates_to_demand`
Views: `recruitment_kpis`

### Employees

- `employees`, `departments`, `positions`
- `employee_positions`, `employee_contracts`, `employee_documents`, `employee_status_history`

Fluxo: `people → candidates → jobs → applications → interviews → employees`

---

## 17. CRM / Services

Tabelas:

- `companies`, `company_relationships`, `company_contacts`
- `company_services`
- `service_orders`, `service_order_items`, `service_order_status_history`
- `service_acceptances`, `service_executions`, `service_attachments`
- `contracts`, `contract_status_history`
- `interactions`
- `recruitment_demands`

Fluxo: `company → service → service_order → items → execution → acceptance`

---

## 18. Inventory / Almoxarifado

Tabelas:

- `products`, `stock_movements`, `stock_balances`, `stock_entries`
- `warehouses`, `warehouse_locations`
- `product_categories`
- `stock_lots`
- `stock_inventory`, `stock_inventory_items`

Fluxo: `supplier/products → purchase/receipt → stock_movements → stock_balances → stock_inventory`

---

## 19. Purchasing

Tabelas:

- `suppliers`
- `purchase_requests`, `purchase_request_items`
- `purchase_quotations`, `purchase_quotation_items`
- `purchase_orders`, `purchase_order_items`
- `purchase_receipts`, `purchase_receipt_items`, `purchase_receipt_divergences`
- `purchase_status_history`

Fluxo: `supplier → purchase_request → quotation → purchase_order → receipt → inventory/financial`

---

## 20. POS / Sales

Tabelas:

- `pos_terminals`, `pos_cashiers`, `pos_operators`
- `pos_cashier_sessions`
- `pos_sales`, `pos_sale_items`
- `pos_payments`
- `pos_cancellations`, `pos_returns`
- `pos_cash_movements`
- `pos_daily_closures`

Trigger: `pos_daily_closure_validate`

Fluxo: `product → POS sale → payment → stock → fiscal → financial`

---

## 21. Tasks / Support

Tabelas:

- `tasks`
- `task_comments`, `task_attachments`, `task_status_history`
- `support_ticket_categories`
- `support_tickets`, `support_ticket_messages`, `support_ticket_assignments`, `support_ticket_status_history`

---

## 22. Chat

Tabelas:

- Human Chat: `chat_rooms`, `chat_participants`, `chat_messages`
- AI Chat: `ai_conversations`, `ai_messages`
- Handoff: `chat_handoffs`
- Usage: `ai_usage`
- Sessions: `sessions`

---

## 23. Automation

Tabelas:

- `automation_templates`
- `automation_jobs`, `automation_executions`
- `webhook_deliveries`

---

## 24. Notifications

Tabelas:

- `notifications`, `notification_deliveries`
- `notification_preferences`

---

## 25. Reports / Dashboards

Tabelas:

- `report_definitions`, `report_executions`, `report_schedules`
- `dashboard_widgets`, `dashboard_layouts`

Views: `financial_kpis`, `recruitment_kpis`

---

## 26. Documents / Storage

Tabelas:

- `files`, `file_access_logs`
- `document_versions`, `document_links`
- `administrative_requests`, `administrative_tasks`, `administrative_approvals`, `administrative_documents`

---

## 27. Audit / Security / LGPD

Tabelas:

- `audit_logs`, `security_events`
- `first_login_state`, `password_policies`, `sessions`
- `legal_acceptances`
- `consents`, `privacy_requests`, `data_export_requests`, `data_deletion_requests`, `data_retention_policies`

---

## 28. Events

Tabelas:

- `domain_events`
- `event_outbox`
- `event_deliveries`

Funções: `domain_event_emit`, `event_outbox_enqueue`, `event_outbox_process_next`

---

## 29. Seed / Configuration

Arquivo: `32_seed.sql`

Inclui:

- Roles padrão: `admin_master`, `admin_tenant`, `manager`, `operator`
- Permissões padrão por recurso/ação
- `role_permissions` iniciais
- `role_assignments` para usuário master
- Dados de configuração quando aplicável

---

## 30. Business Flow Matrix

| Fluxo        | Tabelas envolvidas                                                                                                                   | Functions                                  | Triggers                 | Events            | Finance | Fiscal | Audit            | Status |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------ | ----------------- | ------- | ------ | ---------------- | ------ |
| RH           | people → candidates → jobs → applications → interviews → employees                                                                   | match_candidates_to_demand                 | —                        | —                 | —       | —      | audit_log_insert | ✅     |
| Cliente      | companies → company_services → service_orders → service_order_items → service_executions → service_acceptances                       | —                                          | —                        | domain_event_emit | —       | —      | audit_log_insert | ⚠️     |
| Compras      | suppliers → purchase_requests → purchase_quotations → purchase_orders → purchase_receipts → stock_movements → financial_transactions | financial_reversal                         | purchase_receipt_confirm | domain_event_emit | ✅      | —      | audit_log_insert | ✅     |
| Venda        | products → pos_sales → pos_payments → stock_movements → invoices → financial_transactions                                            | financial_reversal                         | —                        | domain_event_emit | ✅      | —      | audit_log_insert | ⚠️     |
| Fiscal       | fiscal_configurations → fiscal_documents → fiscal_document_items → fiscal_api_requests/responses → fiscal_document_events            | fiscal_emit_invoice, fiscal_cancel_invoice | —                        | domain_event_emit | —       | ✅     | audit_log_insert | ⚠️     |
| Suporte      | support_ticket_categories → support_tickets → support_ticket_messages → support_ticket_assignments                                   | —                                          | —                        | —                 | —       | —      | audit_log_insert | ⚠️     |
| Chat         | chat_rooms → chat_participants → chat_messages → ai_conversations → ai_messages                                                      | —                                          | —                        | —                 | —       | —      | audit_log_insert | ✅     |
| Automação    | automation_templates → automation_jobs → automation_executions → webhook_deliveries                                                  | —                                          | —                        | domain_event_emit | —       | —      | audit_log_insert | ✅     |
| Notificações | notifications → notification_deliveries → notification_preferences                                                                   | —                                          | —                        | domain_event_emit | —       | —      | audit_log_insert | ✅     |

---

## 31. Frontend Contract

### Entidades principais por módulo

| Módulo        | Read | Create | Update | Delete | RPC                                        | Upload | Realtime |
| ------------- | ---- | ------ | ------ | ------ | ------------------------------------------ | ------ | -------- |
| Core/Identity | ✅   | ✅     | ✅     | ❌     | user_has_permission, user_permissions      | ❌     | ❌       |
| RBAC          | ✅   | ✅     | ✅     | ❌     | user_has_permission, user_permissions      | ❌     | ❌       |
| CRM/Companies | ✅   | ✅     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Recruitment   | ✅   | ✅     | ✅     | ❌     | match_candidates_to_demand                 | ❌     | ❌       |
| Employees     | ✅   | ✅     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Services      | ✅   | ✅     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Finance       | ✅   | ✅     | ✅     | ❌     | financial_reversal                         | ❌     | ❌       |
| Fiscal        | ✅   | ✅     | ❌     | ❌     | fiscal_emit_invoice, fiscal_cancel_invoice | ❌     | ❌       |
| POS           | ✅   | ✅     | ✅     | ❌     | pos_daily_closure_validate                 | ❌     | ❌       |
| Purchasing    | ✅   | ✅     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Inventory     | ✅   | ✅     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Support       | ✅   | ✅     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Chat          | ✅   | ✅     | ❌     | ❌     | —                                          | ❌     | ❌       |
| Automation    | ✅   | ✅     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Notifications | ✅   | ❌     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Reports       | ✅   | ✅     | ✅     | ❌     | —                                          | ❌     | ❌       |
| Documents     | ✅   | ✅     | ✅     | ❌     | —                                          | ✅     | ❌       |
| Audit/LGPD    | ✅   | ❌     | ❌     | ❌     | —                                          | ❌     | ❌       |

---

## 32. Storage

Sem buckets definidos no SQL. Uploads previstos via:

- `files.file_url`
- `document_versions.file_url`
- `employee_documents.file_url`
- `service_attachments.file_url`
- `task_attachments.file_url`
- `candidate_documents.file_url`

Acesso deve ser controlado por RLS + URLs assinadas.

---

## 33. Implementation Traceability

| Gap                      | SQL                            | Estrutura                                                                                                                                              | Fase | Status |
| ------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------ |
| RBAC sem RPCs            | 21_functions_triggers.sql      | user_has_permission, user_permissions                                                                                                                  | 01   | ✅     |
| employees ausente        | 33_employees.sql               | employees, departments, positions, employee_positions, employee_contracts, employee_documents, employee_status_history                                 | 02   | ✅     |
| company_services ausente | 34_crm_services.sql            | company_services, service_orders, service_order_items, service_acceptances, service_executions, service_attachments, interactions, recruitment_demands | 03   | ✅     |
| talent_pool ausente      | 35_recruitment_talent_pool.sql | talent_pool_memberships, job_matches, candidate_profile_views, recruitment_kpis, match_candidates_to_demand                                            | 04   | ✅     |
| inventory ausente        | 36_inventory.sql               | warehouses, warehouse_locations, product_categories, stock_lots, stock_inventory, stock_inventory_items                                                | 05   | ✅     |
| purchasing ausente       | 37_purchasing.sql              | purchase_requests, purchase_request_items, purchase_quotations, purchase_quotation_items, purchase_status_history, purchase_receipt_divergences        | 06   | ✅     |
| finance ausente          | 27_finance.sql                 | invoices, invoice_items, financial_accounts, financial_reversal, financial_kpis                                                                        | 07   | ✅     |
| fiscal ausente           | 39_fiscal.sql                  | fiscal_integrations, fiscal_emit_invoice, fiscal_cancel_invoice                                                                                        | 08   | ✅     |
| POS ausente              | 29_pos.sql                     | pos_daily_closure_validate                                                                                                                             | 09   | ✅     |
| tasks/support ausente    | 40_tasks_support.sql           | task_comments, task_attachments, task_status_history, support_ticket_categories, support_tickets, support_ticket_messages, support_ticket_assignments  | 10   | ✅     |
| chat/security ausente    | 41_chat_security.sql           | ai_usage, sessions, password_policies                                                                                                                  | 11   | ✅     |
| automation ausente       | 42_automation.sql              | automation_templates                                                                                                                                   | 12   | ✅     |
| notifications ausente    | 43_notifications.sql           | notification_preferences                                                                                                                               | 13   | ✅     |
| reports ausente          | 44_reports_views.sql           | report_definitions, report_executions, report_schedules, dashboard_widgets, dashboard_layouts                                                          | 14   | ✅     |
| RLS ausente              | 22_rls.sql                     | policies para todas as tabelas novas                                                                                                                   | 15   | ✅     |

---

## 34. Known Gaps

- `service_orders` duplicada em `05_services_contracts.sql` e `34_crm_services.sql`
- `support_tickets` duplicada em `15_support.sql` e `40_tasks_support.sql`
- FK de `purchase_order_items` depende de ordem de execução (`products` em `07`)
- 47 tabelas sem RLS explícito no snapshot atual
- Nenhuma policy DELETE explícita para tabelas operacionais
- RPCs fiscais sem checagem de tenant/permissão
- Views sem `security_invoker = true`
- `financial_accounts` não integrada a `financial_transactions`/`payments`/`receipts`
- `payments` só existe para `accounts_payable`
- `invoices.customer_id` referencia `companies(id)` sem entidade `customers` separada
- `talent_pool_memberships` e `job_matches` referenciam `people` ao invés de `candidates`
- Tabelas sem `tenant_id` direto: `employee_positions`, `employee_contracts`, `employee_documents`, `employee_status_history`, `company_relationships`, `company_contacts`, `applications`, `application_status_history`, `interviews`, `chat_rooms`, `chat_participants`, `chat_messages`, `ai_messages`, `chat_handoffs`
- Arquivos ausentes: `08`, `13`, `16`, `17`, `19`, `24`, `38`

---

## 35. Reconstruction Guide

Ordem recomendada para reconstrução:

1. `00_extensions.sql`
2. `01_core.sql`
3. `02_rbac.sql`
4. `03_crm.sql`
5. `04_rh_recruitment.sql`
6. `05_services_contracts.sql`
7. `06_suppliers_purchasing.sql`
8. `07_inventory_custody.sql`
9. `09_chat.sql`
10. `10_notifications_events.sql`
11. `11_audit_security.sql`
12. `12_custody.sql`
13. `14_tasks.sql`
14. `15_support.sql`
15. `18_storage_documents.sql`
16. `20_lgpd.sql`
17. `21_functions_triggers.sql`
18. `22_rls.sql`
19. `23_indexes.sql`
20. `25_validation.sql`
21. `26_error_codes.sql`
22. `27_finance.sql`
23. `28_fiscal.sql`
24. `29_pos.sql`
25. `30_recruitment.sql`
26. `31_automation.sql`
27. `32_seed.sql`
28. `33_employees.sql`
29. `34_crm_services.sql`
30. `35_recruitment_talent_pool.sql`
31. `36_inventory.sql`
32. `37_purchasing.sql`
33. `39_fiscal.sql`
34. `40_tasks_support.sql`
35. `41_chat_security.sql`
36. `42_automation.sql`
37. `43_notifications.sql`
38. `44_reports_views.sql`

---

## 36. Snapshot Integrity

| Métrica               | Valor                    |
| --------------------- | ------------------------ |
| Total tables          | 164                      |
| Total views           | 2                        |
| Total functions       | ~20                      |
| Total triggers        | 14+                      |
| Total indexes         | ~80                      |
| Total enums/types     | 0 (text + CHECK)         |
| Total RLS policies    | 286                      |
| Total extensions      | 2                        |
| Total storage buckets | 0 (não definidos no SQL) |

---

## 37. Status Final

**Status:** INCOMPLETE / UNDER AUDIT

**Bloqueadores:**

- Duplicidade de tabelas `service_orders` e `support_tickets`
- FK dependente de ordem de execução
- 47 tabelas sem RLS explícito no snapshot atual
- Nenhuma policy DELETE explícita para tabelas operacionais
- RPCs fiscais sem checagem de tenant/permissão
- Views sem `security_invoker = true`
- `financial_accounts` não integrada a `financial_transactions`/`payments`/`receipts`
- `payments` só existe para `accounts_payable`
- `invoices.customer_id` referencia `companies(id)` sem entidade `customers` separada
- `talent_pool_memberships` e `job_matches` referenciam `people` ao invés de `candidates`
- Tabelas operacionais sem `tenant_id` direto: `employee_positions`, `employee_contracts`, `employee_documents`, `employee_status_history`, `company_relationships`, `company_contacts`, `applications`, `application_status_history`, `interviews`, `chat_rooms`, `chat_participants`, `chat_messages`, `ai_messages`, `chat_handoffs`
- Arquivos ausentes: `08`, `13`, `16`, `17`, `19`, `24`, `38`

**Próximo passo:** aplicar correções da auditoria antes de promover para Supabase/runtime.
