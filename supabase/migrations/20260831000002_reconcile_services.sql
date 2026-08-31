-- =============================================================================
-- P1 — SERVICES: enriquecer catálogo para alimentar /servicos
-- =============================================================================
-- Adiciona colunas de CMS/imagens sem alterar RLS/policies existentes.
-- Idempotente: usa ADD COLUMN IF NOT EXISTS.
-- =============================================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS short_description text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS card_image_url text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS hero_image_url text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS hero_title text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS hero_subtitle text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS benefits jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS process_steps jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS cta_title text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS cta_description text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS icon text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS seo_title text;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS seo_description text;

CREATE INDEX IF NOT EXISTS idx_services_slug
  ON public.services (slug);

CREATE INDEX IF NOT EXISTS idx_services_display_order
  ON public.services (display_order);
