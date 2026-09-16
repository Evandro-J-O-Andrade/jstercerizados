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
console.log('URL:', url ? 'PRESENTE' : 'AUSENTE');
console.log('KEY:', key ? 'PRESENTE' : 'AUSENTE');
if (!url || !key) process.exit(1);

const supabase = createClient(url, key);

const TARGET_TABLES = [
  'employees',
  'employee_documents',
  'departments',
  'positions',
  'employee_positions',
  'employee_contracts',
  'employee_status_history',
  'employee_education',
  'employee_experiences',
  'employee_skills',
  'employee_languages',
  'employee_courses',
  'role_assignments',
  'roles',
  'permissions',
  'role_permissions',
  'tenant_memberships',
  'people',
  'tenants',
  'first_login_state',
  'candidates',
  'jobs',
  'applications',
  'companies',
  'domain_events',
  'company_relationships',
];

(async () => {
  console.log('\n=== AUDIT: table existence via probe queries ===');
  const results: Array<{ table: string; exists: boolean; error?: string; count?: number }> = [];

  for (const table of TARGET_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      const exists = !/does not exist|not found|Could not find the table/i.test(error.message);
      results.push({ table, exists, error: error.message });
    } else {
      results.push({ table, exists: true, count: count ?? 0 });
    }
  }

  console.log('\n--- EXISTEM ---');
  results.filter((r) => r.exists).forEach((r) => console.log(`  ${r.table} (count=${r.count})`));

  console.log('\n--- NÃO EXISTEM ---');
  results.filter((r) => !r.exists).forEach((r) => console.log(`  ${r.table} :: ${r.error}`));

  console.log('\n=== AUDIT: employees sample (if exists) ===');
  const { data: empSample, error: empSampleErr } = await supabase
    .from('employees')
    .select('id, tenant_id, person_id, employee_code, hire_date, salary, status')
    .limit(3);
  if (empSampleErr) {
    console.log('ERROR:', empSampleErr.message);
  } else {
    console.log(JSON.stringify(empSample, null, 2));
  }

  console.log('\n=== AUDIT: employee_documents sample (if exists) ===');
  const { data: docSample, error: docSampleErr } = await supabase
    .from('employee_documents')
    .select('*')
    .limit(3);
  if (docSampleErr) {
    console.log('ERROR:', docSampleErr.message);
  } else {
    console.log(JSON.stringify(docSample, null, 2));
  }

  console.log('\n=== AUDIT: roles list ===');
  const { data: roles, error: rolesErr } = await supabase
    .from('roles')
    .select('id, name, scope, status')
    .order('name');
  if (rolesErr) {
    console.log('ERROR:', rolesErr.message);
  } else {
    console.log((roles ?? []).map((r) => `${r.name} (scope=${r.scope}, status=${r.status})`).join('\n'));
  }

  console.log('\n=== AUDIT: role_assignments sample ===');
  const { data: raSample, error: raErr } = await supabase
    .from('role_assignments')
    .select('*')
    .limit(3);
  if (raErr) {
    console.log('ERROR:', raErr.message);
  } else {
    console.log(JSON.stringify(raSample, null, 2));
  }

  console.log('\n=== AUDIT: people sample ===');
  const { data: peopleSample, error: peopleErr } = await supabase
    .from('people')
    .select('id, auth_user_id, full_name, email, status')
    .limit(3);
  if (peopleErr) {
    console.log('ERROR:', peopleErr.message);
  } else {
    console.log(JSON.stringify(peopleSample, null, 2));
  }

  console.log('\n=== AUDIT: candidates sample ===');
  const { data: candSample, error: candErr } = await supabase
    .from('candidates')
    .select('*')
    .limit(3);
  if (candErr) {
    console.log('ERROR:', candErr.message);
  } else {
    console.log(JSON.stringify(candSample, null, 2));
  }

  console.log('\n=== AUDIT: companies sample ===');
  const { data: compSample, error: compErr } = await supabase
    .from('companies')
    .select('*')
    .limit(3);
  if (compErr) {
    console.log('ERROR:', compErr.message);
  } else {
    console.log(JSON.stringify(compSample, null, 2));
  }

  console.log('\n=== AUDIT: domain_events sample ===');
  const { data: evSample, error: evErr } = await supabase
    .from('domain_events')
    .select('*')
    .limit(3);
  if (evErr) {
    console.log('ERROR:', evErr.message);
  } else {
    console.log(JSON.stringify(evSample, null, 2));
  }

  console.log('\n=== AUDIT: first_login_state sample ===');
  const { data: flsSample, error: flsErr } = await supabase
    .from('first_login_state')
    .select('*')
    .limit(3);
  if (flsErr) {
    console.log('ERROR:', flsErr.message);
  } else {
    console.log(JSON.stringify(flsSample, null, 2));
  }

  console.log('\n=== AUDIT DONE ===');
})();