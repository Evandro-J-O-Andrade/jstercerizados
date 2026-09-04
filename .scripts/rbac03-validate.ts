/**
 * RBAC-03: Valida a migration de canonical roles.
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
  console.log('🔍 RBAC-03: Validação pós-migration\n');

  const { data: roles, error } = await supabase
    .from('roles')
    .select('*')
    .order('level, sector, name');

  if (error) {
    console.error('❌ Erro ao buscar roles:', error.message);
    process.exit(1);
  }

  console.log(`Total de roles: ${roles?.length || 0}\n`);

  const active = (roles || []).filter((r) => r.status === 'active');
  const deprecated = (roles || []).filter((r) => r.status === 'deprecated');
  const legacy = (roles || []).filter((r) => !r.status || r.status === '');

  console.log(`Active: ${active.length}`);
  console.log(`Deprecated: ${deprecated.length}`);
  console.log(`Legacy/empty: ${legacy.length}\n`);

  console.log('=== ROLES DEPRECATED ===\n');
  for (const r of deprecated) {
    console.log(`${r.name} → replacement: ${r.replacement_role_id || '(none)'}`);
  }

  console.log('\n=== ROLES POR LEVEL/SECTOR ===\n');
  const grouped = new Map<string, typeof roles>();
  for (const r of roles || []) {
    const key = `${r.level}/${r.sector}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }
  for (const [key, group] of grouped) {
    console.log(`\n[${key}] (${group.length})`);
    for (const r of group) {
      const flag = r.status === 'deprecated' ? ' [DEPRECATED]' : '';
      console.log(`  ${r.name}${flag}`);
    }
  }

  console.log('\n=== VALIDAÇÕES ===\n');

  const validations = [
    { name: 'Total >= 49', pass: (roles?.length || 0) >= 49 },
    { name: 'Active >= 46', pass: active.length >= 46 },
    { name: 'Deprecated >= 3', pass: deprecated.length >= 3 },
    { name: 'Nenhuma role sem slug', pass: !(roles || []).some((r) => !r.slug) },
    { name: 'Nenhuma role sem level', pass: !(roles || []).some((r) => r.level === null || r.level === undefined) },
    { name: 'Nenhuma role sem sector', pass: !(roles || []).some((r) => !r.sector) },
  ];

  let allPass = true;
  for (const v of validations) {
    console.log(`${v.pass ? '✅' : '❌'} ${v.name}`);
    if (!v.pass) allPass = false;
  }

  console.log(`\n${allPass ? '✅ RBAC-03 VALIDADO' : '❌ RBAC-03 COM FALHAS'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
