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

  // Test 1: Simple select
  console.log('Test 1: Simple select');
  const t1 = await supabase
    .from('role_assignments')
    .select('id')
    .eq('person_id', personId);
  console.log(
    '  Result:',
    t1.data?.length || 0,
    'rows, error:',
    t1.error?.message || 'none',
  );

  // Test 2: With OR clause (expires_at)
  console.log('\nTest 2: With .or() clause');
  const t2 = await supabase
    .from('role_assignments')
    .select('role_id, expires_at')
    .eq('person_id', personId)
    .or('expires_at.is.null,expires_at.gt.now()');
  console.log(
    '  Result:',
    t2.data?.length || 0,
    'rows, error:',
    t2.error?.message || 'none',
  );

  // Test 3: Without OR clause
  console.log('\nTest 3: Without .or() clause');
  const t3 = await supabase
    .from('role_assignments')
    .select('role_id, expires_at')
    .eq('person_id', personId);
  console.log(
    '  Result:',
    t3.data?.length || 0,
    'rows, error:',
    t3.error?.message || 'none',
  );
  console.log('  Data:', JSON.stringify(t3.data));
}

test().catch(console.error);
