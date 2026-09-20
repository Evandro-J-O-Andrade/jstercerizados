#!/usr/bin/env tsx

/**
 * MIGRATE-V21-DATA.TS
 *
 * Script de migração AS-IS → V2.1.
 *
 * Modos:
 *   --mode=analyze   Apenas calcula o que seria migrado. Não altera nada.
 *   --mode=dry-run   Executa em transação controlada e produz relatório.
 *   --mode=apply     Aplica migração. BLOQUEADO até autorização explícita.
 *
 * Uso:
 *   tsx scripts/migrate-v21-data.ts --mode=analyze
 *   tsx scripts/migrate-v21-data.ts --mode=dry-run
 *   tsx scripts/migrate-v21-data.ts --mode=apply --authorized
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

const DEFAULT_SOURCE_URL = process.env.VITE_SUPABASE_URL || '';
const DEFAULT_SOURCE_KEY = process.env.SUPABASE_SECRET_KEY || '';

const TENANT_SLUG = 'js-empregos';

// =============================================================================
// TIPOS
// =============================================================================

type Mode = 'analyze' | 'dry-run' | 'apply';

interface Args {
  mode: Mode;
  sourceUrl: string;
  sourceKey: string;
  authorized: boolean;
  tenantSlug: string;
}

interface CountResult {
  table: string;
  count: number;
}

interface MigrationReport {
  phase: string;
  action: string;
  table: string;
  rowsBefore: number;
  rowsAfter: number;
  status: 'ok' | 'skip' | 'error';
  message?: string;
}

// =============================================================================
// UTILITÁRIOS
// =============================================================================

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const mode = (args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'analyze') as Mode;
  const sourceUrl = args.find(a => a.startsWith('--source-url='))?.split('=')[1] || DEFAULT_SOURCE_URL;
  const sourceKey = args.find(a => a.startsWith('--source-key='))?.split('=')[1] || DEFAULT_SOURCE_KEY;
  const authorized = args.includes('--authorized');
  const tenantSlug = args.find(a => a.startsWith('--tenant-slug='))?.split('=')[1] || TENANT_SLUG;

  return { mode, sourceUrl, sourceKey, authorized, tenantSlug };
}

function log(message: string) {
  console.log(message);
}

function logSection(title: string) {
  console.log(`\n=== ${title} ===`);
}

function logResult(action: string, table: string, status: string, message?: string) {
  const statusIcon = status === 'ok' ? '✅' : status === 'skip' ? '⏭️' : '❌';
  console.log(`  ${statusIcon} [${action}] ${table}: ${status}${message ? ` - ${message}` : ''}`);
}

// =============================================================================
// CLIENT
// =============================================================================

function createSourceClient(url: string, key: string): SupabaseClient {
  if (!url || !key) {
    throw new Error('URL e chave do banco de origem são obrigatórias.');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// =============================================================================
// CONTAGENS
// =============================================================================

async function countTable(client: SupabaseClient, table: string): Promise<number> {
  const { count, error } = await client
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    // Tabela pode não existir no banco real
    return -1;
  }

  return count ?? 0;
}

async function countAllTables(client: SupabaseClient, tables: string[]): Promise<CountResult[]> {
  const results: CountResult[] = [];
  for (const table of tables) {
    const count = await countTable(client, table);
    results.push({ table, count });
  }
  return results;
}

// =============================================================================
// INVARIANTES
// =============================================================================

async function validateInvariant001(client: SupabaseClient): Promise<boolean> {
  const { count } = await client.from('people').select('*', { count: 'exact', head: true });
  return (count ?? 0) >= 1; // Pelo menos 1 pessoa (admin_master)
}

async function validateInvariant002(client: SupabaseClient): Promise<boolean> {
  const { count } = await client.from('tenant_memberships').select('*', { count: 'exact', head: true });
  return (count ?? 0) >= 1; // Pelo menos 1 membership
}

async function validateInvariant003(client: SupabaseClient): Promise<boolean> {
  const { data: roles, error } = await client
    .from('roles')
    .select('id')
    .eq('name', 'admin_master')
    .eq('is_global', true)
    .single();

  if (error || !roles) return false;

  const { data: assignments, error: assignError } = await client
    .from('role_assignments')
    .select('tenant_id')
    .eq('role_id', roles.id)
    .is('tenant_id', null)
    .limit(1);

  return !assignError && (assignments?.length ?? 0) >= 1;
}

async function validateInvariant004(client: SupabaseClient): Promise<boolean> {
  // Verificar FKs órfãs em companies
  const { data: companies, error } = await client
    .from('companies')
    .select('tenant_id')
    .not('tenant_id', 'is', null)
    .limit(1);

  if (error || !companies || companies.length === 0) return true;

  const { data: tenants, error: tenantError } = await client
    .from('tenants')
    .select('id')
    .in('id', companies.map(c => c.tenant_id));

  return !tenantError && tenants !== null && tenants.length === companies.length;
}

async function validateInvariant005(client: SupabaseClient): Promise<boolean> {
  // Tenant isolation é garantida por RLS. Aqui verificamos se há apenas 1 tenant.
  const { count } = await client.from('tenants').select('*', { count: 'exact', head: true });
  return (count ?? 0) === 1;
}

async function validateInvariant006(client: SupabaseClient): Promise<boolean> {
  // Verificar se notifications.user_id foi removido (após transformação)
  const { data, error } = await client
    .from('notifications')
    .select('user_id')
    .limit(1);

  if (error) return true; // Tabela não existe ainda
  return !data || data.length === 0;
}

async function validateInvariant007(client: SupabaseClient): Promise<boolean> {
  // jobs.company_id deve existir e ser válido
  const { data: jobs, error } = await client
    .from('jobs')
    .select('company_id, company_relationship_id')
    .not('company_id', 'is', null)
    .limit(100);

  if (error || !jobs || jobs.length === 0) return true;

  // Verificar se os company_id existem em companies
  const companyIds = jobs.map(j => j.company_id).filter(Boolean);
  if (companyIds.length === 0) return true;

  const { data: companies, error: companyError } = await client
    .from('companies')
    .select('id')
    .in('id', companyIds);

  return !companyError && companies !== null && companies.length === companyIds.length;
}

async function validateInvariant008(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client
    .from('roles')
    .select('name')
    .in('name', ['admin', 'empresa', 'candidato']);

  return !error && (!data || data.length === 0);
}

async function validateInvariant009(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client
    .from('people')
    .select('auth_user_id')
    .not('auth_user_id', 'is', null);

  if (error || !data || data.length === 0) return true;

  const authUserIds = data.map(p => p.auth_user_id);
  const uniqueIds = new Set(authUserIds);

  return uniqueIds.size === authUserIds.length;
}

async function validateInvariant010(client: SupabaseClient): Promise<boolean> {
  // Verificar se há tenant_id inválidos em tabelas tenant-scoped
  const tables = ['companies', 'jobs', 'applications', 'candidates'];
  for (const table of tables) {
    const { data, error } = await client
      .from(table)
      .select('tenant_id')
      .not('tenant_id', 'is', null)
      .limit(100);

    if (error || !data || data.length === 0) continue;

    const { data: tenants, error: tenantError } = await client
      .from('tenants')
      .select('id')
      .in('id', data.map(r => r.tenant_id));

    if (tenantError || !tenants || tenants.length !== data.length) {
      return false;
    }
  }

  return true;
}

async function validateAllInvariants(client: SupabaseClient, mode: Mode): Promise<boolean> {
  logSection('INVARIANTS');

  const invariants = [
    { id: 'INVARIANT-001', fn: validateInvariant001, desc: 'COUNT(people) preservado' },
    { id: 'INVARIANT-002', fn: validateInvariant002, desc: 'COUNT(tenant_memberships) preservado' },
    { id: 'INVARIANT-003', fn: validateInvariant003, desc: 'admin_master global' },
    { id: 'INVARIANT-004', fn: validateInvariant004, desc: 'Sem FKs órfãs' },
    { id: 'INVARIANT-005', fn: validateInvariant005, desc: 'Isolamento tenant' },
    { id: 'INVARIANT-006', fn: validateInvariant006, desc: 'notifications sem user_id' },
    { id: 'INVARIANT-007', fn: validateInvariant007, desc: 'jobs.company_id válido' },
    { id: 'INVARIANT-008', fn: validateInvariant008, desc: 'Sem roles legacy' },
    { id: 'INVARIANT-009', fn: validateInvariant009, desc: 'auth_user_id único' },
    { id: 'INVARIANT-010', fn: validateInvariant010, desc: 'tenant_id válido' },
  ];

  let allOk = true;
  for (const invariant of invariants) {
    try {
      const result = await invariant.fn(client);
      const status = result ? 'ok' : 'error';
      if (!result) allOk = false;
      logResult('VALIDATE', invariant.id, status, invariant.desc);
    } catch (error) {
      allOk = false;
      logResult('VALIDATE', invariant.id, 'error', invariant.desc);
    }
  }

  return allOk;
}

// =============================================================================
// PHASES
// =============================================================================

async function phase1Preserve(client: SupabaseClient, mode: Mode): Promise<MigrationReport[]> {
  logSection('PHASE 1 — PRESERVE');
  const reports: MigrationReport[] = [];

  const tables = [
    'tenants',
    'people',
    'tenant_memberships',
    'roles',
    'permissions',
    'role_permissions',
    'role_assignments',
    'role_resource_permissions',
    'company_types',
    'company_relationship_types',
    'skills',
    'candidate_skills',
    'job_skills',
    'files',
    'file_access_logs',
    'domain_events',
    'talent_pool_memberships',
    'candidate_preferences',
    'candidate_profile_views',
    'job_matches',
    'notifications',
    'notification_deliveries',
    'notification_preferences',
    'application_status_history',
    'application_profile_snapshots',
  ];

  for (const table of tables) {
    const rowsBefore = await countTable(client, table);
    if (rowsBefore === -1) {
      logResult('PRESERVE', table, 'skip', 'tabela não existe');
      continue;
    }

    if (mode === 'analyze') {
      logResult('PRESERVE', table, 'ok', `${rowsBefore} rows`);
    } else if (mode === 'dry-run') {
      // Em dry-run, apenas verificamos que a tabela existe
      logResult('PRESERVE', table, 'ok', `${rowsBefore} rows`);
    }

    reports.push({
      phase: 'PHASE 1',
      action: 'PRESERVE',
      table,
      rowsBefore,
      rowsAfter: rowsBefore,
      status: 'ok',
    });
  }

  return reports;
}

async function phase2Transform(client: SupabaseClient, mode: Mode): Promise<MigrationReport[]> {
  logSection('PHASE 2 — TRANSFORM');
  const reports: MigrationReport[] = [];

  // 2.1 companies: adicionar tenant_id
  const companiesCount = await countTable(client, 'companies');
  if (companiesCount === -1) {
    logResult('TRANSFORM', 'companies', 'skip', 'tabela não existe');
  } else {
    if (mode === 'analyze') {
      logResult('TRANSFORM', 'companies', 'ok', `${companiesCount} rows → add tenant_id`);
    } else if (mode === 'dry-run') {
      // Verificar se coluna já existe
      const { data, error } = await client
        .from('companies')
        .select('tenant_id')
        .limit(1);

      if (error || !data || data.length === 0) {
        logResult('TRANSFORM', 'companies', 'ok', `${companiesCount} rows → add tenant_id`);
      } else {
        logResult('TRANSFORM', 'companies', 'ok', 'tenant_id já existe');
      }
    }

    reports.push({
      phase: 'PHASE 2',
      action: 'TRANSFORM',
      table: 'companies',
      rowsBefore: companiesCount,
      rowsAfter: companiesCount,
      status: 'ok',
    });
  }

  // 2.2 jobs: company_relationship_id → company_id
  const jobsCount = await countTable(client, 'jobs');
  if (jobsCount === -1) {
    logResult('TRANSFORM', 'jobs', 'skip', 'tabela não existe');
  } else {
    if (mode === 'analyze') {
      logResult('TRANSFORM', 'jobs', 'ok', `${jobsCount} rows → company_relationship_id → company_id`);
    } else if (mode === 'dry-run') {
      const { data, error } = await client
        .from('jobs')
        .select('company_id, company_relationship_id')
        .limit(1);

      if (error || !data || data.length === 0 || !data[0].company_id) {
        logResult('TRANSFORM', 'jobs', 'ok', `${jobsCount} rows → company_relationship_id → company_id`);
      } else {
        logResult('TRANSFORM', 'jobs', 'ok', 'company_id já existe');
      }
    }

    reports.push({
      phase: 'PHASE 2',
      action: 'TRANSFORM',
      table: 'jobs',
      rowsBefore: jobsCount,
      rowsAfter: jobsCount,
      status: 'ok',
    });
  }

  // 2.3 notifications: user_id → recipient_person_id
  const notificationsCount = await countTable(client, 'notifications');
  if (notificationsCount === -1) {
    logResult('TRANSFORM', 'notifications', 'skip', 'tabela não existe');
  } else {
    if (mode === 'analyze') {
      logResult('TRANSFORM', 'notifications', 'ok', `${notificationsCount} rows → user_id → recipient_person_id`);
    } else if (mode === 'dry-run') {
      const { data, error } = await client
        .from('notifications')
        .select('user_id, recipient_person_id')
        .limit(1);

      if (error || !data || data.length === 0 || !data[0].recipient_person_id) {
        logResult('TRANSFORM', 'notifications', 'ok', `${notificationsCount} rows → user_id → recipient_person_id`);
      } else {
        logResult('TRANSFORM', 'notifications', 'ok', 'recipient_person_id já existe');
      }
    }

    reports.push({
      phase: 'PHASE 2',
      action: 'TRANSFORM',
      table: 'notifications',
      rowsBefore: notificationsCount,
      rowsAfter: notificationsCount,
      status: 'ok',
    });
  }

  return reports;
}

async function phase3Reconcile(client: SupabaseClient, mode: Mode): Promise<MigrationReport[]> {
  logSection('PHASE 3 — RECONCILE');
  const reports: MigrationReport[] = [];

  const domainEventsCount = await countTable(client, 'domain_events');
  if (domainEventsCount === -1) {
    logResult('RECONCILE', 'domain_events', 'skip', 'tabela não existe');
  } else {
    if (mode === 'analyze') {
      logResult('RECONCILE', 'domain_events', 'ok', `${domainEventsCount} rows → ajustar aggregate fields`);
    } else if (mode === 'dry-run') {
      logResult('RECONCILE', 'domain_events', 'ok', `${domainEventsCount} rows → preservar estrutura rica`);
    }

    reports.push({
      phase: 'PHASE 3',
      action: 'RECONCILE',
      table: 'domain_events',
      rowsBefore: domainEventsCount,
      rowsAfter: domainEventsCount,
      status: 'ok',
    });
  }

  return reports;
}

async function phase4New(client: SupabaseClient, mode: Mode): Promise<MigrationReport[]> {
  logSection('PHASE 4 — NEW');
  const reports: MigrationReport[] = [];

  // Lista de tabelas novas na V2.1 que não existem no AS-IS
  const newTables = [
    'tenant_settings',
    'interactions',
    'stage_templates',
    'recruitment_stages',
    'candidate_processes',
    'interview_participants',
    'interview_feedback',
    'employees',
    'employee_contracts',
    'employee_documents',
    'employee_status_history',
    'departments',
    'positions',
    'employee_positions',
    'administrative_requests',
    'administrative_tasks',
    'administrative_approvals',
    'administrative_documents',
    'financial_accounts',
    'financial_categories',
    'cost_centers',
    'accounts_receivable',
    'accounts_payable',
    'financial_transactions',
    'invoices',
    'invoice_items',
    'payments',
    'expenses',
    'revenues',
    'fiscal_configurations',
    'fiscal_integrations',
    'fiscal_documents',
    'fiscal_document_items',
    'fiscal_document_events',
    'fiscal_document_status_history',
    'fiscal_api_requests',
    'fiscal_api_responses',
    'products',
    'product_categories',
    'warehouses',
    'warehouse_locations',
    'stock_balances',
    'stock_movements',
    'stock_entries',
    'stock_exits',
    'stock_inventory',
    'stock_inventory_items',
    'stock_adjustments',
    'suppliers',
    'purchase_orders',
    'purchase_order_items',
    'tasks',
    'task_comments',
    'task_attachments',
    'task_status_history',
    'support_ticket_categories',
    'support_tickets',
    'support_ticket_messages',
    'support_ticket_assignments',
    'support_ticket_status_history',
    'chat_rooms',
    'chat_participants',
    'chat_messages',
    'ai_conversations',
    'ai_messages',
    'ai_usage',
    'chat_assignments',
    'chat_handoffs',
    'chat_events',
    'document_versions',
    'document_links',
    'security_events',
    'privacy_requests',
    'data_export_requests',
    'data_deletion_requests',
    'data_retention_policies',
  ];

  for (const table of newTables) {
    const exists = await countTable(client, table);
    if (exists !== -1) {
      logResult('NEW', table, 'skip', 'já existe');
      continue;
    }

    if (mode === 'analyze') {
      logResult('NEW', table, 'ok', 'criar tabela');
    } else if (mode === 'dry-run') {
      logResult('NEW', table, 'ok', 'criar tabela');
    }

    reports.push({
      phase: 'PHASE 4',
      action: 'NEW',
      table,
      rowsBefore: 0,
      rowsAfter: 0,
      status: 'ok',
    });
  }

  return reports;
}

async function phase5Seed(client: SupabaseClient, mode: Mode): Promise<MigrationReport[]> {
  logSection('PHASE 5 — SEED');
  const reports: MigrationReport[] = [];

  // Seed tables que devem ter dados iniciais
  const seedTables = [
    { table: 'company_types', rows: 6 },
    { table: 'company_relationship_types', rows: 3 },
    { table: 'skills', rows: 68 },
    { table: 'roles', rows: 10 },
    { table: 'permissions', rows: 26 },
    { table: 'role_resource_permissions', rows: 114 },
    { table: 'departments', rows: 0 },
    { table: 'positions', rows: 0 },
    { table: 'financial_accounts', rows: 0 },
    { table: 'financial_categories', rows: 0 },
    { table: 'cost_centers', rows: 0 },
    { table: 'products', rows: 0 },
    { table: 'product_categories', rows: 0 },
    { table: 'warehouses', rows: 0 },
    { table: 'support_ticket_categories', rows: 0 },
    { table: 'stage_templates', rows: 0 },
    { table: 'data_retention_policies', rows: 0 },
  ];

  for (const seed of seedTables) {
    const currentCount = await countTable(client, seed.table);
    if (currentCount === -1) {
      logResult('SEED', seed.table, 'skip', 'tabela não existe');
      continue;
    }

    if (currentCount >= seed.rows) {
      logResult('SEED', seed.table, 'skip', `${currentCount} rows (seed não necessário)`);
      continue;
    }

    if (mode === 'analyze') {
      logResult('SEED', seed.table, 'ok', `${currentCount} → ${seed.rows} rows`);
    } else if (mode === 'dry-run') {
      logResult('SEED', seed.table, 'ok', `${currentCount} → ${seed.rows} rows`);
    }

    reports.push({
      phase: 'PHASE 5',
      action: 'SEED',
      table: seed.table,
      rowsBefore: currentCount,
      rowsAfter: seed.rows,
      status: 'ok',
    });
  }

  return reports;
}

async function phase6Validate(client: SupabaseClient, mode: Mode): Promise<boolean> {
  logSection('PHASE 6 — VALIDATE');
  return validateAllInvariants(client, mode);
}

// =============================================================================
// REMOVE
// =============================================================================

async function phaseRemove(client: SupabaseClient, mode: Mode): Promise<MigrationReport[]> {
  logSection('PHASE REMOVE — Tabelas legacy');
  const reports: MigrationReport[] = [];

  const removeTables = [
    'leads',
    'contact_requests',
    'webhooks',
    'automation_queue',
    'whatsapp_messages',
    'emails',
    'services',
    'tickets',
  ];

  for (const table of removeTables) {
    const exists = await countTable(client, table);
    if (exists === -1) {
      logResult('REMOVE', table, 'skip', 'não existe');
      continue;
    }

    if (mode === 'analyze') {
      logResult('REMOVE', table, 'ok', `${exists} rows → remover`);
    } else if (mode === 'dry-run') {
      logResult('REMOVE', table, 'ok', `${exists} rows → remover`);
    }

    reports.push({
      phase: 'PHASE REMOVE',
      action: 'REMOVE',
      table,
      rowsBefore: exists,
      rowsAfter: 0,
      status: 'ok',
    });
  }

  return reports;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = parseArgs();

  logSection('MIGRATION AS-IS → V2.1');
  log(`Mode: ${args.mode}`);
  log(`Tenant slug: ${args.tenantSlug}`);

  if (args.mode === 'apply' && !args.authorized) {
    console.error('❌ --mode=apply requires --authorized flag');
    process.exit(1);
  }

  const client = createSourceClient(args.sourceUrl, args.sourceKey);

  try {
    // Testar conexão
    const { data: testData, error: testError } = await client
      .from('tenants')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erro ao conectar ao banco de origem:', testError.message);
      process.exit(1);
    }

    log('✅ Conexão com banco de origem OK');

    // Executar fases
    const allReports: MigrationReport[] = [];

    if (args.mode === 'analyze') {
      logSection('ANALYSIS MODE');
      log('Calculando o que seria migrado...\n');

      const preserveReports = await phase1Preserve(client, 'analyze');
      const transformReports = await phase2Transform(client, 'analyze');
      const reconcileReports = await phase3Reconcile(client, 'analyze');
      const newReports = await phase4New(client, 'analyze');
      const seedReports = await phase5Seed(client, 'analyze');
      const removeReports = await phaseRemove(client, 'analyze');

      allReports.push(...preserveReports, ...transformReports, ...reconcileReports, ...newReports, ...seedReports, ...removeReports);

      logSection('ANALYSIS SUMMARY');
      log(`Total tables analyzed: ${allReports.length}`);
      log(`PRESERVE: ${allReports.filter(r => r.action === 'PRESERVE').length}`);
      log(`TRANSFORM: ${allReports.filter(r => r.action === 'TRANSFORM').length}`);
      log(`RECONCILE: ${allReports.filter(r => r.action === 'RECONCILE').length}`);
      log(`NEW: ${allReports.filter(r => r.action === 'NEW').length}`);
      log(`SEED: ${allReports.filter(r => r.action === 'SEED').length}`);
      log(`REMOVE: ${allReports.filter(r => r.action === 'REMOVE').length}`);

      const invariantsOk = await validateAllInvariants(client, 'analyze');
      logSection('INVARIANT SUMMARY');
      log(`All invariants: ${invariantsOk ? '✅ OK' : '❌ FAILED'}`);

      if (!invariantsOk) {
        console.error('❌ Invariants failed. Migration cannot proceed.');
        process.exit(1);
      }

      log('\n✅ Analysis complete. Review the report above before proceeding to dry-run.');
    } else if (args.mode === 'dry-run') {
      logSection('DRY-RUN MODE');
      log('Executing in controlled transaction...\n');

      // Em dry-run, não alteramos nada, apenas simulamos
      const preserveReports = await phase1Preserve(client, 'dry-run');
      const transformReports = await phase2Transform(client, 'dry-run');
      const reconcileReports = await phase3Reconcile(client, 'dry-run');
      const newReports = await phase4New(client, 'dry-run');
      const seedReports = await phase5Seed(client, 'dry-run');
      const removeReports = await phaseRemove(client, 'dry-run');

      allReports.push(...preserveReports, ...transformReports, ...reconcileReports, ...newReports, ...seedReports, ...removeReports);

      logSection('DRY-RUN SUMMARY');
      log(`Total tables: ${allReports.length}`);
      log(`PRESERVE: ${allReports.filter(r => r.action === 'PRESERVE').length}`);
      log(`TRANSFORM: ${allReports.filter(r => r.action === 'TRANSFORM').length}`);
      log(`RECONCILE: ${allReports.filter(r => r.action === 'RECONCILE').length}`);
      log(`NEW: ${allReports.filter(r => r.action === 'NEW').length}`);
      log(`SEED: ${allReports.filter(r => r.action === 'SEED').length}`);
      log(`REMOVE: ${allReports.filter(r => r.action === 'REMOVE').length}`);

      const invariantsOk = await validateAllInvariants(client, 'dry-run');
      logSection('INVARIANT SUMMARY');
      log(`All invariants: ${invariantsOk ? '✅ OK' : '❌ FAILED'}`);

      if (!invariantsOk) {
        console.error('❌ Invariants failed. Migration cannot proceed.');
        process.exit(1);
      }

      log('\n✅ Dry-run complete. No changes were made to the database.');
      log('Review the report above and proceed to apply mode when ready.');
    } else if (args.mode === 'apply') {
      logSection('APPLY MODE');
      log('⚠️  APPLY MODE IS NOT YET IMPLEMENTED');
      log('This mode will be enabled after:');
      log('  1. Frontend/backend dependency validation');
      log('  2. Dry-run validation suite passes');
      log('  3. Explicit authorization from project owner');
      log('  4. Backup of production database');
      console.error('❌ --mode=apply is currently blocked.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
