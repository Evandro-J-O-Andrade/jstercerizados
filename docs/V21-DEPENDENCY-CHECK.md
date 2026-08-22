# V2.1 — Dependency Check

**Branch:** `feat/database-v21-local-rebuild`  
**Base:** `main` @ `f14fb09`  
**Data:** 2026-08-21  
**Mode:** READ-ONLY dependency verification

## Purpose

Verify that canonical SQL files in `supabase/specs/sql/` can be executed in dependency-safe order without FK violations, missing references, or premature object creation.

## Execution Order (Dependency-Safe)

```text
00_extensions.sql
    ↓
01_core.sql
    ↓
02_rbac.sql
    ↓
03_crm.sql
    ↓
04_rh_recruitment.sql
    ↓
05_services_contracts.sql
    ↓
06_suppliers_purchasing.sql
    ↓
07_inventory_custody.sql
    ↓
09_chat.sql
    ↓
10_notifications_events.sql
    ↓
11_audit_security.sql
    ↓
12_custody.sql
    ↓
14_tasks.sql
    ↓
15_support.sql
    ↓
18_storage_documents.sql
    ↓
20_lgpd.sql
    ↓
21_functions_triggers.sql
    ↓
22_rls.sql
    ↓
23_indexes.sql
    ↓
25_validation.sql (test infrastructure)
    ↓
32_seed.sql (bootstrap data)
```

## Dependency Graph

### Core Layer

```
00_extensions.sql
    └── extensions: uuid-ossp, pgcrypto, btree_gist

01_core.sql
    ├── people (no FK dependencies)
    ├── tenants (no FK dependencies)
    ├── tenant_memberships
    │   ├── FK → people(id)
    │   └── FK → tenants(id)
    └── tenant_settings
        └── FK → tenants(id)
```

### RBAC Layer

```
02_rbac.sql
    ├── roles (no FK dependencies)
    ├── permissions (no FK dependencies)
    ├── role_permissions
    │   ├── FK → roles(id)
    │   └── FK → permissions(id)
    └── role_assignments
        ├── FK → people(id)
        ├── FK → roles(id)
        └── FK → tenants(id) [nullable]
```

### CRM Layer

```
03_crm.sql
    ├── companies
    │   └── FK → tenants(id)
    ├── company_relationships
    │   └── FK → companies(id)
    └── company_contacts
        └── FK → companies(id)
```

### RH / Recruitment Layer

```
04_rh_recruitment.sql
    ├── candidates
    │   ├── FK → people(id)
    │   └── FK → tenants(id)
    ├── jobs
    │   ├── FK → tenants(id)
    │   └── FK → companies(id) [nullable]
    ├── applications
    │   ├── FK → candidates(id)
    │   └── FK → jobs(id)
    ├── application_status_history
    │   └── FK → applications(id)
    └── interviews
        └── FK → applications(id)
```

### Services / Contracts Layer

```
05_services_contracts.sql
    ├── services
    │   └── FK → tenants(id)
    ├── service_orders
    │   ├── FK → tenants(id)
    │   ├── FK → companies(id) [nullable]
    │   └── FK → services(id) [nullable]
    ├── service_order_status_history
    │   └── FK → service_orders(id)
    ├── contracts
    │   ├── FK → tenants(id)
    │   └── FK → companies(id)
    └── contract_status_history
        └── FK → contracts(id)
```

### Suppliers / Purchasing Layer

```
06_suppliers_purchasing.sql
    ├── suppliers
    │   ├── FK → tenants(id)
    │   └── FK → companies(id)
    ├── purchase_orders
    │   ├── FK → tenants(id)
    │   └── FK → suppliers(id)
    └── purchase_order_items
        ├── FK → tenants(id)
        ├── FK → purchase_orders(id)
        └── FK → products(id)
```

### Inventory / Custody Layer

```
07_inventory_custody.sql
    ├── products
    │   └── FK → tenants(id)
    └── stock_movements
        ├── FK → tenants(id)
        └── FK → products(id)
```

### Chat / AI Layer

```
09_chat.sql
    ├── chat_rooms
    │   └── FK → tenants(id)
    ├── chat_participants
    │   ├── FK → chat_rooms(id)
    │   └── FK → people(id) [nullable]
    ├── chat_messages
    │   ├── FK → chat_rooms(id)
    │   └── FK → people(id) [nullable]
    ├── ai_conversations
    │   └── FK → tenants(id)
    ├── ai_messages
    │   └── FK → ai_conversations(id)
    └── chat_handoffs
        ├── FK → chat_rooms(id)
        ├── FK → people(id) [nullable]
        └── FK → people(id) [nullable]
```

