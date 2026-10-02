import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const pool = new Pool({
  host: 'db.okxqfyoqbhcmflpurfrw.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function runQuery(sql, label) {
  try {
    const client = await pool.connect();
    const res = await client.query(sql);
    client.release();
    console.log(`\n=== ${label} ===`);
    console.log(JSON.stringify(res.rows, null, 2));
    return res.rows;
  } catch (e) {
    console.error(`${label} error:`, e.message);
    return [];
  }
}

async function main() {
  const results = {};

  // 1. Tabelas e contagem de colunas
  results.tables = await runQuery(
    `SELECT t.table_schema, t.table_name, 
     COUNT(c.column_name) AS column_count
     FROM information_schema.tables t
     LEFT JOIN information_schema.columns c 
       ON c.table_schema = t.table_schema 
       AND c.table_name = t.table_name
     WHERE t.table_schema = 'public'
       AND t.table_type = 'BASE TABLE'
     GROUP BY t.table_schema, t.table_name
     ORDER BY t.table_name`,
    'TABELAS E COLUNAS'
  );

  // 2. Roles
  results.roles = await runQuery(
    `SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolreplication
     FROM pg_roles WHERE rolname NOT LIKE '__%' ORDER BY rolname`,
    'ROLES'
  );

  // 3. Triggers
  results.triggers = await runQuery(
    `SELECT tg.tgname, tg.tgrelid::regclass AS table_name, tg.tgenabled,
     pg_get_triggerdef(tg.oid) AS trigger_definition
     FROM pg_trigger tg WHERE NOT tg.tgisinternal ORDER BY tg.tgrelid::regclass::text`,
    'TRIGGERS'
  );

  // 4. Functions
  results.functions = await runQuery(
    `SELECT n.nspname AS schema_name, p.proname AS function_name,
     pg_get_function_arguments(p.oid) AS args,
     pg_get_function_result(p.oid) AS return_type
     FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' ORDER BY p.proname`,
    'FUNCTIONS'
  );

  // 5. RLS Status
  results.rls = await runQuery(
    `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`,
    'RLS STATUS'
  );

  // 6. Policies
  results.policies = await runQuery(
    `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
     FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname`,
    'POLICIES'
  );

  // 7. Views
  results.views = await runQuery(
    `SELECT table_schema, table_name, view_definition
     FROM information_schema.views WHERE table_schema = 'public'`,
    'VIEWS'
  );

  // 8. Enums
  results.enums = await runQuery(
    `SELECT t.typname AS enum_name, 
     string_agg(enumlabel, ', ' ORDER BY enumsortorder) AS enum_values
     FROM pg_type t JOIN pg_enum enum ON t.oid = enum.typrelid
     WHERE t.typcategory = 'E' GROUP BY t.typname`,
    'ENUMS'
  );

  // 9. Extensions
  results.extensions = await runQuery(
    `SELECT extname, extversion FROM pg_extension`,
    'EXTENSIONS'
  );

  // 10. FKs
  results.foreign_keys = await runQuery(
    `SELECT tc.table_name, kcu.column_name, 
     ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
     JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
     ORDER BY tc.table_name, kcu.ordinal_position`,
    'FOREIGN KEYS'
  );

  // 11. Grants
  results.grants = await runQuery(
    `SELECT grantee, table_name, privilege_type
     FROM information_schema.role_table_grants
     WHERE table_schema = 'public'
     ORDER BY table_name, grantee`,
    'GRANTS'
  );

  // 12. Row counts
  const tableList = results.tables.map(t => t.table_name).filter(
    name => !name.startsWith('pg_') && !name.startsWith('_')
  );
  for (const table of tableList) {
    results['count_' + table] = await runQuery(
      `SELECT '${table}' AS table_name, count(*)::int AS row_count FROM ${table}`,
      'COUNT ' + table
    );
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'docs', 'supabase-inventory.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\n=== Resultados completos salvos em docs/supabase-inventory.json ===');

  await pool.end();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
