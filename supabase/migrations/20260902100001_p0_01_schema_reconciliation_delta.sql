-- =============================================================================
-- P0-01 — RECONCILIATION DELTA
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Delta que a migration 01 (version collision) não conseguiu aplicar
--          porque 20260902000001 já estava registrada como 'reconcile_services_cms'
--          (migration superseded movida para _superseded/).
--
-- Objetos faltando (confirmados via pre-flight contra Supabase real):
--   1. Índice idx_jobs_tenant_status_published (NÃO existe)
--   2. CHECK constraint media_assets_entity_type_check (NÃÃO existe)
--
-- NOTA: blog_posts já tem seo_title/seo_description (criado por outra migration).
-- NOTA: Bucket services-images já existe; comment já aplicado.
--
-- Idempotente: tudo dentro de IF NOT EXISTS / DO $$ / EXISTS
-- Não-destrutivo: NUNCA recria, NUNCA apaga dados
-- =============================================================================
-- Rollback:
--   DROP INDEX IF EXISTS public.idx_jobs_tenant_status_published;
--   ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_entity_type_check;
-- =============================================================================

BEGIN;

-- P0-01.1 — Jobs: índice composto para listagem pública
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status_published
  ON public.jobs (tenant_id, status, published_at DESC)
  WHERE status = 'published';

-- P0-01.2 — media_assets: CHECK constraint de entity_type
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

COMMIT;
