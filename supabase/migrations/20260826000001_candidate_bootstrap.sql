-- =============================================================================
-- C1.7-D — CANDIDATE IDENTITY BOOTSTRAP
-- =============================================================================
-- Purpose:
--   - Fix bootstrap deadlock in people RLS by allowing self-read via auth_user_id
--   - Provide atomic identity provisioning for candidate/self registration
--   - Make register flow idempotent
--
-- Flow:
--   AUTH → people → tenant_membership → role_assignment → first_login_state
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. RLS FIX — people self-read
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS people_member_read ON public.people;

CREATE POLICY people_member_read ON public.people
  FOR SELECT
  USING (
    is_admin_master()
    OR auth.uid() = auth_user_id
    OR EXISTS (
      SELECT 1
      FROM tenant_memberships tm
      WHERE tm.person_id = people.id
        AND tm.status = 'active'
    )
  );

COMMENT ON POLICY people_member_read ON public.people IS
  'Allow admin_master, self-read by auth_user_id, or active tenant membership.';

-- -----------------------------------------------------------------------------
-- 2. BOOTSTRAP FUNCTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bootstrap_candidate_identity(
  p_auth_user_id uuid,
  p_full_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_tenant_id uuid DEFAULT NULL,
  p_role_id uuid DEFAULT NULL
)
RETURNS TABLE (
  person_id uuid,
  tenant_membership_id uuid,
  role_assignment_id uuid,
  first_login_state_person_id uuid,
  candidate_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id uuid;
  v_tenant_membership_id uuid;
  v_role_assignment_id uuid;
  v_first_login_state_person_id uuid;
  v_candidate_id uuid;
BEGIN
  -- 1. People (idempotent)
  SELECT id INTO v_person_id
  FROM public.people
  WHERE auth_user_id = p_auth_user_id;

  IF v_person_id IS NULL THEN
    INSERT INTO public.people (auth_user_id, full_name, email, phone, status)
    VALUES (p_auth_user_id, p_full_name, p_email, p_phone, 'active')
    RETURNING id INTO v_person_id;
  END IF;

  -- 2. Tenant membership (idempotent)
  IF p_tenant_id IS NOT NULL THEN
    SELECT id INTO v_tenant_membership_id
    FROM public.tenant_memberships
    WHERE person_id = v_person_id
      AND tenant_id = p_tenant_id;

    IF v_tenant_membership_id IS NULL THEN
      INSERT INTO public.tenant_memberships (person_id, tenant_id, status, joined_at)
      VALUES (v_person_id, p_tenant_id, 'active', now())
      RETURNING id INTO v_tenant_membership_id;
    END IF;
  END IF;

  -- 3. Role assignment (idempotent)
  IF p_role_id IS NOT NULL THEN
    SELECT id INTO v_role_assignment_id
    FROM public.role_assignments
    WHERE person_id = v_person_id
      AND role_id = p_role_id;

    IF v_role_assignment_id IS NULL THEN
      INSERT INTO public.role_assignments (person_id, role_id, tenant_id, assigned_at)
      VALUES (v_person_id, p_role_id, p_tenant_id, now())
      RETURNING id INTO v_role_assignment_id;
    END IF;
  END IF;

  -- 4. First login state (idempotent)
  SELECT person_id INTO v_first_login_state_person_id
  FROM public.first_login_state
  WHERE person_id = v_person_id;

  IF v_first_login_state_person_id IS NULL THEN
    INSERT INTO public.first_login_state (person_id, must_change_password, first_login_completed)
    VALUES (v_person_id, true, false)
    RETURNING person_id INTO v_first_login_state_person_id;
  END IF;

  -- 5. Candidate (idempotent)
  IF p_tenant_id IS NOT NULL THEN
    SELECT id INTO v_candidate_id
    FROM public.candidates
    WHERE person_id = v_person_id
      AND tenant_id = p_tenant_id;

    IF v_candidate_id IS NULL THEN
      INSERT INTO public.candidates (person_id, tenant_id, status)
      VALUES (v_person_id, p_tenant_id, 'active')
      RETURNING id INTO v_candidate_id;
    END IF;
  END IF;

  RETURN QUERY
  SELECT v_person_id, v_tenant_membership_id, v_role_assignment_id, v_first_login_state_person_id, v_candidate_id;
END;
$$;

COMMENT ON FUNCTION public.bootstrap_candidate_identity IS
  'Atomically bootstrap candidate identity: people, tenant_membership, role_assignment, first_login_state, candidate. Idempotent.';

-- -----------------------------------------------------------------------------
-- 3. GRANTS
-- -----------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(uuid, text, text, text, uuid, uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(uuid, text, text, text, uuid, uuid)
  TO service_role;
