-- =============================================================================
-- 06 — RLS / SECURITY
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Policies faltantes + search_path fixo em funções SECURITY DEFINER
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Rollback (rodar manualmente):
--   DROP POLICY IF EXISTS tenants_member_read ON public.tenants;
--   DROP POLICY IF EXISTS company_relationship_types_authenticated_read ON public.company_relationship_types;
--   -- search_path pode ser revertido com ALTER FUNCTION … RESET search_path
-- =============================================================================

BEGIN;

-- 6.1 — tenants: SELECT para membros
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenants_member_read ON public.tenants;
CREATE POLICY tenants_member_read
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (public.is_tenant_member(id));

-- 6.2 — company_relationship_types: SELECT autenticado
ALTER TABLE public.company_relationship_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_relationship_types_authenticated_read
  ON public.company_relationship_types;
CREATE POLICY company_relationship_types_authenticated_read
  ON public.company_relationship_types
  FOR SELECT
  TO authenticated
  USING (true);

-- 6.3 — search_path em 9 funções SECURITY DEFINER
--       handle_new_auth_user (rebuild)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_meta jsonb;
  v_full_name text;
  v_email text;
BEGIN
  v_meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_email := new.email;
  v_full_name := v_meta ->> 'full_name';
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := v_meta ->> 'name';
  END IF;
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := split_part(v_email, '@', 1);
  END IF;

  IF EXISTS (SELECT 1 FROM public.people WHERE auth_user_id = new.id) THEN
    UPDATE public.people
    SET email = new.email, full_name = v_full_name
    WHERE auth_user_id = new.id
      AND (email IS DISTINCT FROM new.email
           OR full_name IS DISTINCT FROM v_full_name);
  ELSE
    INSERT INTO public.people (id, auth_user_id, full_name, email, status)
    VALUES (gen_random_uuid(), new.id, v_full_name, v_email, 'active');
  END IF;

  RETURN new;
END;
$$;

-- 6.4 — handle_auth_user_updated (rebuild)
CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF new.email IS DISTINCT FROM old.email THEN
    UPDATE public.people
    SET email = new.email
    WHERE auth_user_id = new.id;
  END IF;
  RETURN new;
END;
$$;

-- 6.5 — handle_auth_user_deleted (rebuild)
CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.people
  SET auth_user_id = NULL
  WHERE auth_user_id = old.id;
  RETURN old;
END;
$$;

-- 6.6 — demais funções: ALTER FUNCTION preservando assinatura
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='is_tenant_member') THEN
    EXECUTE 'ALTER FUNCTION public.is_tenant_member(uuid) SET search_path = public, pg_temp';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='is_admin_master') THEN
    EXECUTE 'ALTER FUNCTION public.is_admin_master() SET search_path = public, pg_temp';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='user_tenant_ids') THEN
    EXECUTE 'ALTER FUNCTION public.user_tenant_ids() SET search_path = public, pg_temp';
  END IF;
END $$;

-- 6.7 — funções com múltiplas assinaturas
DO $$
DECLARE
  v_func record;
BEGIN
  FOR v_func IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='user_has_permission'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', v_func.sig);
  END LOOP;
  FOR v_func IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='user_permissions'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', v_func.sig);
  END LOOP;
  FOR v_func IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='bootstrap_candidate_identity'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', v_func.sig);
  END LOOP;
END $$;

COMMIT;
