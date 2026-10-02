-- =====================================================================
-- SUPABASE DOMAIN INVENTORY (READ-ONLY)
-- Run this as a single query in Supabase SQL Editor
-- Project: okxqfyoqbhcmflpurfrw
-- =====================================================================

-- 1. Tabelas e colunas
SELECT
  t.table_schema,
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c
  ON c.table_schema = t.table_schema
  AND c.table_name = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 2. Primary Keys e Foreign Keys
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  tc.constraint_type,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 3. Triggers
SELECT
  tg.tgname,
  tg.tgrelid::regclass AS table_name,
  tg.tgenabled,
  pg_get_triggerdef(tg.oid) AS trigger_definition
FROM pg_trigger tg
WHERE NOT tg.tgisinternal
ORDER BY tg.tgrelid::regclass::text;

-- 4. Funções / RPC
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS args,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND pg_get_function_result(p.oid) IS NOT NULL
ORDER BY p.proname;

-- 5. Views
SELECT
  table_schema,
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public';

-- 6. RLS Status
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 7. Policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. Roles
SELECT
  r.rolname,
  r.rolsuper,
  r.rolcreaterole,
  r.rolcreatedb,
  r.rolreplication
FROM pg_roles r
WHERE r.rolname NOT LIKE '__%'
ORDER BY r.rolname;

-- 9. Role-Table Grants (permissions)
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee NOT IN ('pg_read_all_data', 'pg_write_all_data')
ORDER BY table_name, grantee;

-- 10. Enums
SELECT
  t.typname AS enum_name,
  enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum enum ON t.oid = enum.typrelid
WHERE t.typcategory = 'E'
ORDER BY t.typname, enum.oid;

-- 11. Extensions
SELECT
  extname,
  extversion
FROM pg_extension;

-- 12. Indexes
SELECT
  i.relname AS index_name,
  a.attname AS column_name,
  am.amname AS index_method,
  ix.indisunique AS is_unique
FROM pg_class i
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
JOIN pg_index ix ON ix.indexrelid = i.oid
JOIN pg_am am ON am.oid = i.relam
WHERE t.relname IN (
  -- Lista de tabelas principais (será preenchida dinamicamente)
)
ORDER BY t.relname, i.relname;

-- 13. Counts (opcional — dados agregados, read-only)
DO $$
DECLARE
  sql_text TEXT := '';
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'grants%'
  LOOP
    sql_text := sql_text ||
      format('SELECT %L AS table_name, count(*) AS row_count FROM %I UNION ALL ',
             r.tablename, r.tablename);
  END LOOP;

  IF sql_text <> '' THEN
    sql_text := left(sql_text, -11); -- remove trailing 'UNION ALL'
    EXECUTE sql_text;
  END IF;
END $$;
