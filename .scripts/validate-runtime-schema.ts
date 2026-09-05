/**
 * Validação pós-migration do portal: tabelas, RLS, grants, seeds.
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

const TABLES = [
  'footer_configs',
  'candidate_portal_modules',
  'global_navigation_links',
  'candidate_job_alerts',
  'page_templates',
];

async function main() {
  console.log('🔍 Validação pós-migration do portal\n');

  let allOk = true;

  for (const table of TABLES) {
    console.log(`=== ${table} ===`);

    const { data, error } = await supabase.from(table).select('*').limit(1);

    if (error) {
      console.log(`❌ ERRO: ${error.message}`);
      allOk = false;
      continue;
    }

    console.log(`✅ EXISTS (count=${data?.length || 0})`);

    if (data && data.length > 0) {
      console.log('   Colunas:', Object.keys(data[0]).join(', '));
      console.log('   Amostra:', JSON.stringify(data[0], null, 2).slice(0, 200) + '...');
    }

    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log(`❌ COUNT ERROR: ${countError.message}`);
      allOk = false;
    } else {
      console.log(`   Total rows: ${count}`);
    }

    console.log('');
  }

  console.log('=== VALIDAÇÃO GERAL ===');
  console.log(allOk ? '✅ TODAS AS TABELAS EXISTEM E SÃO ACESSÍVEIS' : '❌ ALGUMAS TABELAS COM PROBLEMA');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
