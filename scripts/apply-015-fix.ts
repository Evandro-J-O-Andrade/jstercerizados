/**
 * Apply 015 fixes manually via SQL RPC (database already has partial migration)
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

const sql = `
-- Drop ALL policies first
DROP POLICY IF EXISTS "Role assignments readable by self" ON public.role_assignments;
DROP POLICY IF EXISTS "Role assignments manageable by global admin or tenant administrator" ON public.role_assignments;
DROP POLICY IF EXISTS "Role assignments manageable by global admin or tenant admin" ON public.role_assignments;
DROP POLICY IF EXISTS "role_assignments_select" ON public.role_assignments;
DROP POLICY IF EXISTS "role_assignments_manage" ON public.role_assignments;

-- Recreate helper functions (security definer to bypass RLS)
create or replace function public.is_admin_master(auth_uid uuid default auth.uid())
returns boolean as $$
  select exists (
    select 1 from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = $1
      and r.name = 'admin_master'
      and r.is_global = true
  )
$$ language sql security definer stable;

create or replace function public.can_manage_role_assignment(
  target_person_id uuid,
  target_tenant_id uuid default null
)
returns boolean as $$
  select exists (
    select 1 from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = auth.uid()
      and r.name = 'admin_master'
      and r.is_global = true
    union all
    select 1 from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = auth.uid()
      and r.name = 'tenant_admin'
      and r.is_global = false
      and ra.tenant_id = target_tenant_id
  )
$$ language sql security definer stable;

-- SELECT policy
create policy "role_assignments_select"
  on public.role_assignments for select
  using (
    person_id in (select id from public.people where auth_user_id = auth.uid())
    or is_admin_master()
    or auth.role() = 'service_role'
  );

-- INSERT/UPDATE/DELETE policy
create policy "role_assignments_manage"
  on public.role_assignments for all
  using (
    is_admin_master()
    or can_manage_role_assignment(role_assignments.person_id, role_assignments.tenant_id)
    or auth.role() = 'service_role'
  )
  with check (
    is_admin_master()
    or can_manage_role_assignment(null::uuid, role_assignments.tenant_id)
    or auth.role() = 'service_role'
  );
`;

console.log('Applying SQL fixes...');
const { error } = await supabase.rpc('exec_sql', { sql });
if (error) {
  console.error('RPC exec_sql failed:', error.message);

  // Fallback: try via pgrest
  console.log('Trying via fetch...');
  const response = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  console.log('Fetch result:', response.status, await response.text());
} else {
  console.log('SQL applied successfully!');
}

// Verify
await new Promise((r) => setTimeout(r, 1000));
const { data, error: err } = await supabase.auth.signInWithPassword({
  email: 'evandro_j.o.a@hotmail.com',
  password: 'JsEmpregos_2026!',
});
if (err) console.error('Login error:', err.message);
const pid = '5959468c-ce89-474a-a277-a1eef6ff1731';
const ra = await supabase
  .from('role_assignments')
  .select('role_id, tenant_id')
  .eq('person_id', pid);
console.log(
  'role_assignments query:',
  ra.data?.length || 0,
  'rows, error:',
  ra.error?.message || 'none',
);
