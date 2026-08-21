# Structural Comparison: Production vs V2.1 Canonical

**Generated:** 2026-08-20T09:12:28.773Z
**Production Project:** okxqfyoqbhcmflpurfrw
**V2.1 Reference:** docs/sql/

## Executive Summary

| Metric | Value |
|--------|-------|
| Production tables | 31 |
| V2.1 canonical tables | 113 |
| Tables in both | 28 |
| Only in production | 3 |
| Only in V2.1 (new) | 85 |
| Production functions | 40 |
| Production triggers | 38 |
| Production RLS policies | 84 |
| Production indexes | 173 |

## Tables Comparison

### ⚠️ Tables ONLY in Production (would be DROPPED)

These tables exist in production but are NOT defined in V2.1 canonical:

| Table | Columns | Rows | Constraints |
|-------|---------|------|-------------|
| candidate_preferences | 18 | 0 | 9 |
| company_relationship_types | 5 | 3 | 6 |
| company_types | 5 | 6 | 6 |

### ➕ Tables ONLY in V2.1 (would be CREATED)

These tables are defined in V2.1 canonical but do NOT exist in production:

| Table | Status |
|-------|--------|
| tenant_settings | NEW |
| interactions | NEW |
| candidate_documents | NEW |
| candidate_experiences | NEW |
| candidate_education | NEW |
| candidate_courses | NEW |
| candidate_languages | NEW |
| stage_templates | NEW |
| recruitment_processes | NEW |
| recruitment_stages | NEW |
| candidate_processes | NEW |
| interviews | NEW |
| interview_participants | NEW |
| interview_feedback | NEW |
| employees | NEW |
| employee_contracts | NEW |
| employee_documents | NEW |
| employee_status_history | NEW |
| departments | NEW |
| positions | NEW |
| employee_positions | NEW |
| administrative_requests | NEW |
| administrative_tasks | NEW |
| administrative_approvals | NEW |
| administrative_documents | NEW |
| financial_accounts | NEW |
| financial_categories | NEW |
| cost_centers | NEW |
| accounts_receivable | NEW |
| accounts_payable | NEW |
| financial_transactions | NEW |
| invoices | NEW |
| invoice_items | NEW |
| payments | NEW |
| expenses | NEW |
| revenues | NEW |
| fiscal_configurations | NEW |
| fiscal_integrations | NEW |
| fiscal_documents | NEW |
| fiscal_document_items | NEW |
| fiscal_document_events | NEW |
| fiscal_document_status_history | NEW |
| fiscal_api_requests | NEW |
| fiscal_api_responses | NEW |
| products | NEW |
| product_categories | NEW |
| warehouses | NEW |
| warehouse_locations | NEW |
| stock_balances | NEW |
| stock_movements | NEW |
| stock_entries | NEW |
| stock_exits | NEW |
| stock_inventory | NEW |
| stock_inventory_items | NEW |
| stock_adjustments | NEW |
| suppliers | NEW |
| purchase_orders | NEW |
| purchase_order_items | NEW |
| tasks | NEW |
| task_comments | NEW |
| task_attachments | NEW |
| task_status_history | NEW |
| support_ticket_categories | NEW |
| support_tickets | NEW |
| support_ticket_messages | NEW |
| support_ticket_assignments | NEW |
| support_ticket_status_history | NEW |
| chat_rooms | NEW |
| chat_participants | NEW |
| chat_messages | NEW |
| ai_conversations | NEW |
| ai_messages | NEW |
| ai_usage | NEW |
| chat_assignments | NEW |
| chat_handoffs | NEW |
| chat_events | NEW |
| document_versions | NEW |
| document_links | NEW |
| audit_logs | NEW |
| security_events | NEW |
| consents | NEW |
| privacy_requests | NEW |
| data_export_requests | NEW |
| data_deletion_requests | NEW |
| data_retention_policies | NEW |

### ✅ Tables in Both

