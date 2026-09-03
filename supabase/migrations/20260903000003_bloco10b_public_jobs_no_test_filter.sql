-- =============================================================================
-- BLOCO 10B — public_jobs_v1: remover filtro is_test (jobs ≠ companies)
-- =============================================================================
-- Purpose:
--   Corrigir o contrato da view public_jobs_v1 removendo o filtro erroneamente
--   herdeiro do Bloco 7 (`AND coalesce(c.metadata->>'is_test', 'false') <> 'true'`).
--
--   Decisão arquitetural aprovada (2026-09-03):
--     - `is_test` é uma regra de exposição da EMPRESA, não da VAGA.
--     - Uma vaga publicada pode existir sem empresa vinculada (company_id NULL).
--     - Uma vaga publicada vinculada a uma empresa de teste continua sendo
--       uma vaga publicada — o teste da empresa não invalida a vaga editorial.
--     - A empresa é enriquecimento opcional (LEFT JOIN), não filtro de publicação.
--
--   Antes:
--     19 published → 10 retornados (9 filtradas por company.is_test)
--
--   Depois:
--     19 published → 19 retornados (todas publicadas aparecem)
--    1 draft → continua excluído (j.status = 'published')
--
--   Mudança mínima: apenas o WHERE clause. Todas as colunas e o LEFT JOIN
--   são preservados do Bloco 9 (20260903000002_bloco9_seed_vagas_contract.sql).
--   O job-mapper.ts já trata company_name = NULL → fallback 'J&S Empregos LTDA'.
--
--   Reversível: recrie a view adicionando o filtro `is_test` de volta.
-- =============================================================================
-- Strategy: DROP VIEW + CREATE VIEW (não é possível reordenar colunas em
--   CREATE OR REPLACE VIEW, e não há mudança de colunas aqui — apenas WHERE).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Recriar public_jobs_v1 sem o filtro is_test
--    Base: contrato do Bloco 9 (colunas estendidas)
--    Removido: AND coalesce(c.metadata->>'is_test', 'false') <> 'true'
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
  j.location        AS location_raw,
  j.city            AS city,
  j.state           AS state,

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
  -- LEFT JOIN: empresa é opcional. Vaga sem empresa continua publicada.
  c.id              AS company_id,
  c.name            AS company_name,
  COALESCE(
    (
      SELECT ma.file_url
      FROM public.media_assets ma
      WHERE ma.tenant_id = j.tenant_id
        AND ma.entity_type = 'company'
        AND ma.entity_id = c.id
        AND (ma.is_primary = true OR ma.alt_text ILIKE '%logo%')
      ORDER BY ma.is_primary DESC, ma.sort_order ASC, ma.created_at ASC
      LIMIT 1
    ),
    c.logo_url
  ) AS company_logo_url,

  -- Seniority / workload / area / work_schedule (Bloco 9)
  j.seniority       AS seniority,
  j.work_hours      AS work_hours,
  j.metadata->>'area' AS area,
  j.metadata->>'work_schedule' AS work_schedule,

  -- Audit
  j.published_at    AS published_at,
  j.expires_at      AS expires_at,
  j.metadata        AS metadata,
  j.views_count     AS views_count,
  j.applications_count AS applications_count,

  j.tenant_id       AS tenant_id

FROM public.jobs j
LEFT JOIN public.companies c ON c.id = j.company_id
WHERE j.status = 'published';

COMMENT ON VIEW public.public_jobs_v1 IS
  'Public read-only view exposing all published jobs. Company join is LEFT '
  'JOIN (optional) — a published job is public regardless of whether it has '
  'a company linked. The is_test flag on companies filters /clientes '
  '(public_companies_by_type), NOT jobs. Contract: job_id, title, slug, '
  'status, description, responsibilities, requirements, benefits, '
  'contract_type, work_mode, location, location_raw, city, state, '
  'salary_text, salary_min, salary_max, salary_type, seniority, work_hours, '
  'area (via metadata), work_schedule (via metadata), company_id, '
  'company_name, company_logo_url (media_assets -> companies.logo_url), '
  'published_at, expires_at, metadata, views_count, applications_count, '
  'tenant_id.';

ALTER VIEW public.public_jobs_v1 SET (security_invoker = false);
GRANT SELECT ON public.public_jobs_v1 TO anon, authenticated;

COMMIT;

-- -----------------------------------------------------------------------------
-- Validation
-- -----------------------------------------------------------------------------

SELECT
  COUNT(*) AS total_public_jobs,
  COUNT(c.id) AS with_company,
  COUNT(*) FILTER (
    WHERE coalesce(c.metadata->>'is_test', 'false') = 'true'
  ) AS from_test_company
FROM public.jobs j
LEFT JOIN public.companies c ON c.id = j.company_id
WHERE j.status = 'published';
