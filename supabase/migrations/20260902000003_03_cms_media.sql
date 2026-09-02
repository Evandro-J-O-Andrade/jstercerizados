-- =============================================================================
-- 03 — CMS / MEDIA
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Padrões transversais de CMS (helpers) e contratos de media_assets
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Rollback:
--   DROP FUNCTION IF EXISTS public.media_for_entity(text, uuid);
--   DROP FUNCTION IF EXISTS public.set_primary_media(text, uuid, uuid);
-- =============================================================================

BEGIN;

-- 3.1 — media_for_entity(entity_type, entity_id) → conjunto de assets ordenados
CREATE OR REPLACE FUNCTION public.media_for_entity(
  p_entity_type text,
  p_entity_id   uuid
)
RETURNS TABLE (
  id              uuid,
  bucket_id       text,
  storage_path    text,
  file_url        text,
  file_name       text,
  mime_type       text,
  width           integer,
  height          integer,
  is_primary      boolean,
  sort_order      integer,
  alt_text        text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    ma.id, ma.bucket_id, ma.storage_path, ma.file_url,
    ma.file_name, ma.mime_type, ma.width, ma.height,
    ma.is_primary, ma.sort_order, ma.alt_text
  FROM public.media_assets ma
  WHERE ma.entity_type = p_entity_type
    AND ma.entity_id   = p_entity_id
  ORDER BY ma.is_primary DESC, ma.sort_order ASC, ma.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.media_for_entity(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.media_for_entity(text, uuid) TO service_role;

-- 3.2 — set_primary_media(entity_type, entity_id, media_id)
--       idempotente: desmarca todos do entity e marca o escolhido
CREATE OR REPLACE FUNCTION public.set_primary_media(
  p_entity_type text,
  p_entity_id   uuid,
  p_media_id    uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.media_assets
  SET is_primary = (id = p_media_id)
  WHERE entity_type = p_entity_type
    AND entity_id   = p_entity_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_primary_media(text, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_primary_media(text, uuid, uuid) TO service_role;

COMMIT;