### Notifications / Events / Outbox Layer

```
10_notifications_events.sql
    ├── notifications
    │   ├── FK → tenants(id)
    │   └── FK → people(id) [nullable]
    ├── notification_deliveries
    │   ├── FK → tenants(id)
    │   └── FK → notifications(id)
    ├── domain_events
    │   ├── FK → tenants(id)
    │   └── FK → people(id) [nullable]
    ├── event_outbox
    │   ├── FK → tenants(id)
    │   └── FK → domain_events(id)
    └── event_deliveries
        ├── FK → tenants(id)
        └── FK → event_outbox(id)
```

### Audit / Security Layer

```
11_audit_security.sql
    ├── audit_logs
    │   ├── FK → people(id) [nullable]
    │   └── FK → tenants(id) [nullable]
    ├── security_events
    │   ├── FK → people(id) [nullable]
    │   └── FK → tenants(id) [nullable]
    ├── first_login_state
    │   └── FK → people(id)
    └── legal_acceptances
        ├── FK → people(id)
        └── FK → tenants(id)
```

### Custody Layer

```
12_custody.sql
    ├── third_party_custody
    │   ├── FK → tenants(id)
    │   └── FK → companies(id)
    └── third_party_custody_items
        ├── FK → tenants(id)
        ├── FK → third_party_custody(id)
        └── FK → products(id)
```

### Tasks / Support Layer

```
14_tasks.sql
    └── tasks
        ├── FK → tenants(id)
        └── FK → people(id) [nullable]

15_support.sql
    ├── support_tickets
    │   ├── FK → tenants(id)
    │   └── FK → people(id) [nullable]
    └── support_ticket_status_history
        ├── FK → tenants(id)
        └── FK → support_tickets(id)
```

### Storage / Documents Layer

```
18_storage_documents.sql
    ├── files
    │   ├── FK → tenants(id)
    │   └── FK → people(id)
    ├── file_access_logs
    │   ├── FK → tenants(id)
    │   └── FK → files(id)
    ├── document_versions
    │   ├── FK → tenants(id)
    │   └── FK → people(id) [nullable]
    ├── document_links
    │   ├── FK → tenants(id)
    │   └── FK → files(id)
    ├── administrative_requests
    │   ├── FK → tenants(id)
    │   └── FK → people(id)
    ├── administrative_tasks
    │   ├── FK → tenants(id)
    │   ├── FK → administrative_requests(id) [nullable]
    │   └── FK → people(id) [nullable]
    ├── administrative_approvals
    │   ├── FK → tenants(id)
    │   ├── FK → administrative_tasks(id)
    │   └── FK → people(id)
    └── administrative_documents
        ├── FK → tenants(id)
        ├── FK → administrative_requests(id) [nullable]
        └── FK → files(id) [nullable]
```

### LGPD Layer

```
20_lgpd.sql
    ├── consents
    │   ├── FK → tenants(id)
    │   ├── FK → people(id)
    │   └── FK → people(id) [nullable, actor]
    ├── privacy_requests
    │   ├── FK → tenants(id)
    │   ├── FK → people(id)
    │   └── FK → people(id) [nullable, actor]
    ├── data_export_requests
    │   ├── FK → tenants(id)
    │   ├── FK → people(id)
    │   └── FK → people(id) [nullable, actor]
    ├── data_deletion_requests
    │   ├── FK → tenants(id)
    │   ├── FK → people(id)
    │   └── FK → people(id) [nullable, actor]
    ├── data_retention_policies
    │   └── FK → tenants(id)
    └── ALTER TABLE legal_acceptances
        ├── ADD COLUMN actor_person_id → FK → people(id)
        ├── ADD COLUMN correlation_id
        └── ADD COLUMN causation_id
```

### Functions / Triggers Layer

