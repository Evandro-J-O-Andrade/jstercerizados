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
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) process.exit(1);

const SQL = `
SELECT proname, prosrc
FROM pg_proc
WHERE proname IN ('user_has_permission', 'bootstrap_candidate_from_auth_user', 'bootstrap_candidate_identity')
ORDER BY proname;
`;

(async () => {
  console.log('\n=== SQL via pgrest ===');
  const resp = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: SQL }),
  });
  console.log('status:', resp.status);
  const text = await resp.text();
  console.log('body:', text.substring(0, 800));

  // Try direct SQL endpoint
  console.log('\n=== SQL via /rest/v1/sql ===');
  const resp2 = await fetch(`${url}/rest/v1/sql`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  });
  console.log('status:', resp2.status);
  const text2 = await resp2.text();
  console.log('body:', text2.substring(0, 800));

  // Try /database/queries
  console.log('\n=== SQL via /database/queries ===');
  const resp3 = await fetch(`${url}/database/queries`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: SQL }),
  });
  console.log('status:', resp3.status);
  const text3 = await resp3.text();
  console.log('body:', text3.substring(0, 800));

  console.log('\n=== DONE ===');
})();