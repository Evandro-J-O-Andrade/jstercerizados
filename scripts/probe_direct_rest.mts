import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  const contents = readFileSync('.env.local', 'utf-8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;
console.log('URL:', url ? 'PRESENTE' : 'AUSENTE');
console.log('KEY TYPE:', process.env.SUPABASE_SECRET_KEY ? 'SERVICE_ROLE' : 'ANON');
if (!url || !key) process.exit(1);

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: 'public' },
});

(async () => {
  console.log('\n=== DIRECT REST: pg_proc via service role ===');
  const restUrl = `${url}/rest/v1/pg_proc?proname=eq.user_has_permission&select=proname,prosrc&limit=5`;
  const resp = await fetch(restUrl, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  });
  console.log('status:', resp.status);
  const text = await resp.text();
  console.log('body:', text.substring(0, 500));

  console.log('\n=== DIRECT REST: information_schema.columns ===');
  const restUrl2 = `${url}/rest/v1/columns?table_schema=eq.public&table_name=eq.first_login_state&select=column_name,data_type,column_default,is_nullable&order=ordinal_position`;
  const resp2 = await fetch(restUrl2, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  });
  console.log('status:', resp2.status);
  const text2 = await resp2.text();
  console.log('body:', text2.substring(0, 500));

  console.log('\n=== DIRECT REST: role_assignments columns ===');
  const restUrl3 = `${url}/rest/v1/columns?table_schema=eq.public&table_name=eq.role_assignments&select=column_name,data_type&order=ordinal_position`;
  const resp3 = await fetch(restUrl3, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  });
  console.log('status:', resp3.status);
  const text3 = await resp3.text();
  console.log('body:', text3.substring(0, 500));

  console.log('\n=== DONE ===');
})();