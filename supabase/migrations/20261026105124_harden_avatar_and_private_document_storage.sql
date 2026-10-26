-- Candidate avatar storage ownership and private-document access hardening.
-- Public avatar reads remain enabled; authenticated writes are restricted to the
-- authenticated user's own top-level storage folder. Private documents are
-- accessed only through server-side functions that perform resource authorization.

ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS avatar_url text;

DROP POLICY IF EXISTS avatars_insert ON storage.objects;
DROP POLICY IF EXISTS avatars_update ON storage.objects;
DROP POLICY IF EXISTS avatars_delete ON storage.objects;

CREATE POLICY avatars_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY avatars_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY avatars_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Remove blanket authenticated access to private documents. Server-side
-- functions using service_role must validate candidate/tenant permissions
-- before generating signed URLs or reading/writing these objects.
DROP POLICY IF EXISTS private_documents_read ON storage.objects;
DROP POLICY IF EXISTS private_documents_insert ON storage.objects;
DROP POLICY IF EXISTS private_documents_update ON storage.objects;
DROP POLICY IF EXISTS private_documents_delete ON storage.objects;
