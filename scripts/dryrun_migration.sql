# Migration Dry-Run Script for V2.1
# This script applies the canonical SQL files in dependency order
# and runs validation tests.
#
# Prerequisites:
# - PostgreSQL client (psql) installed and in PATH
# - Connection to a local/staging database
#
# Usage:
#   psql -U postgres -d v21_dryrun -f scripts/dryrun_migration.sql
#   psql -U postgres -d v21_dryrun -f scripts/dryrun_seed.sql
#   psql -U postgres -d v21_dryrun -f scripts/dryrun_validation.sql

-- ============================================================
-- DRY-RUN MIGRATION
-- ============================================================

-- Order: 00 -> 01 -> 02 -> 03 -> 07 -> 04 -> 05 -> 06 -> 09 -> 10 -> 11 -> 12 -> 14 -> 15 -> 18 -> 20 -> 26 -> 27 -> 28 -> 29 -> 30 -> 31 -> 21 -> 22 -> 23

\echo '=== Starting V2.1 Migration Dry-Run ==='

-- 00 Extensions
\echo 'Applying 00_extensions.sql...'
\i supabase/specs/sql/00_extensions.sql

-- 01 Core
\echo 'Applying 01_core.sql...'
\i supabase/specs/sql/01_core.sql

-- 02 RBAC
\echo 'Applying 02_rbac.sql...'
\i supabase/specs/sql/02_rbac.sql

-- 03 CRM
\echo 'Applying 03_crm.sql...'
\i supabase/specs/sql/03_crm.sql

-- 07 Inventory
\echo 'Applying 07_inventory_custody.sql...'
\i supabase/specs/sql/07_inventory_custody.sql

-- 04 RH/Recruitment
\echo 'Applying 04_rh_recruitment.sql...'
\i supabase/specs/sql/04_rh_recruitment.sql

-- 05 Services/Contracts
\echo 'Applying 05_services_contracts.sql...'
\i supabase/specs/sql/05_services_contracts.sql

-- 06 Suppliers/Purchasing
\echo 'Applying 06_suppliers_purchasing.sql...'
\i supabase/specs/sql/06_suppliers_purchasing.sql

-- 09 Chat
\echo 'Applying 09_chat.sql...'
\i supabase/specs/sql/09_chat.sql

-- 10 Notifications/Events/Outbox
\echo 'Applying 10_notifications_events.sql...'
\i supabase/specs/sql/10_notifications_events.sql

-- 11 Audit/Security
\echo 'Applying 11_audit_security.sql...'
\i supabase/specs/sql/11_audit_security.sql

-- 12 Custody
\echo 'Applying 12_custody.sql...'
\i supabase/specs/sql/12_custody.sql

-- 14 Tasks
\echo 'Applying 14_tasks.sql...'
\i supabase/specs/sql/14_tasks.sql

-- 15 Support
\echo 'Applying 15_support.sql...'
\i supabase/specs/sql/15_support.sql

-- 18 Storage/Documents
\echo 'Applying 18_storage_documents.sql...'
\i supabase/specs/sql/18_storage_documents.sql

-- 20 LGPD
\echo 'Applying 20_lgpd.sql...'
\i supabase/specs/sql/20_lgpd.sql

-- 26 Error Codes
\echo 'Applying 26_error_codes.sql...'
\i supabase/specs/sql/26_error_codes.sql

-- 27 Finance
\echo 'Applying 27_finance.sql...'
\i supabase/specs/sql/27_finance.sql

-- 28 Fiscal
\echo 'Applying 28_fiscal.sql...'
\i supabase/specs/sql/28_fiscal.sql

-- 29 POS
\echo 'Applying 29_pos.sql...'
\i supabase/specs/sql/29_pos.sql

-- 30 Recruitment
\echo 'Applying 30_recruitment.sql...'
\i supabase/specs/sql/30_recruitment.sql

-- 31 Automation
\echo 'Applying 31_automation.sql...'
\i supabase/specs/sql/31_automation.sql

-- 21 Functions/Triggers
\echo 'Applying 21_functions_triggers.sql...'
\i supabase/specs/sql/21_functions_triggers.sql

-- 22 RLS
\echo 'Applying 22_rls.sql...'
\i supabase/specs/sql/22_rls.sql

-- 45b Scheduling/Integrations
\echo 'Applying 45b_scheduling_integrations.sql...'
\i supabase/specs/sql/45b_scheduling_integrations.sql

-- 46 Operations Field Service
\echo 'Applying 46_operations_field_service.sql...'
\i supabase/specs/sql/46_operations_field_service.sql

-- 45 RLS Remaining
\echo 'Applying 45_rls_remaining.sql...'
\i supabase/specs/sql/45_rls_remaining.sql

-- 45 Indexes
\echo 'Applying 45_indexes.sql...'
\i supabase/specs/sql/45_indexes.sql

\echo '=== Migration Dry-Run Complete ==='
