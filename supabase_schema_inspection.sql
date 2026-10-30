-- ============================================================================
-- LEVANTAMENTO COMPLETO DO ESQUEMA SUPABASE - J&S Empregos LTDA
-- Projeto: okxqfyoqbhcmflpurfrw
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TODAS AS TABELAS (esquema public)
-- ----------------------------------------------------------------------------
SELECT
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ----------------------------------------------------------------------------
-- 2. COLUNAS DE TODAS AS TABELAS
-- ----------------------------------------------------------------------------
SELECT
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  numeric_precision,
  numeric_scale,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ----------------------------------------------------------------------------
-- 3. FOREIGN KEYS (relacionamentos entre tabelas)
-- ----------------------------------------------------------------------------
SELECT
  tc.table_name AS tabela_origem,
  kcu.column_name AS coluna_origem,
  ccu.table_name AS tabela_destino,
  ccu.column_name AS coluna_destino,
  tc.constraint_name AS fk_nome
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- ----------------------------------------------------------------------------
-- 4. UNIQUE CONSTRAINTS
-- ----------------------------------------------------------------------------
SELECT
  tc.table_name,
  tc.constraint_name AS unique_nome,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name, kcu.ordinal_position;

-- ----------------------------------------------------------------------------
-- 5. PRIMARY KEYS
-- ----------------------------------------------------------------------------
SELECT
  tc.table_name,
  tc.constraint_name AS pk_nome,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- ----------------------------------------------------------------------------
-- 6. VIEWS (visões)
-- ----------------------------------------------------------------------------
SELECT
  table_schema,
  table_name AS view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ----------------------------------------------------------------------------
-- 7. MATERIALIZED VIEWS (se houver)
-- ----------------------------------------------------------------------------
SELECT
  schemaname,
  matviewname AS view_name,
  definition
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

-- ----------------------------------------------------------------------------
-- 8. FUNÇÕES (routines/procedures)
-- ----------------------------------------------------------------------------
SELECT
  routine_schema,
  routine_name AS function_name,
  routine_type, -- FUNCTION ou PROCEDURE
  data_type AS return_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type IN ('FUNCTION', 'PROCEDURE')
ORDER BY routine_name;

-- ----------------------------------------------------------------------------
-- 9. TRIGGERS
-- ----------------------------------------------------------------------------
SELECT
  trigger_name,
  event_object_table AS tabela,
  event_manipulation AS evento, -- INSERT, UPDATE, DELETE
  action_statement AS funcao_executada,
  action_timing AS momento -- BEFORE, AFTER
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY tabela, trigger_name;

-- ----------------------------------------------------------------------------
-- 10. ROLES (papéis de banco de dados)
-- ----------------------------------------------------------------------------
SELECT
  rolname AS role_name,
  rolsuper AS eh_superusuario,
  rolinherit AS herda_privilegios,
  rolcreaterole AS pode_criar_role,
  rolcreatedb AS pode_criar_db,
  rolcanlogin AS pode_fazer_login,
  rolbypassrls AS ignora_rls
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%'
  AND rolname NOT IN ('postgres')
ORDER BY rolname;

-- ----------------------------------------------------------------------------
-- 11. PERMISSÕES EM TABELAS (grants)
-- ----------------------------------------------------------------------------
SELECT
  grantee AS role_recebe,
  table_schema,
  table_name,
  privilege_type AS tipo_permissao -- SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
FROM information_schema.table_privileges
WHERE table_schema = 'public'
ORDER BY grantee, table_name, privilege_type;

-- ----------------------------------------------------------------------------
-- 12. POLÍTICAS RLS (Row Level Security)
-- ----------------------------------------------------------------------------
SELECT
  schemaname,
  tablename AS tabela,
  policyname AS politica,
  permissive AS eh_permissiva,
  roles AS roles_aplicam,
  cmd AS comando, -- SELECT, INSERT, UPDATE, DELETE
  qual AS definicao_usando,
  with_check AS definicao_com_verificacao
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tabela, policyname;

-- ----------------------------------------------------------------------------
-- 13. TABELAS COM RLS HABILITADO
-- ----------------------------------------------------------------------------
SELECT
  schemaname,
  tablename AS tabela,
  rowsecurity AS rls_habilitado,
  forcerowsecurity AS rls_forcado
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ----------------------------------------------------------------------------
-- 14. ÍNDICES (além de PK/UK automáticas)
-- ----------------------------------------------------------------------------
SELECT
  tablename AS tabela,
  indexname AS indice,
  indexdef AS definicao
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ----------------------------------------------------------------------------
-- 15. RESUMO POR TABELA (contagem de colunas, chaves, índices)
-- ----------------------------------------------------------------------------
SELECT
  t.table_name,
  COUNT(c.column_name) AS total_colunas,
  COUNT(CASE WHEN c.data_type = 'timestamp without time zone' THEN 1 END) AS colunas_timestamp,
  COUNT(CASE WHEN c.column_default LIKE 'gen_random_uuid%' THEN 1 END) AS colunas_uuid_auto
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
  ON t.table_name = c.table_name
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
