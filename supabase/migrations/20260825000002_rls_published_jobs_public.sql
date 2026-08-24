-- =============================================================================
-- GATE-DATA-04.015 — RLS: Public read access for published jobs
-- =============================================================================
-- Schema: public
-- Order: 15
-- Dependencies: 005_jobs, 012_rls_consolidation
-- =============================================================================
-- Purpose:
--   Allow public/anonymous access to published jobs for the public website.
--   The /vagas page is public and must show published vacancies without
--   requiring authentication.
--
-- Rules:
--   - Public can READ only jobs with status = 'published'
--   - Public cannot INSERT/UPDATE/DELETE
--   - Tenant members keep their existing permissions
--   - service_role keeps full access
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Public read policy for published jobs
-- -----------------------------------------------------------------------------
-- WHAT:
-- Allow anonymous/authenticated users to read published jobs.
--
-- WHY:
-- The public website (/vagas) needs to display published vacancies without
-- requiring login. RLS previously blocked this because policies only
-- allowed tenant members.
--
-- ARCHITECTURE:
-- - auth.role() = 'anon' covers public visitors
-- - auth.role() = 'authenticated' covers logged-in users
-- - Only SELECT is allowed
-- - Only jobs.status = 'published' are visible
create policy "Published jobs visible to public"
  on public.jobs for select
  using (
    status = 'published'
    AND auth.role() IN ('anon', 'authenticated')
  );

-- -----------------------------------------------------------------------------
-- 2. Public read policy for job_skills (via published jobs)
-- -----------------------------------------------------------------------------
-- WHAT:
-- Allow reading job_skills for published jobs.
--
-- WHY:
-- Public pages may show skills required for published jobs.
create policy "Job skills for published jobs visible to public"
  on public.job_skills for select
  using (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_skills.job_id
        AND j.status = 'published'
    )
  );

-- -----------------------------------------------------------------------------
-- 3. Validation
-- -----------------------------------------------------------------------------
select 'RLS 015 VALIDATED: Public read access for published jobs' as validation_status;
