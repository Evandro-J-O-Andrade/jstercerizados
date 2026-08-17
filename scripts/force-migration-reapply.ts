import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import https from 'https';

const env: Record<string, string> = {};
fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  });

const SECRET = env.SUPABASE_SECRET_KEY || '';
const URL = env.VITE_SUPABASE_URL || '';

async function execSql(sql: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'db.okxqfyoqbhcmflpurfrw.supabase.co',
        port: 5432,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SECRET}`,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      },
    );
    req.on('error', reject);
    // Can't do raw PG over this - need to use Supabase REST instead
    req.end();
  });
}

// Use PostgREST to delete from schema_migrations
async function forceRefetchMigration() {
  // Delete migration 015 from schema_migrations so db push re-runs it
  const sql = `DELETE FROM schema_migrations WHERE version = '20260817000300';`;

  const supabase = createClient(URL, SECRET, {
    auth: { autoRefreshToken: false },
  });

  // Check what's in schema_migrations
  console.log('1. Checking schema_migrations...');
  const { data: migrations, error: mErr } = await supabase
    .from('schema_migrations')
    .select('version')
    .order('version');

  if (mErr) {
    console.error('Could not check schema_migrations:', mErr.message);
    console.log('Will try alternative approach');
  } else {
    console.log(
      'Current migrations:',
      migrations?.map((m: any) => m.version),
    );
  }
}

forceRefetchMigration().catch(console.error);
