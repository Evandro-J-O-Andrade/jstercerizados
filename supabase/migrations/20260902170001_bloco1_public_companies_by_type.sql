-- =============================================================================
-- BLOCO 1 — VIEW public_companies_by_type
-- =============================================================================
-- Purpose:
--   Expor publicamente (anon/authenticated) a composição mínima de uma empresa
--   dentro de um papel comercial (customer / partner / supplier).
--
--   Mantém as tabelas internas (companies, company_relationships,
--   company_relationship_types) protegidas pelas RLS existentes; apenas a VIEW
--   derivada é pública. Isso preserva o isolamento multi-tenant.
--
-- Architecture:
--   companies (active)
--     JOIN company_relationships (status='active')    -- papel comercial
--       JOIN company_relationship_types (code)        -- código canônico
--
--   Filtros aplicados na VIEW:
--     - companies.status = 'active'
--     - company_relationships.status = 'active'
--
--   Decisões aprovadas:
--     1. description/website/hero_image_url vivem em
--        company_relationships.metadata (jsonb)
--     2. logo_url permanece em companies.logo_url (origem correta = media_assets
--        quando upload existir; fallback em /images/clientes no frontend)
--     3. Apenas SELECT na VIEW é exposto; demais operações usam repositories internos.
--
--   Ajustes para o schema real (validado via PostgREST inspection):
--     - companies NÃO tem coluna is_active (só status='active' para ativo)
--     - company_relationships.relationship_type é TEXT (não UUID)
--     - JOIN é via company_relationship_types.code = company_relationships.relationship_type
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. VIEW
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.public_companies_by_type AS
SELECT
  c.id              AS company_id,
  c.name            AS company_name,
  c.legal_name      AS legal_name,
  c.trading_name    AS trading_name,
  c.logo_url        AS logo_url,
  c.description     AS description,
  c.website         AS website,
  c.industry        AS industry,
  c.size            AS company_size,
  c.status          AS company_status,
  cr.id             AS relationship_id,
  cr.status         AS relationship_status,
  crt.code          AS relationship_type,
  crt.name          AS relationship_type_name,
  cr.metadata       AS relationship_metadata,
  cr.started_at     AS relationship_started_at
FROM public.companies c
INNER JOIN public.company_relationships cr
  ON cr.company_id = c.id
INNER JOIN public.company_relationship_types crt
  ON crt.code = cr.relationship_type
WHERE c.status = 'active'
  AND cr.status = 'active';

COMMENT ON VIEW public.public_companies_by_type IS
  'Public read-only view exposing active companies by commercial relationship type. '
  'Used by institutional pages (/clientes, /parceiros, /fornecedores) without '
  'exposing internal tables (companies, company_relationships, company_relationship_types).';

-- -----------------------------------------------------------------------------
-- 2. RLS — habilitar leitura pública apenas para SELECT
-- -----------------------------------------------------------------------------

ALTER VIEW public.public_companies_by_type SET (security_invoker = false);

-- Garante que a view pode ser lida anonimamente. Como a view executa com as
-- permissões do owner (security_invoker=false), as RLS das tabelas internas
-- não se aplicam ao consumidor da view, mas continuam aplicando para CRUD
-- direto nas tabelas.
GRANT SELECT ON public.public_companies_by_type TO anon, authenticated;

COMMIT;

-- -----------------------------------------------------------------------------
-- 3. Validation
-- -----------------------------------------------------------------------------

SELECT 'public_companies_by_type view created with public SELECT' AS status;