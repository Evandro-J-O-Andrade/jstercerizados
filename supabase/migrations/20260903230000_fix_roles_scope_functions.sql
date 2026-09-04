-- =============================================================================
-- GATE-FIX-01 — Fix is_admin_master() and related functions for scope schema
-- =============================================================================
-- Root cause: The is_admin_master() function references r.is_global which
-- does NOT exist in the actual DB schema. The DB uses `scope` column instead.
-- This causes:
--   1. role_assignments SELECT RLS policy to fail when candidate has no
--      role_assignments (is_admin_master() is evaluated and throws)
--   2. role_permissions, roles SELECT to fail for users without role_assignments
--   3. Black screen in candidate flow due to silent auth loading failure
-- =============================================================================
-- This migration is idempotent: CREATE OR REPLACE handles existing functions,
-- and GRANT statements are guarded with optional IF EXISTS or DO blocks.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Fix is_admin_master() — use scope instead of is_global
--    Preserve the existing zero-arg signature AND add a parameterized overload.
-- -----------------------------------------------------------------------------

-- Zero-arg version (replaces existing if signature matches)
CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = auth.uid()
      AND r.name = 'admin_master'
      AND r.scope = 'global'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Parameterized overload (accepts explicit auth uid)
CREATE OR REPLACE FUNCTION public.is_admin_master(auth_uid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = $1
      AND r.name = 'admin_master'
      AND r.scope = 'global'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 2. Fix can_manage_role_assignment() — use scope instead of is_global
-- -----------------------------------------------------------------------------

-- Zero-arg version
CREATE OR REPLACE FUNCTION public.can_manage_role_assignment()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = auth.uid()
      AND r.name = 'admin_master'
      AND r.scope = 'global'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Parameterized version (accepts explicit tenant id)
CREATE OR REPLACE FUNCTION public.can_manage_role_assignment(target_tenant_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = auth.uid()
      AND r.name = 'admin_master'
      AND r.scope = 'global'
    UNION ALL
    SELECT 1 FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = auth.uid()
      AND r.name = 'tenant_admin'
      AND r.scope = 'tenant'
      AND ra.tenant_id = can_manage_role_assignment.target_tenant_id
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 3. Fix user_has_permission() — use scope instead of is_global
--    Note: uses role_permissions + permissions (not role_resource_permissions)
--    which does NOT exist in this schema.
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
      AND (ra.expires_at IS NULL OR ra.expires_at > now())
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
        AND (ra.expires_at IS NULL OR ra.expires_at > now())
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Fix roles SELECT policy — simplify to not call is_admin_master()
--    Ensure roles are visible to authenticated users without is_admin_master.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "roles_select" ON public.roles;
DROP POLICY IF EXISTS "Roles visible to authenticated" ON public.roles;

CREATE POLICY "roles_select"
  ON public.roles FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 5. Grant execute on fixed functions to authenticated role
-- -----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.is_admin_master() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_master(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_role_assignment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_role_assignment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 6. Ensure candidato role exists with scope='tenant'
-- -----------------------------------------------------------------------------
INSERT INTO public.roles (name, scope, description)
VALUES ('candidato', 'tenant', 'Candidato a vagas — acesso only ao portal do candidato')
ON CONFLICT (name) DO NOTHING;

COMMIT;
