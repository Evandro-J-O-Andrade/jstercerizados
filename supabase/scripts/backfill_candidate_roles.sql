-- =============================================================================
-- BACKFILL SCRIPT — Candidate Role Assignment Gap
-- =============================================================================
-- Purpose:
--   - Fix existing candidates that are missing role_assignments
--   - Ensure role 'candidato' exists
--   - Idempotent: safe to run multiple times
--   - Does NOT delete or modify existing data
--
-- Usage:
--   1. Run inspect_candidate_role_gap.sql first
--   2. Review the results
--   3. Run this script ONLY if candidates without role are found
--   4. Verify with inspect_candidate_role_gap.sql again
-- =============================================================================

DO $$
BEGIN
  -- Safety check: prevent accidental execution in production
  IF current_database() ILIKE '%prod%' OR current_database() ILIKE '%production%' THEN
    RAISE EXCEPTION 'ABORT: This backfill script must NOT run in production. Current DB: %', current_database();
  END IF;
END $$;

BEGIN;

-- =============================================================================
-- 1. Ensure role 'candidato' exists (idempotent)
-- =============================================================================

INSERT INTO public.roles (name, is_global, description)
VALUES ('candidato', FALSE, 'Candidato')
ON CONFLICT (is_global, name) DO NOTHING;

-- =============================================================================
-- 2. Backfill role_assignments for candidates without one
-- =============================================================================
-- Strategy:
--   - Find all candidates with no role_assignment
--   - Assign them to the 'candidato' role
--   - Use their current tenant from tenant_memberships or candidates table
--   - Idempotent: ON CONFLICT DO NOTHING

-- First, get the role_id for 'candidato'
WITH role_candidato AS (
  SELECT id AS role_id
  FROM public.roles
  WHERE name = 'candidato'
    AND is_global = FALSE
),
candidates_without_role AS (
  -- Candidates without any role_assignment
  SELECT 
    c.person_id,
    c.tenant_id,
    rc.role_id
  FROM public.candidates c
  CROSS JOIN role_candidato rc
  LEFT JOIN public.role_assignments ra ON ra.person_id = c.person_id
  WHERE ra.id IS NULL
)
INSERT INTO public.role_assignments (person_id, role_id, tenant_id, assigned_at)
SELECT 
  cwr.person_id,
  cwr.role_id,
  cwr.tenant_id,
  now()
FROM candidates_without_role cwr
ON CONFLICT (person_id, role_id, tenant_id) DO NOTHING;

-- =============================================================================
-- 3. Verification queries (run these after the backfill)
-- =============================================================================

-- 3.1 Count of candidates without role_assignments (should be 0)
SELECT 
  'POST_BACKFILL' AS phase,
  'candidates_without_role' AS check_name,
  count(*) AS total
FROM public.candidates c
LEFT JOIN public.role_assignments ra ON ra.person_id = c.person_id
WHERE ra.id IS NULL;

-- 3.2 List of candidates with their role assignments (should all have 'candidato')
SELECT 
  'POST_BACKFILL' AS phase,
  c.id AS candidate_id,
  p.full_name,
  p.email,
  r.name AS role_name,
  t.slug AS tenant_slug,
  ra.assigned_at
FROM public.candidates c
JOIN public.people p ON p.id = c.person_id
LEFT JOIN public.role_assignments ra ON ra.person_id = c.person_id
LEFT JOIN public.roles r ON r.id = ra.role_id
LEFT JOIN public.tenants t ON t.id = c.tenant_id
ORDER BY p.email;

COMMIT;

-- =============================================================================
-- 4. Summary
-- =============================================================================

SELECT 
  'SUMMARY' AS phase,
  'backfill_complete' AS check_name,
  'Check POST_BACKFILL queries above. candidates_without_role should be 0.' AS note;
