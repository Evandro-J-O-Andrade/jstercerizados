-- =============================================================================
-- P3-A.2 — Storage Hardening: public-media Policies ONLY (idempotent)
-- Date: 2026-10-04
-- Empresa: J&S Empregos LTDA
-- Escopo: Endurecimento das policies do bucket public-media APENAS
-- Ordem: 91 (após P3-A.1 media permissions)
-- Dependencies: 001_media_storage_v1, 090_p3a1_media_permissions
-- =============================================================================
-- Propósito:
--   Substituir policies abertas do public-media (qualquer authenticated = pode escrever)
--   por policies que exigem service_role (Edge Function após verificação RBAC).
--
-- NÃO TOCAR EM:
--   - avatars (fluxo próprio, risco de quebrar onboarding/perfil)
--   - private-documents (bucket privado, contrato diferente)
-- =============================================================================
-- Regras:
--   - Tudo idempotente: DROP POLICY IF EXISTS + CREATE POLICY
--   - Não executar operações destrutivas nos dados
--   - Apenas bucket_id = 'public-media'
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. REMOVER POLICIES ABERTAS ATUAIS DO PUBLIC-MEDIA
-- =============================================================================

-- INSERT: qualquer authenticated (REMOVER)
DROP POLICY IF EXISTS public_media_insert ON storage.objects;

-- UPDATE: qualquer authenticated (REMOVER)
DROP POLICY IF EXISTS public_media_update ON storage.objects;

-- DELETE: qualquer authenticated (REMOVER)
DROP POLICY IF EXISTS public_media_delete ON storage.objects;

-- =============================================================================
-- 2. NOVAS POLICIES RESTRITIVAS — SOMENTE PUBLIC-MEDIA
-- =============================================================================

-- Public read: MANTÉM (site público precisa ler imagens)
-- Policy existente: public_media_read
-- CREATE POLICY public_media_read ON storage.objects FOR SELECT TO public
--   USING (bucket_id = 'public-media');

-- INSERT: APENAS service_role (Edge Function após verificação de permissão)
CREATE POLICY public_media_insert_service_only
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'public-media');

-- UPDATE: APENAS service_role (Edge Function após verificação de permissão)
CREATE POLICY public_media_update_service_only
  ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'public-media');

-- DELETE: APENAS service_role (Edge Function após verificação de permissão)
CREATE POLICY public_media_delete_service_only
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'public-media');

-- =============================================================================
-- 3. AVATARS E PRIVATE-DOCUMENTS — NÃO ALTERADOS NESTA MIGRATION
-- =============================================================================
-- RISCO: Mudar policies agora quebra fluxos existentes (avatar, onboarding, docs privados)
-- Esses buckets terão hardening próprio em fase dedicada, se necessário.

-- =============================================================================
-- 4. VALIDAÇÃO
-- =============================================================================

DO $$
DECLARE
  v_count integer;
BEGIN
  -- Verificar que public-media tem exatamente 3 policies de write para service_role
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE 'public_media_%'
    AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
    AND 'service_role' = ANY(roles);

  ASSERT v_count = 3,
    'public-media deve ter exatamente 3 policies de write (INSERT/UPDATE/DELETE) para service_role';

  -- Verificar que NÃO existe policy para authenticated em write no public-media
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE 'public_media_%'
    AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
    AND 'authenticated' = ANY(roles);

  ASSERT v_count = 0,
    'public-media NÃO deve ter policies de write para authenticated';

  -- Verificar que public read continua existindo
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'public_media_read'
    AND cmd = 'SELECT'
    AND 'public' = ANY(roles);

  ASSERT v_count = 1,
    'public-media deve manter policy de public read (public_media_read)';

  -- Verificar que avatars NÃO foi alterado (ainda tem policies authenticated)
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE 'avatars_%'
    AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
    AND 'authenticated' = ANY(roles);

  ASSERT v_count >= 1,
    'avatars deve manter policies de write para authenticated (não alterado nesta migration)';

  -- Verificar que private-documents NÃO foi alterado
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE 'private_documents_%'
    AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
    AND 'authenticated' = ANY(roles);

  ASSERT v_count >= 1,
    'private-documents deve manter policies de write para authenticated (não alterado nesta migration)';

  -- Verificar que private-documents NÃO ganhou public read
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE 'private_documents_%'
    AND cmd = 'SELECT'
    AND 'public' = ANY(roles);

  ASSERT v_count = 0,
    'private-documents NÃO deve ter policy de public read';

  RAISE NOTICE 'Storage hardening validation passed: public-media restricted to service_role for write; avatars and private-documents unchanged';
END $$;

-- =============================================================================
-- 5. COMENTÁRIOS
-- =============================================================================

COMMENT ON POLICY public_media_insert_service_only ON storage.objects IS
  'P3-A.2: Apenas service_role pode inserir no public-media. Edge Function valida permissão RBAC antes.';

COMMENT ON POLICY public_media_update_service_only ON storage.objects IS
  'P3-A.2: Apenas service_role pode atualizar no public-media.';

COMMENT ON POLICY public_media_delete_service_only ON storage.objects IS
  'P3-A.2: Apenas service_role pode deletar no public-media.';

-- =============================================================================
-- 6. MARCAÇÃO DE AUDITORIA
-- =============================================================================
-- Esta migration é idempotente e não destrutiva (apenas policies do public-media).
-- avatars e private-documents NÃO foram alterados.
-- Pode ser reexecutada com segurança.
-- Referência: P3-A.2 Storage Hardening (public-media only)

COMMIT;