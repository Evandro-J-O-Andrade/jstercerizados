import { Client } from 'pg';
const c = new Client({ connectionString: 'postgresql://postgres:' + encodeURIComponent('@An2907081831') + '@db.okxqfyoqbhcmflpurfrw.supabase.co:5432/postgres' });
(async () => {
  await c.connect();
  const r = await c.query(`
    SELECT polname, polcmd,
           pg_get_expr(polqual, polrelid) AS using_expr,
           pg_get_expr(polwithcheck, polrelid) AS with_check
    FROM pg_policy
    WHERE polrelid = 'public.legal_acceptances'::regclass
  `);
  console.log(JSON.stringify(r.rows, null, 2));
  await c.end();
})();
