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
  console.log('=== DIAGNOSTICO BANCO REMOTO ===\n');

  // 1. Verificar se coluna file_hash existe em media_assets
  console.log('--- 1. Estrutura da tabela media_assets ---');
  const columns = await query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'media_assets'
    ORDER BY ordinal_position;
  `);
  console.log(JSON.stringify(columns, null, 2));

  const hasFileHash = columns.some((c: any) => c.column_name === 'file_hash');
  console.log(`\nColuna file_hash existe: ${hasFileHash}`);

  // 2. Verificar buckets do Storage
  console.log('\n--- 2. Buckets do Storage ---');
  const buckets = await query(`
    SELECT id, name, public, file_size_limit, allowed_mime_types
    FROM storage.buckets
    ORDER BY name;
  `);
  console.log(JSON.stringify(buckets, null, 2));

  // 3. Verificar políticas RLS de media_assets
  console.log('\n--- 3. Políticas RLS de media_assets ---');
  const policies = await query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'media_assets'
    ORDER BY policyname;
  `);
  console.log(JSON.stringify(policies, null, 2));

  // 4. Verificar políticas Storage de cada bucket
  console.log('\n--- 4. Políticas Storage ---');
  const storagePolicies = await query(`
    SELECT policyname, definition, bucket_id
    FROM storage.policies
    ORDER BY bucket_id, policyname;
  `);
  console.log(JSON.stringify(storagePolicies, null, 2));

  // 5. Verificar current_person_id() definição
  console.log('\n--- 5. Definição current_person_id() ---');
  const funcs = await query(`
    SELECT p.proname, pg_get_function_arguments(p.oid) AS args,
           pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'current_person_id';
  `);
  console.log(JSON.stringify(funcs, null, 2));

  // 6. Verificar grants de is_admin_master(uuid)
  console.log('\n--- 6. Grants is_admin_master(uuid) ---');
  const grants = await query(`
    SELECT rp.routine_name, rp.grantee, rp.privilege_type
    FROM information_schema.routine_privileges rp
    WHERE rp.routine_schema = 'public'
      AND rp.routine_name = 'is_admin_master'
    ORDER BY rp.grantee;
  `);
  console.log(JSON.stringify(grants, null, 2));

  // 7. Contar registros media_assets
  console.log('\n--- 7. Registros media_assets ---');
  const count = await query('SELECT COUNT(*) AS total FROM public.media_assets;');
  console.log(`Total: ${count[0]?.total}`);

  await client.end();
  console.log('\n[DONE] Conexão encerrada');
}

main().catch((err) => {
  console.error('❌ ERRO:', err.message);
  process.exit(1);
});
