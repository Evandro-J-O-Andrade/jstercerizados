/**
 * scripts/reconcile-roles.ts
 *
 * Creates missing tenant roles and assigns permissions from ModuleRegistry.
 *
 * Uso:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SECRET_KEY=sb_secret_xxx \
 *   npx tsx scripts/reconcile-roles.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnvFile(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('='))
        continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  } catch {
    // ignore
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing required env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

const ROLE_PERMISSIONS: Record<string, string[]> = {
  tenant_admin: [
    'dashboard.read',
    'companies.read',
    'companies.create',
    'companies.update',
    'companies.delete',
    'people.read',
    'people.create',
    'people.update',
    'people.delete',
    'roles.read',
    'roles.create',
    'roles.update',
    'permissions.read',
    'audit.read',
    'audit.export',
    'files.read',
    'files.create',
    'files.update',
    'files.delete',
    'contracts.read',
    'contracts.create',
    'contracts.update',
    'contracts.renew',
    'documents.read',
    'documents.update',
    'documents.publish',
    'jobs.read',
    'jobs.create',
    'jobs.update',
    'jobs.publish',
    'jobs.archive',
    'candidates.read',
    'candidates.create',
    'candidates.update',
    'candidates.delete',
    'applications.read',
    'applications.create',
    'applications.update',
    'applications.reject',
    'applications.approve',
    'finance.dashboard.read',
    'finance.accounts_payable.read',
    'finance.accounts_payable.create',
    'finance.accounts_payable.update',
    'finance.accounts_payable.delete',
    'finance.accounts_receivable.read',
    'finance.accounts_receivable.create',
    'finance.accounts_receivable.update',
    'finance.accounts_receivable.delete',
    'finance.cashflow.read',
    'finance.billing.read',
    'finance.billing.create',
    'finance.billing.update',
    'finance.billing.cancel',
    'finance.reports.read',
    'finance.reports.export',
    'finance.suppliers.read',
    'fiscal.dashboard.read',
    'fiscal.invoices.read',
    'fiscal.invoices.issue',
    'fiscal.invoices.cancel',
    'fiscal.invoices.void',
    'fiscal.taxes.read',
    'fiscal.reports.read',
    'fiscal.reports.export',
    'accounting.dashboard.read',
    'accounting.chart_of_accounts.read',
    'accounting.chart_of_accounts.create',
    'accounting.chart_of_accounts.update',
    'accounting.chart_of_accounts.delete',
    'accounting.entries.read',
    'accounting.entries.create',
    'accounting.entries.update',
    'accounting.entries.delete',
    'accounting.trial_balance.read',
    'accounting.reconciliation.read',
    'accounting.reports.read',
    'accounting.reports.export',
    'products.read',
    'products.create',
    'products.update',
    'products.delete',
    'stock_movements.read',
    'stock_movements.create',
    'stock_movements.export',
    'service_orders.read',
    'service_orders.create',
    'service_orders.update',
    'service_orders.complete',
    'service_orders.cancel',
    'support_tickets.read',
    'support_tickets.create',
    'support_tickets.update',
    'support_tickets.resolve',
    'support_tickets.close',
    'reports.read',
    'reports.generate',
    'reports.export',
    'integrations.manage',
    'integrations.create',
    'integrations.update',
    'integrations.delete',
    'integrations.test',
    'tenant.manage',
    'tenant.update',
  ],
  finance_manager: [
    'dashboard.read',
    'finance.dashboard.read',
    'finance.accounts_payable.read',
    'finance.accounts_payable.create',
    'finance.accounts_payable.update',
    'finance.accounts_payable.delete',
    'finance.accounts_receivable.read',
    'finance.accounts_receivable.create',
    'finance.accounts_receivable.update',
    'finance.accounts_receivable.delete',
    'finance.cashflow.read',
    'finance.billing.read',
    'finance.billing.create',
    'finance.billing.update',
    'finance.billing.cancel',
    'finance.reports.read',
    'finance.reports.export',
    'finance.suppliers.read',
    'fiscal.dashboard.read',
    'fiscal.invoices.read',
    'fiscal.invoices.issue',
    'accounting.dashboard.read',
    'reports.read',
    'reports.generate',
    'reports.export',
    'companies.read',
    'people.read',
    'files.read',
  ],
  finance: [
    'dashboard.read',
    'finance.dashboard.read',
    'finance.accounts_payable.read',
    'finance.accounts_payable.create',
    'finance.accounts_payable.update',
    'finance.accounts_receivable.read',
    'finance.accounts_receivable.create',
    'finance.accounts_receivable.update',
    'finance.billing.read',
    'finance.billing.create',
    'finance.billing.update',
    'finance.billing.read',
    'finance.billing.create',
    'finance.billing.update',
    'fiscal.dashboard.read',
    'fiscal.invoices.read',
    'reports.read',
    'companies.read',
    'people.read',
    'files.read',
  ],
  fiscal_manager: [
    'dashboard.read',
    'fiscal.dashboard.read',
    'fiscal.invoices.read',
    'fiscal.invoices.issue',
    'fiscal.invoices.cancel',
    'fiscal.invoices.void',
    'fiscal.taxes.read',
    'fiscal.reports.read',
    'fiscal.reports.export',
    'accounting.dashboard.read',
    'finance.dashboard.read',
    'reports.read',
    'reports.generate',
    'reports.export',
    'companies.read',
    'people.read',
    'files.read',
  ],
  accountant: [
    'dashboard.read',
    'accounting.dashboard.read',
    'accounting.chart_of_accounts.read',
    'accounting.chart_of_accounts.create',
    'accounting.chart_of_accounts.update',
    'accounting.chart_of_accounts.delete',
    'accounting.entries.read',
    'accounting.entries.create',
    'accounting.entries.update',
    'accounting.entries.delete',
    'accounting.trial_balance.read',
    'accounting.reconciliation.read',
    'accounting.reports.read',
    'accounting.reports.export',
    'fiscal.dashboard.read',
    'fiscal.reports.export',
    'finance.dashboard.read',
    'finance.reports.export',
    'reports.read',
    'reports.generate',
    'reports.export',
    'companies.read',
    'files.read',
  ],
  accounting_manager: [
    'dashboard.read',
    'accounting.dashboard.read',
    'accounting.chart_of_accounts.read',
    'accounting.chart_of_accounts.create',
    'accounting.chart_of_accounts.update',
    'accounting.chart_of_accounts.delete',
    'accounting.entries.read',
    'accounting.entries.create',
    'accounting.entries.update',
    'accounting.entries.delete',
    'accounting.trial_balance.read',
    'accounting.reconciliation.read',
    'accounting.reports.read',
    'accounting.reports.export',
    'fiscal.dashboard.read',
    'finance.dashboard.read',
    'reports.read',
    'reports.generate',
    'reports.export',
    'companies.read',
    'people.read',
    'files.read',
  ],
  billing_manager: [
    'dashboard.read',
    'finance.billing.read',
    'finance.billing.create',
    'finance.billing.update',
    'finance.billing.cancel',
    'finance.dashboard.read',
    'finance.accounts_payable.read',
    'finance.accounts_payable.create',
    'finance.accounts_payable.update',
    'fiscal.dashboard.read',
    'fiscal.invoices.read',
    'fiscal.invoices.issue',
    'reports.read',
    'reports.generate',
    'reports.export',
    'companies.read',
    'people.read',
    'files.read',
  ],
  rh_manager: [
    'dashboard.read',
    'people.read',
    'people.create',
    'people.update',
    'people.export',
    'jobs.read',
    'jobs.create',
    'jobs.update',
    'jobs.publish',
    'jobs.archive',
    'candidates.read',
    'candidates.create',
    'candidates.update',
    'candidates.export',
    'applications.read',
    'applications.create',
    'applications.update',
    'applications.approve',
    'applications.reject',
    'applications.interview',
    'files.read',
    'files.create',
    'files.update',
    'files.delete',
    'reports.read',
    'reports.generate',
    'reports.export',
  ],
  recruiter: [
    'dashboard.read',
    'jobs.read',
    'jobs.create',
    'jobs.update',
    'jobs.publish',
    'jobs.archive',
    'candidates.read',
    'candidates.create',
    'candidates.update',
    'candidates.export',
    'applications.read',
    'applications.create',
    'applications.update',
    'applications.approve',
    'applications.reject',
    'applications.interview',
    'reports.read',
  ],
  support: [
    'dashboard.read',
    'support_tickets.read',
    'support_tickets.create',
    'support_tickets.update',
    'support_tickets.resolve',
    'support_tickets.close',
    'files.read',
    'people.read',
  ],
  commercial: [
    'dashboard.read',
    'companies.read',
    'companies.create',
    'companies.update',
    'contracts.read',
    'contracts.create',
    'contracts.update',
    'contracts.renew',
    'service_orders.read',
    'service_orders.create',
    'service_orders.update',
    'reports.read',
    'files.read',
  ],
  operations_manager: [
    'dashboard.read',
    'companies.read',
    'companies.create',
    'companies.update',
    'people.read',
    'people.create',
    'people.update',
    'products.read',
    'products.create',
    'products.update',
    'service_orders.read',
    'service_orders.create',
    'service_orders.update',
    'service_orders.complete',
    'stock_movements.read',
    'stock_movements.create',
    'purchase_orders.read',
    'purchase_orders.create',
    'purchase_orders.update',
    'purchase_receipts.read',
    'purchase_receipts.create',
    'support_tickets.read',
    'support_tickets.create',
    'support_tickets.update',
    'reports.read',
    'reports.generate',
    'reports.export',
    'files.read',
  ],
  stock_manager: [
    'dashboard.read',
    'products.read',
    'products.update',
    'stock_movements.read',
    'stock_movements.create',
    'purchase_orders.read',
    'purchase_orders.create',
    'purchase_receipts.read',
    'purchase_receipts.create',
    'reports.read',
  ],
  security_manager: [
    'dashboard.read',
    'people.read',
    'people.update',
    'security_events.read',
    'files.read',
  ],
  facilities_manager: [
    'dashboard.read',
    'service_orders.read',
    'service_orders.create',
    'service_orders.update',
    'service_orders.complete',
    'tasks.read',
    'tasks.create',
    'tasks.update',
    'tasks.assign',
    'files.read',
  ],
  lawyer: [
    'dashboard.read',
    'contracts.read',
    'contracts.create',
    'contracts.update',
    'documents.read',
    'documents.create',
    'documents.update',
    'documents.version',
    'files.read',
    'people.read',
  ],
  it_admin: [
    'dashboard.read',
    'people.read',
    'people.create',
    'people.update',
    'roles.read',
    'roles.create',
    'roles.update',
    'files.read',
    'files.create',
    'files.update',
  ],
  viewer: [
    'dashboard.read',
    'companies.read',
    'contracts.read',
    'documents.read',
    'files.read',
    'people.read',
    'products.read',
    'purchase_orders.read',
    'purchase_receipts.read',
    'reports.read',
    'service_orders.read',
    'stock_movements.read',
    'support_tickets.read',
    'tasks.read',
  ],
};

const REQUIRED_ROLES = [
  'finance_manager',
  'fiscal_manager',
  'accountant',
  'accounting_manager',
  'billing_manager',
];

async function reconcile() {
  console.log('[ROLE-SYNC] Starting...\n');

  const { data: existingRoles } = await supabase
    .from('roles')
    .select('id, name, scope')
    .eq('scope', 'tenant');

  const existingMap = new Map((existingRoles || []).map((r) => [r.name, r]));

  let createdRoles = 0;
  let updatedRoles = 0;

  for (const roleName of REQUIRED_ROLES) {
    if (existingMap.has(roleName)) {
      updatedRoles++;
      existingMap.delete(roleName);
      continue;
    }

    const { error } = await supabase.from('roles').insert({
      name: roleName,
      scope: 'tenant',
      description: roleName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    });

    if (error) {
      console.error(`Failed to create role ${roleName}:`, error.message);
    } else {
      createdRoles++;
      console.log(`  Created role: ${roleName}`);
    }
  }

  console.log(
    `\n[ROLE-SYNC] Roles: created=${createdRoles}, updated=${updatedRoles}`,
  );

  const { data: allRoles } = await supabase
    .from('roles')
    .select('id, name, scope')
    .eq('scope', 'tenant');

  const roleMap = new Map((allRoles || []).map((r) => [r.name, r]));

  const { data: allPermissions } = await supabase
    .from('permissions')
    .select('id, resource, action');

  const permMap = new Map(
    (allPermissions || []).map((p) => [`${p.resource}.${p.action}`, p.id]),
  );

  let permCreated = 0;
  let permSkipped = 0;

  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleMap.get(roleName);
    if (!role) {
      console.log(`  Skipping ${roleName}: role not found`);
      continue;
    }

    const { data: existingRolePerms } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', role.id);

    const existingPermIds = new Set(
      (existingRolePerms || []).map((rp) => rp.permission_id),
    );

    for (const permKey of perms) {
      const permId = permMap.get(permKey);
      if (!permId) {
        console.log(
          `  Skipping ${roleName} -> ${permKey}: permission not found`,
        );
        continue;
      }

      if (existingPermIds.has(permId)) {
        permSkipped++;
        continue;
      }

      const { error } = await supabase.from('role_permissions').insert({
        role_id: role.id,
        permission_id: permId,
      });

      if (error) {
        console.error(
          `  Failed to assign ${permKey} to ${roleName}:`,
          error.message,
        );
      } else {
        permCreated++;
      }
    }
  }

  console.log(
    `\n[ROLE-SYNC] Permissions: created=${permCreated}, skipped=${permSkipped}`,
  );
  console.log('[ROLE-SYNC] Completed');
}

reconcile().catch((err) => {
  console.error('Role sync failed:', err.message || err);
  process.exit(1);
});
