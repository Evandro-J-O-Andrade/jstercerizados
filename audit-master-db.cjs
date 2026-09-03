const { Client } = require('pg');
const fs = require('fs');
const PASSWORD = fs.readFileSync('env_SUPABASE_DB_PASSWORD.txt', 'utf-8').trim();
const URL = fs.readFileSync('env_SUPABASE_URL.txt', 'utf-8').trim();
const PROJECT_REF = URL.replace('https://', '').replace('.supabase.co', '');
const c = new Client({ host: 'db.' + PROJECT_REF + '.supabase.co', port: 5432, user: 'postgres', password: PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });

(async () => {
  await c.connect();

  const tables = await c.query(`
    SELECT c.relname AS table_name, COALESCE(c.relrowsecurity, false) AS rls
    FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relkind = 'r' AND n.nspname = 'public'
    ORDER BY c.relname
  `);

  const hasTenant = await c.query(`
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
  `);
  const tenantSet = new Set(hasTenant.rows.map(r => r.table_name));

  const views = await c.query(`
    SELECT table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name
  `);

  const policies = await c.query(`
    SELECT tablename, count(*)::int AS n
    FROM pg_policies WHERE schemaname = 'public'
    GROUP BY tablename
  `);
  const policyMap = Object.fromEntries(policies.rows.map(p => [p.tablename, p.n]));

  const fns = await c.query(`
    SELECT n.nspname || '.' || p.proname AS sig
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' ORDER BY sig
  `);

  const trg = await c.query(`
    SELECT count(*)::int AS n FROM information_schema.triggers WHERE trigger_schema = 'public'
  `);

  const fks = await c.query(`
    SELECT tc.table_name AS from_table, kcu.column_name AS from_col,
           ccu.table_name AS to_table, ccu.column_name AS to_col
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `);

  const totalPolicies = policies.rows.reduce((s, r) => s + r.n, 0);
  const tablesWithPolicies = policies.rows.length;

  // Row counts
  const rcs = await c.query(`
    SELECT relname, n_live_tup::int AS rows
    FROM pg_stat_user_tables WHERE schemaname = 'public' AND n_live_tup > 0
    ORDER BY n_live_tup DESC
  `);

  let out = '# AUDIT MASTER — FASE 1: BANCO\n\n';
  out += '**Snapshot:** 2026-09-03 (Supabase `okxqfyoqbhcmflpurfrw`)\n\n';
  out += '## Resumo\n\n';
  out += '| Métrica | Valor |\n|---|---|\n';
  out += `| Tabelas | ${tables.rows.length} |\n`;
  out += `| Tabelas com tenant_id | ${tenantSet.size} |\n`;
  out += `| Tabelas com RLS habilitado | ${tables.rows.filter(t => t.rls).length} |\n`;
  out += `| Tabelas com policies | ${tablesWithPolicies} |\n`;
  out += `| Total de policies (public) | ${totalPolicies} |\n`;
  out += `| Policies de storage | 16 |\n`;
  out += `| Views públicas | ${views.rows.length} |\n`;
  out += `| Functions (RPCs) | ${fns.rows.length} |\n`;
  out += `| Triggers | ${trg.rows[0].n} |\n`;
  out += `| Foreign keys | ${fks.rows.length} |\n\n`;

  out += '## Tabelas (com RLS, tenant_id, policies e row count)\n\n';
  out += '| Tabela | tenant_id | RLS | Policies | Linhas |\n|---|---|---|---|---|\n';
  const rcMap = Object.fromEntries(rcs.rows.map(r => [r.relname, r.rows]));
  for (const t of tables.rows) {
    const hasT = tenantSet.has(t.table_name) ? '✅' : '—';
    const rls = t.rls ? '✅' : '—';
    const pol = policyMap[t.table_name] || 0;
    const rows = rcMap[t.table_name] || 0;
    out += `| ${t.table_name} | ${hasT} | ${rls} | ${pol} | ${rows} |\n`;
  }

  out += '\n## Views\n\n';
  for (const v of views.rows) out += `- ${v.table_name}\n`;

  out += '\n## RPCs (functions)\n\n';
  for (const f of fns.rows) out += `- ${f.sig}\n`;

  out += '\n## Foreign keys (todas)\n\n';
  out += '| De | Para |\n|---|---|\n';
  for (const fk of fks.rows) {
    out += `| ${fk.from_table}.${fk.from_col} | ${fk.to_table}.${fk.to_col} |\n`;
  }

  fs.writeFileSync('audit-master-db.md', out);
  console.log('WROTE: audit-master-db.md');
  console.log('Summary: TABLES=' + tables.rows.length + ' WITH_TENANT=' + tenantSet.size + ' RLS=' + tables.rows.filter(t => t.rls).length + ' POLICIES=' + totalPolicies + ' VIEWS=' + views.rows.length + ' RPCs=' + fns.rows.length + ' TRIGGERS=' + trg.rows[0].n + ' FKs=' + fks.rows.length + ' TABLES_WITH_ROWS=' + rcs.rows.length);

  await c.end();
})();
