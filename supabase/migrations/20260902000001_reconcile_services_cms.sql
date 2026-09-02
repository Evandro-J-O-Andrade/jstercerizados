-- =============================================================================
-- RECONCILE SERVICES — Evolução de schema (NÃO recriação)
-- =============================================================================
-- Data: 2026-09-02
-- Autor: Kilo (auditoria Evandro + Andrey)
-- Status: IDEMPOTENTE — seguro para re-execução
-- =============================================================================
-- Contexto:
--   A tabela `public.services` foi aplicada no Supabase por caminho
--   alternativo (anterior ao nosso controle git), em formato mínimo.
--
--   Esta migration NÃO recria a tabela. Apenas garante que todas as
--   colunas do catálogo CMS existam, com seus índices, constraints,
--   trigger e RLS.
--
--   Tudo aqui usa IF NOT EXISTS / DO $$ / DROP IF EXISTS — pode ser
--   executada múltiplas vezes sem efeito colateral.
--
--   Regra de ouro: nunca apagar coluna existente, nunca truncar dados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COLUNAS CMS — adiciona somente as ausentes
-- -----------------------------------------------------------------------------

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS short_description    varchar(280),
  ADD COLUMN IF NOT EXISTS card_image_url       text,
  ADD COLUMN IF NOT EXISTS hero_image_url       text,
  ADD COLUMN IF NOT EXISTS hero_title           text,
  ADD COLUMN IF NOT EXISTS hero_subtitle        text,
  ADD COLUMN IF NOT EXISTS icon                 text,
  ADD COLUMN IF NOT EXISTS benefits             jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS process_steps        jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_title            text,
  ADD COLUMN IF NOT EXISTS cta_description      text,
  ADD COLUMN IF NOT EXISTS cta_button_text      text,
  ADD COLUMN IF NOT EXISTS cta_button_url       text,
  ADD COLUMN IF NOT EXISTS seo_title            varchar(70),
  ADD COLUMN IF NOT EXISTS seo_description      varchar(160),
  ADD COLUMN IF NOT EXISTS seo_keywords         text[],
  ADD COLUMN IF NOT EXISTS published_at         timestamptz,
  ADD COLUMN IF NOT EXISTS display_order        integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by           uuid REFERENCES public.people(id);

-- -----------------------------------------------------------------------------
-- 2. CONSTRAINTS — check + unique (idempotente)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_status_check'
  ) THEN
    ALTER TABLE public.services
      ADD CONSTRAINT services_status_check
      CHECK (status IN ('draft', 'published', 'archived'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_services_tenant_slug'
  ) THEN
    ALTER TABLE public.services
      ADD CONSTRAINT uq_services_tenant_slug UNIQUE (tenant_id, slug);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. INDEXES — performance de catálogo público
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_services_tenant_id
  ON public.services (tenant_id);

CREATE INDEX IF NOT EXISTS idx_services_status
  ON public.services (status)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_services_display_order
  ON public.services (display_order);

CREATE INDEX IF NOT EXISTS idx_services_category
  ON public.services (category)
  WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_services_published_at
  ON public.services (published_at DESC)
  WHERE published_at IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 4. TRIGGER updated_at — idempotente
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- 5. RLS — habilita e cria policies idempotentes
-- -----------------------------------------------------------------------------

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 5.1 Leitura pública: apenas serviços publicados
DROP POLICY IF EXISTS services_public_read ON public.services;
CREATE POLICY services_public_read
  ON public.services
  FOR SELECT
  USING (status = 'published');

-- 5.2 Leitura para membros do tenant
DROP POLICY IF EXISTS services_member_read ON public.services;
CREATE POLICY services_member_read
  ON public.services
  FOR SELECT
  USING (is_tenant_member(tenant_id));

-- 5.3 Escrita para membros com permissão services.* (resource/action)
DROP POLICY IF EXISTS services_member_write ON public.services;
CREATE POLICY services_member_write
  ON public.services
  FOR ALL
  USING (
    is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1
      FROM public.role_assignments ra
      JOIN public.role_permissions rp ON rp.role_id = ra.role_id
      JOIN public.permissions p       ON p.id = rp.permission_id
      JOIN public.people pe           ON pe.id = ra.person_id
      WHERE pe.auth_user_id = auth.uid()
        AND p.resource = 'services'
        AND p.action IN ('create', 'update', 'delete')
    )
  )
  WITH CHECK (
    is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1
      FROM public.role_assignments ra
      JOIN public.role_permissions rp ON rp.role_id = ra.role_id
      JOIN public.permissions p       ON p.id = rp.permission_id
      JOIN public.people pe           ON pe.id = ra.person_id
      WHERE pe.auth_user_id = auth.uid()
        AND p.resource = 'services'
        AND p.action IN ('create', 'update', 'delete')
    )
  );

-- -----------------------------------------------------------------------------
-- 6. COMMENTS — documentação inline
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN public.services.short_description IS
  'Resumo curto para cards da home e do /servicos.';
COMMENT ON COLUMN public.services.card_image_url IS
  'URL da imagem do card (Storage bucket: services-images).';
COMMENT ON COLUMN public.services.hero_image_url IS
  'URL da imagem hero da página do serviço (Storage bucket: services-images).';
COMMENT ON COLUMN public.services.benefits IS
  'Array JSON com benefícios institucionais do serviço.';
COMMENT ON COLUMN public.services.process_steps IS
  'Array JSON com etapas do processo de contratação/execução.';
COMMENT ON COLUMN public.services.status IS
  'draft | published | archived — controla visibilidade pública.';
COMMENT ON COLUMN public.services.display_order IS
  'Ordenação manual dentro do tenant (menor = primeiro).';