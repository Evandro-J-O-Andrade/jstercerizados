-- =============================================================================
-- 01 — SCHEMA RECONCILIATION
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Índices faltantes, blog_posts SEO, entity_type CHECK em media_assets
-- Status:  AGUARDANDO OK EXPLÍCITO para aplicação no Supabase
-- Idempotente: tudo dentro de IF NOT EXISTS / DO $$ / EXISTS
-- Não-destrutivo: NUNCA recria, NUNCA apaga dados
-- =============================================================================
-- Rollback (rodar manualmente, se necessário):
--   DROP INDEX IF EXISTS public.idx_jobs_tenant_status_published;
--   ALTER TABLE public.blog_posts DROP COLUMN IF EXISTS seo_title;
--   ALTER TABLE public.blog_posts DROP COLUMN IF EXISTS seo_description;
--   ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_entity_type_check;
-- =============================================================================

BEGIN;

-- 1.1 — jobs: índice composto para listagem pública
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status_published
  ON public.jobs (tenant_id, status, published_at DESC)
  WHERE status = 'published';

-- 1.2 — blog_posts: SEO (somente se a tabela existir)
DO $$
BEGIN
  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    EXECUTE '
      ALTER TABLE public.blog_posts
        ADD COLUMN IF NOT EXISTS seo_title       varchar(70),
        ADD COLUMN IF NOT EXISTS seo_description varchar(160)
    ';
  END IF;
END $$;

-- 1.3 — media_assets: CHECK constraint de entity_type (se a tabela existir)
DO $$
BEGIN
  IF to_regclass('public.media_assets') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.media_assets'::regclass
        AND conname  = 'media_assets_entity_type_check'
    ) THEN
      EXECUTE '
        ALTER TABLE public.media_assets
        ADD CONSTRAINT media_assets_entity_type_check
        CHECK (entity_type IN (
          ''service'', ''company'', ''job'', ''blog_post'', ''page'',
          ''avatar'', ''document'',
          ''candidate_document'', ''employee_document''
        ))
      ';
    END IF;
  END IF;
END $$;

-- 1.4 — bucket services-images: marcado como deprecated
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'services-images') THEN
    EXECUTE $SQL$
      COMMENT ON COLUMN storage.buckets.name IS
      'DEPRECATED: bucket services-images é legado. Use public-media (10MB, image/*) para novas features. Existe apenas para não quebrar URLs históricas.'
    $SQL$;
  END IF;
END $$;

COMMIT;
