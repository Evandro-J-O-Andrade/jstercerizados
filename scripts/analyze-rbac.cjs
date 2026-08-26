const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function analyze() {
  const [
    { data: people },
    { data: tenants },
    { data: memberships },
    { data: roles },
    { data: rolePerms },
    { data: perms },
  ] = await Promise.all([
    supabase.from('people').select('id,auth_user_id,full_name,email,status'),
    supabase.from('tenants').select('id,name,status'),
    supabase.from('tenant_memberships').select('id,person_id,tenant_id,role_id,status'),
    supabase.from('roles').select('id,name,description,scope'),
    supabase.from('role_permissions').select('role_id,permission_id'),
    supabase.from('permissions').select('id,resource,action,description,name'),
  ]);

  const roleMap = new Map((roles||[]).map(r => [r.id, r]));
  const permMap = new Map((perms||[]).map(p => [p.id, p]));
  const peopleMap = new Map((people||[]).map(p => [p.id, p]));
  const tenantMap = new Map((tenants||[]).map(t => [t.id, t]));

  const rolePermCounts = {};
  for (const rp of rolePerms || []) {
    rolePermCounts[rp.role_id] = (rolePermCounts[rp.role_id] || 0) + 1;
  }

  const peopleByRole = [];
  for (const membership of memberships || []) {
    const role = roleMap.get(membership.role_id);
    const person = peopleMap.get(membership.person_id);
    const tenant = tenantMap.get(membership.tenant_id);
    peopleByRole.push({
      personId: membership.person_id,
      personName: person?.full_name || null,
      personEmail: person?.email || null,
      roleId: membership.role_id,
      roleName: role?.name || null,
      roleScope: role?.scope || null,
      tenantId: membership.tenant_id,
      tenantName: tenant?.name || null,
      membershipStatus: membership.status,
    });
  }

  const report = {
    totalRoles: (roles||[]).length,
    totalPermissions: (perms||[]).length,
    totalRolePermissions: (rolePerms||[]).length,
    totalPeople: (people||[]).length,
    totalTenants: (tenants||[]).length,
    totalMemberships: (memberships||[]).length,
    roles: (roles||[]).map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      scope: r.scope,
      permissionCount: rolePermCounts[r.id] || 0,
    })),
    peopleByRole,
  };

  const dir = path.join(process.cwd(), 'docs');
  fs.writeFileSync(path.join(dir, 'PORTAL-RBAC-MATRIX-ANALYSIS.json'), JSON.stringify(report, null, 2));
  console.log('Analysis written to docs/PORTAL-RBAC-MATRIX-ANALYSIS.json');
}

analyze().catch(err => { console.error(err); process.exit(1); });
