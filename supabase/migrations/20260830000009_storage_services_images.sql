-- =============================================================================
-- FASE 4 — Serviços: Storage para uploads de imagens
-- =============================================================================
-- Cria bucket `services-images` e políticas RLS de leitura/escrita.
-- =============================================================================

-- 1. Bucket idempotente (INSERT ... ON CONFLICT DO NOTHING)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'services-images',
  'services-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas RLS no bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'services_images_public_read'
  ) THEN
    CREATE POLICY services_images_public_read
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'services-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'services_images_authenticated_write'
  ) THEN
    CREATE POLICY services_images_authenticated_write
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'services-images'
        AND (
          auth.uid() IN (
            SELECT p.auth_user_id
            FROM public.people p
            JOIN public.tenant_memberships tm
              ON tm.person_id = p.id
            WHERE tm.status = 'active'
          )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'services_images_authenticated_update'
  ) THEN
    CREATE POLICY services_images_authenticated_update
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'services-images'
        AND (
          auth.uid() IN (
            SELECT p.auth_user_id
            FROM public.people p
            JOIN public.tenant_memberships tm
              ON tm.person_id = p.id
            WHERE tm.status = 'active'
          )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'services_images_authenticated_delete'
  ) THEN
    CREATE POLICY services_images_authenticated_delete
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'services-images'
        AND (
          auth.uid() IN (
            SELECT p.auth_user_id
            FROM public.people p
            JOIN public.tenant_memberships tm
              ON tm.person_id = p.id
            WHERE tm.status = 'active'
          )
        )
      );
  END IF;
END $$;

COMMENT ON TABLE storage.buckets IS
  'Bucket `services-images` criado para uploads de card/hero de serviços.';
