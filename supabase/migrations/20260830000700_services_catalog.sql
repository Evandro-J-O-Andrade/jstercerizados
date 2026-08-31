-- =============================================================================
-- FASE 4 — Serviços: alinhar `services` para alimentar a página pública
-- =============================================================================
-- Adiciona colunas de conteúdo comercial, SEO, imagens, processo e CTA.
-- Não altera RLS existente.
-- =============================================================================

-- 1. Colunas adicionais em `services`
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug               text UNIQUE,
  ADD COLUMN IF NOT EXISTS short_description  text,
  ADD COLUMN IF NOT EXISTS card_image_url     text,
  ADD COLUMN IF NOT EXISTS hero_image_url     text,
  ADD COLUMN IF NOT EXISTS hero_title         text,
  ADD COLUMN IF NOT EXISTS hero_subtitle      text,
  ADD COLUMN IF NOT EXISTS benefits           jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS process_steps      jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_title          text,
  ADD COLUMN IF NOT EXISTS cta_description    text,
  ADD COLUMN IF NOT EXISTS icon               text,
  ADD COLUMN IF NOT EXISTS display_order      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_at       timestamptz,
  ADD COLUMN IF NOT EXISTS meta_title         text,
  ADD COLUMN IF NOT EXISTS meta_description   text;

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_services_slug
  ON public.services (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_services_status_display_order
  ON public.services (status, display_order);

-- 3. Comentários
COMMENT ON COLUMN public.services.slug IS
  'URL amigável para página pública (ex: limpeza, seguranca).';

COMMENT ON COLUMN public.services.short_description IS
  'Descrição curta para cards/resumos.';

COMMENT ON COLUMN public.services.card_image_url IS
  'URL da imagem de card do serviço (upload para Storage).';

COMMENT ON COLUMN public.services.hero_image_url IS
  'URL da imagem de hero. Se NULL, usar card_image_url como fallback.';

COMMENT ON COLUMN public.services.hero_title IS
  'Título principal da seção hero.';

COMMENT ON COLUMN public.services.hero_subtitle IS
  'Subtítulo da seção hero.';

COMMENT ON COLUMN public.services.benefits IS
  'Lista de benefícios em formato jsonb.';

COMMENT ON COLUMN public.services.process_steps IS
  'Etapas do processo em formato jsonb.';

COMMENT ON COLUMN public.services.cta_title IS
  'Título do call-to-action.';

COMMENT ON COLUMN public.services.cta_description IS
  'Descrição do call-to-action.';

COMMENT ON COLUMN public.services.icon IS
  'Identificador do ícone do serviço.';

COMMENT ON COLUMN public.services.display_order IS
  'Ordem de exibição no catálogo (menor = primeiro).';

COMMENT ON COLUMN public.services.published_at IS
  'Data/hora de publicação. NULL = rascunho.';

COMMENT ON COLUMN public.services.meta_title IS
  'Meta título SEO.';

COMMENT ON COLUMN public.services.meta_description IS
  'Meta descrição SEO.';
