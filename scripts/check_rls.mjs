import { Client } from 'pg';
const c = new Client({ connectionString: 'postgresql://postgres:' + encodeURIComponent('@An2907081831') + '@db.okxqfyoqbhcmflpurfrw.supabase.co:5432/postgres' });
(async () => {
  await c.connect();
  for (const t of ['candidates','candidate_skills','candidate_experiences','candidate_education','candidate_courses','candidate_languages','candidate_documents','applications']) {
    const r = await c.query(`SELECT polname FROM pg_policy WHERE polrelid='public.${t}'::regclass ORDER BY polname`);
    console.log(`\n[${t}] ${r.rows.length} policies:`);
    for (const row of r.rows) console.log('  ', row.polname);
  }
  await c.end();
})();
