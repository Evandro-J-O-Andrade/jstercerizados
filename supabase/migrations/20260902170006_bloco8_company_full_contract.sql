-- =============================================================================
-- BLOCO 8 — public_companies_by_type: media_assets + socials
--            public_jobs_v1: company logo via media_assets
-- =============================================================================
-- Purpose:
--   Estende o contrato público das VIEWs com a fonte canônica de mídias
--   (media_assets) e redes sociais (company_social_links), conforme decisão
--   do Bloco 8 (auditoria G13 + gaps da matriz).
--
--   Decisões aprovadas (Bloco 8):
--     1. Logo: priorizar media_assets (entity_type='company', is_primary=true,
--        file_name ILIKE '%logo%' OR bucket_id='public-media' AND mime_type
--        starts with 'image/'). Fallback em companies.logo_url. Sempre string
--        (ou NULL).
--     2. Hero image: media_assets (entity_type='company', is_primary=false OR
--        with alt_text ILIKE '%hero%'). Fallback em
--        company_relationships.metadata->>'hero_image_url'.
--     3. Socials: JSONB agregado de company_social_links com TODAS as
--        plataformas (linkedin, instagram, facebook, twitter, youtube, tiktok,
--        whatsapp). Filtrado por is_active=true.
--     4. Description: prioriza company_relationships.metadata->>'description'
--        (que tem a descrição editada). Fallback em companies.description.
--     5. company_relationships.metadata (jsonb) preservado para extensões
--        futuras (sem quebrar contrato existente).
--     6. Mesmo padrão aplicado em public_jobs_v1 (logo da empresa
--        contratante via media_assets).
--
--   Idempotente: DROP VIEW IF EXISTS + CREATE VIEW (PostgreSQL não permite
--   reordenar colunas em CREATE OR REPLACE VIEW).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. public_companies_by_type — extended
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS public.public_companies_by_type;

CREATE VIEW public.public_companies_by_type AS
SELECT
  c.id              AS company_id,
  c.name            AS company_name,
  c.legal_name      AS legal_name,
  c.trading_name    AS trading_name,

  -- LOGO: media_assets (primary logo) -> companies.logo_url
  COALESCE(
    (
      SELECT ma.file_url
      FROM public.media_assets ma
      WHERE ma.tenant_id = c.tenant_id
        AND ma.entity_type = 'company'
        AND ma.entity_id = c.id
        AND (ma.is_primary = true OR ma.alt_text ILIKE '%logo%')
      ORDER BY ma.is_primary DESC, ma.sort_order ASC, ma.created_at ASC
      LIMIT 1
    ),
    c.logo_url
  ) AS logo_url,

  -- HERO IMAGE: media_assets (non-primary or hero tagged) ->
  --              company_relationships.metadata->>'hero_image_url'
  COALESCE(
    (
      SELECT ma.file_url
      FROM public.media_assets ma
      WHERE ma.tenant_id = c.tenant_id
        AND ma.entity_type = 'company'
        AND ma.entity_id = c.id
        AND (ma.alt_text ILIKE '%hero%' OR ma.title ILIKE '%hero%')
      ORDER BY ma.sort_order ASC, ma.created_at ASC
      LIMIT 1
    ),
    cr.metadata->>'hero_image_url',
    NULL
  ) AS image_url,

  -- DESCRIPTION: company_relationships.metadata->>'description' ->
  --              companies.description
  COALESCE(
    cr.metadata->>'description',
    c.description
  ) AS description,

  c.website         AS website,
  c.industry        AS industry,
  c.size            AS company_size,
  c.status          AS company_status,

  cr.id             AS relationship_id,
  cr.status         AS relationship_status,
  crt.code          AS relationship_type,
  crt.name          AS relationship_type_name,
  cr.metadata       AS relationship_metadata,
  cr.started_at     AS relationship_started_at,

  -- SOCIALS: jsonb agregado de company_social_links
  COALESCE(
    (
      SELECT jsonb_object_agg(
        lower(csl.platform),
        csl.url
      )
      FROM public.company_social_links csl
      WHERE csl.tenant_id = cr.tenant_id
        AND csl.company_id = c.id
        AND csl.is_active = true
    ),
    '{}'::jsonb
  ) AS socials

FROM public.companies c
INNER JOIN public.company_relationships cr
  ON cr.company_id = c.id
INNER JOIN public.company_relationship_types crt
  ON crt.code = cr.relationship_type
WHERE c.status = 'active'
  AND cr.status = 'active'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true';

