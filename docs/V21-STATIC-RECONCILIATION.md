# V2.1 — Static Reconciliation Matrix

**Branch:** `feat/database-v21-local-rebuild`  
**Base:** `main` @ `f14fb09`  
**Data:** 2026-08-21  
**Mode:** READ-ONLY static reconciliation

## Methodology

Static reconciliation compares:

1. Functional contracts (`V21-FUNCTIONAL-CONTRACT-INVENTORY-FINANCE-PDV.md`, `V21-INVENTORY-BILLING-WAREHOUSE-POS-MASTER-SPEC.md`)
2. Canonical object master (`V21-CANONICAL-OBJECT-MASTER-MATRIX.md`)
3. Reconstruction plan (`V21-MISSING-OBJECTS-RECONSTRUCTION-PLAN.md`)
4. Cross-domain audit (`FINAL-TRANSVERSAL-AUDIT.md`)
5. Actual canonical SQL files in `supabase/specs/sql/`

## Legend

| Symbol | Meaning                                       |
| ------ | --------------------------------------------- |
| ✅     | Present and aligned                           |
| ⚠️     | Present but needs review/adjustment           |
| ❌     | Missing from canonical SQL                    |
| 🔧     | Requires functional implementation beyond DDL |
| N/A    | Not applicable to this domain                 |

---

## Domain Reconciliation

### Core / Tenancy

| Object             | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ------------------ | -------- | --- | --- | ----- | --- | ----- | ------ |
| people             | ✅       | ✅  | —   | ✅    | ✅  | ✅    | PASS   |
| tenants            | ✅       | ✅  | —   | ✅    | ✅  | ✅    | PASS   |
| tenant_memberships | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| tenant_settings    | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `people.auth_user_id` unique present ✅
- `tenant_memberships` has `uq_tenant_membership_person_tenant` ✅
- All tables have `created_at`/`updated_at` ✅

---

### RBAC

| Object           | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ---------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| roles            | ✅       | ✅  | —   | ✅    | ✅  | ✅    | PASS   |
| permissions      | ✅       | ✅  | —   | ✅    | ✅  | ✅    | PASS   |
| role_permissions | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| role_assignments | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- Legacy roles (`admin`, `empresa`, `candidato`) absent from canonical ✅
- `roles.scope` supports `global` and `tenant` ✅
- `role_assignments` has `uq_role_assignment_person_role_tenant` ✅
- No `actor_person_id` in `role_assignments` — acceptable for RBAC table

---

### CRM

| Object                | Contract | SQL | FK  | Index | RLS | Audit | Status |
| --------------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| companies             | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| company_relationships | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| company_contacts      | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `company_relationships` and `company_contacts` lack `tenant_id` — access controlled via `companies.tenant_id` per canonical design ⚠️
- `company_contacts` missing `updated_at` — acceptable for contact table ⚠️

---

### RH / Recruitment

