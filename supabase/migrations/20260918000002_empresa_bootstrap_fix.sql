-- Fix: Replace bootstrap_company_from_auth_user with corrected schema
-- The initial 20260918000001 migration referenced company_types (non-existent)
-- and used is_active column (does not exist on companies table).
-- Companies table has: tenant_id (NOT NULL), name (NOT NULL), no is_active, no company_types.

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