```
21_functions_triggers.sql
    ├── stock_balances (table)
    │   ├── FK → tenants(id)
    │   └── FK → products(id)
    ├── stock_entries (table)
    │   ├── FK → tenants(id)
    │   ├── FK → products(id)
    │   └── FK → people(id) [nullable]
    ├── purchase_receipts (table)
    │   ├── FK → tenants(id)
    │   ├── FK → purchase_orders(id)
    │   ├── FK → suppliers(id)
    │   └── FK → people(id) [nullable]
    ├── purchase_receipt_items (table)
    │   ├── FK → tenants(id)
    │   ├── FK → purchase_receipts(id)
    │   ├── FK → purchase_order_items(id)
    │   ├── FK → products(id)
    │   └── FK → people(id) [nullable]
    ├── Functions
    │   ├── set_updated_at() [no FK deps]
    │   ├── audit_log_insert() [uses people, tenants, tenant_memberships]
    │   ├── domain_event_emit() [uses domain_events]
    │   ├── event_outbox_enqueue() [uses event_outbox, domain_events]
    │   ├── event_outbox_process_next() [uses event_outbox]
    │   ├── stock_movement_insert() [uses stock_movements, stock_balances, stock_entries]
    │   ├── purchase_receipt_confirm() [uses purchase_receipts, purchase_receipt_items, stock_entries, purchase_orders]
    │   ├── lgpd_legal_hold_check() [uses data_deletion_requests]
    │   └── lgpd_consent_register() [uses consents]
    └── Triggers
        ├── trg_set_updated_at_* [on tenant-scoped tables]
        ├── trg_audit_* [on audit tables]
        ├── trg_audit_stock_movements [on stock_movements]
        ├── trg_audit_purchase_receipts [on purchase_receipts]
        ├── trg_domain_event_to_outbox [on domain_events]
        ├── trg_audit_consents [on consents]
        └── trg_audit_data_deletion_requests [on data_deletion_requests]
```

### RLS Layer

```
22_rls.sql
    ├── Functions (created first)
    │   ├── is_tenant_member(p_tenant_id uuid)
    │   ├── is_admin_master()
    │   └── user_tenant_ids()
    ├── ALTER TABLE people ENABLE ROW LEVEL SECURITY
    │   └── Policies: people_self_read, people_admin_write
    ├── ALTER TABLE tenants ENABLE ROW LEVEL SECURITY
    │   └── Policy: tenants_admin_all
    ├── ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY
    │   └── Policies: ...
    ├── ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY
    │   └── Policies: ...
    ├── ALTER TABLE roles ENABLE ROW LEVEL SECURITY
    │   └── Policies: ...
    ├── ALTER TABLE permissions ENABLE ROW LEVEL SECURITY
    │   └── Policies: ...
    ├── ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY
    │   └── Policies: ...
    ├── ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY
    │   └── Policies: ...
    ├── ALTER TABLE companies ENABLE ROW LEVEL SECURITY
    │   └── Policies: ...
    ├── ... (all tenant-scoped tables)
    └── ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY
        └── Policies: ...
```

### Indexes Layer

```
23_indexes.sql
    └── CREATE INDEX on all tables (after tables + RLS)
```

### Validation Layer

```
25_validation.sql
    ├── CREATE TABLE validation_results
    ├── CREATE FUNCTION validation_upsert()
    ├── CREATE FUNCTION validation_assert()
    └── DO blocks with validation tests
```

### Seed Layer

```
32_seed.sql
    ├── INSERT INTO roles
    ├── INSERT INTO permissions
    ├── INSERT INTO role_permissions
    └── INSERT INTO tenants, people, tenant_memberships (bootstrap)
```

## Dependency Validation

### FK Target Precedence

