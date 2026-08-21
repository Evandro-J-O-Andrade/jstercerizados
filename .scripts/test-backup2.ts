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

const c = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});

async function main() {
  const { data, error } = await c.from('tenants').select('*').limit(0);
  console.log('data type:', typeof data, Array.isArray(data));
  console.log('data:', JSON.stringify(data, null, 2));
  console.log('error:', error?.message);
  console.log('count:', (data as any)?.length);
}

main();
