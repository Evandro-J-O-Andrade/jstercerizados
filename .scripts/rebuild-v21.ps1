# Rebuild V2.1 - J&S Empregos LTDA
# Production: okxqfyoqbhcmflpurfrw
# Autorizado: 2026-08-20

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = ".backups/rebuild_log_$timestamp.txt"

function Log($msg) {
    $line = "[$(Get-Date -Format 'HH:mm:ss')] $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line
}

function Execute-Sql($sql, $description) {
    Log "EXECUTING: $description"
    if ($DryRun) {
        Log "  [DRY-RUN] $sql"
        return
    }
    try {
        $result = supabase db query --linked --output json $sql 2>&1
        Log "  OK"
    } catch {
        Log "  ERROR: $_"
        throw
    }
}

function Execute-SqlFile($file, $description) {
    Log "EXECUTING FILE: $description ($file)"
    if ($DryRun) {
        Log "  [DRY-RUN] Skipping file execution"
        return
    }
    try {
        $result = supabase db query --linked --file $file 2>&1
        Log "  OK"
    } catch {
        Log "  ERROR: $_"
        throw
    }
}

# Phase 1: Drop all production tables
Log "=== PHASE 1: DROP PRODUCTION TABLES ==="
$tablesToDrop = @(
    "application_profile_snapshots",
    "application_status_history",
    "applications",
    "candidate_preferences",
    "candidate_profile_views",
    "candidate_skills",
    "candidates",
    "companies",
    "company_contacts",
    "company_relationship_types",
    "company_relationships",
    "company_types",
    "domain_events",
    "file_access_logs",
    "files",
    "job_matches",
    "job_skills",
    "jobs",
    "notification_deliveries",
    "notification_preferences",
    "notifications",
    "people",
    "permissions",
    "role_assignments",
    "role_permissions",
    "role_resource_permissions",
    "roles",
    "skills",
    "talent_pool_memberships",
    "tenant_memberships",
    "tenants"
)

foreach ($table in $tablesToDrop) {
    Execute-Sql "DROP TABLE IF EXISTS $table CASCADE;" "Drop $table"
}

Log "Phase 1 complete: all production tables dropped"

# Phase 2: Execute V2.1 DDL
Log "=== PHASE 2: V2.1 DDL ==="
$ddlFiles = @(
    "docs/sql/00_extensions.sql",
    "docs/sql/01_core.sql",
    "docs/sql/02_rbac.sql",
    "docs/sql/03_crm.sql",
    "docs/sql/04_rh_recruitment.sql",
    "docs/sql/05_services_contracts.sql",
    "docs/sql/06_suppliers_purchasing.sql",
    "docs/sql/07_inventory_custody.sql",
    "docs/sql/08_fiscal.sql",
    "docs/sql/09_chat.sql",
    "docs/sql/10_tasks.sql",
    "docs/sql/11_support.sql",
    "docs/sql/12_notifications.sql",
    "docs/sql/13_domain_events.sql",
    "docs/sql/14_storage.sql",
    "docs/sql/15_audit_security.sql",
    "docs/sql/16_lgpd.sql",
    "docs/sql/17_employees.sql",
    "docs/sql/18_administrative.sql",
    "docs/sql/19_finance.sql",
    "docs/sql/20_indexes.sql",
    "docs/sql/21_rls.sql",
    "docs/sql/22_seed.sql",
    "docs/sql/23_validation.sql"
)

foreach ($file in $ddlFiles) {
    Execute-SqlFile $file "Execute $file"
}

Log "Phase 2 complete: V2.1 DDL executed"

# Phase 3: Validation
Log "=== PHASE 3: VALIDATION ==="
$tables = @(
    "tenants", "people", "tenant_memberships", "tenant_settings",
    "roles", "permissions", "role_permissions", "role_assignments", "role_resource_permissions",
    "companies", "company_relationships", "company_contacts", "interactions",
    "candidates", "candidate_documents", "candidate_experiences", "candidate_education",
    "candidate_courses", "candidate_languages", "candidate_skills", "stage_templates",
    "jobs", "job_skills", "recruitment_processes", "recruitment_stages", "candidate_processes",
    "applications", "application_status_history", "application_profile_snapshots", "interviews",
    "interview_participants", "interview_feedback",
    "services", "service_orders", "service_order_status_history",
    "contracts", "contract_status_history",
    "suppliers", "purchase_orders", "purchase_order_items",
    "products", "stock_movements",
    "tasks", "task_comments", "task_attachments", "task_status_history",
    "support_tickets", "support_ticket_status_history", "support_ticket_messages",
    "support_ticket_assignments", "support_ticket_categories",
    "chat_rooms", "chat_participants", "chat_messages", "ai_conversations", "ai_messages",
    "ai_usage", "chat_handoffs", "chat_assignments", "chat_events",
    "notifications", "notification_deliveries", "notification_preferences",
    "domain_events", "event_outbox", "event_deliveries",
    "audit_logs", "security_events", "first_login_state", "legal_acceptances",
    "files", "file_access_logs",
    "consents", "privacy_requests", "data_export_requests", "data_deletion_requests",
    "data_retention_policies",
    "employees", "employee_contracts", "employee_documents", "employee_status_history",
    "departments", "positions", "employee_positions",
    "administrative_requests", "administrative_tasks", "administrative_approvals",
    "administrative_documents",
    "financial_accounts", "financial_categories", "cost_centers",
    "accounts_receivable", "accounts_payable", "financial_transactions",
    "invoices", "invoice_items", "payments", "expenses", "revenues",
    "fiscal_configurations", "fiscal_integrations", "fiscal_documents",
    "fiscal_document_items", "fiscal_document_events", "fiscal_document_status_history",
    "fiscal_api_requests", "fiscal_api_responses",
    "document_versions", "document_links"
)

$missingTables = @()
foreach ($table in $tables) {
    $sql = "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table';"
    $result = supabase db query --linked --output json $sql 2>&1
    if ($LASTEXITCODE -ne 0) {
        $missingTables += $table
        Log "  MISSING: $table"
    }
}

if ($missingTables.Count -gt 0) {
    Log "VALIDATION FAILED: Missing tables: $($missingTables -join ', ')"
    exit 1
}

Log "Phase 3 complete: all tables exist"
Log "=== REBUILD COMPLETE ==="
Log "Log file: $logFile"
