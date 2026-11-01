-- =============================================================================
-- SCRIPT DE VERIFICAÇÃO DE MIGRAÇÕES PENDENTES (AUDITORIA SOMENTE LEITURA)
-- =============================================================================
-- Execute este script no SQL Editor do Supabase Dashboard para identificar
-- o histórico de migrações aplicadas no banco remoto.
--
-- Este script NÃO cria, altera ou remove objetos. É somente leitura.
--
-- NÃO presume colunas ou tabelas específicas. Identifica primeiro a estrutura
-- real do histórico de migrações antes de consultar versões aplicadas.
-- =============================================================================

-- 1. Identificar tabelas de histórico de migrações disponíveis
SELECT
  table_schema,
  table_name
FROM information_schema.tables
WHERE
  (table_schema = 'supabase_migrations' AND table_name = 'schema_migrations')
  OR
  (table_schema = 'supabase' AND table_name IN ('migrations', 'schema_migrations'))
ORDER BY table_schema, table_name;

-- 2. Consultar colunas da tabela encontrada (exemplo para supabase_migrations.schema_migrations)
-- Descomente e ajuste o nome da tabela após confirmar a existência na etapa 1.
-- SELECT
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'supabase_migrations'
--   AND table_name = 'schema_migrations'
-- ORDER BY ordinal_position;

-- 3. Listar versões aplicadas (exemplo para supabase_migrations.schema_migrations)
-- Descomente após confirmar a estrutura real.
-- SELECT *
-- FROM supabase_migrations.schema_migrations
-- ORDER BY version;

-- 4. Alternativa: listar todas as tabelas que contenham "migration" no nome
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE tablename LIKE '%migration%'
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- =============================================================================
-- INSTRUÇÕES PARA RECONCILIAÇÃO LOCAL
-- =============================================================================
-- Este script NÃO pode listar arquivos locais via SQL. A comparação deve ser
-- feita manualmente:
--
-- 1. Execute as consultas acima no SQL Editor do Supabase Dashboard.
-- 2. Anote as versões encontradas no histórico remoto.
-- 3. Compare com os 86 arquivos locais em supabase/migrations/.
-- 4. Considere os diretórios _legacy, _review, _superseded e arquivos .BLOQUEADO
--    como não executáveis automaticamente.
-- 5. Não execute nenhuma migration sem autorização explícita.