COMMENT ON VIEW public.public_companies_by_type IS
  'Public read-only view exposing active companies by commercial relationship '
  'type. Contract: company_id, company_name, legal_name, trading_name, '
  'logo_url (media_assets -> companies.logo_url), image_url '
  '(media_assets -> company_relationships.metadata.hero_image_url), '
  'description (company_relationships.metadata.description -> '
  'companies.description), website, industry, company_size, company_status, '
  'relationship_id, relationship_status, relationship_type, '
  'relationship_type_name, relationship_metadata, relationship_started_at, '
  'socials (jsonb aggregated from company_social_links). '
  'Test companies (metadata.is_test=true) are excluded.';

ALTER VIEW public.public_companies_by_type SET (security_invoker = false);
GRANT SELECT ON public.public_companies_by_type TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. public_jobs_v1 — extend with company logo via media_assets
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS public.public_jobs_v1;

CREATE VIEW public.public_jobs_v1 AS
SELECT
  j.id              AS job_id,
  j.title           AS title,
  j.slug            AS slug,
  j.status          AS status,
  j.description     AS description,
  j.responsibilities AS responsibilities,
  j.requirements    AS requirements,
  j.benefits        AS benefits,

  -- Employment / contract
  coalesce(j.contract_type, j.employment_type, 'clt') AS contract_type,
  j.work_mode       AS work_mode,

  -- Location with legacy fallback
  CASE
    WHEN j.city IS NOT NULL AND j.state IS NOT NULL THEN
      trim(both ' ' from (j.city || ', ' || j.state))
    WHEN j.city IS NOT NULL THEN j.city
    WHEN j.location IS NOT NULL THEN j.location
    ELSE NULL
  END AS location,

  -- Salary canonical (free text first, then numeric range)
  CASE
    WHEN j.salary IS NOT NULL AND length(trim(j.salary)) > 0 THEN j.salary
    WHEN j.salary_min IS NOT NULL AND j.salary_max IS NOT NULL THEN
      'R$ ' || to_char(j.salary_min, 'FM999G999G990D00')
        || ' – R$ ' || to_char(j.salary_max, 'FM999G999G990D00')
    WHEN j.salary_min IS NOT NULL THEN
      'R$ ' || to_char(j.salary_min, 'FM999G999G990D00')
    ELSE NULL
  END AS salary_text,
  j.salary_min      AS salary_min,
  j.salary_max      AS salary_max,
  j.salary_type     AS salary_type,

  -- Company join via jobs.company_id (FK legada / direta)
  c.id              AS company_id,
  c.name            AS company_name,
  -- LOGO: media_assets (primary logo) -> companies.logo_url
  COALESCE(
    (
      SELECT ma.file_url
      FROM public.media_assets ma
      WHERE ma.tenant_id = c.tenant_id
        AND ma.entity_type = 'company'
        AND ma.entity_id = c.id
        AND (ma.is_primary = true OR ma.alt_text ILIKE '%logo%')
      ORDER BY ma.is_primary DESC, ma.sort_order ASC, ma.created_at ASC
      LIMIT 1
    ),
    c.logo_url
  ) AS company_logo_url,

  -- Audit
  j.published_at    AS published_at,
  j.expires_at      AS expires_at,
  j.metadata        AS metadata,
  j.views_count     AS views_count,

  j.tenant_id       AS tenant_id
FROM public.jobs j
LEFT JOIN public.companies c ON c.id = j.company_id
WHERE j.status = 'published'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true';

COMMENT ON VIEW public.public_jobs_v1 IS
  'Public read-only view exposing published jobs joined with company '
  '(via jobs.company_id), excluding jobs whose company is marked as test '
  '(companies.metadata->>''is_test'' = ''true''). Contract: job_id, title, '
  'slug, status, description, responsibilities, requirements, benefits, '
  'contract_type, work_mode, location, salary_text, salary_min, salary_max, '
  'salary_type, company_id, company_name, company_logo_url '
  '(media_assets -> companies.logo_url), published_at, expires_at, '
  'metadata, views_count, tenant_id.';

ALTER VIEW public.public_jobs_v1 SET (security_invoker = false);
GRANT SELECT ON public.public_jobs_v1 TO anon, authenticated;

COMMIT;

-- -----------------------------------------------------------------------------
-- 3. Validation
-- -----------------------------------------------------------------------------

SELECT
  'public_companies_by_type extended with media_assets + socials' AS companies,
  'public_jobs_v1 extended with company logo via media_assets' AS jobs;
