/**
 * Full AUTH-E2E-001 final test
 * Uses PUBLISHABLE key (anon) to simulate real frontend
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

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  'sb_publishable_8BqjHyGkcIvLYeOjKg4q8g_WT8l3xqE',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function test() {
  console.log('1. LOGIN');
  const { data: loginData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email: 'evandro_j.o.a@hotmail.com',
      password: 'JsEmpregos_2026!',
    });
  if (loginError) throw loginError;
  console.log('   OK user:', loginData.user?.email);

  console.log('\n2. AUTH CONTEXT');
  const { data: personData } = await supabase
    .from('people')
    .select('*')
    .eq('auth_user_id', loginData.user?.id || '')
    .maybeSingle();
  console.log('   Person:', personData?.id);

  const { data: membership } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, membership_role')
    .eq('person_id', personData?.id || '')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  console.log(
    '   Membership:',
    membership?.membership_role,
    membership?.tenant_id,
  );

  // KEY QUERY (same as AuthContext)
  console.log('\n3. ROLE ASSIGNMENTS (via publishable key)');
  const { data: roleAssignments, error: raError } = await supabase
    .from('role_assignments')
    .select('role_id, expires_at')
    .eq('person_id', personData?.id || '')
    .or('expires_at.is.null,expires_at.gt.now()');

  console.log('   Query result:');
  console.log('   count:', roleAssignments?.length || 0);
  console.log('   data:', JSON.stringify(roleAssignments));
  console.log('   error:', raError?.message || 'none');

  const roleIds = Array.from(
    new Set(
      (roleAssignments || []).map((ra: any) => ra.role_id).filter(Boolean),
    ),
  );
  console.log('   roleIds:', roleIds);

  if (roleIds.length > 0) {
    const { data: roles } = await supabase
      .from('roles')
      .select('id, name, is_global')
      .in('id', roleIds);
    console.log('   roles:', JSON.stringify(roles));

    const isAdminMaster = (roles || []).some(
      (r: { name: string; is_global: boolean }) =>
        r.name === 'admin_master' && r.is_global === true,
    );
    console.log('\n4. RBAC RESULT');
    console.log('   isAdminMaster:', isAdminMaster);
    console.log('   primaryRole:', isAdminMaster ? 'admin_master' : 'member');
  } else {
    console.error('FAIL: no roleIds - query broken');
  }

  console.log('\n=== TEST END ===');
}

test().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
