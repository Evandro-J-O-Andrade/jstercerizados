import { Client } from 'pg';
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

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://okxqfyoqbhcmflpurfrw.supabase.co';
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!SUPABASE_DB_PASSWORD) {
  console.error('Missing SUPABASE_DB_PASSWORD');
  process.exit(1);
}

const url = new URL(SUPABASE_URL);
const hostname = url.hostname;
const projectRef = hostname.split('.')[0];

const possibleConfigs = [
  { host: `db.${hostname}`, user: 'postgres', db: 'postgres' },
  {
    host: `${projectRef}.pooler.supabase.com`,
    user: `postgres.${projectRef}`,
    db: 'postgres',
  },
  { host: hostname, user: 'postgres', db: 'postgres' },
];

let client: Client | null = null;

for (const cfg of possibleConfigs) {
  const connectionString = `postgresql://${encodeURIComponent(cfg.user)}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@${cfg.host}:5432/${cfg.db}`;
  try {
    client = new Client({ connectionString });
    await client.connect();
    console.log(`Connected to: ${cfg.host} as ${cfg.user}`);
    break;
  } catch (err) {
    console.log(`Failed ${cfg.host}: ${(err as Error).message}`);
    client = null;
  }
}

if (!client) {
  console.error('Could not connect to Supabase database');
  process.exit(1);
}

async function query(sql: string, params: any[] = []) {
  const res = await client!.query(sql, params);
  return res.rows;
}

async function main() {
  const evandroAuthUserId = 'a78ddef1-5659-404f-9c7c-940c5df0abf1';
  const targetTenantId = 'd480af07-ab6b-4561-ac3a-2a0b0c1267b5';

  // 1. Get current function definitions
  console.log('\n=== CHECK CURRENT FUNCTIONS ===');
  const funcs = await query(`
    SELECT p.proname, pg_get_functiondef(p.oid) as definition
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('user_permissions', 'user_has_permission')
    ORDER BY p.proname
  `);

  const userPermsDef =
    funcs.find((f) => f.proname === 'user_permissions')?.definition || '';
  const userHasPermDef =
    funcs.find((f) => f.proname === 'user_has_permission')?.definition || '';

  const needsFix = (def: string) => {
    const hasOrNull = def.includes('ra.tenant_id is null');
    const hasGlobal = def.includes("r.scope = 'global'");
    const hasOr = def.includes('or (');
    return !(hasOrNull && hasGlobal && hasOr);
  };

  const needsPermsFix = needsFix(userPermsDef);
  const needsHasFix = needsFix(userHasPermDef);

  console.log('user_permissions needs fix:', needsPermsFix);
  console.log('user_has_permission needs fix:', needsHasFix);

  if (!needsPermsFix && !needsHasFix) {
    console.log(
      '\n✅ Both functions already contain global role logic. No fix needed.',
    );
  }

  // 2. Apply fixes if needed
  if (needsPermsFix) {
    console.log('\n=== FIXING user_permissions ===');
    const sql = `
CREATE OR REPLACE FUNCTION public.user_permissions(p_auth_user_id uuid, p_tenant_id uuid)
 RETURNS TABLE(resource text, action text, description text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return query
  select distinct perm.resource, perm.action, perm.description
  from public.people pe
  join public.role_assignments ra on ra.person_id = pe.id
  join public.roles r on r.id = ra.role_id
  join public.role_permissions rp on rp.role_id = ra.role_id
  join public.permissions perm on perm.id = rp.permission_id
  where pe.auth_user_id = p_auth_user_id
    and (
      ra.tenant_id = p_tenant_id
      or (ra.tenant_id is null and r.scope = 'global')
    );
end;
$function$;
    `;
    await query(sql);
    console.log('user_permissions fixed');
  }

  if (needsHasFix) {
    console.log('\n=== FIXING user_has_permission ===');
    const sql = `
CREATE OR REPLACE FUNCTION public.user_has_permission(p_auth_user_id uuid, p_resource text, p_action text, p_tenant_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return exists (
    select 1
    from public.people pe
    join public.role_assignments ra on ra.person_id = pe.id
    join public.roles r on r.id = ra.role_id
    join public.role_permissions rp on rp.role_id = ra.role_id
    join public.permissions perm on perm.id = rp.permission_id
    where pe.auth_user_id = p_auth_user_id
      and (
        ra.tenant_id = p_tenant_id
        or (ra.tenant_id is null and r.scope = 'global')
      )
      and perm.resource = p_resource
      and perm.action = p_action
  );
end;
$function$;
    `;
    await query(sql);
    console.log('user_has_permission fixed');
  }

  // 3. Validate with Evandro
  console.log('\n=== VALIDATION WITH EVANDRO ===');
  const permResult = await query(
    `
    SELECT * FROM public.user_permissions($1::uuid, $2::uuid)
  `,
    [evandroAuthUserId, targetTenantId],
  );

  console.log('Total permissions:', permResult.length);

  const specificPerms = [
    ['dashboard', 'read'],
    ['recruitment', 'read'],
    ['reports', 'read'],
    ['service_orders', 'read'],
    ['support_tickets', 'read'],
    ['contracts', 'read'],
  ];

  for (const [resource, action] of specificPerms) {
    const hasPerm = await query(
      `
      SELECT public.user_has_permission($1::uuid, $2::text, $3::text, $4::uuid) as has_perm
    `,
      [evandroAuthUserId, resource, action, targetTenantId],
    );

    const val = hasPerm[0]?.has_perm;
    console.log(`${resource}.${action}: ${val}`);
  }

  // 4. Check other roles still work
  console.log('\n=== VALIDATE OTHER ROLES ===');
  const tenantAdmin = await query(`
    SELECT p.auth_user_id
    FROM people p
    JOIN role_assignments ra ON ra.person_id = p.id
    JOIN roles r ON r.id = ra.role_id
    WHERE r.name = 'tenant_admin' AND p.auth_user_id IS NOT NULL
    LIMIT 1
  `);

  if (tenantAdmin.length > 0) {
    const tenantAdminPerms = await query(
      `
      SELECT COUNT(*) as count
      FROM public.user_permissions($1::uuid, $2::uuid)
    `,
      [tenantAdmin[0].auth_user_id, targetTenantId],
    );
    console.log('tenant_admin permissions:', tenantAdminPerms[0]?.count || 0);
  }

  const financeManager = await query(`
    SELECT p.auth_user_id
    FROM people p
    JOIN role_assignments ra ON ra.person_id = p.id
    JOIN roles r ON r.id = ra.role_id
    WHERE r.name = 'finance_manager' AND p.auth_user_id IS NOT NULL
    LIMIT 1
  `);

  if (financeManager.length > 0) {
    const financePerms = await query(
      `
      SELECT COUNT(*) as count
      FROM public.user_permissions($1::uuid, $2::uuid)
    `,
      [financeManager[0].auth_user_id, targetTenantId],
    );
    console.log('finance_manager permissions:', financePerms[0]?.count || 0);
  }

  await client.end();
  console.log('\n[DONE] Connection closed');
}

main().catch((err) => {
  console.error('❌ Failed:', err.message || err);
  process.exit(1);
});
