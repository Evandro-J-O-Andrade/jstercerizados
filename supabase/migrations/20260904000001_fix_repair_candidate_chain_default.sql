-- =============================================================================
-- GATE-DATA-04.012 — Fix repair_candidate_chain default role code
-- =============================================================================
-- Purpose:
--   -修复 repair_candidate_chain functions that still default to 'candidate'
--   - The role was renamed from 'candidate' to 'candidato' in migration 010
--   - Functions with DEFAULT 'candidate' will fail when called without arguments
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Fix repair_candidate_chain default in public schema
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.repair_candidate_chain(
  p_person_id  uuid,
  p_tenant_id  uuid DEFAULT NULL,
  p_role_code  text DEFAULT 'candidato'
)
RETURNS TABLE (
  person_id             uuid,
  tenant_membership_id  uuid,
  role_assignment_id    uuid,
  candidate_id          uuid,
  created_membership    boolean,
  created_assignment    boolean,
  created_candidate     boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tenant_membership_id uuid;
  v_role_assignment_id   uuid;
  v_candidate_id         uuid;
  v_role_id              uuid;
  v_resolved_tenant_id   uuid;
  v_created_membership   boolean := false;
  v_created_assignment   boolean := false;
  v_created_candidate    boolean := false;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.people WHERE id = p_person_id) THEN
    RAISE EXCEPTION 'repair_candidate_chain: person % não encontrada', p_person_id;
  END IF;

  IF p_tenant_id IS NOT NULL THEN
    v_resolved_tenant_id := p_tenant_id;
  ELSE
    SELECT tm.tenant_id INTO v_resolved_tenant_id
    FROM public.tenant_memberships tm
    WHERE tm.person_id = p_person_id
      AND tm.status = 'active'
    ORDER BY tm.joined_at DESC NULLS LAST
    LIMIT 1;
  END IF;

  IF v_resolved_tenant_id IS NULL THEN
    RAISE EXCEPTION 'repair_candidate_chain: nenhum tenant resolvido para person %', p_person_id;
  END IF;

  SELECT id INTO v_tenant_membership_id
  FROM public.tenant_memberships
  WHERE person_id = p_person_id
    AND tenant_id = v_resolved_tenant_id;

  IF v_tenant_membership_id IS NULL THEN
    INSERT INTO public.tenant_memberships (person_id, tenant_id, status, joined_at)
    VALUES (p_person_id, v_resolved_tenant_id, 'active', now())
    RETURNING id INTO v_tenant_membership_id;
    v_created_membership := true;
  END IF;

  SELECT id INTO v_role_id
  FROM public.roles
  WHERE name = p_role_code
  LIMIT 1;

  IF v_role_id IS NOT NULL THEN
    SELECT id INTO v_role_assignment_id
    FROM public.role_assignments
    WHERE person_id = p_person_id
      AND role_id = v_role_id
      AND (tenant_id = v_resolved_tenant_id OR tenant_id IS NULL);

    IF v_role_assignment_id IS NULL THEN
      INSERT INTO public.role_assignments (person_id, role_id, tenant_id, assigned_at)
      VALUES (p_person_id, v_role_id, v_resolved_tenant_id, now())
      RETURNING id INTO v_role_assignment_id;
      v_created_assignment := true;
    END IF;
  END IF;

  SELECT id INTO v_candidate_id
  FROM public.candidates
  WHERE person_id = p_person_id
    AND tenant_id = v_resolved_tenant_id;

  IF v_candidate_id IS NULL THEN
    INSERT INTO public.candidates (person_id, tenant_id, status, created_at)
    VALUES (p_person_id, v_resolved_tenant_id, 'active', now())
    RETURNING id INTO v_candidate_id;
    v_created_candidate := true;
  END IF;

  person_id := p_person_id;
  tenant_membership_id := v_tenant_membership_id;
  role_assignment_id := v_role_assignment_id;
  candidate_id := v_candidate_id;
  created_membership := v_created_membership;
  created_assignment := v_created_assignment;
  created_candidate := v_created_candidate;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Fix bootstrap_candidate_identity default role if needed
-- -----------------------------------------------------------------------------
-- Note: bootstrap_candidate_identity already uses p_role_id with NULL default,
-- so it is not affected by the role name change.
