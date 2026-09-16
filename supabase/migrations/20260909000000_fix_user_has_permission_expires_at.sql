-- =============================================================================
-- GATE-FIX-02 — Fix user_has_permission() to remove nonexistent expires_at
-- =============================================================================
-- Root cause:
--   The `user_has_permission()` function (applied by 20260903230000) references
--   `ra.expires_at` in two places (lines 126, 145 of the migration).
--
--   However, the live `role_assignments` table does NOT have an `expires_at`
--   column. The schema (20260816000700_rbac.sql) defines it, but the actual
--   deployed table has only: id, person_id, role_id, tenant_id, assigned_at,
--   created_at, updated_at.
--
--   This causes SQL error 42703 ("column ra.expires_at does not exist") whenever
--   any RLS policy evaluates `user_has_permission()`, which includes:
--     - candidates_self_read / candidates_self_update / candidates_self_insert
--     - candidate_skills_self_read / ..._update / ..._insert
--     - candidate_experiences_self_*
--     - candidate_education_self_*
--     - candidate_courses_self_*
--     - candidate_languages_self_*
--     - candidate_documents_self_*
--     - applications_self_*
--     - cpm_admin_write (candidate_portal_modules)
--     - gnl_admin_write (global_navigation_links)
--     - footer_configs policies
--     - page_templates policies
--
--   The error surfaces as HTTP 400 from PostgREST because the RLS policy
--   evaluation fails before any row is returned.
--
-- Fix:
--   Remove the `expires_at` checks from user_has_permission(). The column
--   doesn't exist, so the check is meaningless. Role expiry is not enforced
--   anywhere else in the current schema.
--
--   This is a no-op semantically: without expires_at, role assignments never
--   expire, which matches the current data model.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Fix user_has_permission() — remove expires_at references
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_auth_user_id uuid,
  p_resource text,
  p_action text,
  p_tenant_id uuid default null
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_person_id uuid;
BEGIN
  SELECT id INTO v_person_id
  FROM public.people
  WHERE auth_user_id = p_auth_user_id;

  IF v_person_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check global role (admin_master bypasses tenant)
  IF EXISTS (
    SELECT 1
    FROM public.role_assignments ra
    JOIN public.roles r ON r.id = ra.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE ra.person_id = v_person_id
      AND r.scope = 'global'
      AND perm.resource = p_resource
      AND perm.action = p_action
  ) THEN
    RETURN true;
  END IF;

  -- Check tenant-scoped role
  IF p_tenant_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.role_assignments ra
      JOIN public.roles r ON r.id = ra.role_id
      JOIN public.role_permissions rp ON rp.role_id = r.id
      JOIN public.permissions perm ON perm.id = rp.permission_id
      JOIN public.tenant_memberships tm ON tm.tenant_id = ra.tenant_id
      WHERE ra.person_id = v_person_id
        AND r.scope = 'tenant'
        AND perm.resource = p_resource
        AND perm.action = p_action
        AND tm.tenant_id = p_tenant_id
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- Re-grant for safety (idempotent)
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 2. Verify: candidates table should now be queryable by authenticated users
--    with appropriate role assignments
-- -----------------------------------------------------------------------------
-- (No data changes — this is a function-only fix)

COMMIT;