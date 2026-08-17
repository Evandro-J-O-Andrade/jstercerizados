import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env: Record<string, string> = {};
fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  });

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

async function checkPolicies() {
  // Query role_assignments table directly (should trigger RLS)
  const { data, error } = await supabase
    .from('role_assignments')
    .select('id')
    .limit(1);

  console.log('role_assignments query:');
  console.log('  count:', data?.length || 0);
  console.log('  error:', error?.message || 'none');

  // Also test tenants (no recursion expected)
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id')
    .limit(1);
  console.log('tenants query:', tenants?.length || 0);
}

checkPolicies().catch(console.error);
