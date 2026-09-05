/**
 * Audit script: extracts RBAC data from Supabase for matrix building.
 * Uses SUPABASE_SECRET_KEY for admin access.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnvFile(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (!process.env[key.trim()]) process.env[key.trim()] = value;
    }
  } catch {}
}

loadEnvFile('.env.provision');

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

async function queryAll(table: string) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`Error querying ${table}:`, error.message);
    return [];
  }
  return data || [];
}

async function main() {
  console.log('🔍 Auditing RBAC data...\n');

  const [roles, permissions, rolePermissions, roleAssignments, memberships, tenants] =
    await Promise.all([
      queryAll('roles'),
      queryAll('permissions'),
      queryAll('role_permissions'),
      queryAll('role_assignments'),
      queryAll('tenant_memberships'),
      queryAll('tenants'),
    ]);

  console.log('=== ROLES ===');
  for (const r of roles) {
    const permCount = rolePermissions.filter((rp) => rp.role_id === r.id).length;
    const assignCount = roleAssignments.filter((ra) => ra.role_id === r.id).length;
    console.log(
      `${r.id} | ${r.name.padEnd(25)} | scope=${r.scope.padEnd(6)} | perms=${String(permCount).padStart(3)} | assignments=${assignCount} | desc=${r.description || '-'}`,
    );
  }

  console.log('\n=== PERMISSIONS (grouped by module) ===');
  const moduleMap = new Map<string, typeof permissions>();
  for (const p of permissions) {
    const mod = (p as any).module || '(no module)';
    if (!moduleMap.has(mod)) moduleMap.set(mod, []);
    moduleMap.get(mod)!.push(p);
  }
  for (const [mod, perms] of moduleMap) {
    console.log(`\n[${mod}] (${perms.length} perms)`);
    for (const p of perms) {
      const name = (p as any).name || `${(p as any).resource}.${(p as any).action}`;
      console.log(`  ${p.id} | ${name}`);
    }
  }

  console.log('\n=== ROLE_PERMISSIONS (role -> permissions) ===');
  const rolePermMap = new Map<string, string[]>();
  for (const rp of rolePermissions) {
    const role = roles.find((r) => r.id === rp.role_id);
    const perm = permissions.find((p) => p.id === rp.permission_id);
    if (!role || !perm) continue;
    if (!rolePermMap.has(role.name)) rolePermMap.set(role.name, []);
    const permName = (perm as any).name || `${(perm as any).resource}.${(perm as any).action}`;
    rolePermMap.get(role.name)!.push(permName);
  }
  for (const [roleName, permNames] of rolePermMap) {
    console.log(`\n${roleName} (${permNames.length}):`);
    for (const pn of permNames.sort()) {
      console.log(`  - ${pn}`);
    }
  }

  console.log('\n=== ROLE_ASSIGNMENTS ===');
  for (const ra of roleAssignments) {
    const role = roles.find((r) => r.id === ra.role_id);
    const person = (await queryAll('people')).find((p) => p.id === ra.person_id);
    console.log(
      `${ra.id} | role=${role?.name || '?'} | person=${ra.person_id} | tenant=${ra.tenant_id || '(global)'} | status=${ra.status || '-'}`,
    );
  }

  console.log('\n=== TENANT_MEMBERSHIPS ===');
  const tenantMap = new Map(tenants.map((t) => [t.id, t.name]));
  for (const m of memberships) {
    console.log(
      `${m.id} | person=${m.person_id} | tenant=${m.tenant_id} (${tenantMap.get(m.tenant_id) || '?'}) | role=${m.role_id || '-'} | status=${m.status}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
