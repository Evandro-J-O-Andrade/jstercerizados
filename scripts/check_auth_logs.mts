import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  const contents = readFileSync('.env', 'utf-8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
console.log('URL:', url ? 'PRESENTE' : 'AUSENTE');
console.log('KEY:', key ? 'PRESENTE' : 'AUSENTE');
if (!url || !key) process.exit(1);

const supabase = createClient(url, key);

(async () => {
  // Query auth.audit_log via SQL (if exposed)
  console.log('\n=== auth.audit_log via PostgREST ===');
  const { data, error } = await supabase
    .from('auth.audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log('error:', error?.message || null);
  if (data && data.length > 0) {
    data.forEach(row => console.log({
      event: row.event,
      created_at: row.created_at,
      user_email: row.user_email,
      params: row.params,
    }));
  } else if (!error) {
    console.log('auth.audit_log não acessível');
  }

  // Query auth.events via SQL
  console.log('\n=== auth.events via PostgREST ===');
  const { data: evtData, error: evtError } = await supabase
    .from('auth.events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log('error:', evtError?.message || null);
  if (evtData && evtData.length > 0) {
    evtData.forEach(row => console.log(row));
  } else if (!evtError) {
    console.log('auth.events não acessível');
  }
})();