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

const TARGET_TABLES = [
  'employees', 'employee_documents', 'departments', 'positions',
  'employee_positions', 'employee_contracts', 'employee_status_history',
  'employee_education', 'employee_experiences', 'employee_skills',
  'employee_languages', 'employee_courses', 'role_assignments', 'roles',
  'permissions', 'role_permissions', 'tenant_memberships', 'people',
  'tenants', 'first_login_state', 'candidates', 'jobs', 'applications',
  'companies', 'domain_events', 'company_relationships',
];

(async () => {
  console.log('\n=== PROBE COM ERROS DETALHADOS ===');
  for (const table of TARGET_TABLES) {
    const { data, count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    const status = error ? `ERRO: ${error.message}` : `OK (count=${count ?? 'N/A'}, rows=${(data ?? []).length})`;
    console.log(`${table.padEnd(32)} => ${status}`);
  }
  console.log('\n=== PROBE DONE ===');
})();