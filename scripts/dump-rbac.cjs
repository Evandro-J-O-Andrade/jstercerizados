const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function dumpAll() {
  const [
    { data: users },
    { data: people },
    { data: tenants },
    { data: memberships },
    { data: roles },
    { data: rolePerms },
    { data: perms },
    { data: firstLogin },
  ] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('people').select('*'),
    supabase.from('tenants').select('*'),
    supabase.from('tenant_memberships').select('*'),
    supabase.from('roles').select('*'),
    supabase.from('role_permissions').select('*'),
    supabase.from('permissions').select('*'),
    supabase.from('first_login_state').select('*'),
  ]);

  const dir = path.join(process.cwd(), 'docs', 'rbac');
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    path.join(dir, 'auth-users.json'),
    JSON.stringify(users?.users || [], null, 2)
  );

  fs.writeFileSync(
    path.join(dir, 'people.json'),
    JSON.stringify(people || [], null, 2)
  );

  fs.writeFileSync(
    path.join(dir, 'tenants.json'),
    JSON.stringify(tenants || [], null, 2)
  );

  fs.writeFileSync(
    path.join(dir, 'tenant-memberships.json'),
    JSON.stringify(memberships || [], null, 2)
  );

  fs.writeFileSync(
    path.join(dir, 'roles.json'),
    JSON.stringify(roles || [], null, 2)
  );

  fs.writeFileSync(
    path.join(dir, 'role-permissions.json'),
    JSON.stringify(rolePerms || [], null, 2)
  );

  fs.writeFileSync(
    path.join(dir, 'permissions.json'),
    JSON.stringify(perms || [], null, 2)
  );

  fs.writeFileSync(
    path.join(dir, 'first-login-state.json'),
    JSON.stringify(firstLogin || [], null, 2)
  );

  console.log('Dumped to', dir);
}

dumpAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
