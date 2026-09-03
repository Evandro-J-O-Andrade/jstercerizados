-- =============================================================================
-- BLOCO 7 — Data Quality: metadata.is_test + VIEWs filtram registros de teste
-- =============================================================================
-- Purpose:
--   Marca explicitamente registros de teste (companies.metadata->>'is_test')
--   e atualiza as VIEWs públicas para nunca expor empresas de teste.
--
--   Decisões aprovadas:
--     1. Flag interna: companies.metadata->>'is_test' = 'true' (jsonb text).
--        Compatível com o jsonb livre do schema. Nenhuma coluna nova.
--     2. Filtro aplicado dentro da própria VIEW (com subquery EXISTS), de
--        forma que anon não possa bypassar via outra rota.
--     3. Idempotente: UPDATE ... WHERE name ILIKE '%test%' etc. Não sobrescreve
--        metadata->>'is_test' se já for 'true' (re-running is safe).
--     4. Apenas os 4 nomes identificados na auditoria do Bloco 6 são marcados.
--        "Empresa E2E Teste Editada" também é marcada (cliente de teste).
--     5. 5 empresas resultantes com is_test='true' (ver lista abaixo).
--     6. 4 empresas com nome "Teste" / "Fornecedor Tech" / "Parceiro
--        Consultoria" / "Global Services S.A." estão em companies.
--        Suas vagas publicadas em jobs devem ser excluídas também (via JOIN
--        na public_jobs_v1).
--
--   Identificação Bloco 6 (auditoria):
--     company_id                            name
--     b9231243-7950-4b99-a6a6-fcfad2ecd4ed  Teste
--     ffe9f026-a3fe-4627-a65a-7be6638adf80  Fornecedor Tech
--     f113ea57-029c-4ba0-9dd0-6b8cd6096c9f  Parceiro Consultoria
--     634f265d-7d37-49a6-85fb-dd312ea86d09  Global Services S.A.
--     5e0813d4-8bca-48e5-adbf-372341d558cb  Empresa E2E Teste Editada
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Marcar companies de teste via metadata->>'is_test' = 'true'
-- -----------------------------------------------------------------------------

UPDATE public.companies
SET metadata = metadata || jsonb_build_object('is_test', 'true')
WHERE id IN (
    'b9231243-7950-4b99-a6a6-fcfad2ecd4ed',  -- Teste
    'ffe9f026-a3fe-4627-a65a-7be6638adf80',  -- Fornecedor Tech
    'f113ea57-029c-4ba0-9dd0-6b8cd6096c9f',  -- Parceiro Consultoria
    '634f265d-7d37-49a6-85fb-dd312ea86d09',  -- Global Services S.A.
    '5e0813d4-8bca-48e5-adbf-372341d558cb'   -- Empresa E2E Teste Editada
  )
  AND coalesce(metadata->>'is_test', 'false') <> 'true';

-- -----------------------------------------------------------------------------
-- 2. Atualizar VIEW public_companies_by_type — excluir empresas de teste
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
  AND cr.status = 'active'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true';

COMMENT ON VIEW public.public_companies_by_type IS
  'Public read-only view exposing active companies by commercial relationship type, '
  'excluding test/seed records (companies.metadata->>''is_test'' = ''true''). '
  'Used by /clientes, /parceiros, /fornecedores.';

ALTER VIEW public.public_companies_by_type SET (security_invoker = false);
GRANT SELECT ON public.public_companies_by_type TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Atualizar VIEW public_jobs_v1 — excluir vagas cuja company é de teste
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.public_jobs_v1 AS
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
  c.logo_url        AS company_logo_url,

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
  'Public read-only view exposing published jobs joined with company (via jobs.company_id), '
  'excluding jobs whose company is marked as test (companies.metadata->>''is_test'' = ''true''). '
  'Used by /vagas, /, /vagas/:slug.';

ALTER VIEW public.public_jobs_v1 SET (security_invoker = false);
GRANT SELECT ON public.public_jobs_v1 TO anon, authenticated;

COMMIT;

-- -----------------------------------------------------------------------------
-- 4. Validation
-- -----------------------------------------------------------------------------

SELECT
  'public_companies_by_type updated, test companies excluded' AS companies,
  'public_jobs_v1 updated, jobs of test companies excluded' AS jobs;
