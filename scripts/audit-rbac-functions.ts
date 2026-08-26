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

  // 1. Test user_permissions with Evandro
  console.log('\n=== TEST user_permissions WITH EVANDRO ===');
  const permResult = await query(
    `
    SELECT * FROM public.user_permissions($1::uuid, $2::uuid)
  `,
    [evandroAuthUserId, targetTenantId],
  );

  console.log('Count:', permResult.length);
  console.log(
    'Sample:',
    permResult.slice(0, 20).map((r: any) => `${r.resource}.${r.action}`),
  );

  // 2. Check specific permissions with 4 args
  console.log('\n=== TEST user_has_permission WITH 4 ARGS ===');
  const specificPerms = [
    ['dashboard', 'read'],
    ['recruitment', 'read'],
    ['reports', 'read'],
    ['service_orders', 'read'],
    ['support_tickets', 'read'],
    ['contracts', 'read'],
  ];

  for (const [resource, action] of specificPerms) {
    try {
      const hasPerm = await query(
        `
        SELECT public.user_has_permission($1::uuid, $2::text, $3::text, $4::uuid) as has_perm
      `,
        [evandroAuthUserId, resource, action, targetTenantId],
      );

      const val = hasPerm[0]?.has_perm;
      console.log(`${resource}.${action}: ${val}`);
    } catch (err) {
      console.log(`${resource}.${action}: ERROR - ${(err as Error).message}`);
    }
  }

  // 3. Check what the function returns for admin@jsempregos.com.br (orphan)
  console.log('\n=== TEST WITH ORPHAN ADMIN ===');
  const orphanPerson = await query(`
    SELECT id FROM people WHERE email = 'admin@jsempregos.com.br'
  `);
  const orphanPersonId = orphanPerson[0]?.id;

  if (orphanPersonId) {
    // Try to find auth_user_id for this person - it's null, so function should return 0
    const orphanPerms = await query(
      `
      SELECT * FROM public.user_permissions('00000000-0000-0000-0000-000000000000'::uuid, $1::uuid)
    `,
      [targetTenantId],
    );
    console.log('Orphan admin permissions:', orphanPerms.length);
  }

  await client.end();
}

main().catch((err) => {
  console.error('❌ Failed:', err.message || err);
  process.exit(1);
});
