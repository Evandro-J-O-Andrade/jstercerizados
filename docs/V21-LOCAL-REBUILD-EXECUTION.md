# V2.1 — Local Rebuild Execution Guide

**Branch:** `feat/database-v21-local-rebuild`  
**Base:** `main` @ `f14fb09`  
**Data:** 2026-08-21  
**Mode:** Execution instructions for local/staging rebuild

## Prerequisites

- PostgreSQL 15+ (local or Docker)
- psql client
- Git

## Option 1: Docker (Recommended)

```bash
# Start PostgreSQL
docker run --name v21-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=v21_dryrun \
  -p 5432:5432 \
  -d postgres:15-alpine

# Wait for PostgreSQL to be ready
sleep 5

# Execute migration
psql -U postgres -d v21_dryrun -f scripts/dryrun_migration.sql

# Execute seed
psql -U postgres -d v21_dryrun -f scripts/dryrun_seed.sql

# Execute validation
psql -U postgres -d v21_dryrun -f scripts/dryrun_validation.sql

# View validation report
psql -U postgres -d v21_dryrun -c "SELECT * FROM public.validation_results ORDER BY executed_at DESC;"
```

## Option 2: Local PostgreSQL

```bash
# Create database
createdb v21_dryrun

# Execute migration
psql -U postgres -d v21_dryrun -f scripts/dryrun_migration.sql

# Execute seed
psql -U postgres -d v21_dryrun -f scripts/dryrun_seed.sql

# Execute validation
psql -U postgres -d v21_dryrun -f scripts/dryrun_validation.sql

# View validation report
psql -U postgres -d v21_dryrun -c "SELECT * FROM public.validation_results ORDER BY executed_at DESC;"
```

## Option 3: Supabase Local (if available)

```bash
# Start Supabase local
supabase start

# Execute migration
psql -U postgres -d postgres -f scripts/dryrun_migration.sql

# Execute seed
psql -U postgres -d postgres -f scripts/dryrun_seed.sql

# Execute validation
psql -U postgres -d postgres -f scripts/dryrun_validation.sql
```

## Execution Order

The scripts must be executed in this order:

1. `scripts/dryrun_migration.sql` — applies all canonical SQL in dependency-safe order
2. `scripts/dryrun_seed.sql` — applies bootstrap seed data
3. `scripts/dryrun_validation.sql` — runs validation tests and generates report

## Expected Results

### Migration

- All 52+ tables created without errors
- All 136+ indexes created
- All 14 functions created
- All 7+ triggers created
- All RLS policies applied

### Seed

- 4 roles inserted: `admin_master`, `admin_tenant`, `manager`, `operator`
- 40+ permissions inserted
- Role-permission mappings inserted
- Bootstrap tenant/people/membership data inserted (if configured)

### Validation

- All structural integrity tests PASS
- All tenancy tests PASS
- All RLS tests PASS
- All transaction tests PASS
- All idempotency tests PASS
- All concurrency tests PASS
- All ledger tests PASS
- All LGPD tests PASS
- All audit tests PASS
- All outbox tests PASS

## Troubleshooting

### FK Violation: products does not exist

**Cause:** Execution order incorrect.  
**Fix:** Ensure `07_inventory_custody.sql` is applied before `06_suppliers_purchasing.sql`.  
**Status:** Already fixed in current `dryrun_migration.sql`.

### RLS Policy Error

**Cause:** Helper functions not created before policies.  
**Fix:** Ensure `22_rls.sql` is applied after `21_functions_triggers.sql`.  
**Status:** Already correct in current order.

### Function Does Not Exist

**Cause:** Triggers created before functions.  
**Fix:** Ensure `21_functions_triggers.sql` is applied before `22_rls.sql` and `23_indexes.sql`.  
**Status:** Already correct in current order.

## Cleanup

```bash
# Stop Docker container
docker stop v21-postgres
docker rm v21-postgres

# Or drop database
dropdb v21_dryrun
```

## Next Steps After PASS

1. Freeze local rebuild schema
2. Document final DDL
3. Prepare Supabase read-only reconciliation plan
4. Open `feat/admin-dashboards` branch for frontend work

## Next Steps After FAIL

1. Review validation report: `SELECT * FROM public.validation_results WHERE status = 'FAIL';`
2. Identify failing test and root cause
3. Fix canonical SQL or validation script
4. Re-run migration/seed/validation
5. Repeat until PASS
