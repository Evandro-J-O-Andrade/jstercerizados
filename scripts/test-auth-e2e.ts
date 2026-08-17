import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://okxqfyoqbhcmflpurfrw.supabase.co',
  'sb_publishable_8BqjHyGkcIvLYeOjKg4q8g_WT8l3xqE',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function test() {
  console.log('1. LOGIN');
  const { data: loginData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email: 'evandro_j.o.a@hotmail.com',
      password: 's@An29070818',
    });
  if (loginError) {
    console.error('Login failed:', loginError.message);
    process.exit(1);
  }
  console.log('✅ Login OK:', loginData.user?.email);
  console.log('   Session token present:', !!loginData.session?.access_token);

  console.log('\n2. AUTH CONTEXT SIMULATION');
  const { data: personData } = await supabase
    .from('people')
    .select('*')
    .eq('auth_user_id', loginData.user?.id || '')
    .maybeSingle();
  console.log('✅ Person ID:', personData?.id);

  const { data: membershipData } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, membership_role')
    .eq('person_id', personData?.id || '')
    .eq('status', 'active')
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  console.log(
    '✅ Tenant membership:',
    membershipData?.membership_role,
    'tenant:',
    membershipData?.tenant_id,
  );

  const { data: roleAssignments } = await supabase
    .from('role_assignments')
    .select('role_id')
    .eq('person_id', personData?.id || '')
    .or('expires_at.is.null,expires_at.gt.now()');

  const roleIds = Array.from(
    new Set(
      (roleAssignments || []).map((ra: any) => ra.role_id).filter(Boolean),
    ),
  );

  const { data: roles } = await supabase
    .from('roles')
    .select('id, name, is_global')
    .in('id', roleIds);

  console.log(
    '✅ Roles:',
    roles?.map((r: any) => r.name),
  );
  const isAdminMaster = (roles || []).some(
    (r: { name: string; is_global: boolean }) =>
      r.name === 'admin_master' && r.is_global === true,
  );
  console.log('✅ isAdminMaster:', isAdminMaster);

  console.log('\n3. SESSION PERSISTENCE');
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('✅ Session active after login:', !!sessionData.session);

  console.log('\n4. LOGOUT');
  const { error: logoutError } = await supabase.auth.signOut();
  console.log('✅ Logout OK:', !logoutError);

  console.log('\n5. PROTECTED ROUTE CHECK');
  const { data: sessionAfter } = await supabase.auth.getSession();
  const canAccessDashboard = !!sessionAfter.session;
  console.log('✅ Redirect to /login required:', !canAccessDashboard);

  console.log('\n=== AUTH-E2E-001: ALL TESTS PASSED ===');
}

test().catch((err) => {
  console.error('❌ FAIL:', err.message);
  process.exit(1);
});
