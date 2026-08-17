/**
 * Test role_assignments via service_role
 */
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

async function test() {
  const personId = '5959468c-ce89-474a-a277-a1eef6ff1731';
  const { data, error } = await supabase
    .from('role_assignments')
    .select('role_id, expires_at, tenant_id')
    .eq('person_id', personId);

  console.log('Service role query:', data?.length || 0, 'rows');
  console.log('Error:', error?.message || 'none');
  console.log('Data:', JSON.stringify(data));
}

test().catch(console.error);
