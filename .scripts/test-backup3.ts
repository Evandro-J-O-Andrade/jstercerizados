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

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reHFmeW9xYmhjbWZscHVyZnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjkxNDg3MSwiZXhwIjoyMTAyNDkwODcxfQ.rIkHyqktJebgu8fqJc6s0e2ilFFO_nRh-mH-tohHIEo';

const c = createClient(process.env.VITE_SUPABASE_URL!, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data, error } = await c.from('information_schema.tables')
    .select('table_name, table_type')
    .eq('table_schema', 'public')
    .order('table_name');
  
  console.log('tables:', JSON.stringify(data, null, 2));
  console.log('error:', error?.message);
}

main();
