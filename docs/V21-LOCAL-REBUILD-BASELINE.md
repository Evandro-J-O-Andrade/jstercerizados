# V2.1 — Local Rebuild Baseline

**Branch:** `feat/database-v21-local-rebuild`  
**Base:** `main` @ `f14fb09`  
**Data:** 2026-08-21  
**Status:** WAITING — runtime blocked

## Baseline State

This document records the exact state of the V2.1 rebuild process at the point where static work is complete and runtime execution is blocked pending PostgreSQL/Docker availability.

## Completed Phases

| Phase                | Status   | Output                                                     |
| -------------------- | -------- | ---------------------------------------------------------- |
| Nível 1 — Documental | ✅ PASS  | Contracts, matrices, specs, readiness                      |
| Nível 2 — Estático   | ✅ PASS  | Object inventory, reconciliation, dependency check         |
| Dependency Fix       | ✅ FIXED | `07_inventory_custody.sql` → `06_suppliers_purchasing.sql` |

## Documentation Produced

| File                                  | Purpose                                         |
| ------------------------------------- | ----------------------------------------------- |
| `docs/V21-LOCAL-REBUILD-READINESS.md` | Baseline, constraints, non-goals, exit criteria |
| `docs/V21-STATIC-RECONCILIATION.md`   | Full object-by-object reconciliation matrix     |
| `docs/V21-DEPENDENCY-CHECK.md`        | FK precedence, function/trigger order, RLS deps |
| `docs/V21-LOCAL-REBUILD-EXECUTION.md` | Execution guide for local/staging rebuild       |

## Canonical SQL Status

| File                          | Status   |
| ----------------------------- | -------- |
| `00_extensions.sql`           | ✅ Ready |
| `01_core.sql`                 | ✅ Ready |
| `02_rbac.sql`                 | ✅ Ready |
| `03_crm.sql`                  | ✅ Ready |
| `04_rh_recruitment.sql`       | ✅ Ready |
| `05_services_contracts.sql`   | ✅ Ready |
| `06_suppliers_purchasing.sql` | ✅ Ready |
| `07_inventory_custody.sql`    | ✅ Ready |
| `09_chat.sql`                 | ✅ Ready |
| `10_notifications_events.sql` | ✅ Ready |
| `11_audit_security.sql`       | ✅ Ready |
| `12_custody.sql`              | ✅ Ready |
| `14_tasks.sql`                | ✅ Ready |
| `15_support.sql`              | ✅ Ready |
| `18_storage_documents.sql`    | ✅ Ready |
| `20_lgpd.sql`                 | ✅ Ready |
| `21_functions_triggers.sql`   | ✅ Ready |
| `22_rls.sql`                  | ✅ Ready |
| `23_indexes.sql`              | ✅ Ready |
| `25_validation.sql`           | ✅ Ready |
| `32_seed.sql`                 | ✅ Ready |

## Critical Fix Applied

**Issue:** `purchase_order_items` in `06_suppliers_purchasing.sql` referenced `products` from `07_inventory_custody.sql`, but original execution order had `06` before `07`.

**Fix:** Reordered `scripts/dryrun_migration.sql` to execute `07_inventory_custody.sql` before `06_suppliers_purchasing.sql`.

**Impact:** Without this fix, migration would fail with `ERROR: relation "products" does not exist`.

## Runtime Gate (Blocked)

```
scripts/dryrun_migration.sql
        ↓
PostgreSQL/Docker
        ↓
scripts/dryrun_seed.sql
        ↓
scripts/dryrun_validation.sql
        ↓
PASS / FAIL
```

## Post-Freeze Path

Only after runtime PASS:

1. Freeze local rebuild schema
2. Supabase READ-ONLY reconciliation
3. Open `feat/admin-dashboards` branch

## Blockers

| Blocker                         | Type | Resolution                                   |
| ------------------------------- | ---- | -------------------------------------------- |
| PostgreSQL/Docker unavailable   | ENV  | Install Docker or provision local PostgreSQL |
| Runtime validation not executed | GATE | Execute dry-run scripts after ENV ready      |
| Supabase not inspected          | GATE | READ-ONLY reconciliation after freeze        |

## Non-Goals (Preserved)

- No Admin UI
- No dashboards
- No production Supabase reset
- No destructive SQL
- No replacement of canonical contract with historical migrations

## Next Actions

1. Provision PostgreSQL/Docker environment
2. Execute `scripts/dryrun_migration.sql`
3. Execute `scripts/dryrun_seed.sql`
4. Execute `scripts/dryrun_validation.sql`
5. If PASS: freeze schema, proceed to Supabase READ-ONLY
6. If FAIL: fix canonical SQL, repeat

**Do not proceed to Admin/Dashboard until runtime PASS is achieved.**
