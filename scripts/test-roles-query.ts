import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://okxqfyoqbhcmflpurfrw.supabase.co',
  'sb_publishable_8BqjHyGkcIvLYeOjKg4q8g_WT8l3xqE',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function test() {
  await supabase.auth.signInWithPassword({
    email: 'evandro_j.o.a@hotmail.com',
    password: 'JsEmpregos_2026!',
  });

  const roleId = '82c33a22-b8d4-4711-b003-53c11b0d0be8';

  console.log('Test: select roles by ID');
  const { data: roles, error: roleError } = await supabase
    .from('roles')
    .select('id, name, is_global')
    .eq('id', roleId);
  console.log('Result:', roles?.length, 'rows');
  console.log('Error:', roleError?.message || 'none');
  console.log('Data:', JSON.stringify(roles));

  console.log('\nTest: select all roles');
  const { data: allRoles, error: allError } = await supabase
    .from('roles')
    .select('id, name, is_global');
  console.log('Result:', allRoles?.length, 'rows');
  console.log('Error:', allError?.message || 'none');
}

test().catch(console.error);
