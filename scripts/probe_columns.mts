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

const EMPLOYEE_COLUMNS = [
  'id', 'tenant_id', 'person_id', 'company_id', 'employee_code', 'registration',
  'hire_date', 'termination_date', 'salary', 'status', 'created_at', 'updated_at',
  'job_title', 'department', 'cost_center', 'work_mode', 'employment_type',
  'probation_end_date', 'salary_currency', 'salary_frequency', 'manager_id', 'notes',
];

const DOC_COLUMNS = [
  'id', 'employee_id', 'document_type', 'document_name', 'document_url', 'file_url',
  'issue_date', 'expiry_date', 'is_verified', 'notes', 'created_at', 'updated_at',
];

async function probeColumns(table: string, columns: string[]): Promise<string[]> {
  const existing: string[] = [];
  for (const col of columns) {
    const { error } = await supabase.from(table).select(col).limit(1);
    if (error) {
      if (/does not exist|column.*does not exist/i.test(error.message)) {
        continue;
      }
    } else {
      existing.push(col);
    }
  }
  return existing;
}

(async () => {
  console.log('\n=== PROBE: employees columns ===');
  const empCols = await probeColumns('employees', EMPLOYEE_COLUMNS);
  console.log('EXISTENTES:', empCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', EMPLOYEE_COLUMNS.filter((c) => !empCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: employee_documents columns ===');
  const docCols = await probeColumns('employee_documents', DOC_COLUMNS);
  console.log('EXISTENTES:', docCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', DOC_COLUMNS.filter((c) => !docCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: role_assignments columns ===');
  const RA_COLUMNS = ['id', 'person_id', 'role_id', 'tenant_id', 'assigned_at', 'created_at', 'updated_at', 'expires_at'];
  const raCols = await probeColumns('role_assignments', RA_COLUMNS);
  console.log('EXISTENTES:', raCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', RA_COLUMNS.filter((c) => !raCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: first_login_state columns ===');
  const FLS_COLUMNS = ['person_id', 'must_change_password', 'first_login_completed', 'signup_origin', 'created_at', 'updated_at'];
  const flsCols = await probeColumns('first_login_state', FLS_COLUMNS);
  console.log('EXISTENTES:', flsCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', FLS_COLUMNS.filter((c) => !flsCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: people columns ===');
  const PEOPLE_COLUMNS = ['id', 'auth_user_id', 'full_name', 'email', 'phone', 'status', 'created_at', 'updated_at'];
  const peopleCols = await probeColumns('people', PEOPLE_COLUMNS);
  console.log('EXISTENTES:', peopleCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', PEOPLE_COLUMNS.filter((c) => !peopleCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: candidates columns ===');
  const CAND_COLUMNS = ['id', 'person_id', 'tenant_id', 'status', 'headline', 'created_at', 'updated_at'];
  const candCols = await probeColumns('candidates', CAND_COLUMNS);
  console.log('EXISTENTES:', candCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', CAND_COLUMNS.filter((c) => !candCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE: domain_events columns ===');
  const EV_COLUMNS = ['id', 'tenant_id', 'event_name', 'event_type', 'aggregate_type', 'aggregate_id', 'actor_person_id', 'payload', 'created_at'];
  const evCols = await probeColumns('domain_events', EV_COLUMNS);
  console.log('EXISTENTES:', evCols.join(', ') || 'nenhuma');
  console.log('AUSENTES:', EV_COLUMNS.filter((c) => !evCols.includes(c)).join(', ') || 'nenhuma');

  console.log('\n=== PROBE DONE ===');
})();