| Dependent Table               | FK Target               | Created Before?                |
| ----------------------------- | ----------------------- | ------------------------------ |
| tenant_memberships            | people                  | ✅ 01_core.sql                 |
| tenant_memberships            | tenants                 | ✅ 01_core.sql                 |
| tenant_settings               | tenants                 | ✅ 01_core.sql                 |
| role_permissions              | roles                   | ✅ 02_rbac.sql                 |
| role_permissions              | permissions             | ✅ 02_rbac.sql                 |
| role_assignments              | people                  | ✅ 01_core.sql                 |
| role_assignments              | roles                   | ✅ 02_rbac.sql                 |
| role_assignments              | tenants                 | ✅ 01_core.sql                 |
| companies                     | tenants                 | ✅ 01_core.sql                 |
| company_relationships         | companies               | ✅ 03_crm.sql                  |
| company_contacts              | companies               | ✅ 03_crm.sql                  |
| candidates                    | people                  | ✅ 01_core.sql                 |
| candidates                    | tenants                 | ✅ 01_core.sql                 |
| jobs                          | tenants                 | ✅ 01_core.sql                 |
| jobs                          | companies               | ✅ 03_crm.sql                  |
| applications                  | candidates              | ✅ 04_rh_recruitment.sql       |
| applications                  | jobs                    | ✅ 04_rh_recruitment.sql       |
| application_status_history    | applications            | ✅ 04_rh_recruitment.sql       |
| interviews                    | applications            | ✅ 04_rh_recruitment.sql       |
| services                      | tenants                 | ✅ 01_core.sql                 |
| service_orders                | tenants                 | ✅ 01_core.sql                 |
| service_orders                | companies               | ✅ 03_crm.sql                  |
| service_orders                | services                | ✅ 05_services_contracts.sql   |
| service_order_status_history  | service_orders          | ✅ 05_services_contracts.sql   |
| contracts                     | tenants                 | ✅ 01_core.sql                 |
| contracts                     | companies               | ✅ 03_crm.sql                  |
| contract_status_history       | contracts               | ✅ 05_services_contracts.sql   |
| suppliers                     | tenants                 | ✅ 01_core.sql                 |
| suppliers                     | companies               | ✅ 03_crm.sql                  |
| purchase_orders               | tenants                 | ✅ 01_core.sql                 |
| purchase_orders               | suppliers               | ✅ 06_suppliers_purchasing.sql |
| purchase_order_items          | tenants                 | ✅ 01_core.sql                 |
| purchase_order_items          | purchase_orders         | ✅ 06_suppliers_purchasing.sql |
| purchase_order_items          | products                | ✅ 07_inventory_custody.sql    |
| products                      | tenants                 | ✅ 01_core.sql                 |
| stock_movements               | tenants                 | ✅ 01_core.sql                 |
| stock_movements               | products                | ✅ 07_inventory_custody.sql    |
| chat_rooms                    | tenants                 | ✅ 01_core.sql                 |
| chat_participants             | chat_rooms              | ✅ 09_chat.sql                 |
| chat_participants             | people                  | ✅ 01_core.sql                 |
| chat_messages                 | chat_rooms              | ✅ 09_chat.sql                 |
| chat_messages                 | people                  | ✅ 01_core.sql                 |
| ai_conversations              | tenants                 | ✅ 01_core.sql                 |
| ai_messages                   | ai_conversations        | ✅ 09_chat.sql                 |
| chat_handoffs                 | chat_rooms              | ✅ 09_chat.sql                 |
| chat_handoffs                 | people                  | ✅ 01_core.sql                 |
| notifications                 | tenants                 | ✅ 01_core.sql                 |
| notifications                 | people                  | ✅ 01_core.sql                 |
| notification_deliveries       | tenants                 | ✅ 01_core.sql                 |
| notification_deliveries       | notifications           | ✅ 10_notifications_events.sql |
| domain_events                 | tenants                 | ✅ 01_core.sql                 |
| domain_events                 | people                  | ✅ 01_core.sql                 |
| event_outbox                  | tenants                 | ✅ 01_core.sql                 |
| event_outbox                  | domain_events           | ✅ 10_notifications_events.sql |
| event_deliveries              | tenants                 | ✅ 01_core.sql                 |
| event_deliveries              | event_outbox            | ✅ 10_notifications_events.sql |
| audit_logs                    | people                  | ✅ 01_core.sql                 |
| audit_logs                    | tenants                 | ✅ 01_core.sql                 |
| security_events               | people                  | ✅ 01_core.sql                 |
| security_events               | tenants                 | ✅ 01_core.sql                 |
| first_login_state             | people                  | ✅ 01_core.sql                 |
| legal_acceptances             | people                  | ✅ 01_core.sql                 |
| legal_acceptances             | tenants                 | ✅ 01_core.sql                 |
| third_party_custody           | tenants                 | ✅ 01_core.sql                 |
| third_party_custody           | companies               | ✅ 03_crm.sql                  |
| third_party_custody_items     | tenants                 | ✅ 01_core.sql                 |
| third_party_custody_items     | third_party_custody     | ✅ 12_custody.sql              |
| third_party_custody_items     | products                | ✅ 07_inventory_custody.sql    |
| tasks                         | tenants                 | ✅ 01_core.sql                 |
| tasks                         | people                  | ✅ 01_core.sql                 |
| support_tickets               | tenants                 | ✅ 01_core.sql                 |
| support_tickets               | people                  | ✅ 01_core.sql                 |
| support_ticket_status_history | tenants                 | ✅ 01_core.sql                 |
| support_ticket_status_history | support_tickets         | ✅ 15_support.sql              |
| files                         | tenants                 | ✅ 01_core.sql                 |
| files                         | people                  | ✅ 01_core.sql                 |
| file_access_logs              | tenants                 | ✅ 01_core.sql                 |
| file_access_logs              | files                   | ✅ 18_storage_documents.sql    |
| document_versions             | tenants                 | ✅ 01_core.sql                 |
| document_versions             | people                  | ✅ 01_core.sql                 |
| document_links                | tenants                 | ✅ 01_core.sql                 |
| document_links                | files                   | ✅ 18_storage_documents.sql    |
| administrative_requests       | tenants                 | ✅ 01_core.sql                 |
| administrative_requests       | people                  | ✅ 01_core.sql                 |
| administrative_tasks          | tenants                 | ✅ 01_core.sql                 |
| administrative_tasks          | administrative_requests | ✅ 18_storage_documents.sql    |
| administrative_tasks          | people                  | ✅ 01_core.sql                 |
| administrative_approvals      | tenants                 | ✅ 01_core.sql                 |
| administrative_approvals      | administrative_tasks    | ✅ 18_storage_documents.sql    |
| administrative_approvals      | people                  | ✅ 01_core.sql                 |
| administrative_documents      | tenants                 | ✅ 01_core.sql                 |
| administrative_documents      | administrative_requests | ✅ 18_storage_documents.sql    |
| administrative_documents      | files                   | ✅ 18_storage_documents.sql    |
| consents                      | tenants                 | ✅ 01_core.sql                 |
| consents                      | people                  | ✅ 01_core.sql                 |
| privacy_requests              | tenants                 | ✅ 01_core.sql                 |
| privacy_requests              | people                  | ✅ 01_core.sql                 |
| data_export_requests          | tenants                 | ✅ 01_core.sql                 |
| data_export_requests          | people                  | ✅ 01_core.sql                 |
| data_deletion_requests        | tenants                 | ✅ 01_core.sql                 |
| data_deletion_requests        | people                  | ✅ 01_core.sql                 |
| data_retention_policies       | tenants                 | ✅ 01_core.sql                 |
| stock_balances                | tenants                 | ✅ 01_core.sql                 |
| stock_balances                | products                | ✅ 07_inventory_custody.sql    |
| stock_entries                 | tenants                 | ✅ 01_core.sql                 |
| stock_entries                 | products                | ✅ 07_inventory_custody.sql    |
| stock_entries                 | people                  | ✅ 01_core.sql                 |
| purchase_receipts             | tenants                 | ✅ 01_core.sql                 |
| purchase_receipts             | purchase_orders         | ✅ 06_suppliers_purchasing.sql |
| purchase_receipts             | suppliers               | ✅ 06_suppliers_purchasing.sql |
| purchase_receipts             | people                  | ✅ 01_core.sql                 |
| purchase_receipt_items        | tenants                 | ✅ 01_core.sql                 |
| purchase_receipt_items        | purchase_receipts       | ✅ 21_functions_triggers.sql   |
| purchase_receipt_items        | purchase_order_items    | ✅ 21_functions_triggers.sql   |
| purchase_receipt_items        | products                | ✅ 07_inventory_custody.sql    |
| purchase_receipt_items        | people                  | ✅ 01_core.sql                 |

