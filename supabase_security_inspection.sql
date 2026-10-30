-- ============================================================================
-- LEVANTAMENTO DE SEGURANÇA E AUTH - SUPABASE
-- Projeto: okxqfyoqbhcmflpurfrw
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================================

-- ----------------------------------------------------------------------------
-- A. FUNÇÕES SECURITY DEFINER (crítico para segurança)
-- ----------------------------------------------------------------------------
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS argument_types,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER (RISCO)'
    ELSE 'SECURITY INVOKER'
  END AS security_model,
  pg_get_userbyid(p.proowner) AS proprietario,
  pg_get_functiondef(p.oid) AS definicao_completa
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- ----------------------------------------------------------------------------
-- B. STORAGE BUCKETS
-- ----------------------------------------------------------------------------
SELECT
  id AS bucket_id,
  name AS bucket_name,
  public AS eh_publico,
  file_size_limit AS limite_arquivo_bytes,
  allowed_mime_types AS tipos_mime_permitidos,
  owner AS proprietario
FROM storage.buckets
ORDER BY name;

-- ----------------------------------------------------------------------------
-- C. TABELAS DO SCHEMA auth (usuários, identidades, sessões)
-- ----------------------------------------------------------------------------
-- Nota: O esquema auth é gerenciado pelo Supabase Auth. Listar apenas se acessível.
SELECT
  schemaname,
  tablename AS tabela_auth
FROM pg_tables
WHERE schemaname = 'auth'
ORDER BY tablename;

-- ----------------------------------------------------------------------------
-- D. EXTENSÕES POSTGRES INSTALADAS
-- ----------------------------------------------------------------------------
SELECT
  extname AS extensao,
  extversion AS versao,
  extnamespace::regnamespace AS esquema
FROM pg_extension
ORDER BY extname;

-- ----------------------------------------------------------------------------
-- E. PUBLICATIONS (Realtime)
-- ----------------------------------------------------------------------------
SELECT
  pubname AS nome_publicacao,
  puballtables AS publica_todas_tabelas,
  pubinsert AS permite_insert,
  pubupdate AS permite_update,
  pubdelete AS permite_delete,
  pubtruncate AS permite_truncate
FROM pg_publication;

-- ----------------------------------------------------------------------------
-- F. QUais tabelas estão na publication do realtime
-- ----------------------------------------------------------------------------
SELECT
  pubname AS publicacao,
  relname AS tabela
FROM pg_publication_tables
ORDER BY pubname, relname;

-- ----------------------------------------------------------------------------
-- G. CRON JOBS (pg_cron, se instalado)
-- ----------------------------------------------------------------------------
SELECT
  jobid,
  jobname AS nome_job,
  schedule AS cron_schedule,
  command AS comando_sql,
  job_active AS ativo
FROM cron.job
ORDER BY jobname;

-- ----------------------------------------------------------------------------
-- H. RESUMO DE TABELAS SEM RLS (risco de segurança)
-- ----------------------------------------------------------------------------
SELECT
  schemaname,
  tablename AS tabela_sem_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- ----------------------------------------------------------------------------
-- I. RESUMO DE TABELAS COM RLS MAS SEM POLÍTICAS (tudo bloqueado)
-- ----------------------------------------------------------------------------
SELECT
  t.tablename AS tabela_rls_sem_politica
FROM pg_tables t
LEFT JOIN pg_policies p
  ON t.tablename = p.tablename
  AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND p.policyname IS NULL
ORDER BY t.tablename;

-- ============================================================================
-- FIM DO SCRIPT DE SEGURANÇA
-- ============================================================================
