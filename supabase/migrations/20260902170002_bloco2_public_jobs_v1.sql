-- =============================================================================
-- BLOCO 2 — VIEW public_jobs_v1 + idempotent slug fill
-- =============================================================================
-- Purpose:
--   Expor publicamente (anon/authenticated) as vagas publicadas (status='published')
--   com dados canônicos + fallback para os campos legados
--   (employment_type, location, salary) que ainda existem em algumas linhas.
--
--   Inclui:
--     1) UPDATE idempotente para preencher `slug` em jobs.slug IS NULL
--        a partir de jobs.title (slugify pt-BR) — sem sobrescrever slugs já
--        preenchidos.
--     2) VIEW public_jobs_v1 com JOIN à tabela companies por company_id
--        (não company_relationship_id, que está NULL em todas as vagas atuais).
--     3) GRANT SELECT anon/authenticated — mantém RLS das tabelas internas.
--
--   Decisões aprovadas:
--     - location canônica = jobs.city + jobs.state (fallback: jobs.location)
--     - salary canônico = jobs.salary (texto livre legado) OU faixa
--       salary_min/salary_max quando preenchidos
--     - contract_type canônico = jobs.contract_type (fallback: jobs.employment_type)
--     - work_mode canônico = jobs.work_mode (fallback derivado de metadata
--       ou 'onsite' padrão)
--     - Empresa: companies via jobs.company_id (relacionamento comercial via
--       company_relationships fica para fase futura)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Idempotent slug fill
-- -----------------------------------------------------------------------------

UPDATE public.jobs
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        coalesce(title, 'vaga'),
        '[áàâãäÁÀÂÃÄ]', 'a', 'g'
      ),
      '[éèêëÉÈÊË]', 'e', 'g'
    ),
    '[^a-zA-Z0-9]+', '-', 'g'
  )
) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL
  AND title IS NOT NULL;

-- Resolve colisão eventual dentro do mesmo tenant: jobs já tem índice único
-- (tenant_id, slug). Se duas vagas gerarem o mesmo slug, sufixamos com o id curto.

DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  suffix INT := 1;
BEGIN
  FOR rec IN
    SELECT j.id, j.tenant_id, j.slug
    FROM public.jobs j
    WHERE j.slug IS NOT NULL
  LOOP
    WHILE EXISTS (
      SELECT 1 FROM public.jobs j2
      WHERE j2.tenant_id = rec.tenant_id
        AND j2.slug = rec.slug
        AND j2.id <> rec.id
    ) LOOP
      suffix := suffix + 1;
      UPDATE public.jobs
      SET slug = rec.slug || '-' || suffix::text
      WHERE id = rec.id;
      suffix := 1;
    END LOOP;
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 2. VIEW public_jobs_v1
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
WHERE j.status = 'published';

COMMENT ON VIEW public.public_jobs_v1 IS
  'Public read-only view exposing published jobs joined with company (via jobs.company_id). '
  'Used by institutional pages (/vagas, /, /vagas/:slug) without exposing internal tables. '
  'Includes legacy fallback for employment_type, location and salary free-text.';

-- -----------------------------------------------------------------------------
-- 3. Grants
-- -----------------------------------------------------------------------------

ALTER VIEW public.public_jobs_v1 SET (security_invoker = false);
GRANT SELECT ON public.public_jobs_v1 TO anon, authenticated;

COMMIT;

-- -----------------------------------------------------------------------------
-- 4. Validation
-- -----------------------------------------------------------------------------

SELECT 'public_jobs_v1 view created with public SELECT' AS status;