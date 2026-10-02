import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'db.okxqfyoqbhcmflpurfrw.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  options: '-c default_transaction_read_only=on -c statement_timeout=30000',
});

async function q(sql, label) {
  const client = await pool.connect();
  const res = await client.query(sql).catch((e) => ({ rows: [{ ERRO: e.message }] }));
  client.release();
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(res.rows, null, 2));
}

async function main() {
  await q('SHOW transaction_read_only', 'MODO');

  await q(
    `SELECT table_name, COUNT(*)::int AS colunas
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name IN ('dashboard_layouts','dashboard_widgets','dashboard_widget_positions')
     GROUP BY table_name`,
    'A. TABELAS DE DASHBOARD EXISTEM?'
  );

  await q(
    `SELECT table_name, column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name IN ('dashboard_layouts','dashboard_widgets')
     ORDER BY table_name, ordinal_position`,
    'B. COLUNAS'
  );

  await q(
    `SELECT COUNT(*)::int AS linhas_layouts FROM dashboard_layouts`,
    'C. LINHAS dashboard_layouts'
  );

  await q(
    `SELECT COUNT(*)::int AS linhas_widgets FROM dashboard_widgets`,
    'D. LINHAS dashboard_widgets'
  );

  await q(
    `SELECT COUNT(*)::int AS policies FROM pg_policies
     WHERE schemaname='public' AND tablename IN ('dashboard_layouts','dashboard_widgets')`,
    'E. RLS/policies dessas tabelas'
  );

  await q(
    `SELECT c.relname AS tabela, c.relrowsecurity AS rls
     FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE n.nspname='public' AND c.relname LIKE '%dashboard%' AND c.relkind='r'`,
    'F. RLS habilitado?'
  );

  await q(
    `SELECT COUNT(*)::int AS triggers_public FROM pg_trigger
     WHERE NOT tgisinternal AND tgrelid::regclass::text NOT LIKE 'auth.%' AND tgrelid::regclass::text NOT LIKE 'storage.%'`,
    'G. triggers public (reconciliacao)'
  );

  await q('select 1', 'FIM');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });
