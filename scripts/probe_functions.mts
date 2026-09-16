import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  const contents = readFileSync('.env', 'utf-8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) process.exit(1);

const supabase = createClient(url, key);

(async () => {
  console.log('=== RPC user_has_permission ===');
  const { data, error } = await supabase.rpc('user_has_permission', {
    p_auth_user_id: '00000000-0000-0000-0000-000000000000',
    p_resource: 'candidates',
    p_action: 'read',
  });
  console.log('data:', data, 'error:', error?.message ?? 'none');

  console.log('=== RPC bootstrap_candidate_identity ===');
  const { data: data2, error: error2 } = await supabase.rpc('bootstrap_candidate_identity', {
    p_auth_user_id: '00000000-0000-0000-0000-000000000000',
    p_full_name: 'Test',
    p_email: 'test@example.com',
  });
  console.log('data:', JSON.stringify(data2), 'error:', error2?.message ?? 'none');

  console.log('=== first_login_state ===');
  const { data: flsData, error: flsErr } = await supabase.from('first_login_state').select('*').limit(1);
  console.log('rows:', JSON.stringify(flsData), 'error:', flsErr?.message ?? 'none');

  console.log('=== role_assignments ===');
  const { data: raData, error: raErr } = await supabase.from('role_assignments').select('*').limit(1);
  console.log('rows:', JSON.stringify(raData), 'error:', raErr?.message ?? 'none');

  console.log('=== people ===');
  const { data: peopleData, error: peopleErr } = await supabase.from('people').select('*').limit(1);
  console.log('rows:', JSON.stringify(peopleData), 'error:', peopleErr?.message ?? 'none');

  console.log('=== candidates ===');
  const { data: candData, error: candErr } = await supabase.from('candidates').select('*').limit(1);
  console.log('rows:', JSON.stringify(candData), 'error:', candErr?.message ?? 'none');

  console.log('=== domain_events ===');
  const { data: evData, error: evErr } = await supabase.from('domain_events').select('*').limit(1);
  console.log('rows:', JSON.stringify(evData), 'error:', evErr?.message ?? 'none');

  console.log('=== roles ===');
  const { data: rolesData, error: rolesErr } = await supabase.from('roles').select('*').limit(5);
  console.log('rows:', JSON.stringify(rolesData), 'error:', rolesErr?.message ?? 'none');

  console.log('=== DONE ===');
})();