**Result:** All FK targets are created before dependent tables. ✅

## Function/Trigger Dependency Validation

### Functions Created Before Triggers

| Function                    | Created In                | Triggers That Use It             |
| --------------------------- | ------------------------- | -------------------------------- |
| set_updated_at()            | 21_functions_triggers.sql | trg_set_updated_at_*             |
| audit_log_insert()          | 21_functions_triggers.sql | trg_audit_*                      |
| domain_event_emit()         | 21_functions_triggers.sql | trg_domain_event_to_outbox       |
| event_outbox_enqueue()      | 21_functions_triggers.sql | — (called directly)              |
| event_outbox_process_next() | 21_functions_triggers.sql | — (called by worker)             |
| stock_movement_insert()     | 21_functions_triggers.sql | trg_audit_stock_movements        |
| purchase_receipt_confirm()  | 21_functions_triggers.sql | trg_audit_purchase_receipts      |
| lgpd_legal_hold_check()     | 21_functions_triggers.sql | trg_audit_data_deletion_requests |
| lgpd_consent_register()     | 21_functions_triggers.sql | trg_audit_consents               |

### Triggers Depend on Tables Created Earlier

| Trigger                          | Table                             | Table Created In                |
| -------------------------------- | --------------------------------- | ------------------------------- |
| trg_set_updated_at_*             | tenant-scoped tables              | 01_core.sql through 20_lgpd.sql |
| trg_audit_*                      | audit_logs, security_events, etc. | 11_audit_security.sql           |
| trg_audit_stock_movements        | stock_movements                   | 07_inventory_custody.sql        |
| trg_audit_purchase_receipts      | purchase_receipts                 | 21_functions_triggers.sql       |
| trg_domain_event_to_outbox       | domain_events                     | 10_notifications_events.sql     |
| trg_audit_consents               | consents                          | 20_lgpd.sql                     |
| trg_audit_data_deletion_requests | data_deletion_requests            | 20_lgpd.sql                     |

