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
  // Try to find the historical user
  const { data, error } = await supabase
    .from('people')
    .select('id, email, created_at, auth_user_id')
    .ilike('email', '%darkangelyas%')
    .limit(5);

  console.log('\n=== people com darkangelyas ===');
  console.log('error:', error?.message || null);
  if (data && data.length > 0) {
    data.forEach(p => console.log(p));
  } else if (!error) {
    console.log('Nenhum people encontrado');
  }

  // Try candidates
  const { data: candData, error: candError } = await supabase
    .from('candidates')
    .select('id, email, created_at, auth_user_id')
    .ilike('email', '%darkangelyas%')
    .limit(5);

  console.log('\n=== candidates com darkangelyas ===');
  console.log('error:', candError?.message || null);
  if (candData && candData.length > 0) {
    candData.forEach(c => console.log(c));
  } else if (!candError) {
    console.log('Nenhum candidates encontrado');
  }

  // List all people with email to find any historical records
  const { data: allPeople, error: allError } = await supabase
    .from('people')
    .select('id, email, created_at, auth_user_id')
    .order('created_at', { ascending: true })
    .limit(10);

  console.log('\n=== Primeiros 10 people (ordenados por created_at) ===');
  console.log('error:', allError?.message || null);
  if (allPeople && allPeople.length > 0) {
    allPeople.forEach(p => console.log({
      email: p.email,
      created_at: p.created_at,
      auth_user_id: p.auth_user_id,
    }));
  } else if (!allError) {
    console.log('Nenhum people encontrado');
  }
})();