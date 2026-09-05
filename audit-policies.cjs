const { Client } = require('pg');
const fs = require('fs');
const PASSWORD = fs.readFileSync('env_SUPABASE_DB_PASSWORD.txt', 'utf-8').trim();
const URL = fs.readFileSync('env_SUPABASE_URL.txt', 'utf-8').trim();
const PROJECT_REF = URL.replace('https://', '').replace('.supabase.co', '');
const c = new Client({ host: 'db.' + PROJECT_REF + '.supabase.co', port: 5432, user: 'postgres', password: PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
(async () => {
  await c.connect();
  // All policies
  const p = await c.query(`
    SELECT schemaname, count(*) AS n FROM pg_policies GROUP BY 1
  `);
  console.log('SCHEMAS with policies:');
  p.rows.forEach(r => console.log('  ' + r.schemaname + ': ' + r.n));
  // RLS enabled per table
  const rls = await c.query(`
    SELECT c.relname, c.relrowsecurity AS rls
    FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = true
    ORDER BY c.relname
  `);
  console.log('TABLES with RLS:', rls.rows.length);
  await c.end();
})();
