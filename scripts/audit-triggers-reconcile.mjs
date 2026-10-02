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
  const client = await pool.connect();
  try {
    const porSchema = await client.query(`
      SELECT n.nspname AS schema, count(*)::int AS triggers
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE NOT t.tgisinternal
      GROUP BY 1
      ORDER BY 2 DESC
    `);
    console.log('=== TRIGGERS POR SCHEMA ===');
    console.log(JSON.stringify(porSchema.rows, null, 2));

    const total = await client.query(
      'SELECT count(*)::int AS total_all_schemas FROM pg_trigger WHERE NOT tgisinternal'
    );
    console.log('=== TOTAL TODOS OS SCHEMAS ===');
    console.log(JSON.stringify(total.rows, null, 2));

    const publicTriggers = await client.query(`
      SELECT t.tgname, n.nspname AS schema, c.relname AS tabela
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE NOT t.tgisinternal AND n.nspname = 'public'
      ORDER BY t.tgname
    `);
    console.log(`=== TRIGGERS PUBLIC (${publicTriggers.rows.length}) ===`);
    console.log(publicTriggers.rows.map((r) => r.tgname).join('\n'));

    const dup = await client.query(`
      SELECT t.tgname, count(*)::int AS ocorrencias
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE NOT t.tgisinternal AND n.nspname = 'public'
      GROUP BY t.tgname HAVING count(*) > 1
      ORDER BY 2 DESC
    `);
    console.log('=== NOMES DUPLICADOS EM PUBLIC ===');
    console.log(JSON.stringify(dup.rows, null, 2));

    const views = await client.query(`
      SELECT count(*)::int AS views_public
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'v'
    `);
    console.log('=== VIEWS PUBLIC ===');
    console.log(JSON.stringify(views.rows, null, 2));

    const tables = await client.query(`
      SELECT count(*)::int AS tabelas_public
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    `);
    console.log('=== TABELAS PUBLIC ===');
    console.log(JSON.stringify(tables.rows, null, 2));
  } finally {
    client.release();
  }
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });