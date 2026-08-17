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

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  'sb_publishable_8BqjHyGkcIvLYeOjKg4q8g_WT8l3xqE',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function test() {
  const personId = '5959468c-ce89-474a-a277-a1eef6ff1731';

  // Wait for session first
  await supabase.auth.signInWithPassword({
    email: 'evandro_j.o.a@hotmail.com',
    password: 'JsEmpregos_2026!',
  });

  console.log('Test A: select role_id, expires_at with .or()');
  const t1 = await supabase
    .from('role_assignments')
    .select('role_id, expires_at')
    .eq('person_id', personId)
    .or('expires_at.is.null,expires_at.gt.now()');
  console.log('  Result:', t1.data?.length || 0, 'rows');
  console.log('  Error:', t1.error?.message || 'none');

  console.log('\nTest B: select role_id only WITHOUT .or()');
  const t2 = await supabase
    .from('role_assignments')
    .select('role_id')
    .eq('person_id', personId);
  console.log('  Result:', t2.data?.length || 0, 'rows');
  console.log('  Error:', t2.error?.message || 'none');
  console.log('  Data:', JSON.stringify(t2.data));

  console.log('\nTest C: select role_id with .or("expires_at.is.null")');
  const t3 = await supabase
    .from('role_assignments')
    .select('role_id')
    .eq('person_id', personId)
    .is('expires_at', null);
  console.log('  Result:', t3.data?.length || 0, 'rows');
  console.log('  Error:', t3.error?.message || 'none');
}

test().catch(console.error);
