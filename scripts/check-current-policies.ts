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

// Try via REST api with raw SQL using PostgREST format
async function getPolicies() {
  // Method: query directly via rpc using supabase's built-in functions
  const { data, error } = await supabase
    .from('pg_proc')
    .select('proname')
    .limit(5);

  console.log('pg_proc check:', data?.length, error?.message);

  // Try querying role_assignment table (should give us a hint about policies)
  const { data: ra, error: raErr } = await supabase
    .from('role_assignments')
    .select('role_id, tenant_id, person_id')
    .limit(5);

  console.log('role_assignments (direct):', ra?.length, raErr?.message || 'OK');
}

getPolicies().catch(console.error);
