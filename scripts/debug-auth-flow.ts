/**
 * Debug script: full AuthContext flow simulation
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

async function debugAuth() {
  console.log('1. LOGIN');
  const { data: loginData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email: 'evandro_j.o.a@hotmail.com',
      password: 'JsEmpregos_2026!',
    });
  if (loginError) {
    console.error('Login failed:', loginError.message);
    return;
  }
  console.log('   User ID:', loginData.user?.id);

  console.log('\n2. PEOPLE');
  const { data: personData, error: personError } = await supabase
    .from('people')
    .select('*')
    .eq('auth_user_id', loginData.user?.id || '')
    .maybeSingle();
  if (personError) console.error('Person error:', personError.message);
  console.log('   Person ID:', personData?.id);

  console.log('\n3. TENANT_MEMBERSHIPS');
  const { data: membershipData, error: membError } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, membership_role, status, created_at')
    .eq('person_id', personData?.id || '')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (membError) console.error('Membership error:', membError.message);
  console.log('   Membership:', membershipData);

  console.log('\n4. ROLE_ASSIGNMENTS');
  const { data: roleAssignments, error: raError } = await supabase
    .from('role_assignments')
    .select('role_id, expires_at, tenant_id')
    .eq('person_id', personData?.id || '')
    .or('expires_at.is.null,expires_at.gt.now()');
  if (raError) console.error('RA error:', raError.message);
  console.log('   count:', roleAssignments?.length || 0);
  console.log('   data:', JSON.stringify(roleAssignments));

  const roleIds = Array.from(
    new Set(
      (roleAssignments || []).map((ra: any) => ra.role_id).filter(Boolean),
    ),
  );
  console.log('   roleIds:', roleIds);

  console.log('\n5. ROLES');
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name, is_global')
    .in('id', roleIds);
  if (rolesError) console.error('Roles error:', rolesError.message);
  console.log('   roles:', JSON.stringify(roles));

  const isAdminMaster = (roles || []).some(
    (r: { name: string; is_global: boolean }) =>
      r.name === 'admin_master' && r.is_global === true,
  );
  console.log('\n6. RESULT');
  console.log('   isAdminMaster:', isAdminMaster);
  console.log('   primaryRole:', isAdminMaster ? 'admin_master' : 'member');

  console.log('\n=== DEBUG Complete ===');
}

debugAuth().catch(console.error);
