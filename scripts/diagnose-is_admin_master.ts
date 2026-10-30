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
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  } catch { /* ignore */ }
}

loadEnvFile('.env.local');

const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!SUPABASE_DB_PASSWORD) {
  console.error('Missing SUPABASE_DB_PASSWORD');
  process.exit(1);
}

const connectionString = `postgresql://postgres.okxqfyoqbhcmflpurfrw:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`;

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function query(sql: string, params: any[] = []) {
  const res = await client.query(sql, params);
  return res.rows;
}

async function main() {
  await client.connect();
  console.log('=== CONECTADO AO SUPABASE REMOTO (somente leitura) ===\n');

  // 1. Definição de is_admin_master() — todas as sobrecargas
  console.log('--- 1. Definição de is_admin_master() ---');
  const funcs = await query(`
    SELECT p.proname,
           pg_get_function_arguments(p.oid) AS args,
           pg_get_function_result(p.oid) AS result,
           l.lanname AS language,
           p.prosecdef AS security_definer,
           p.provolatile AS volatility,
           pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    LEFT JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname = 'public'
      AND p.proname = 'is_admin_master'
    ORDER BY p.proname, pg_get_function_arguments(p.oid);
  `);
  console.log(JSON.stringify(funcs, null, 2));

  // 2. Privilégios EXECUTE em is_admin_master()
  console.log('\n--- 2. Privilégios EXECUTE em is_admin_master() ---');
  const privileges = await query(`
    SELECT rp.routine_name, rp.grantee, rp.privilege_type
    FROM information_schema.routine_privileges rp
    WHERE rp.routine_schema = 'public'
      AND rp.routine_name = 'is_admin_master'
      AND rp.privilege_type = 'EXECUTE'
    ORDER BY rp.grantee;
  `);
  console.log(JSON.stringify(privileges, null, 2));

  // 3. Identidade efetiva (current_user, session_user)
  console.log('\n--- 3. Identidade efetiva da sessão ---');
  const identity = await query(`
    SELECT current_user AS current_user,
           session_user AS session_user,
           current_database() AS current_database,
           inet_server_addr() AS server_addr,
           inet_server_port() AS server_port;
  `);
  console.log(JSON.stringify(identity, null, 2));

  // 4. Verificar se authenticated consegue executar (via role simulation não é possível diretamente,
  //    mas podemos verificar se o GRANT existe para authenticated)
  console.log('\n--- 4. Verificação de GRANT EXECUTE para authenticated ---');
  const authGrant = await query(`
    SELECT rp.grantee, rp.privilege_type
    FROM information_schema.routine_privileges rp
    WHERE rp.routine_schema = 'public'
      AND rp.routine_name = 'is_admin_master'
      AND rp.grantee = 'authenticated';
  `);
  console.log(authGrant.length > 0 ? 'GRANT EXECUTE para authenticated: EXISTE' : 'GRANT EXECUTE para authenticated: NÃO ENCONTRADO');

  // 5. Tabela roles — verificar se existe admin_master com scope global
  console.log('\n--- 5. Roles existentes ---');
  const roles = await query(`
    SELECT id, name, scope, description FROM public.roles ORDER BY name;
  `);
  console.log(JSON.stringify(roles, null, 2));

  // 6. Verificar se existe auth.uid() correspondente (pessoas com auth_user_id)
  console.log('\n--- 6. Pessoas com auth_user_id (amostra) ---');
  const people = await query(`
    SELECT id, auth_user_id, full_name, email FROM public.people LIMIT 10;
  `);
  console.log(JSON.stringify(people, null, 2));

  // 7. Verificar role_assignments para admin_master
  console.log('\n--- 7. Role assignments para admin_master ---');
  const assignments = await query(`
    SELECT ra.id, ra.person_id, ra.role_id, ra.tenant_id, ra.expires_at,
           r.name AS role_name, r.scope AS role_scope,
           p.full_name AS person_name, p.auth_user_id
    FROM public.role_assignments ra
    JOIN public.roles r ON r.id = ra.role_id
    JOIN public.people p ON p.id = ra.person_id
    WHERE r.name = 'admin_master'
    ORDER BY ra.id;
  `);
  console.log(JSON.stringify(assignments, null, 2));

  await client.end();
  console.log('\n[DONE] Conexão encerrada');
}

main().catch((err) => {
  console.error('❌ ERRO:', err.message);
  process.exit(1);
});
