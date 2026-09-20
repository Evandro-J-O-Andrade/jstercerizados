-- =============================================================================
-- J&S Empregos LTDA
-- Migration: 20260918000001_empresa_bootstrap.sql
--
-- OBJETIVO:
--   1. Seed role 'company_representative' (tenant-scoped)
--   2. Add 'company_signup' to first_login_state.signup_origin CHECK
--   3. Guard bootstrap_candidate_from_auth_user to skip empresa context
--   4. Create bootstrap_company_from_auth_user trigger function
--   5. Create trg_bootstrap_company_from_auth_user trigger
--
-- REGRA:
--   signup_context in raw_user_meta_data:
--     - 'candidato' (default/omitted) → bootstrap_candidate_from_auth_user()
--     - 'empresa' → bootstrap_company_from_auth_user()
--
--   This ensures both triggers fire on auth.users INSERT, but only ONE
--   provisions the correct chain. No cross-contamination.
--
-- DEPENDÊNCIAS:
--   - 20260816000200_identity_people_auth.sql (handle_new_auth_user, on_auth_user_created)
--   - 20260909000001_fix_bootstrap_candidate_role_name.sql (bootstrap_candidate_from_auth_user)
--   - 20260910000002_unify_first_login_state.sql (signup_origin column)
--   - 20260816000300_companies.sql (companies, company_relationships)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. Seed: company_representative role
-- =============================================================================

INSERT INTO public.roles (name, description, scope, status, slug, level, sector)
VALUES ('company_representative', 'Representante legal da empresa (tenant)', 'tenant', 'active', 'company-representative', 5, 'commerce')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 2. Extend first_login_state.signup_origin CHECK constraint
--    Add 'company_signup' as valid value
-- =============================================================================

DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'first_login_state_signup_origin_check'
          AND conrelid = 'public.first_login_state'::regclass
    ) THEN
        ALTER TABLE public.first_login_state
            DROP CONSTRAINT first_login_state_signup_origin_check;
    END IF;

    -- Recreate with extended values
    ALTER TABLE public.first_login_state
        ADD CONSTRAINT first_login_state_signup_origin_check
        CHECK (
            signup_origin IS NULL
            OR signup_origin IN ('self_signup', 'admin_created', 'company_signup')
        );
END
$$;

-- =============================================================================
-- 3. Guard: bootstrap_candidate_from_auth_user skips empresa context
--    If signup_context = 'empresa', return early — let the company trigger
--    handle provisioning. This prevents empresa signups from creating
--    candidate records.
-- =============================================================================

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

  -- GUARD: Skip empresa context — not a candidate signup
  IF NEW.raw_user_meta_data ->> 'signup_context' = 'empresa' THEN
    RETURN NEW;
  END IF;

  -- Origem (existing logic preserved)
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

  -- First login state
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

-- =============================================================================
-- 4. Create: bootstrap_company_from_auth_user
--    Parallel to bootstrap_candidate_from_auth_user but for empresa signup.
--    Creates companies, company_relationships, tentant_memberships, first_login_state,
--    role_assignments — NO candidates record.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.bootstrap_company_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_tenant_id      uuid;
  v_person_id       uuid;
  v_company_id      uuid;
  v_role_id         uuid;

  v_company_name   text;
  v_cnpj           text;
  v_phone          text;
  v_signup_origin  text := 'company_signup';
  v_must_change_password boolean := false;
BEGIN
  SET LOCAL row_security = off;

  -- GUARD: Only process empresa context
  IF NEW.raw_user_meta_data ->> 'signup_context' <> 'empresa' THEN
    RETURN NEW;
  END IF;

  -- Resolve tenant 'js-empregos' (platform tenant — empresa signs up as a client)
  SELECT t.id INTO v_tenant_id
  FROM public.tenants t
  WHERE t.slug = 'js-empregos'
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant js-empregos not configured for company bootstrap';
  END IF;

  -- Extract company data from metadata
  v_company_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'company_name', '')), '');
  v_cnpj := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'cnpj', '')), '');
  v_phone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'phone', '')), '');

  IF v_company_name IS NULL THEN
    RAISE EXCEPTION 'company_name is required for empresa signup';
  END IF;

  -- People (idempotent — handle_new_auth_user may have already created it)
  SELECT p.id INTO v_person_id
  FROM public.people p
  WHERE p.auth_user_id = NEW.id
  LIMIT 1;

  IF v_person_id IS NULL THEN
    INSERT INTO public.people (
      auth_user_id, full_name, email, phone, status
    ) VALUES (
      NEW.id,
      TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))),
      LOWER(TRIM(NEW.email)),
      v_phone,
      'active'
    )
    RETURNING id INTO v_person_id;
  END IF;

  -- Company (idempotent — one company per CNPJ)
  SELECT id INTO v_company_id
  FROM public.companies c
  WHERE c.cnpj = v_cnpj
  LIMIT 1;

  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (
      tenant_id,
      name,
      legal_name,
      trading_name,
      cnpj,
      phone,
      email,
      status,
      created_by
    ) VALUES (
      v_tenant_id,
      v_company_name,
      v_company_name,
      v_company_name,
      v_cnpj,
      v_phone,
      LOWER(TRIM(NEW.email)),
      'active',
      v_person_id
    )
    RETURNING id INTO v_company_id;
  END IF;

  -- Company relationship: company ↔ tenant (type: 'client')
  -- Uses existence check to avoid unique-constraint assumptions
  PERFORM 1 FROM public.company_relationships
  WHERE company_id = v_company_id
    AND relationship_type = 'client'
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.company_relationships (
      company_id,
      tenant_id,
      relationship_type,
      status,
      started_at,
      created_by
    ) VALUES (
      v_company_id,
      v_tenant_id,
      'client',
      'active',
      NOW(),
      v_person_id
    );
  END IF;

  -- Tenant membership (idempotent)
  INSERT INTO public.tenant_memberships (
    person_id, tenant_id, status, joined_at
  ) VALUES (
    v_person_id, v_tenant_id, 'active', NOW()
  )
  ON CONFLICT (person_id, tenant_id) DO NOTHING;

  -- First login state
  INSERT INTO public.first_login_state (
    person_id, signup_origin, must_change_password, first_login_completed
  ) VALUES (
    v_person_id, v_signup_origin, v_must_change_password, false
  )
  ON CONFLICT (person_id) DO NOTHING;

  -- Role assignment: company_representative
  SELECT r.id INTO v_role_id
  FROM public.roles r
  WHERE r.name = 'company_representative'
  LIMIT 1;

  IF v_role_id IS NOT NULL THEN
    INSERT INTO public.role_assignments (
      person_id, role_id, tenant_id, assigned_at, created_at
    ) VALUES (
      v_person_id, v_role_id, v_tenant_id, NOW(), NOW()
    )
    ON CONFLICT (person_id, role_id, tenant_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- =============================================================================
-- 5. Create trigger: trg_bootstrap_company_from_auth_user
--    AFTER INSERT on auth.users — fires alongside handle_new_auth_user
--    and trg_bootstrap_candidate_from_auth_user, but the GUARD in each
--    function ensures only the correct provisioning runs.
-- =============================================================================

DROP TRIGGER IF EXISTS trg_bootstrap_company_from_auth_user ON auth.users;

CREATE TRIGGER trg_bootstrap_company_from_auth_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.bootstrap_company_from_auth_user();

-- =============================================================================
-- 6. Re-grant for safety (idempotent)
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.bootstrap_company_from_auth_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.bootstrap_company_from_auth_user() TO service_role;

COMMIT;
