import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  const contents = readFileSync('.env', 'utf-8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) process.exit(1);

const supabase = createClient(url, key);

// Probe a list of columns on a table (one by one)
async function probeColumns(table: string, columns: string[]): Promise<string[]> {
  const existing: string[] = [];
  for (const col of columns) {
    const { error } = await supabase.from(table).select(col).limit(1);
    if (error) {
      if (/does not exist|column.*does not exist/i.test(error.message)) continue;
    } else {
      existing.push(col);
    }
  }
  return existing;
}

// Probe a function existence via a lightweight call
async function probeFunction(name: string, args: string): Promise<{ exists: boolean; error?: string }> {
  const { data, error } = await supabase.rpc(name, JSON.parse(args || '{}') as Record<string, unknown>);
  if (error) {
    if (/does not exist|function.*does not exist/i.test(error.message)) {
      return { exists: false, error: error.message };
    }
    return { exists: true, error: error.message };
  }
  return { exists: true };
}

(async () => {
  console.log('\n=== PROBE: role_assignments columns ===');
  const raCols = await probeColumns('role_assignments', [
    'id', 'person_id', 'role_id', 'tenant_id', 'assigned_at', 'created_at', 'updated_at', 'expires_at',
  ]);
  console.log('EXISTENTES:', raCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', ['id','person_id','role_id','tenant_id','assigned_at','created_at','updated_at','expires_at'].filter((c) => !raCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: first_login_state columns ===');
  const flsCols = await probeColumns('first_login_state', [
    'person_id', 'must_change_password', 'first_login_completed', 'signup_origin', 'created_at', 'updated_at',
  ]);
  console.log('EXISTENTES:', flsCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', ['person_id','must_change_password','first_login_completed','signup_origin','created_at','updated_at'].filter((c) => !flsCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: roles table (canonical names) ===');
  const { data: roles, error: rolesErr } = await supabase.from('roles').select('id, name, scope, status').order('name');
  if (rolesErr) {
    console.log('ERROR:', rolesErr.message);
  } else {
    console.log((roles ?? []).map((r) => `${r.name} (scope=${r.scope}, status=${r.status})`).join('\n'));
  }

  console.log('\n=== PROBE: people columns ===');
  const peopleCols = await probeColumns('people', [
    'id', 'auth_user_id', 'full_name', 'email', 'phone', 'status', 'created_at', 'updated_at',
  ]);
  console.log('EXISTENTES:', peopleCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', ['id','auth_user_id','full_name','email','phone','status','created_at','updated_at'].filter((c) => !peopleCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: candidates columns ===');
  const candCols = await probeColumns('candidates', [
    'id', 'person_id', 'tenant_id', 'status', 'headline', 'created_at', 'updated_at',
  ]);
  console.log('EXISTENTES:', candCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', ['id','person_id','tenant_id','status','headline','created_at','updated_at'].filter((c) => !candCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: tenants columns ===');
  const tenantsCols = await probeColumns('tenants', [
    'id', 'slug', 'name', 'status', 'created_at', 'updated_at',
  ]);
  console.log('EXISTENTES:', tenantsCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', ['id','slug','name','status','created_at','updated_at'].filter((c) => !tenantsCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: domain_events columns ===');
  const evCols = await probeColumns('domain_events', [
    'id', 'tenant_id', 'event_name', 'event_type', 'aggregate_type', 'aggregate_id', 'actor_person_id', 'payload', 'created_at',
  ]);
  console.log('EXISTENTES:', evCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', ['id','tenant_id','event_name','event_type','aggregate_type','aggregate_id','actor_person_id','payload','created_at'].filter((c) => !evCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE DONE ===');
})();