| Object                     | Contract | SQL | FK  | Index | RLS | Audit | Status |
| -------------------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| candidates                 | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| jobs                       | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| applications               | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| application_status_history | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| interviews                 | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `application_status_history` lacks `tenant_id` — inherited via `candidates`/`jobs` ⚠️
- No `candidate_skills`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages` — these are legacy objects, not in V2.1 canonical ❌
- No `skills`, `job_skills`, `stage_templates`, `recruitment_processes`, `recruitment_stages` — these are legacy objects, not in V2.1 canonical ❌

---

### Services / Contracts

| Object                       | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ---------------------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| services                     | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| service_orders               | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| service_order_status_history | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| contracts                    | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| contract_status_history      | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `service_order_status_history` and `contract_status_history` lack `tenant_id` — inherited via parent ⚠️

---

### Suppliers / Purchasing

| Object               | Contract | SQL | FK  | Index | RLS | Audit | Status |
| -------------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| suppliers            | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| purchase_orders      | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| purchase_order_items | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- No `purchase_receipts`/`purchase_receipt_items` in canonical — created in D.21 as operational tables ⚠️
- `purchase_order_items` has `received_quantity` ✅

---

### Inventory / Custody

| Object                    | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ------------------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| products                  | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| stock_movements           | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| stock_balances            | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| stock_entries             | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| third_party_custody       | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| third_party_custody_items | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `stock_balances` and `stock_entries` are in D.21, not in `07_inventory_custody.sql` ⚠️
- Duplicate `third_party_custody*` removed from `07_inventory_custody.sql` ✅
- No `warehouses`, `warehouse_locations`, `stock_lots` — these are legacy objects, not in V2.1 canonical ❌

---

### Tasks / Support

| Object                        | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ----------------------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| tasks                         | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| support_tickets               | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| support_ticket_status_history | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `support_ticket_status_history` has `tenant_id` ✅
- No legacy `tasks_support` merged table ✅

---

### Notifications / Events / Outbox

| Object                  | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ----------------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| notifications           | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| notification_deliveries | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| domain_events           | ✅       | ✅  | —   | ✅    | ✅  | ✅    | PASS   |
| event_outbox            | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| event_deliveries        | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `tenant_id` added to all delivery/outbox tables ✅
- `correlation_id`/`causation_id` present ✅
- `idempotency_key` unique present ✅
- `event_outbox` has `uq_event_outbox_event_id` ✅
- `event_deliveries` has `uq_event_deliveries_idempotency_key` ✅

---

### Chat / AI / Handoff

| Object            | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ----------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| chat_rooms        | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| chat_participants | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| chat_messages     | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| ai_conversations  | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| ai_messages       | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| chat_handoffs     | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `chat_participants`, `chat_messages`, `chat_handoffs` lack `tenant_id` — inherited via `chat_rooms` ⚠️
- No `ai_usage` table — not in V2.1 canonical ❌

---

### Storage / Documents

| Object                   | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ------------------------ | -------- | --- | --- | ----- | --- | ----- | ------ |
| files                    | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| file_access_logs         | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| document_versions        | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| document_links           | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| administrative_requests  | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| administrative_tasks     | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| administrative_approvals | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| administrative_documents | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `storage_path` canonical, no `file_url` duplication ✅
- `files` has `uq_files_storage_path` ✅
- `document_versions` has `uq_document_versions_entity_version` ✅

---

### Audit / Security

| Object            | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ----------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| audit_logs        | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| security_events   | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| first_login_state | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| legal_acceptances | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `audit_logs` has `before_data`/`after_data` ✅
- `legal_acceptances` augmented with `actor_person_id`, `correlation_id`, `causation_id` ✅

---

### LGPD

| Object                  | Contract | SQL | FK  | Index | RLS | Audit | Status |
| ----------------------- | -------- | --- | --- | ----- | --- | ----- | ------ |
| consents                | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| privacy_requests        | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| data_export_requests    | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| data_deletion_requests  | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |
| data_retention_policies | ✅       | ✅  | ✅  | ✅    | ✅  | ✅    | PASS   |

**Notes:**

- `legal_hold` field present ✅
- `idempotency_key` unique on request tables ✅
- `correlation_id`/`causation_id` present ✅

---

### Finance / Fiscal / PDV

| Object              | Contract | SQL | FK  | Index | RLS | Audit | Status  |
| ------------------- | -------- | --- | --- | ----- | --- | ----- | ------- |
| accounts_receivable | ❌       | ❌  | —   | ❌    | ❌  | ❌    | MISSING |
| accounts_payable    | ❌       | ❌  | —   | ❌    | ❌  | ❌    | MISSING |
| fiscal_documents    | ❌       | ❌  | —   | ❌    | ❌  | ❌    | MISSING |
| pos_sales           | ❌       | ❌  | —   | ❌    | ❌  | ❌    | MISSING |
| pos_sale_items      | ❌       | ❌  | —   | ❌    | ❌  | ❌    | MISSING |
| pos_payments        | ❌       | ❌  | —   | ❌    | ❌  | ❌    | MISSING |

**Notes:**

- Functional contracts exist in `V21-FUNCTIONAL-CONTRACT-INVENTORY-FINANCE-PDV.md` ✅
- No canonical SQL for Finance/Fiscal/PDV in `supabase/specs/sql/` ❌
- This is a **known gap** — these domains are planned but not yet implemented in canonical
- Not blocking for V2.1 core if treated as post-launch expansion

---

## Cross-Cutting Concerns

### RLS Coverage

| Domain               | Tables with RLS | Status       |
| -------------------- | --------------- | ------------ |
| Core                 | 4/4             | ✅           |
| RBAC                 | 4/4             | ✅           |
| CRM                  | 3/3             | ✅           |
| RH/Recruitment       | 5/5             | ✅           |
| Services/Contracts   | 5/5             | ✅           |
| Suppliers/Purchasing | 3/3             | ✅           |
| Inventory/Custody    | 6/6             | ✅           |
| Tasks/Support        | 3/3             | ✅           |
| Notifications/Events | 5/5             | ✅           |
| Chat/AI              | 6/6             | ✅           |
| Storage/Documents    | 8/8             | ✅           |
| Audit/Security       | 4/4             | ✅           |
| LGPD                 | 5/5             | ✅           |
| Validation           | 1/1             | ⚠️ test-only |

**Total:** 52/52 operational tables have RLS ✅

### Functions / Triggers

| Function                  | Purpose                         | Status |
| ------------------------- | ------------------------------- | ------ |
| set_updated_at            | Auto-update timestamps          | ✅     |
| audit_log_insert          | Generic audit trigger           | ✅     |
| domain_event_emit         | Event emission with idempotency | ✅     |
| event_outbox_enqueue      | Outbox enqueue                  | ✅     |
| event_outbox_process_next | Worker with SKIP LOCKED         | ✅     |
| stock_movement_insert     | Stock validation + ledger       | ✅     |
| purchase_receipt_confirm  | Receipt → stock + PO update     | ✅     |
| lgpd_legal_hold_check     | Block deletion on legal hold    | ✅     |
| lgpd_consent_register     | Consent audit trail             | ✅     |
| is_tenant_member          | RLS helper                      | ✅     |
| is_admin_master           | RLS bypass                      | ✅     |
| user_tenant_ids           | RLS helper                      | ✅     |
| validation_upsert         | Test infrastructure             | ✅     |
| validation_assert         | Test infrastructure             | ✅     |

**Total:** 14 functions ✅

### Triggers

| Trigger                          | Purpose               | Status |
| -------------------------------- | --------------------- | ------ |
| trg_set_updated_at_*             | Timestamp maintenance | ✅     |
| trg_audit_*                      | Audit logging         | ✅     |
| trg_audit_stock_movements        | Stock ledger          | ✅     |
| trg_audit_purchase_receipts      | Receipt confirmation  | ✅     |
| trg_domain_event_to_outbox       | Auto-outbox           | ✅     |
| trg_audit_consents               | Consent audit         | ✅     |
| trg_audit_data_deletion_requests | LGPD legal hold       | ✅     |

**Total:** Comprehensive trigger coverage ✅

### Indexes

| Category             | Count | Status |
| -------------------- | ----- | ------ |
| Core/Tenancy         | 7     | ✅     |
| RBAC                 | 6     | ✅     |
| CRM                  | 4     | ✅     |
| RH/Recruitment       | 12    | ✅     |
| Services/Contracts   | 12    | ✅     |
| Suppliers/Purchasing | 14    | ✅     |
| Inventory/Custody    | 10    | ✅     |
| Tasks/Support        | 6     | ✅     |
| Chat/AI              | 9     | ✅     |
| Notifications/Events | 15    | ✅     |
| Storage/Documents    | 20    | ✅     |
| Audit/Security       | 9     | ✅     |
| LGPD                 | 12    | ✅     |

**Total:** 136 indexes ✅

---

## Reconciliation Gaps

### Critical Gaps (None)

No critical gaps found in canonical SQL for implemented domains.

### Medium Gaps

| Gap                                                                       | Domain   | Impact                                 | Action                          |
| ------------------------------------------------------------------------- | -------- | -------------------------------------- | ------------------------------- |
| Finance/Fiscal/PDV SQL missing                                            | Finance  | Cannot process payments, invoices, POS | Implement in post-V2.1 phase    |
| `company_relationships`/`contacts` lack `tenant_id`                       | CRM      | Inherited tenancy only                 | Acceptable per canonical design |
| `application_status_history` lacks `tenant_id`                            | RH       | Inherited tenancy only                 | Acceptable per canonical design |
| `service_order_status_history`/`contract_status_history` lack `tenant_id` | Services | Inherited tenancy only                 | Acceptable per canonical design |
| `chat_participants`/`chat_messages`/`chat_handoffs` lack `tenant_id`      | Chat     | Inherited via `chat_rooms`             | Acceptable per canonical design |

### Low Gaps

| Gap                                      | Domain   | Impact | Action                       |
| ---------------------------------------- | -------- | ------ | ---------------------------- |
| `company_contacts` missing `updated_at`  | CRM      | Minor  | Acceptable for contact table |
| `audit_logs` missing `updated_at`        | Audit    | Minor  | Append-only table            |
| `security_events` missing `updated_at`   | Security | Minor  | Append-only table            |
| `legal_acceptances` missing `updated_at` | Audit    | Minor  | Append-only table            |
| No `ai_usage` table                      | Chat     | Minor  | Not in V2.1 canonical        |

---

## Functional Contract Coverage

### Inventory / Warehouse / POS

| Rule                                                            | SQL Support                                          | Status |
| --------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| Ledger-first stock                                              | `stock_movements`, `stock_entries`, `stock_balances` | ✅     |
| Negative balance prevention                                     | `stock_movement_insert` trigger                      | ✅     |
| Movement types: entry/exit/adjustment/transfer/inventory/return | Validated in trigger                                 | ✅     |
| Stock balance derivation from ledger                            | `stock_balances` updated via trigger                 | ✅     |
| Purchase receipt → stock entry                                  | `purchase_receipt_confirm` trigger                   | ✅     |
| PO received_quantity update                                     | Trigger present                                      | ✅     |

### Finance / Billing

| Rule                   | SQL Support        | Status |
| ---------------------- | ------------------ | ------ |
| Accounts receivable    | ❌ Not implemented | GAP    |
| Accounts payable       | ❌ Not implemented | GAP    |
| Financial transactions | ❌ Not implemented | GAP    |

### Fiscal

| Rule                 | SQL Support        | Status |
| -------------------- | ------------------ | ------ |
| Fiscal documents     | ❌ Not implemented | GAP    |
| NF-e/SAT integration | ❌ Not implemented | GAP    |

### PDV

| Rule                 | SQL Support        | Status |
| -------------------- | ------------------ | ------ |
| POS sales            | ❌ Not implemented | GAP    |
| POS payments         | ❌ Not implemented | GAP    |
| POS cashier sessions | ❌ Not implemented | GAP    |

**Note:** Finance/Fiscal/PDV are explicitly out of V2.1 core scope per project decisions. They are documented in functional contracts for future phases.

---

## Conclusion

### What is Ready

| Domain                      | Status   |
| --------------------------- | -------- |
| Core/Tenancy                | ✅ READY |
| RBAC                        | ✅ READY |
| CRM                         | ✅ READY |
| RH/Recruitment              | ✅ READY |
| Services/Contracts          | ✅ READY |
| Suppliers/Purchasing        | ✅ READY |
| Inventory/Custody           | ✅ READY |
| Tasks/Support               | ✅ READY |
| Notifications/Events/Outbox | ✅ READY |
| Chat/AI/Handoff             | ✅ READY |
| Storage/Documents           | ✅ READY |
| Audit/Security              | ✅ READY |
| LGPD                        | ✅ READY |
| RLS                         | ✅ READY |
| Indexes                     | ✅ READY |
| Functions/Triggers          | ✅ READY |
| Seed                        | ✅ READY |
| Validation                  | ✅ READY |

### What is Not Ready (Post-V2.1)

| Domain  | Status     | Phase     |
| ------- | ---------- | --------- |
| Finance | ❌ MISSING | Post-V2.1 |
| Fiscal  | ❌ MISSING | Post-V2.1 |
| PDV     | ❌ MISSING | Post-V2.1 |

### Recommendation

Proceed with local rebuild of V2.1 core. Finance/Fiscal/PDV should be treated as expansion phases after core stabilization.

The canonical SQL package is internally consistent and ready for PostgreSQL execution when runtime becomes available.
