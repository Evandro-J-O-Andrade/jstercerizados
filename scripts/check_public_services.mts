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

(async () => {
  // 1. View definition via pg_views
  console.log('\n=== pg_views: public_services_v1 ===');
  const { data, error } = await supabase
    .from('pg_views')
    .select('schemaname, viewname, viewowner, definition')
    .eq('schemaname', 'public')
    .eq('viewname', 'public_services_v1')
    .maybeSingle();
  console.log('error:', error?.message || null);
  if (data) {
    console.log('viewowner:', data.viewowner);
    console.log('definition:', data.definition?.substring(0, 500));
  } else if (!error) {
    console.log('View não encontrada');
  }

  // 2. Check RLS on services table
  console.log('\n=== pg_tables: services ===');
  const { data: svcData, error: svcErr } = await supabase
    .from('pg_tables')
    .select('schemaname, tablename, tableowner, rowsecurity')
    .eq('schemaname', 'public')
    .eq('tablename', 'services')
    .maybeSingle();
  console.log('error:', svcErr?.message || null);
  if (svcData) {
    console.log('tableowner:', svcData.tableowner);
    console.log('rowsecurity:', svcData.rowsecurity);
  }

  // 3. Check policies on services
  console.log('\n=== pg_policies: services ===');
  const { data: polData, error: polErr } = await supabase
    .from('pg_policies')
    .select('schemaname, tablename, policyname, permissive, roles, cmd, qual')
    .eq('schemaname', 'public')
    .eq('tablename', 'services');
  console.log('error:', polErr?.message || null);
  if (polData && polData.length > 0) {
    polData.forEach(p => console.log({
      policy: p.policyname,
      permissive: p.permissive,
      roles: p.roles,
      cmd: p.cmd,
      qual: p.qual?.substring(0, 100),
    }));
  } else if (!polErr) {
    console.log('Nenhuma policy encontrada');
  }

  // 4. Check grants on services
  console.log('\n=== pg_catalog: services grants ===');
  const { data: grantData, error: grantErr } = await supabase
    .from('pg_catalog.pg_table_privileges')
    .select('grantee, privilege_type, is_grantable')
    .eq('table_schema', 'public')
    .eq('table_name', 'services');
  console.log('error:', grantErr?.message || null);
  if (grantData && grantData.length > 0) {
    grantData.forEach(g => console.log(g));
  } else if (!grantErr) {
    console.log('Nenhum grant encontrado');
  }
})();