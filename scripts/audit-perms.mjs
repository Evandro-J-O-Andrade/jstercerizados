import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  host: 'db.okxqfyoqbhcmflpurfrw.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  options: '-c default_transaction_read_only=on -c statement_timeout=30000',
});

async function main() {
  const c = await pool.connect();
  try {
    const cols = await c.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='permissions' ORDER BY ordinal_position`);
    console.log('=== colunas de permissions ===');
    console.log(cols.rows.map((r) => '  ' + r.column_name + ' : ' + r.data_type).join('\n'));

    const acc = await c.query(`
      SELECT resource, action FROM permissions
      WHERE resource IN ('accounting','fiscal') ORDER BY resource, action`);
    console.log('\n=== permissoes accounting + fiscal ===');
    console.log(acc.rows.map((r) => '  ' + r.resource + '.' + r.action).join('\n'));

    const fin = await c.query(`
      SELECT action FROM permissions WHERE resource='finance' ORDER BY action`);
    console.log('\n=== permissoes finance ===');
    console.log(fin.rows.map((r) => '  finance.' + r.action).join('\n'));

    // quais tabelas existem para sustentar as permissoes accounting
    console.log('\n=== existe alguma tabela para accounting.*? ===');
    const tabs = await c.query(`
      SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r'
        AND (c.relname LIKE '%account%' OR c.relname LIKE '%ledger%'
             OR c.relname LIKE '%trial%' OR c.relname LIKE '%chart%'
             OR c.relname LIKE '%journal%' OR c.relname LIKE '%closing%')
      ORDER BY c.relname`);
    console.log(tabs.rows.length ? tabs.rows.map((r) => '  ' + r.relname).join('\n') : '  NENHUMA');
  } finally {
    c.release();
  }
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });