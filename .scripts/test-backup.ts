import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile() {
  try {
    const contents = readFileSync('.env.local', 'utf-8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {}
}
loadEnvFile();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://okxqfyoqbhcmflpurfrw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const c = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data, error } = await c.from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .neq('table_type', 'VIEW')
    .order('table_name');
  
  console.log('tables:', JSON.stringify(data, null, 2));
  console.log('error:', error?.message);
}

main();
