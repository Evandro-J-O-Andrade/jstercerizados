/**
 * GATE RBAC-01: Executa correção e validação pós-update.
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

const ASSIGNMENT_ID = 'b7945953-7e5b-4bf5-9a27-0f4d69ab2fc9';
const ROLE_NAME = 'admin_master';

async function main() {
  console.log('🔧 GATE RBAC-01: Correção + Validação\n');

  // 1. Resolver role_id de admin_master
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id, name, scope')
    .eq('name', ROLE_NAME)
    .maybeSingle();

  if (roleError || !role) {
    console.error('❌ Erro ao buscar role:', roleError?.message || 'não encontrada');
    process.exit(1);
  }

  console.log(`Role encontrada: ${role.name} (${role.id}) scope=${role.scope}\n`);

  // 2. Verificar assignment antes da correção
  console.log('=== ANTES ===');
  const { data: before, error: beforeError } = await supabase
    .from('role_assignments')
    .select('id, role_id, person_id, tenant_id')
    .eq('id', ASSIGNMENT_ID)
    .maybeSingle();

  if (beforeError) {
    console.error('❌ Erro na leitura pré-update:', beforeError.message);
    process.exit(1);
  }

  console.log('Assignment antes:', JSON.stringify(before, null, 2));

  if (before?.tenant_id === null) {
    console.log('\n✅ Assignment já está com tenant_id=NULL. Nenhuma correção necessária.');
  } else {
    // 3. Aplicar correção
    console.log('\n🔧 Aplicando UPDATE...');
    const { data: updated, error: updateError } = await supabase
      .from('role_assignments')
      .update({ tenant_id: null })
      .eq('id', ASSIGNMENT_ID)
      .select('id, role_id, person_id, tenant_id')
      .maybeSingle();

    if (updateError) {
      console.error('❌ Erro no UPDATE:', updateError.message);
      process.exit(1);
    }

    console.log('Assignment após UPDATE:', JSON.stringify(updated, null, 2));
  }

  // 4. Validação pós-update
  console.log('\n=== VALIDAÇÃO PÓS-UPDATE ===');
  const { data: after, error: afterError } = await supabase
    .from('role_assignments')
    .select('id, role_id, person_id, tenant_id')
    .eq('id', ASSIGNMENT_ID)
    .maybeSingle();

  if (afterError) {
    console.error('❌ Erro na validação:', afterError.message);
    process.exit(1);
  }

  const isValid = after?.tenant_id === null;
  console.log('Assignment validado:', JSON.stringify(after, null, 2));
  console.log(`tenant_id é NULL? ${isValid ? '✅ SIM' : '❌ NÃO'}`);

  // 5. Verificar se NENHUM admin_master global ficou com tenant_id preenchido
  console.log('\n=== VERIFICAÇÃO GLOBAL ===');
  const { data: allGlobal, error: globalError } = await supabase
    .from('role_assignments')
    .select('id, person_id, tenant_id')
    .eq('role_id', role.id);

  if (globalError) {
    console.error('❌ Erro na verificação global:', globalError.message);
    process.exit(1);
  }

  const inconsistentGlobal = (allGlobal || []).filter((a) => a.tenant_id !== null);
  console.log(`Total de assignments admin_master: ${allGlobal?.length || 0}`);
  console.log(`Inconsistentes restantes: ${inconsistentGlobal.length}`);

  if (inconsistentGlobal.length > 0) {
    console.log('❌ AINDA HÁ INCONSISTÊNCIAS:');
    for (const inc of inconsistentGlobal) {
      console.log(`  - ${inc.id} (person=${inc.person_id}) tenant_id=${inc.tenant_id}`);
    }
    process.exit(1);
  }

  console.log('\n✅ GATE RBAC-01 PASS — admin_master global está consistente.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