| Table | Prod Columns | V2.1 Status |
|-------|-------------|-------------|
| application_profile_snapshots | 4 | canonical |
| application_status_history | 8 | canonical |
| applications | 13 | canonical |
| candidate_profile_views | 7 | canonical |
| candidate_skills | 7 | canonical |
| candidates | 14 | canonical |
| companies | 22 | canonical |
| company_contacts | 8 | canonical |
| company_relationships | 11 | canonical |
| domain_events | 17 | canonical |
| file_access_logs | 9 | canonical |
| files | 16 | canonical |
| job_matches | 13 | canonical |
| job_skills | 6 | canonical |
| jobs | 28 | canonical |
| notification_deliveries | 19 | canonical |
| notification_preferences | 9 | canonical |
| notifications | 18 | canonical |
| people | 12 | canonical |
| permissions | 6 | canonical |
| role_assignments | 7 | canonical |
| role_permissions | 5 | canonical |
| role_resource_permissions | 6 | canonical |
| roles | 6 | canonical |
| skills | 9 | canonical |
| talent_pool_memberships | 16 | canonical |
| tenant_memberships | 10 | canonical |
| tenants | 8 | canonical |

## Data Inventory

### Tables WITH Data (must preserve)

| Table | Rows | Data Type | V2.1 Status |
|-------|------|-----------|-------------|
| company_relationship_types | 3 | Seed/Reference | ❌ MISSING |
| company_types | 6 | Seed/Reference | ❌ MISSING |
| people | 1 | RBAC/Core | ✅ PRESENT |
| permissions | 26 | RBAC/Core | ✅ PRESENT |
| role_assignments | 1 | RBAC/Core | ✅ PRESENT |
| role_resource_permissions | 114 | RBAC/Core | ✅ PRESENT |
| roles | 10 | RBAC/Core | ✅ PRESENT |
| skills | 68 | Seed/Reference | ✅ PRESENT |
| tenant_memberships | 1 | RBAC/Core | ✅ PRESENT |
| tenants | 1 | RBAC/Core | ✅ PRESENT |

### Tables WITHOUT Data (can be safely recreated)

Total: 21 tables with no data

## Objects Comparison

| Object Type | Production Count | V2.1 Status |
|-------------|------------------|-------------|
| Functions | 40 | Defined in docs/sql/18_functions.sql |
| Triggers | 38 | Defined in docs/sql/19_triggers.sql |
| RLS Policies | 84 | Defined in docs/sql/21_rls.sql |
| Indexes | 173 | Defined in docs/sql/20_indexes.sql |
| Seeds | 10 tables with data | Defined in docs/sql/22_seed.sql |

## What Would Be LOST if DROP Today

1. **3 legacy tables** that are not in V2.1: candidate_preferences, company_relationship_types, company_types
2. **231 rows of actual data** across 10 tables
3. **40 functions** (all would be dropped and recreated)
4. **38 triggers** (all would be dropped and recreated)
5. **84 RLS policies** (all would be dropped and recreated)
6. **173 indexes** (all would be dropped and recreated)

## What Would Be RECREATED by V2.1

1. **28 tables** with canonical V2.1 structure
2. **85 new tables** currently missing from production
3. All V2.1 functions, triggers, RLS policies, and indexes
4. Seed data for: company_types (6), company_relationship_types (3), permissions (26), role_resource_permissions (114), skills (68), roles (10)

## GO / NO-GO Assessment

### ⚠️ CONDITIONAL GO

3 legacy tables would be dropped without V2.1 equivalents. Data in seed tables (company_types, company_relationship_types, skills, permissions, roles, role_resource_permissions) can be safely reseeded. Critical data (people, tenant_memberships, tenants, role_assignments) must be preserved.

### Conditions for GO:
1. ✅ Backup verified and stored at `.backups/js_empregos_production_backup_2026-08-20T09-01-46_manifest.json`
2. ✅ 10 tables contain data requiring preservation
3. ⚠️ Evaluate legacy tables: candidate_preferences, company_relationship_types, company_types
4. ⏳ Test rebuild on staging/dry-run environment first
5. ⏳ Validate frontend compatibility with V2.1 schema
6. ⏳ Verify V2.1 canonical completeness (docs/sql/ has 113 table definitions vs 31 in production)

## Next Steps

1. ✅ Backup completed
2. ✅ Structural comparison completed
3. Create staging environment
4. Execute rebuild on staging using V2.1 canonical DDL (docs/sql/*.sql)
5. Migrate data from production backup to staging
6. Validate application functionality
7. Schedule production rebuild window (requires explicit authorization)
