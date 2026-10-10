-- Diagnóstico do módulo de mídia — 15 consultas somente leitura
-- Projeto esperado: okxqfyoqbhcmflpurfrw
-- Não contém INSERT, UPDATE, DELETE, DDL, grants ou migrations.
-- Execute cada consulta separadamente no SQL Editor.

-- 1. Constraint de entity_type
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.media_assets'::regclass
  AND conname = 'media_assets_entity_type_check';

-- 2. Contagem de assets por tipo, bucket e tenant
SELECT entity_type, bucket_id, tenant_id,
       count(*) AS total,
       count(width) AS with_width,
       count(height) AS with_height,
       count(*) FILTER (WHERE is_primary) AS primary_count
FROM public.media_assets
GROUP BY entity_type, bucket_id, tenant_id
ORDER BY entity_type, bucket_id;

-- 3. Cobertura global de dimensões
SELECT count(*) AS total_assets,
       count(width) AS assets_with_width,
       count(height) AS assets_with_height,
       round(100.0 * count(width) / NULLIF(count(*), 0), 2) AS width_pct,
       round(100.0 * count(height) / NULLIF(count(*), 0), 2) AS height_pct
FROM public.media_assets;

-- 4. Buckets e configuração
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY id;

-- 5. Contagem de objetos por bucket
SELECT b.id AS bucket_id, b.public, count(o.id) AS object_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON o.bucket_id = b.id
GROUP BY b.id, b.public
ORDER BY b.id;

-- 6. Policies de Storage relevantes
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname IN (
    'public_media_read', 'public_media_insert_service_only',
    'public_media_update_service_only', 'public_media_delete_service_only',
    'avatars_insert', 'avatars_update', 'avatars_delete', 'avatars_read',
    'private_documents_read', 'private_documents_insert',
    'private_documents_update', 'private_documents_delete'
  )
ORDER BY policyname;

-- 7. Permissões RBAC de mídia
SELECT p.code, p.resource, p.action, p.description
FROM public.permissions p
WHERE p.resource LIKE '%.media'
ORDER BY p.resource, p.action;

-- 8. Vínculos de permissões de mídia por papel
SELECT r.name AS role_name, r.scope AS role_scope,
       p.resource, p.action, p.code AS permission_code
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE p.resource LIKE '%.media'
ORDER BY r.name, p.resource, p.action;

-- 9. Definições das funções SQL de mídia
SELECT p.oid::regprocedure AS signature,
       p.prokind,
       pg_get_userbyid(p.proowner) AS owner,
       p.prosecdef AS security_definer,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('media_for_entity', 'set_primary_media')
  AND n.nspname = 'public'
ORDER BY p.proname;

-- 10. Grants de execução das funções de mídia
SELECT routine_name, grantee, privilege_type
FROM information_schema.role_routine_grants
WHERE routine_name IN ('media_for_entity', 'set_primary_media')
  AND specific_schema = 'public'
ORDER BY routine_name, grantee, privilege_type;

-- 11. Triggers de usuário em media_assets (decodificação corrigida de tgtype)
SELECT t.tgname AS trigger_name,
       p.proname AS function_name,
       CASE
         WHEN (t.tgtype & 2) = 2 THEN 'BEFORE'
         WHEN (t.tgtype & 64) = 64 THEN 'INSTEAD OF'
         ELSE 'AFTER'
       END AS timing,
       concat_ws(', ',
         CASE WHEN (t.tgtype & 4) = 4 THEN 'INSERT' END,
         CASE WHEN (t.tgtype & 8) = 8 THEN 'DELETE' END,
         CASE WHEN (t.tgtype & 16) = 16 THEN 'UPDATE' END,
         CASE WHEN (t.tgtype & 32) = 32 THEN 'TRUNCATE' END
       ) AS events,
       (t.tgtype & 1) = 1 AS for_each_row,
       t.tgdeferrable,
       t.tginitdeferred,
       pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'media_assets'
  AND n.nspname = 'public'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 12. Índices da tabela media_assets
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'media_assets'
ORDER BY indexname;

-- 13. RLS e FORCE RLS em media_assets
SELECT n.nspname AS schema_name,
       c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'media_assets';

-- 14. Policies RLS da tabela media_assets
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'media_assets'
ORDER BY policyname;

-- 15. Colunas e nullability de media_assets
SELECT ordinal_position, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'media_assets'
ORDER BY ordinal_position;
