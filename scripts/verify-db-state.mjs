import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://okxqfyoqbhcmflpurfrw.supabase.co',
  process.env.SUPABASE_SECRET_KEY || '',
  { auth: { persistSession: false } }
);

(async () => {
  console.log('=== Real DB: Verify empresa bootstrap NOT deployed ===');
  console.log('');

  // 1. Check if bootstrap_company_from_auth_user exists
  const { data: funcs, error: fnErr } = await supabase
    .from('pg_proc')
    .select('proname')
    .eq('proname', 'bootstrap_company_from_auth_user');

  if (fnErr) {
    console.log('Error checking function:', fnErr.message);
  } else {
    console.log('bootstrap_company_from_auth_user exists:', funcs && funcs.length > 0);
  }

  // 2. Check company_representative role
  const { data: roles, error: roleErr } = await supabase
    .from('roles')
    .select('name')
    .eq('name', 'company_representative');

  console.log('company_representative role exists:', roles && roles.length > 0);

  // 3. Check first_login_state CHECK constraint for 'company_signup'
  const { data: checkConstraint, error: ccErr } = await supabase.rpc('sql', {
    query: `
      SELECT conname, consrc 
      FROM pg_constraint c 
      JOIN pg_class cl ON c.conrelid = cl.oid 
      WHERE cl.relname = 'first_login_state' AND c.contype = 'c'
    `
  });

  // If rpc doesn't work, try direct query
  if (ccErr) {
    console.log('CHECK constraint query (via rpc):', ccErr.message);
  }

  // 4. Check the bootstrap_candidate guard
  const { data: guardCheck, error: guardErr } = await supabase.rpc('sql', {
    query: `
      SELECT proname, prosrc 
      FROM pg_proc 
      WHERE proname = 'bootstrap_candidate_from_auth_user' 
      AND prosrc ILIKE '%signup_context%'
    `
  });

  if (guardErr) {
    console.log('Guard check error:', guardErr.message);
  } else {
    console.log('bootstrap_candidate guard on signup_context:', guardCheck && guardCheck.length > 0);
  }

  // Clean up test user
  const TEST_EMAIL = process.env.TEST_EMAIL;
  if (TEST_EMAIL) {
    console.log('\n=== Cleaning up test user ===');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === TEST_EMAIL);
    if (user) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
      console.log('Delete test user:', delErr ? `ERROR: ${delErr.message}` : 'OK');
    } else {
      console.log('Test user not found');
    }
  }

  process.exit(0);
})();