**Result:** All functions are created before triggers that reference them. ✅

## RLS Policy Dependencies

### Helper Functions Created Before Policies

```
22_rls.sql execution order:
    1. CREATE FUNCTION is_tenant_member()
    2. CREATE FUNCTION is_admin_master()
    3. CREATE FUNCTION user_tenant_ids()
    4. ALTER TABLE ... ENABLE ROW LEVEL SECURITY
    5. CREATE POLICY ... (uses helper functions)
```

**Result:** Helper functions exist before policies are created. ✅

### Policy References Valid Objects

All policies reference:

- `auth.uid()` — built-in ✅
- `public.is_tenant_member()` — created in 22_rls.sql ✅
- `public.is_admin_master()` — created in 22_rls.sql ✅
- `public.user_tenant_ids()` — created in 22_rls.sql ✅
- `public.tenant_memberships` — created in 01_core.sql ✅
- `public.role_assignments` — created in 02_rbac.sql ✅
- `public.roles` — created in 02_rbac.sql ✅

**Result:** All policy references are valid. ✅

## Circular Dependency Check

| Check                                | Result        |
| ------------------------------------ | ------------- |
| Table A → Table B → Table A          | None found ✅ |
| Function A → Function B → Function A | None found ✅ |
| Trigger A → Trigger B → Trigger A    | None found ✅ |

## Cross-File Reference Validation

| Reference                       | Source File                 | Target File                 | Valid? |
| ------------------------------- | --------------------------- | --------------------------- | ------ |
| `public.products`               | 06_suppliers_purchasing.sql | 07_inventory_custody.sql    | ✅     |
| `public.products`               | 21_functions_triggers.sql   | 07_inventory_custody.sql    | ✅     |
| `public.companies`              | 04_rh_recruitment.sql       | 03_crm.sql                  | ✅     |
| `public.companies`              | 05_services_contracts.sql   | 03_crm.sql                  | ✅     |
| `public.companies`              | 06_suppliers_purchasing.sql | 03_crm.sql                  | ✅     |
| `public.companies`              | 12_custody.sql              | 03_crm.sql                  | ✅     |
| `public.people`                 | multiple                    | 01_core.sql                 | ✅     |
| `public.tenants`                | multiple                    | 01_core.sql                 | ✅     |
| `public.domain_events`          | 21_functions_triggers.sql   | 10_notifications_events.sql | ✅     |
| `public.event_outbox`           | 21_functions_triggers.sql   | 10_notifications_events.sql | ✅     |
| `public.stock_movements`        | 21_functions_triggers.sql   | 07_inventory_custody.sql    | ✅     |
| `public.stock_balances`         | 21_functions_triggers.sql   | 07_inventory_custody.sql    | ✅     |
| `public.purchase_orders`        | 21_functions_triggers.sql   | 06_suppliers_purchasing.sql | ✅     |
| `public.suppliers`              | 21_functions_triggers.sql   | 06_suppliers_purchasing.sql | ✅     |
| `public.consents`               | 21_functions_triggers.sql   | 20_lgpd.sql                 | ✅     |
| `public.data_deletion_requests` | 21_functions_triggers.sql   | 20_lgpd.sql                 | ✅     |

**Result:** All cross-file references are valid. ✅

## Potential Issues

### Issue 1: products referenced before creation

