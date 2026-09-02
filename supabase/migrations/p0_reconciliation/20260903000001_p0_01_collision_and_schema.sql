-- =============================================================================
-- P0-01 — COLLISION + SCHEMA RECONCILIATION
-- =============================================================================
-- Data:    2026-09-03 (timestamp NOVO para evitar colisão com 20260902000001)
-- Origem:  Blocker P0-01 do PREFLIGHT-20260902.md
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- O que faz:
--   1. Cria idx_jobs_tenant_status_published (não existe)
--   2. Adiciona CHECK constraint em media_assets.entity_type (se faltar)
--   3. Marca services-images como DEPRECATED (se o bucket existir)
--   4. NÃO toca em blog_posts (já tem seo_title/description de outra migration)
-- =============================================================================
-- Rollback:
--   DROP INDEX IF EXISTS public.idx_jobs_tenant_status_published;
--   ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_entity_type_check;
-- =============================================================================

BEGIN;

-- 1.1 — índice composto para listagem pública de jobs
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status_published
  ON public.jobs (tenant_id, status, published_at DESC)
  WHERE status = 'published';

-- 1.2 — media_assets.entity_type CHECK (idempotente)
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

-- 1.3 — bucket services-images marcado como deprecated
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
