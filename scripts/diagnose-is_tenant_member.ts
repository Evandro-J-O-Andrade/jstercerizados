import { Client } from 'pg';
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
loadEnvFile('.env.local');

const client = new Client({
  connectionString: 'postgresql://postgres.okxqfyoqbhcmflpurfrw:' + encodeURIComponent(process.env.SUPABASE_DB_PASSWORD!) + '@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  // is_tenant_member definition and privileges
  const funcs = await client.query(`
    SELECT p.proname, pg_get_function_arguments(p.oid) AS args,
           p.prosecdef AS security_definer, pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_tenant_member'
    ORDER BY pg_get_function_arguments(p.oid);
  `);
  console.log('=== is_tenant_member() ===');
  console.log(JSON.stringify(funcs.rows, null, 2));

  const privs = await client.query(`
    SELECT routine_name, grantee, privilege_type
    FROM information_schema.routine_privileges
    WHERE routine_schema = 'public' AND routine_name = 'is_tenant_member'
      AND privilege_type = 'EXECUTE'
    ORDER BY grantee;
  `);
  console.log('\n=== is_tenant_member EXECUTE grants ===');
  console.log(JSON.stringify(privs.rows, null, 2));

  // RLS on tenant_memberships
  const rls = await client.query(`
    SELECT relname, relrowsecurity, relforcerowsecurity
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND relname = 'tenant_memberships';
  `);
  console.log('\n=== tenant_memberships RLS ===');
  console.log(JSON.stringify(rls.rows, null, 2));

  await client.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
