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
  // Query auth.users directly via PostgREST (if exposed)
  console.log('\n=== TENTATIVA 1: auth.users via PostgREST ===');
  const { data, error } = await supabase
    .from('auth.users')
    .select('id, email, created_at, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data')
    .limit(5);

  console.log('error:', error?.message || null);
  if (data && data.length > 0) {
    data.forEach(u => {
      console.log({
        email: u.email,
        created_at: u.created_at,
        email_confirmed_at: u.email_confirmed_at,
        last_sign_in_at: u.last_sign_in_at,
        provider: u.raw_app_meta_data?.provider,
      });
    });
  } else if (!error) {
    console.log('Nenhum dado retornado (vazio ou não exposto)');
  }

  // Query auth.identities
  console.log('\n=== TENTATIVA 2: auth.identities via PostgREST ===');
  const { data: idData, error: idError } = await supabase
    .from('auth.identities')
    .select('id, user_id, provider, identity_data, created_at, last_sign_in_at')
    .limit(5);

  console.log('error:', idError?.message || null);
  if (idData && idData.length > 0) {
    idData.forEach(i => {
      console.log({
        provider: i.provider,
        user_id: i.user_id,
        created_at: i.created_at,
        email: i.identity_data?.email,
      });
    });
  } else if (!idError) {
    console.log('Nenhum dado retornado (vazio ou não exposto)');
  }
})();