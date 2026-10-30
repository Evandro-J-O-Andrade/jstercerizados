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
  console.log('=== DIAGNOSTICO F06 — SOMENTE LEITURA ===\n');

  // 1. RLS status e políticas de tenant_memberships
  console.log('--- 1. RLS e políticas de tenant_memberships ---');
  const rlsStatus = await query(`
    SELECT relname, relrowsecurity, relforcerowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND relname = 'tenant_memberships';
  `);
  console.log('RLS status:', JSON.stringify(rlsStatus, null, 2));

  const policies = await query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tenant_memberships'
    ORDER BY policyname;
  `);
  console.log(JSON.stringify(policies, null, 2));

  // 2. Todas as políticas que referenceiam is_admin_master
  console.log('\n--- 2. Políticas RLS que usam is_admin_master() ---');
  const adminPolicies = await query(`
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual ILIKE '%is_admin_master%' OR with_check ILIKE '%is_admin_master%')
    ORDER BY tablename, policyname;
  `);
  console.log(JSON.stringify(adminPolicies, null, 2));

  // 3. Todas as funções SECURITY DEFINER públicas
  console.log('\n--- 3. Funções SECURITY DEFINER no schema public ---');
  const secDefFuncs = await query(`
    SELECT p.proname, pg_get_function_arguments(p.oid) AS args,
           p.prosecdef AS security_definer
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
    ORDER BY p.proname, pg_get_function_arguments(p.oid);
  `);
  console.log(JSON.stringify(secDefFuncs, null, 2));

  // 4. Tentar executar is_admin_master() como postgres (sem JWT — auth.uid() = null)
  console.log('\n--- 4. Execução direta de is_admin_master() (sem JWT) ---');
  try {
    const result = await query('SELECT public.is_admin_master() AS result');
    console.log('is_admin_master() =', result[0]?.result);
  } catch (e) {
    console.log('ERRO is_admin_master():', e.message);
  }

  // 5. Verificar se auth.uid() está disponível e o que retorna
  console.log('\n--- 5. Verificação auth.uid() ---');
  try {
    const authUid = await query('SELECT auth.uid() AS uid');
    console.log('auth.uid() =', JSON.stringify(authUid[0]?.uid));
  } catch (e) {
    console.log('ERRO auth.uid():', e.message);
  }

  // 6. is_admin_master() com o auth_user_id do Evandro
  console.log('\n--- 6. is_admin_master(auth_uid) com auth_user_id do Evandro ---');
  try {
    const result = await query(
      'SELECT public.is_admin_master($1::uuid) AS result',
      ['a78ddef1-5659-404f-9c7c-940c5df0abf1']
    );
    console.log('is_admin_master(evandro_uid) =', result[0]?.result);
  } catch (e) {
    console.log('ERRO is_admin_master(evandro_uid):', e.message);
  }

  // 7. Contar role_assignments para admin_master global
  console.log('\n--- 7. Contagem de admin_master por tenant ---');
  const adminCounts = await query(`
    SELECT r.name AS role_name, r.scope AS role_scope,
           COUNT(ra.*) AS assignment_count,
           COUNT(CASE WHEN ra.tenant_id IS NULL THEN 1 END) AS global_count,
           COUNT(CASE WHEN ra.tenant_id IS NOT NULL THEN 1 END) AS tenant_count
    FROM public.role_assignments ra
    JOIN public.roles r ON r.id = ra.role_id
    GROUP BY r.name, r.scope
    ORDER BY r.name;
  `);
  console.log(JSON.stringify(adminCounts, null, 2));

  await client.end();
  console.log('\n[DONE] Conexão encerrada');
}

main().catch((err) => {
  console.error('❌ ERRO:', err.message);
  process.exit(1);
});
