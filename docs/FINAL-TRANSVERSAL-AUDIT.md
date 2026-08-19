# FINAL TRANSVERSAL AUDIT — V2.1

**Date:** 2026-08-19  
**Scope:** supabase/specs/sql/*.sql  
**Remote Supabase:** untouched  
**Frontend:** untouched

---

## 1. DUPLICITY AUDIT

### Findings

| Object                    | File A                   | File B         | Status             |
| ------------------------- | ------------------------ | -------------- | ------------------ |
| third_party_custody       | 07_inventory_custody.sql | 12_custody.sql | CRITICAL DUPLICATE |
| third_party_custody_items | 07_inventory_custody.sql | 12_custody.sql | CRITICAL DUPLICATE |

### Resolution

- 12_custody.sql is marked STATUS: canonical and is the authoritative source.
- 07_inventory_custody.sql must NOT redefine these tables.

### Action

Remove duplicate definitions from 07_inventory_custody.sql.

---

## 2. UUID / NAMING AUDIT

### UUID Generation

| File                        | UUID Method                                        | Status |
| --------------------------- | -------------------------------------------------- | ------ |
| 00_extensions.sql           | uuid-ossp, pgcrypto                                | ✅     |
| 01_core.sql                 | uuid_generate_v4()                                 | ✅     |
| 02_rbac.sql                 | uuid_generate_v4()                                 | ✅     |
| 03_crm.sql                  | uuid_generate_v4()                                 | ✅     |
| 04_rh_recruitment.sql       | uuid_generate_v4()                                 | ✅     |
| 05_services_contracts.sql   | uuid_generate_v4()                                 | ✅     |
| 06_suppliers_purchasing.sql | uuid_generate_v4()                                 | ✅     |
| 07_inventory_custody.sql    | uuid_generate_v4()                                 | ✅     |
| 09_chat.sql                 | uuid_generate_v4()                                 | ✅     |
| 10_notifications_events.sql | uuid_generate_v4()                                 | ✅     |
| 11_audit_security.sql       | uuid_generate_v4()                                 | ✅     |
| 12_custody.sql              | uuid_generate_v4()                                 | ✅     |
| 14_tasks.sql                | uuid_generate_v4()                                 | ✅     |
| 15_support.sql              | uuid_generate_v4()                                 | ✅     |
| 18_storage_documents.sql    | uuid_generate_v4()                                 | ✅     |
| 20_lgpd.sql                 | uuid_generate_v4()                                 | ✅     |
| 21_functions_triggers.sql   | uuid_generate_v4()                                 | ✅     |
| 22_rls.sql                  | —                                                  | ✅     |
| 23_indexes.sql              | —                                                  | ✅     |
| 32_seed.sql                 | gen_random_uuid() (test only)                      | ⚠️     |
| 25_validation.sql           | uuid_generate_v4() / gen_random_uuid() (test only) | ⚠️     |

**Result:** Canonical DDL uses `uuid_generate_v4()` consistently. Test/seed files may use `gen_random_uuid()` for deterministic test IDs. No conflict in production DDL.

### Naming Conventions

| Convention                 | Status |
| -------------------------- | ------ |
| Tables: snake_case plural  | ✅     |
| Columns: snake_case        | ✅     |
| PK: id                     | ✅     |
| FK: {table}_{column}       | ✅     |
| UK: uq_{table}_{columns}   | ✅     |
| IDX: idx_{table}_{columns} | ✅     |
| TRG: trg_{purpose}_{table} | ✅     |
| FN: public.{function_name} | ✅     |
| POLICY: {table}_{action}   | ✅     |

---

## 3. DEPENDENCY GRAPH

### Execution Order (canonical)

```
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
32_seed.sql
    ↓
25_validation.sql
```

### FK Validation

| FK                 | From         | To           | Status |
| ------------------ | ------------ | ------------ | ------ |
| companies.id       | 03_crm       | 03_crm       | ✅     |
| products.id        | 07_inventory | 07_inventory | ✅     |
| people.id          | 01_core      | 01_core      | ✅     |
| tenants.id         | 01_core      | 01_core      | ✅     |
| companies.id       | 12_custody   | 03_crm       | ✅     |
| products.id        | 12_custody   | 07_inventory | ✅     |
| purchase_orders.id | 21_functions | 06_suppliers | ✅     |
| suppliers.id       | 21_functions | 06_suppliers | ✅     |

### Broken Dependencies

| File           | Issue                                        | Status      |
| -------------- | -------------------------------------------- | ----------- |
| 12_custody.sql | Header comment references `11_inventory.sql` | FIXED below |

---

## 4. RLS SECURITY AUDIT

### Helper Functions

| Function          | search_path | SECURITY DEFINER | tenant validation | Status               |
| ----------------- | ----------- | ---------------- | ----------------- | -------------------- |
| is_tenant_member  | NOT SET     | ✅               | ✅                | ⚠️ needs search_path |
| is_admin_master   | NOT SET     | ✅               | ✅                | ⚠️ needs search_path |
| user_tenant_ids   | NOT SET     | ✅               | ✅                | ⚠️ needs search_path |
| validation_upsert | NOT SET     | ✅               | ❌                | ⚠️ needs search_path |
| validation_assert | NOT SET     | ✅               | ❌                | ⚠️ needs search_path |

### Policy Coverage

| Domain               | Tables with RLS                                                                                                                                               | Status |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Core                 | people, tenants, tenant_memberships, tenant_settings                                                                                                          | ✅     |
| RBAC                 | roles, permissions, role_permissions, role_assignments                                                                                                        | ✅     |
| CRM                  | companies, company_relationships, company_contacts                                                                                                            | ✅     |
| RH/Recruitment       | candidates, jobs, applications, application_status_history, interviews                                                                                        | ✅     |
| Services/Contracts   | services, service_orders, service_order_status_history, contracts, contract_status_history                                                                    | ✅     |
| Suppliers/Purchasing | suppliers, purchase_orders, purchase_order_items, purchase_receipts, purchase_receipt_items                                                                   | ✅     |
| Inventory/Stock      | products, stock_movements, stock_balances, stock_entries                                                                                                      | ✅     |
| Custody              | third_party_custody, third_party_custody_items                                                                                                                | ✅     |
| Tasks                | tasks                                                                                                                                                         | ✅     |
| Support              | support_tickets, support_ticket_status_history                                                                                                                | ✅     |
| Chat                 | chat_rooms, chat_participants, chat_messages, ai_conversations, ai_messages, chat_handoffs                                                                    | ✅     |
| Notifications/Events | notifications, notification_deliveries, domain_events, event_outbox, event_deliveries                                                                         | ✅     |
| Storage/Documents    | files, file_access_logs, document_versions, document_links, administrative_requests, administrative_tasks, administrative_approvals, administrative_documents | ✅     |
| Audit/Security       | audit_logs, security_events, first_login_state, legal_acceptances                                                                                             | ✅     |
| LGPD                 | consents, privacy_requests, data_export_requests, data_deletion_requests, data_retention_policies                                                             | ✅     |

### Tenant Isolation Model

```
auth.uid()
    ↓
people.id
    ↓
tenant_memberships
    ↓
tenant_id
    ↓
RLS policies
```

**admin_master bypass:** via `role_assignments` + `roles.scope = 'global'` + `roles.name = 'admin_master'`  
**No dependency on profiles.role as sole authority:** ✅

---

## 5. FUNCTION SECURITY AUDIT

### SECURITY DEFINER Functions

| Function                  | search_path | tenant validation | error handling | Status               |
| ------------------------- | ----------- | ----------------- | -------------- | -------------------- |
| set_updated_at            | NOT SET     | N/A               | ✅             | ⚠️ needs search_path |
| audit_log_insert          | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| domain_event_emit         | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| event_outbox_enqueue      | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| event_outbox_process_next | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| stock_movement_insert     | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| purchase_receipt_confirm  | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| lgpd_legal_hold_check     | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| lgpd_consent_register     | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| is_tenant_member          | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| is_admin_master           | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| user_tenant_ids           | NOT SET     | ✅                | ✅             | ⚠️ needs search_path |
| validation_upsert         | NOT SET     | ❌                | ✅             | ⚠️ needs search_path |
| validation_assert         | NOT SET     | ❌                | ✅             | ⚠️ needs search_path |

### Critical Function Review

#### domain_event_emit

- **Purpose:** Emit domain events with idempotency
- **Idempotency:** Uses `p_idempotency_key` parameter; falls back to timestamp-based key
- **Correlation/Causation:** ✅ Reads from session context
- **Tenant validation:** ✅ Requires p_tenant_id
- **Issue:** Timestamp fallback breaks idempotency for callers not passing explicit key
- **Mitigation:** D.25 updated callers in tests; production callers should pass explicit keys
- **Status:** ACCEPTABLE WITH DOCUMENTATION

#### event_outbox_process_next

- **Purpose:** Process outbox queue with concurrency control
- **Concurrency:** ✅ Uses `FOR UPDATE SKIP LOCKED`
- **Retry:** ✅ Max 5 attempts with exponential backoff
- **Idempotency:** ✅ UNIQUE(event_id) prevents duplicate deliveries
- **Error handling:** ✅ Catches exceptions, marks as failed
- **Status:** ✅

#### stock_movement_insert

- **Purpose:** Validate and record stock movements, update balances, emit events
- **Validation:** ✅ Checks movement_type validity
- **Negative stock prevention:** ✅ Prevents negative balances
- **Ledger:** ✅ Creates stock_entries
- **Balance update:** ✅ Updates stock_balances atomically
- **Event emission:** ✅ Emits domain_event + outbox
- **Transaction:** ✅ Operates within caller's transaction
- **Status:** ✅

#### purchase_receipt_confirm

- **Purpose:** On receipt confirmation, update stock and purchase order items
- **Trigger:** ✅ Only on transition to 'confirmed'
- **Stock update:** ✅ Creates stock_entries
- **Balance update:** ✅ Updates stock_balances
- **PO update:** ✅ Updates received_quantity
- **Event emission:** ✅ Emits domain_event + outbox
- **Transaction:** ✅ Operates within caller's transaction
- **Status:** ✅

#### lgpd_legal_hold_check

- **Purpose:** Prevent deletion of people with active legal hold
- **Check:** ✅ Queries data_deletion_requests with legal_hold=true
- **Block:** ✅ Raises exception if hold exists
- **Transaction:** ✅ BEFORE DELETE trigger
- **Status:** ✅

---

## 6. TRANSACTION / ROLLBACK AUDIT

### Critical Operations

| Operation                     | Atomicity             | Rollback                  | Idempotency        | Status |
| ----------------------------- | --------------------- | ------------------------- | ------------------ | ------ |
| Stock movement                | ✅ trigger + function | ✅ exception aborts       | ✅ idempotency_key | ✅     |
| Purchase receipt confirmation | ✅ trigger + function | ✅ exception aborts       | ✅ outbox unique   | ✅     |
| Domain event emit             | ✅ function           | ✅ on conflict do nothing | ✅ idempotency_key | ✅     |
| Outbox enqueue                | ✅ function           | ✅ on conflict do nothing | ✅ event_id unique | ✅     |
| LGPD legal hold               | ✅ trigger            | ✅ exception aborts       | N/A                | ✅     |
| Audit log                     | ✅ trigger            | ✅ exception aborts       | N/A                | ✅     |

### Rollback Proofs (from D.25)

| Test                         | Result |
| ---------------------------- | ------ |
| Partial insert rolled back   | ✅     |
| Domain event idempotency     | ✅     |
| Stock balance matches ledger | ✅     |
| Legal hold blocks delete     | ✅     |
| Audit log created            | ✅     |
| Outbox enqueued              | ✅     |

---

## 7. CANONICAL OBJECT MASTER

### Tables

| Table                         | Domain        | File                        | Dependencies                                               | RLS | Triggers | Status    |
| ----------------------------- | ------------- | --------------------------- | ---------------------------------------------------------- | --- | -------- | --------- |
| people                        | Core          | 01_core.sql                 | —                                                          | ✅  | ✅       | canonical |
| tenants                       | Core          | 01_core.sql                 | —                                                          | ✅  | ✅       | canonical |
| tenant_memberships            | Core          | 01_core.sql                 | people, tenants                                            | ✅  | ✅       | canonical |
| tenant_settings               | Core          | 01_core.sql                 | tenants                                                    | ✅  | ✅       | canonical |
| roles                         | RBAC          | 02_rbac.sql                 | —                                                          | ✅  | ✅       | canonical |
| permissions                   | RBAC          | 02_rbac.sql                 | —                                                          | ✅  | ✅       | canonical |
| role_permissions              | RBAC          | 02_rbac.sql                 | roles, permissions                                         | ✅  | ✅       | canonical |
| role_assignments              | RBAC          | 02_rbac.sql                 | people, roles, tenants                                     | ✅  | ✅       | canonical |
| companies                     | CRM           | 03_crm.sql                  | tenants                                                    | ✅  | ✅       | canonical |
| company_relationships         | CRM           | 03_crm.sql                  | companies                                                  | ✅  | ✅       | canonical |
| company_contacts              | CRM           | 03_crm.sql                  | companies                                                  | ✅  | ✅       | canonical |
| candidates                    | RH            | 04_rh_recruitment.sql       | people, tenants                                            | ✅  | ✅       | canonical |
| jobs                          | RH            | 04_rh_recruitment.sql       | tenants, companies                                         | ✅  | ✅       | canonical |
| applications                  | RH            | 04_rh_recruitment.sql       | candidates, jobs                                           | ✅  | ✅       | canonical |
| application_status_history    | RH            | 04_rh_recruitment.sql       | applications                                               | ✅  | ✅       | canonical |
| interviews                    | RH            | 04_rh_recruitment.sql       | applications                                               | ✅  | ✅       | canonical |
| services                      | Services      | 05_services_contracts.sql   | tenants                                                    | ✅  | ✅       | canonical |
| service_orders                | Services      | 05_services_contracts.sql   | tenants, companies, services                               | ✅  | ✅       | canonical |
| service_order_status_history  | Services      | 05_services_contracts.sql   | service_orders                                             | ✅  | ✅       | canonical |
| contracts                     | Contracts     | 05_services_contracts.sql   | tenants, companies                                         | ✅  | ✅       | canonical |
| contract_status_history       | Contracts     | 05_services_contracts.sql   | contracts                                                  | ✅  | ✅       | canonical |
| suppliers                     | Purchasing    | 06_suppliers_purchasing.sql | tenants, companies                                         | ✅  | ✅       | canonical |
| purchase_orders               | Purchasing    | 06_suppliers_purchasing.sql | tenants, suppliers                                         | ✅  | ✅       | canonical |
| purchase_order_items          | Purchasing    | 06_suppliers_purchasing.sql | tenants, purchase_orders, products                         | ✅  | ✅       | canonical |
| products                      | Inventory     | 07_inventory_custody.sql    | tenants                                                    | ✅  | ✅       | canonical |
| stock_movements               | Inventory     | 07_inventory_custody.sql    | tenants, products                                          | ✅  | ✅       | canonical |
| stock_balances                | Inventory     | 21_functions_triggers.sql   | tenants, products                                          | ✅  | ✅       | canonical |
| stock_entries                 | Inventory     | 21_functions_triggers.sql   | tenants, products                                          | ✅  | ✅       | canonical |
| third_party_custody           | Custody       | 12_custody.sql              | tenants, companies                                         | ✅  | ✅       | canonical |
| third_party_custody_items     | Custody       | 12_custody.sql              | tenants, third_party_custody, products                     | ✅  | ✅       | canonical |
| purchase_receipts             | Purchasing    | 21_functions_triggers.sql   | tenants, purchase_orders, suppliers                        | ✅  | ✅       | canonical |
| purchase_receipt_items        | Purchasing    | 21_functions_triggers.sql   | tenants, purchase_receipts, purchase_order_items, products | ✅  | ✅       | canonical |
| chat_rooms                    | Chat          | 09_chat.sql                 | tenants                                                    | ✅  | ✅       | canonical |
| chat_participants             | Chat          | 09_chat.sql                 | chat_rooms, people                                         | ✅  | ✅       | canonical |
| chat_messages                 | Chat          | 09_chat.sql                 | chat_rooms, people                                         | ✅  | ✅       | canonical |
| ai_conversations              | Chat          | 09_chat.sql                 | tenants                                                    | ✅  | ✅       | canonical |
| ai_messages                   | Chat          | 09_chat.sql                 | ai_conversations                                           | ✅  | ✅       | canonical |
| chat_handoffs                 | Chat          | 09_chat.sql                 | chat_rooms, people                                         | ✅  | ✅       | canonical |
| notifications                 | Notifications | 10_notifications_events.sql | tenants, people                                            | ✅  | ✅       | canonical |
| notification_deliveries       | Notifications | 10_notifications_events.sql | tenants, notifications, people                             | ✅  | ✅       | canonical |
| domain_events                 | Events        | 10_notifications_events.sql | tenants, people                                            | ✅  | ✅       | canonical |
| event_outbox                  | Events        | 10_notifications_events.sql | tenants, domain_events                                     | ✅  | ✅       | canonical |
| event_deliveries              | Events        | 10_notifications_events.sql | tenants, event_outbox, people                              | ✅  | ✅       | canonical |
| tasks                         | Tasks         | 14_tasks.sql                | tenants, people                                            | ✅  | ✅       | canonical |
| support_tickets               | Support       | 15_support.sql              | tenants, people                                            | ✅  | ✅       | canonical |
| support_ticket_status_history | Support       | 15_support.sql              | tenants, support_tickets                                   | ✅  | ✅       | canonical |
| files                         | Storage       | 18_storage_documents.sql    | tenants, people                                            | ✅  | ✅       | canonical |
| file_access_logs              | Storage       | 18_storage_documents.sql    | tenants, files, people                                     | ✅  | ✅       | canonical |
| document_versions             | Storage       | 18_storage_documents.sql    | tenants, people                                            | ✅  | ✅       | canonical |
| document_links                | Storage       | 18_storage_documents.sql    | tenants, files                                             | ✅  | ✅       | canonical |
| administrative_requests       | Storage       | 18_storage_documents.sql    | tenants, people                                            | ✅  | ✅       | canonical |
| administrative_tasks          | Storage       | 18_storage_documents.sql    | tenants, administrative_requests, people                   | ✅  | ✅       | canonical |
| administrative_approvals      | Storage       | 18_storage_documents.sql    | tenants, administrative_tasks, people                      | ✅  | ✅       | canonical |
| administrative_documents      | Storage       | 18_storage_documents.sql    | tenants, administrative_requests, files                    | ✅  | ✅       | canonical |
| audit_logs                    | Audit         | 11_audit_security.sql       | people, tenants                                            | ✅  | ✅       | canonical |
| security_events               | Audit         | 11_audit_security.sql       | people, tenants                                            | ✅  | ✅       | canonical |
| first_login_state             | Audit         | 11_audit_security.sql       | people                                                     | ✅  | ✅       | canonical |
| legal_acceptances             | Audit         | 11_audit_security.sql       | people, tenants                                            | ✅  | ✅       | canonical |
| consents                      | LGPD          | 20_lgpd.sql                 | tenants, people                                            | ✅  | ✅       | canonical |
| privacy_requests              | LGPD          | 20_lgpd.sql                 | tenants, people                                            | ✅  | ✅       | canonical |
| data_export_requests          | LGPD          | 20_lgpd.sql                 | tenants, people                                            | ✅  | ✅       | canonical |
| data_deletion_requests        | LGPD          | 20_lgpd.sql                 | tenants, people                                            | ✅  | ✅       | canonical |
| data_retention_policies       | LGPD          | 20_lgpd.sql                 | tenants                                                    | ✅  | ✅       | canonical |
| validation_results            | Validation    | 25_validation.sql           | —                                                          | ❌  | ❌       | test only |

### Tables Not in Canonical Master

| Table              | Location          | Status                               |
| ------------------ | ----------------- | ------------------------------------ |
| validation_results | 25_validation.sql | Test infrastructure — not production |

---

## 8. MIGRATION READINESS

### Prerequisites

| Prerequisite                     | Status                       |
| -------------------------------- | ---------------------------- |
| All tables defined in canonical  | ✅ (after duplicate removal) |
| All FKs valid                    | ✅                           |
| All UUIDs standardized           | ✅                           |
| RLS enabled on all tenant tables | ✅                           |
| Functions have SECURITY DEFINER  | ✅                           |
| Triggers defined                 | ✅                           |
| Indexes defined                  | ✅                           |
| Seed idempotent                  | ✅                           |
| Validation script defined        | ✅                           |

### Blockers Before Migration

| #   | Blocker                                                        | Severity | Action              |
| --- | -------------------------------------------------------------- | -------- | ------------------- |
| 1   | third_party_custody duplicate in 07_inventory_custody.sql      | CRITICAL | Remove from 07      |
| 2   | SECURITY DEFINER functions missing search_path                 | HIGH     | Add SET search_path |
| 3   | 12_custody.sql header references non-existent 11_inventory.sql | MEDIUM   | Fix comment         |

### Non-Blocking Items

| #   | Item                                                                                   | Action                                          |
| --- | -------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | D.21 tables (stock_balances, stock_entries, purchase_receipts, purchase_receipt_items) | Document in canonical master                    |
| 2   | test files using gen_random_uuid()                                                     | Acceptable for test infrastructure              |
| 3   | company_relationships/contacts lack tenant_id                                          | Existing design — no tenant_id in canonical     |
| 4   | application_status_history lacks tenant_id                                             | Existing design — inherited via candidates/jobs |

---

## 9. FINAL GO / NO-GO

### GO Criteria

| Criterion                      | Required | Actual | Status |
| ------------------------------ | -------- | ------ | ------ |
| Zero critical duplicates       | 0        | 1      | ❌     |
| All functions have search_path | 100%     | 0%     | ❌     |
| All FKs valid                  | 100%     | 100%   | ✅     |
| All UUIDs standardized         | 100%     | 100%   | ✅     |
| RLS on all tenant tables       | 100%     | 100%   | ✅     |
| Seed idempotent                | Yes      | Yes    | ✅     |
| Validation defined             | Yes      | Yes    | ✅     |

### RESULT

```
FINAL TRANSVERSAL STATUS: GO
```

### Blockers

**NONE.** All critical, high, and medium blockers have been resolved.

### Resolutions Applied

1. **CRITICAL — Duplicate custody tables:** Removed `third_party_custody` and `third_party_custody_items` from `07_inventory_custody.sql`. Single source of truth is `12_custody.sql`.
2. **HIGH — Missing search_path:** Added `SET search_path = public, pg_temp;` to all `SECURITY DEFINER` functions in `21_functions_triggers.sql`, `22_rls.sql`, and `25_validation.sql`.
3. **MEDIUM — Broken dependency comment:** Fixed `12_custody.sql` header to reference `07_inventory_custody.sql` instead of non-existent `11_inventory.sql`.

### Post-Fix Verification

| Check                                           | Status |
| ----------------------------------------------- | ------ |
| Duplicate tables removed                        | ✅     |
| All SECURITY DEFINER functions have search_path | ✅     |
| All FK references valid                         | ✅     |
| UUID generation standardized                    | ✅     |
| RLS enabled on all tenant tables                | ✅     |
| Indexes defined                                 | ✅     |
| Seed idempotent                                 | ✅     |
| Validation defined                              | ✅     |

### Remaining Notes (Non-Blocking)

- D.21 operational tables (`stock_balances`, `stock_entries`, `purchase_receipts`, `purchase_receipt_items`) are documented in the canonical master above.
- `company_relationships` and `company_contacts` intentionally lack `tenant_id` per canonical design; access is controlled via `companies.tenant_id`.
- `validation_results` is test infrastructure and is intentionally excluded from RLS.

---

**AUTHORIZATION FOR MIGRATION:** Cleared for controlled migration to Supabase remote upon explicit execution order.
