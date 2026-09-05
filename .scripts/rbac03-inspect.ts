/**
 * RBAC-03: Levanta o schema real da tabela roles e o estado atual do catálogo.
 */
import { createClient } from '@supabase/supabase-js';
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

loadEnvFile('.env.provision');

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

async function main() {
  console.log('🔍 RBAC-03: Levantamento do schema e estado atual\n');

  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  if (rolesError) {
    console.error('❌ Erro ao buscar roles:', rolesError.message);
    process.exit(1);
  }

  console.log('=== ROLES ATUAIS ===\n');
  console.log(`Total: ${roles?.length || 0}\n`);

  for (const r of roles || []) {
    console.log(`${r.id} | ${r.name.padEnd(25)} | scope=${String(r.scope || '-').padEnd(6)} | status=${r.status || '-'} | description=${r.description || '-'}`);
  }

  console.log('\n=== COLUNAS DISPONÍVEIS ===\n');
  if (roles && roles.length > 0) {
    console.log(Object.keys(roles[0]).join(', '));
  }

  console.log('\n=== AMOSTRA (1 role) ===\n');
  if (roles && roles.length > 0) {
    console.log(JSON.stringify(roles[0], null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
