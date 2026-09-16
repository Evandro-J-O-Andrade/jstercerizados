-- ============================================================
-- J&S Empregos LTDA
-- Migration: first_login_state signup origin + self_signup default
--
-- OBJETIVO:
--   1. Unificar must_change_password entre trigger e RPC
--      ambos devem usar false para self-signup
--   2. Adicionar signup_origin para rastrear origem
--   3. Corrigir DEFAULT para false
--
-- REGRA:
--   signup_origin = 'self_signup'
--       -> must_change_password = false
--
--   signup_origin = 'admin_created' (via raw_user_meta_data)
--       -> must_change_password = true
--
--   first_login_completed = true
--       -> registros existentes não são alterados
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Adicionar coluna signup_origin
-- ============================================================

ALTER TABLE public.first_login_state
  ADD COLUMN IF NOT EXISTS signup_origin TEXT;


-- ============================================================
-- 2. Constraint de valores permitidos
--    NULL permitido para registros legados
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'first_login_state_signup_origin_check'
      AND conrelid = 'public.first_login_state'::regclass
  ) THEN
    ALTER TABLE public.first_login_state
      ADD CONSTRAINT first_login_state_signup_origin_check
      CHECK (
        signup_origin IS NULL
        OR signup_origin IN ('self_signup', 'admin_created')
      );
  END IF;
END
$$;


-- ============================================================
-- 3. Novo DEFAULT
-- ============================================================

ALTER TABLE public.first_login_state
  ALTER COLUMN must_change_password SET DEFAULT false;


-- ============================================================
-- 4. Corrigir trigger bootstrap_candidate_from_auth_user
--    - self_signup: false
--    - admin_created (via metadata): true
-- ============================================================

CREATE OR REPLACE FUNCTION public.bootstrap_candidate_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_tenant_id uuid;
  v_person_id uuid;
  v_candidate_role_id uuid;

  v_signup_origin text;
  v_must_change_password boolean;
BEGIN
  SET LOCAL row_security = off;

  -- Origem determinada exclusivamente por metadata explícita
  IF NEW.raw_user_meta_data ->> 'signup_origin' = 'admin_created' THEN
    v_signup_origin := 'admin_created';
    v_must_change_password := true;
  ELSE
    v_signup_origin := 'self_signup';
    v_must_change_password := false;
  END IF;

  -- Tenant
  SELECT t.id INTO v_tenant_id
  FROM public.tenants t
  WHERE t.slug = 'js-empregos'
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'candidate tenant js-empregos not configured';
  END IF;

  -- Validações
  IF NULLIF(TRIM(COALESCE(NEW.email, '')), '') IS NULL THEN
    RAISE EXCEPTION 'candidate email is required';
  END IF;

  IF NULLIF(
    TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')),
    ''
  ) IS NULL THEN
    RAISE EXCEPTION 'candidate full name is required';
  END IF;

  -- People
  SELECT p.id INTO v_person_id
  FROM public.people p
  WHERE p.auth_user_id = NEW.id
  LIMIT 1;

  IF v_person_id IS NULL THEN
    INSERT INTO public.people (
      auth_user_id, full_name, email, phone, status
    ) VALUES (
      NEW.id,
      TRIM(NEW.raw_user_meta_data ->> 'full_name'),
      LOWER(TRIM(NEW.email)),
      NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'phone', '')), ''),
      'active'
    )
    RETURNING id INTO v_person_id;
  END IF;

  -- Tenant membership
  INSERT INTO public.tenant_memberships (
    person_id, tenant_id, status, joined_at
  ) VALUES (
    v_person_id, v_tenant_id, 'active', NOW()
  )
  ON CONFLICT (person_id, tenant_id) DO NOTHING;

  -- First login state (ON CONFLICT DO NOTHING preserva estado existente)
  INSERT INTO public.first_login_state (
    person_id, signup_origin, must_change_password, first_login_completed
  ) VALUES (
    v_person_id, v_signup_origin, v_must_change_password, false
  )
  ON CONFLICT (person_id) DO NOTHING;

  -- Candidate
  INSERT INTO public.candidates (
    person_id, tenant_id, status
  ) VALUES (
    v_person_id, v_tenant_id, 'active'
  )
  ON CONFLICT (person_id, tenant_id) DO NOTHING;

  -- Role: 'candidato'
  SELECT r.id INTO v_candidate_role_id
  FROM public.roles r
  WHERE r.name = 'candidato'
  LIMIT 1;

  IF v_candidate_role_id IS NOT NULL THEN
    INSERT INTO public.role_assignments (
      person_id, role_id, tenant_id, assigned_at, created_at
    ) VALUES (
      v_person_id, v_candidate_role_id, v_tenant_id, NOW(), NOW()
    )
    ON CONFLICT (person_id, role_id, tenant_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;


-- ============================================================
-- 5. Corrigir RPC bootstrap_candidate_identity
--    - self_signup: false
--    - inclui signup_origin = 'self_signup'
-- ============================================================

CREATE OR REPLACE FUNCTION public.bootstrap_candidate_identity(
  p_auth_user_id uuid,
  p_full_name text,
  p_email text,
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
AS $function$
DECLARE
  v_person_id uuid;
  v_tenant_membership_id uuid;
  v_role_assignment_id uuid;
  v_first_login_state_person_id uuid;
  v_candidate_id uuid;
BEGIN
  SET LOCAL row_security = off;

  -- 1. People (idempotent)
  SELECT id INTO v_person_id
  FROM public.people
  WHERE auth_user_id = p_auth_user_id;

  IF v_person_id IS NULL THEN
    INSERT INTO public.people (auth_user_id, full_name, email, status)
    VALUES (p_auth_user_id, p_full_name, p_email, 'active')
    RETURNING id INTO v_person_id;
  END IF;

  -- 2. Tenant membership (idempotent)
  IF p_tenant_id IS NOT NULL THEN
    SELECT id INTO v_tenant_membership_id
    FROM public.tenant_memberships
    WHERE person_id = v_person_id
      AND tenant_id = p_tenant_id;

    IF v_tenant_membership_id IS NULL THEN
      INSERT INTO public.tenant_memberships (
        person_id, tenant_id, status, joined_at
      ) VALUES (
        v_person_id, p_tenant_id, 'active', now()
      )
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
      INSERT INTO public.role_assignments (
        person_id, role_id, tenant_id, assigned_at
      ) VALUES (
        v_person_id, p_role_id, p_tenant_id, now()
      )
      RETURNING id INTO v_role_assignment_id;
    END IF;
  END IF;

  -- 4. First login state (idempotent)
  SELECT person_id INTO v_first_login_state_person_id
  FROM public.first_login_state
  WHERE person_id = v_person_id;

  IF v_first_login_state_person_id IS NULL THEN
    INSERT INTO public.first_login_state (
      person_id, signup_origin, must_change_password, first_login_completed
    ) VALUES (
      v_person_id, 'self_signup', false, false
    )
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
  SELECT v_person_id, v_tenant_membership_id, v_role_assignment_id,
         v_first_login_state_person_id, v_candidate_id;
END;
$function$;


-- Re-grant
GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(
  uuid, text, text, uuid, uuid
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(
  uuid, text, text, uuid, uuid
) TO service_role;


-- ============================================================
-- NOTA: Esta migration não aplica UPDATE em massa.
-- Registros com first_login_completed = true são preservados
-- devido ao ON CONFLICT DO NOTHING.
-- ============================================================

COMMIT;
