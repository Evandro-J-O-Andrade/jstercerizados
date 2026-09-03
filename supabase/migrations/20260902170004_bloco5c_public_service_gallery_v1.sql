-- =============================================================================
-- BLOCO 5C - public_services_v1: gallery via media_assets
-- =============================================================================
-- Purpose:
--   Extend the public read-only view public_services_v1 (Bloco 3) to expose
--   the service gallery as a JSONB array aggregated from media_assets.
--
--   Aggregation rules (approved for Bloco 5C):
--     - media_assets.entity_type = 'service'
--     - media_assets.entity_id   = services.id
--     - media_assets.file_url is the canonical public URL (bucket is public)
--     - alt_text -> item.alt
--     - sort_order ASC, is_primary DESC as tiebreaker
--     - gallery is empty array [] when no media exists (NOT NULL, default '[]')
--
--   Decisions reaffirmed:
--     - tenant_id NOT exposed
--     - VIEW still restricted to tenants.slug = 'js-empregos'
--     - status = 'published' preserved
--     - No new RPC, no new column on services
--     - media_assets remains tenant-scoped via RLS (this VIEW uses
--       security_invoker=false to bypass RLS for the public read)
-- =============================================================================

BEGIN;

-- Replace the view extending the existing contract (Bloco 3) with a new
-- `gallery` jsonb column. DROP + CREATE is required because the column
-- ordering changes (gallery is inserted before status) and CREATE OR REPLACE
-- would fail with "cannot change name of view column".

DROP VIEW IF EXISTS public.public_services_v1;

CREATE VIEW public.public_services_v1 AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.category,
  s.short_description,
  s.description,
  s.card_image_url,
  s.hero_image_url,
  s.hero_title,
  s.hero_subtitle,
  s.icon,
  s.benefits,
  s.process_steps,
  s.cta_title,
  s.cta_description,
  s.cta_button_text,
  s.cta_button_url,
  -- Gallery: jsonb array aggregated from media_assets (entity_type='service').
  -- Ordered by is_primary DESC, sort_order ASC, created_at ASC for stability.
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'url', ma.file_url,
          'alt', ma.alt_text,
          'sort_order', ma.sort_order
        )
        ORDER BY ma.is_primary DESC, ma.sort_order ASC, ma.created_at ASC
      )
      FROM public.media_assets ma
      WHERE ma.tenant_id = s.tenant_id
        AND ma.entity_type = 'service'
        AND ma.entity_id = s.id
    ),
    '[]'::jsonb
  ) AS gallery,
  s.status,
  s.published_at,
  s.display_order,
  s.seo_title,
  s.seo_description,
  s.seo_keywords
FROM public.services s
WHERE s.status = 'published'
  AND s.tenant_id = (
    SELECT id FROM public.tenants WHERE slug = 'js-empregos' LIMIT 1
  );

COMMENT ON VIEW public.public_services_v1 IS
  'Public read-only view exposing the institutional service catalog of '
  'J&S Empregos LTDA (tenant slug = js-empregos). Used by /servicos and '
  '/servicos/:slug. tenant_id is intentionally NOT exposed. Gallery is '
  'aggregated from media_assets (entity_type=service) as a jsonb array.';

ALTER VIEW public.public_services_v1 SET (security_invoker = false);
GRANT SELECT ON public.public_services_v1 TO anon, authenticated;

COMMIT;

-- Validation
SELECT 'public_services_v1 extended with media_assets gallery' AS status;
