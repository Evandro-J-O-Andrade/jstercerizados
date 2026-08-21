# V2.1 — Local Rebuild Readiness

**Branch:** `feat/database-v21-local-rebuild`  
**Base:** `main` @ `f14fb09`  
**Data:** 2026-08-20  
**Mode:** READ-ONLY / preparation only

## Objective

Prepare the canonical V2.1 database package for a local rebuild without modifying the canonical SQL contract and without touching the production Supabase project.

## Current constraints

- No PostgreSQL local runtime is available in the current environment.
- No Docker runtime is available in the current environment.
- Supabase production has not been inspected.
- No backup, reset, migration, seed, or destructive operation has been executed.

Therefore this branch is limited to static reconciliation, documentation, and rebuild preparation until a PostgreSQL/Docker/staging runtime is available.

## Baseline

`feat/database-v21-local-rebuild` was created from the current remote `main` at `f14fb09`.

## Canonical package observed

Expected canonical SQL package currently published on `main`:

- `supabase/specs/sql/00_extensions.sql`
- `supabase/specs/sql/01_core.sql`
- `supabase/specs/sql/02_rbac.sql`
- `supabase/specs/sql/03_crm.sql`
- `supabase/specs/sql/04_rh_recruitment.sql`
- `supabase/specs/sql/05_services_contracts.sql`
- `supabase/specs/sql/06_suppliers_purchasing.sql`
- `supabase/specs/sql/07_inventory_custody.sql`
- `supabase/specs/sql/09_chat.sql`
- `supabase/specs/sql/10_notifications_events.sql`
- `supabase/specs/sql/11_audit_security.sql`
- `supabase/specs/sql/12_custody.sql`
- `supabase/specs/sql/14_tasks.sql`
- `supabase/specs/sql/15_support.sql`
- `supabase/specs/sql/18_storage_documents.sql`
- `supabase/specs/sql/20_lgpd.sql`
- `supabase/specs/sql/21_functions_triggers.sql`
- `supabase/specs/sql/22_rls.sql`
- `supabase/specs/sql/23_indexes.sql`
- `supabase/specs/sql/25_validation.sql`
- `supabase/specs/sql/32_seed.sql`

Supporting execution scripts:

- `scripts/dryrun_migration.sql`
- `scripts/dryrun_seed.sql`
- `scripts/dryrun_validation.sql`

Functional/structural contracts:

- `docs/V21-CANONICAL-OBJECT-MASTER-MATRIX.md`
- `docs/V21-MISSING-OBJECTS-RECONSTRUCTION-PLAN.md`
- `docs/V21-FUNCTIONAL-CONTRACT-INVENTORY-FINANCE-PDV.md`
- `docs/V21-INVENTORY-BILLING-WAREHOUSE-POS-MASTER-SPEC.md`
- `docs/V21-INVENTORY-CUSTODY-RECONCILIATION-MATRIX.md`
- `docs/FINAL-TRANSVERSAL-AUDIT.md`

## Static defasagem matrix

| Area | Contract | Canonical SQL | Static reconciliation | Runtime rebuild |
|---|---|---|---|---|
| Core | PRESENT | PRESENT | PENDING | BLOCKED |
| RBAC | PRESENT | PRESENT | PENDING | BLOCKED |
| CRM | PRESENT | PRESENT | PENDING | BLOCKED |
| RH / Recruitment | PRESENT | PRESENT | PENDING | BLOCKED |
| Services / Contracts | PRESENT | PRESENT | PENDING | BLOCKED |
| Suppliers / Purchasing | PRESENT | PRESENT | PENDING | BLOCKED |
| Inventory / Custody | PRESENT | PRESENT | PENDING | BLOCKED |
| Finance | FUNCTIONAL CONTRACT PRESENT | PACKAGE RECONCILIATION REQUIRED | PENDING | BLOCKED |
| Fiscal | FUNCTIONAL CONTRACT PRESENT | PACKAGE RECONCILIATION REQUIRED | PENDING | BLOCKED |
| PDV | FUNCTIONAL CONTRACT PRESENT | PACKAGE RECONCILIATION REQUIRED | PENDING | BLOCKED |
| Tasks / Support | PRESENT | PRESENT | PENDING | BLOCKED |
| Notifications / Events | PRESENT | PRESENT | PENDING | BLOCKED |
| Chat / AI / Handoff | PRESENT | PRESENT | PENDING | BLOCKED |
| Storage / Documents | PRESENT | PRESENT | PENDING | BLOCKED |
| Audit / Security | PRESENT | PRESENT | PENDING | BLOCKED |
| LGPD | PRESENT | PRESENT | PENDING | BLOCKED |
| RLS | PRESENT | PRESENT | PENDING | BLOCKED |
| Indexes / Functions / Triggers | PRESENT | PRESENT | PENDING | BLOCKED |
| Seed | PRESENT | PRESENT | PENDING | BLOCKED |
| Validation | PRESENT | PRESENT | PENDING | BLOCKED |

`PENDING` does not mean the object is missing. It means it still needs static cross-checking against the canonical matrix and functional contracts.

## Static audit gates

Before a physical rebuild, verify:

1. Every canonical SQL file referenced by the master matrix exists.
2. SQL execution order is dependency-safe.
3. Every referenced table/type/function exists before use.
4. Foreign-key targets are created before dependent constraints.
5. Functions/triggers are created only after their referenced objects exist.
6. RLS policies reference the canonical identity chain:
   `auth.uid() -> people -> tenant_memberships -> tenant_id`.
7. Legacy role names are absent from canonical RBAC definitions.
8. Tenant-scoped operational tables satisfy the V2.1 tenancy rules.
9. Inventory rules remain ledger-first.
10. Finance/fiscal/PDV functional rules have corresponding schema support.
11. Seed does not depend on production data.
12. Validation checks the final canonical object set rather than historical migrations.
13. No historical migration is promoted into the V2.1 canonical package merely to fill a gap without explicit reconciliation.

## Runtime gates — when PostgreSQL/Docker/staging is available

```text
STATIC AUDIT PASS
      |
      v
create isolated PostgreSQL database
      |
      v
run dryrun_migration.sql
      |
      v
apply canonical SQL in dependency order
      |
      v
run dryrun_seed.sql / canonical seed
      |
      v
run dryrun_validation.sql
      |
      +---- FAIL -> fix branch, repeat
      |
      +---- PASS -> freeze local rebuild
```

Only after the local rebuild passes should the production Supabase project enter a read-only reconciliation stage.

## Explicit non-goals of this branch

- No Admin UI implementation.
- No dashboard implementation.
- No frontend route changes unrelated to database compatibility.
- No production Supabase reset.
- No destructive SQL against remote environments.
- No replacement of the canonical V2.1 contract with historical migrations.

## Exit criteria

This branch is ready to be reviewed when:

- static reconciliation is complete;
- all identified gaps have an explicit action;
- local PostgreSQL/Docker/staging is available;
- migration + seed + validation pass in isolation;
- the resulting schema is frozen for frontend/Admin consumption.
