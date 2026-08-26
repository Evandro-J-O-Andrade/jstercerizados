const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'docs', 'rbac');

const roles = JSON.parse(fs.readFileSync(path.join(dir, 'roles.json'), 'utf8'));
const permissions = JSON.parse(fs.readFileSync(path.join(dir, 'permissions.json'), 'utf8'));
const rolePerms = JSON.parse(fs.readFileSync(path.join(dir, 'role-permissions.json'), 'utf8'));
const people = JSON.parse(fs.readFileSync(path.join(dir, 'people.json'), 'utf8'));
const memberships = JSON.parse(fs.readFileSync(path.join(dir, 'tenant-memberships.json'), 'utf8'));
const tenants = JSON.parse(fs.readFileSync(path.join(dir, 'tenants.json'), 'utf8'));

const permMap = new Map(permissions.map(p => [p.id, p]));
const roleMap = new Map(roles.map(r => [r.id, r]));
const peopleMap = new Map(people.map(p => [p.id, p]));
const tenantMap = new Map(tenants.map(t => [t.id, t]));

const rolePermMap = new Map();
for (const rp of rolePerms) {
  if (!rolePermMap.has(rp.role_id)) rolePermMap.set(rp.role_id, []);
  rolePermMap.get(rp.role_id).push(rp.permission_id);
}

const personRoles = [];
for (const m of memberships) {
  const person = peopleMap.get(m.person_id);
  const role = roleMap.get(m.role_id);
  const tenant = tenantMap.get(m.tenant_id);
  personRoles.push({
    personId: m.person_id,
    personName: person?.full_name || 'Unknown',
    personEmail: person?.email || 'Unknown',
    roleId: m.role_id,
    roleName: role?.name || 'Unknown',
    roleScope: role?.scope || 'Unknown',
    tenantId: m.tenant_id,
    tenantName: tenant?.name || 'Unknown',
    membershipStatus: m.status,
  });
}

const rolePermissions = {};
for (const [roleId, permIds] of rolePermMap) {
  const role = roleMap.get(roleId);
  const perms = permIds.map(id => permMap.get(id)).filter(Boolean);
  rolePermissions[roleId] = {
    roleName: role?.name || 'Unknown',
    roleScope: role?.scope || 'Unknown',
    permissions: perms.map(p => ({
      id: p.id,
      resource: p.resource,
      action: p.action,
      description: p.description,
      name: p.name,
    })),
  };
}

const output = {
  roles: roles.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    scope: r.scope,
    permissionCount: (rolePermMap.get(r.id) || []).length,
  })),
  peopleByRole: personRoles,
  rolePermissions,
  totalPermissions: permissions.length,
  totalRoles: roles.length,
};

fs.writeFileSync(
  path.join(process.cwd(), 'docs', 'PORTAL-RBAC-MATRIX-ANALYSIS.json'),
  JSON.stringify(output, null, 2)
);

console.log('Generated PORTAL-RBAC-MATRIX-ANALYSIS.json');
