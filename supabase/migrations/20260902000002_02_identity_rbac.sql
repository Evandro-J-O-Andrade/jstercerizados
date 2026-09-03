-- =============================================================================
-- 02 — IDENTITY / RBAC
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  repair_candidate_chain utilitária (manual, não auto-executa)
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Rollback:
--   DROP FUNCTION IF EXISTS public.repair_candidate_chain(uuid, uuid, text);
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.repair_candidate_chain(
  p_person_id  uuid,
  p_tenant_id  uuid DEFAULT NULL,
  p_role_code  text DEFAULT 'candidate'
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
  WHERE public.tenant_memberships.person_id = p_person_id
    AND public.tenant_memberships.tenant_id = v_resolved_tenant_id;

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
    WHERE public.role_assignments.person_id = p_person_id
      AND public.role_assignments.role_id = v_role_id
      AND (public.role_assignments.tenant_id = v_resolved_tenant_id
           OR public.role_assignments.tenant_id IS NULL);

    IF v_role_assignment_id IS NULL THEN
      INSERT INTO public.role_assignments (person_id, role_id, tenant_id, assigned_at)
      VALUES (p_person_id, v_role_id, v_resolved_tenant_id, now())
      RETURNING id INTO v_role_assignment_id;
      v_created_assignment := true;
    END IF;
  END IF;

  SELECT id INTO v_candidate_id
  FROM public.candidates
  WHERE public.candidates.person_id = p_person_id
    AND public.candidates.tenant_id = v_resolved_tenant_id;

  IF v_candidate_id IS NULL THEN
    INSERT INTO public.candidates (person_id, tenant_id, status)
    VALUES (p_person_id, v_resolved_tenant_id, 'active')
    RETURNING id INTO v_candidate_id;
    v_created_candidate := true;
  END IF;

  RETURN QUERY
  SELECT p_person_id, v_tenant_membership_id, v_role_assignment_id,
         v_candidate_id, v_created_membership, v_created_assignment, v_created_candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) TO service_role;

COMMENT ON FUNCTION public.repair_candidate_chain(uuid, uuid, text) IS
  'Utilitária MANUAL de reparo da cadeia auth.users → people → tenant_memberships → role_assignments → candidate. NÃO é executada automaticamente. Use SELECT repair_candidate_chain(''<person_id>''::uuid) para diagnosticar e reparar um registro.';

COMMIT;
