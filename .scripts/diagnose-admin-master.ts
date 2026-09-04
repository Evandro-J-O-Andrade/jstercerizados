/**
 * GATE RBAC-01: Diagnóstico exato dos assignments de admin_master.
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
  console.log('🔍 GATE RBAC-01: Diagnóstico admin_master\n');

  // 1. Buscar role admin_master
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id, name, scope, description')
    .eq('name', 'admin_master')
    .maybeSingle();

  if (roleError || !roleData) {
    console.error('❌ Erro ao buscar role admin_master:', roleError?.message || 'não encontrada');
    process.exit(1);
  }

  console.log(`Role: ${roleData.name}`);
  console.log(`ID: ${roleData.id}`);
  console.log(`Scope: ${roleData.scope}`);
  console.log(`Descrição: ${roleData.description}\n`);

  // 2. Buscar TODAS as assignments de admin_master
  const { data: assignments, error: assignError } = await supabase
    .from('role_assignments')
    .select('id, person_id, tenant_id, created_at, updated_at')
    .eq('role_id', roleData.id);

  if (assignError) {
    console.error('❌ Erro ao buscar assignments:', assignError.message);
    process.exit(1);
  }

  console.log(`Total de assignments: ${assignments?.length || 0}\n`);

  if (!assignments || assignments.length === 0) {
    console.log('✅ Nenhum assignment encontrado.');
    return;
  }

  // 3. Buscar pessoas relacionadas
  const personIds = [...new Set(assignments.map((a) => a.person_id))];
  const { data: people } = await supabase
    .from('people')
    .select('id, full_name, email')
    .in('id', personIds);

  const peopleMap = new Map((people || []).map((p) => [p.id, p]));

  // 4. Buscar tenants relacionados
  const tenantIds = assignments.map((a) => a.tenant_id).filter(Boolean);
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name')
    .in('id', tenantIds);

  const tenantsMap = new Map((tenants || []).map((t) => [t.id, t]));

  // 5. Analisar cada assignment
  console.log('=== ANÁLISE DOS ASSIGNMENTS ===\n');

  let inconsistentCount = 0;
  let globalNullCount = 0;

  for (const assignment of assignments) {
    const person = peopleMap.get(assignment.person_id);
    const tenant = assignment.tenant_id ? tenantsMap.get(assignment.tenant_id) : null;
    const isInconsistent = roleData.scope === 'global' && assignment.tenant_id !== null;

    if (isInconsistent) inconsistentCount++;
    if (!assignment.tenant_id) globalNullCount++;

    console.log(`Assignment ID: ${assignment.id}`);
    console.log(`  Pessoa: ${person?.full_name || '?'} (${person?.email || assignment.person_id})`);
    console.log(`  Role: ${roleData.name} (scope=${roleData.scope})`);
    console.log(`  Tenant ID: ${assignment.tenant_id || '(NULL)'}`);
    console.log(`  Tenant: ${tenant?.name || '(global)'}`);
    console.log(`  Status: ${isInconsistent ? '🔴 INCONSISTENTE' : '✅ OK'}`);
    console.log(`  Criado em: ${assignment.created_at}`);
    console.log('');
  }

  // 6. Resumo
  console.log('=== RESUMO ===');
  console.log(`Total de assignments: ${assignments.length}`);
  console.log(`Assignments corretos (tenant_id NULL): ${globalNullCount}`);
  console.log(`Assignments inconsistentes (tenant_id != NULL): ${inconsistentCount}`);

  if (inconsistentCount > 0) {
    console.log('\n🔴 AÇÃO NECESSÁRIA:');
    console.log(`   ${inconsistentCount} assignment(s) de admin_master com tenant_id preenchido devem ser corrigidos para NULL.`);
    console.log('\n   SQL sugerido:');
    for (const assignment of assignments) {
      if (assignment.tenant_id) {
        console.log(`   UPDATE role_assignments SET tenant_id = NULL WHERE id = '${assignment.id}';`);
      }
    }
  } else {
    console.log('\n✅ Todos os assignments de admin_master estão corretos.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