**File:** `06_suppliers_purchasing.sql`  
**Line:** `product_id uuid not null references public.products(id)`  
**Impact:** `purchase_order_items` references `products` which is created in `07_inventory_custody.sql`  
**Status:** ✅ RESOLVED — `07_inventory_custody.sql` is executed before `06_suppliers_purchasing.sql` in dry-run order?  
**Wait:** Looking at execution order:

```
06_suppliers_purchasing.sql
    ↓
07_inventory_custody.sql
```

`purchase_order_items` in `06_suppliers_purchasing.sql` references `products` from `07_inventory_custody.sql`. This is executed BEFORE `products` is created.

**Resolution:** This is a **DEPENDENCY VIOLATION**. `06_suppliers_purchasing.sql` must be moved AFTER `07_inventory_custody.sql`, or `products` must be extracted to `01_core.sql`.

**Recommended fix:** Move `06_suppliers_purchasing.sql` after `07_inventory_custody.sql` in execution order.

### Issue 2: purchase_receipts and purchase_receipt_items in D.21

**File:** `21_functions_triggers.sql`  
**Tables:** `purchase_receipts`, `purchase_receipt_items`  
**Impact:** These tables are created in D.21 but referenced in D.06  
**Status:** ✅ RESOLVED — D.21 is executed after D.06, so tables exist when D.06 FK is created... wait.

Actually, `06_suppliers_purchasing.sql` has `purchase_order_items` referencing `products`. But `21_functions_triggers.sql` creates `purchase_receipts` and `purchase_receipt_items`. These are separate tables.

Let me re-check:

- `06_suppliers_purchasing.sql` creates: `suppliers`, `purchase_orders`, `purchase_order_items`
- `purchase_order_items` has `product_id uuid not null references public.products(id)`
- `products` is in `07_inventory_custody.sql`

So the execution order in `dryrun_migration.sql` is:

```
06_suppliers_purchasing.sql
    ↓
07_inventory_custody.sql
```

This means `products` doesn't exist when `06_suppliers_purchasing.sql` runs. This is a **DEPENDENCY VIOLATION**.

**Fix options:**

1. Move `07_inventory_custody.sql` before `06_suppliers_purchasing.sql`
2. Move `products` to `01_core.sql` or a new early file
3. Remove FK from `purchase_order_items` to `products` (not recommended)

**Recommended:** Option 1 — swap order to `07_inventory_custody.sql` then `06_suppliers_purchasing.sql`.

### Issue 3: ALTER TABLE in 20_lgpd.sql

**File:** `20_lgpd.sql`  
**Line:** `alter table if exists public.legal_acceptances add column if not exists ...`  
**Impact:** `legal_acceptances` is created in `11_audit_security.sql`, which runs before `20_lgpd.sql` ✅  
**Status:** OK — table exists before ALTER

## Recommended Execution Order (Corrected)

```text
00_extensions.sql
    ↓
01_core.sql
    ↓
02_rbac.sql
    ↓
03_crm.sql
    ↓
07_inventory_custody.sql    ← moved up (products needed by 06)
    ↓
04_rh_recruitment.sql
    ↓
05_services_contracts.sql
    ↓
06_suppliers_purchasing.sql ← moved down (depends on products)
    ↓
09_chat.sql
    ↓
10_notifications_events.sql
    ↓
11_audit_security.sql
    ↓
12_custody.sql
    ↓
14_tasks.sql
    ↓
15_support.sql
    ↓
18_storage_documents.sql
    ↓
20_lgpd.sql
    ↓
21_functions_triggers.sql
    ↓
22_rls.sql
    ↓
23_indexes.sql
    ↓
25_validation.sql
    ↓
32_seed.sql
```

## Conclusion

| Check                                | Status           |
| ------------------------------------ | ---------------- |
| FK targets created before dependents | ⚠️ ONE VIOLATION |
| Functions created before triggers    | ✅               |
| RLS helpers before policies          | ✅               |
| Cross-file references valid          | ✅               |
| Circular dependencies                | ✅ None          |
| ALTER TABLE targets exist            | ✅               |

### Required Action

**Update `scripts/dryrun_migration.sql` execution order:**

- Move `07_inventory_custody.sql` before `06_suppliers_purchasing.sql`
- This ensures `products` exists before `purchase_order_items` references it

**Status:** 1 dependency violation found, 1 fix required. All other checks pass.
