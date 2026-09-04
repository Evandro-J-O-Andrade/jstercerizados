/**
 * Diagnóstico do schema remoto: verificar existência das tabelas do portal
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

const TABLES_TO_CHECK = [
  'footer_configs',
  'candidate_portal_modules',
  'global_navigation_links',
  'candidate_job_alerts',
  'page_templates',
];

async function main() {
  console.log('🔍 Diagnóstico do schema remoto\n');

  console.log('=== 1. VERIFICANDO EXISTÊNCIA DE TABELAS ===\n');
  for (const table of TABLES_TO_CHECK) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: NÃO EXISTE ou ERRO`);
        console.log(`   ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTE (count=${data?.length || 0})`);
      }
    } catch (err: any) {
      console.log(`❌ ${table}: EXCEÇÃO`);
      console.log(`   ${err.message}`);
    }
  }

  console.log('\n=== 2. VERIFICANDO MIGRATIONS APLICADAS ===\n');
  const { data: migrations, error: migrationsError } = await supabase
    .from('migrations')
    .select('version')
    .like('version', '2026090%')
    .order('version');

  if (migrationsError) {
    console.log('❌ Erro ao buscar migrations:', migrationsError.message);
  } else {
    console.log(`Migrations aplicadas (2026090x): ${migrations?.length || 0}`);
    for (const m of migrations || []) {
      console.log(`  - ${m.version}`);
    }
  }

  console.log('\n=== 3. VERIFICANDO ESTRUTURA DE ROLES ===\n');
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name, status, level, sector, scope')
    .order('name');

  if (rolesError) {
    console.log('❌ Erro ao buscar roles:', rolesError.message);
  } else {
    console.log(`Total de roles: ${roles?.length || 0}`);
    for (const r of roles || []) {
      const flag = r.status === 'deprecated' ? ' [DEPRECATED]' : '';
      console.log(`  ${r.name} (level=${r.level}, sector=${r.sector}, scope=${r.scope})${flag}`);
    }
  }

  console.log('\n=== 4. VERIFICANDO ROLE_ASSIGNMENTS ===\n');
  const { data: assignments, error: assignmentsError } = await supabase
    .from('role_assignments')
    .select('id, role_id, person_id, tenant_id')
    .limit(10);

  if (assignmentsError) {
    console.log('❌ Erro ao buscar assignments:', assignmentsError.message);
  } else {
    console.log(`Assignments encontrados (amostra): ${assignments?.length || 0}`);
    for (const a of assignments || []) {
      console.log(`  ${a.id} | role=${a.role_id} | person=${a.person_id} | tenant=${a.tenant_id || '(null)'}`);
    }
  }

  console.log('\n=== RESUMO DO DIAGNÓSTICO ===\n');
  console.log('Tabelas do portal ausentes:', TABLES_TO_CHECK.filter(t => !supabase.from(t).select('*').limit(1)));
  console.log('\nPróximo passo: aplicar migrations faltantes se confirmado.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
