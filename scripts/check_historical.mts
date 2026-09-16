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
  // Try to find the historical user via people table (which may have auth_user_id)
  console.log('\n=== people com email contendo darkangelyas ===');
  const { data, error } = await supabase
    .from('people')
    .select('id, email, created_at, auth_user_id')
    .ilike('email', '%darkangelyas%')
    .limit(5);
  console.log('error:', error?.message || null);
  if (data && data.length > 0) {
    data.forEach(p => console.log(p));
  } else if (!error) {
    console.log('Nenhum people encontrado com esse email');
  }

  // List all people to see what exists
  console.log('\n===todos os people (primeiros 20) ===');
  const { data: allP, error: allErr } = await supabase
    .from('people')
    .select('id, email, created_at, auth_user_id')
    .order('created_at', { ascending: true })
    .limit(20);
  console.log('error:', allErr?.message || null);
  if (allP && allP.length > 0) {
    allP.forEach(p => console.log({
      email: p.email,
      created_at: p.created_at,
      auth_user_id: p.auth_user_id,
    }));
  } else if (!allErr) {
    console.log('Nenhum people encontrado');
  }

  // Try candidates table
  console.log('\n=== candidates ===');
  const { data: cand, error: candErr } = await supabase
    .from('candidates')
    .select('*')
    .limit(5);
  console.log('error:', candErr?.message || null);
  if (cand && cand.length > 0) {
    console.log('Colunas:', Object.keys(cand[0]));
    cand.forEach(c => console.log(c));
  } else if (!candErr) {
    console.log('Nenhum candidates encontrado');
  }
})();