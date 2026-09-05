/**
 * RBAC-03: Executa a migration de canonical roles no Supabase remoto.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

async function main() {
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260904000003_rbac03_canonical_roles.sql'
  );
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('🔧 RBAC-03: Executando migration...\n');

  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('❌ Erro na migration:', error.message);
    console.error('Detalhes:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log('✅ Migration executada com sucesso');
  console.log('Resultado:', data || '(sem output)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
