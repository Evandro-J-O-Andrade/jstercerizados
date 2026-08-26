import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnvFile(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('='))
        continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (!process.env[key.trim()]) process.env[key.trim()] = value;
    }
  } catch {
    // ignore
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false } },
);

async function main() {
  const { data: jobs } = await supabase.from('jobs').select('id').limit(1);
  console.log('JOB ID:', jobs?.[0]?.id);

  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1);
  console.log('COMPANY ID:', companies?.[0]?.id);
}

main().catch((e: any) => console.error('EXCEPTION:', e.message));
