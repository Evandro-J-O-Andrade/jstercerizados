/**
 * List all policies on role_assignments
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

async function listPolicies() {
  // Use the REST API to query pg_policies
  const response = await fetch(
    `${env.VITE_SUPABASE_URL}/rest/v1/rpc/get_policies`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
      },
      body: JSON.stringify({
        schema_name: 'public',
        table_name: 'role_assignments',
      }),
    },
  );
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

// Fallback: try via sql query
async function getPoliciesViaSql() {
  const { data, error } = await supabase.rpc('supabase_x__query', {
    query: `SELECT policyname, cmd, qual, withcheck FROM pg_policies WHERE tablename = 'role_assignments'`,
  });
  console.log('Policies:', data);
  console.log('Error:', error?.message || 'none');
}

async function main() {
  // Try querying via direct SQL through supabase
  const { data, error } = await supabase
    .from('pg_policies')
    .select('policyname, cmd')
    .eq('tablename', 'role_assignments')
    .limit(10);
  console.log('pg_policies:', data?.length, 'policies');
  console.log('Data:', JSON.stringify(data));
  console.log('Error:', error?.message);
}

main().catch(console.error);
