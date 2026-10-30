-- 20261017_tenant_memberships_immutability_trigger_rollback.sql
-- Rollback fiel: remove APENAS os objetos criados pelo pacote de revisão
DO 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'tenant_memberships'
      AND t.tgname = 'trg_tenant_memberships_prevent_immutable'
  ) THEN
    DROP TRIGGER trg_tenant_memberships_prevent_immutable ON public.tenant_memberships;
  END IF;
END;
;

DROP FUNCTION IF EXISTS public.tenant_memberships_prevent_immutable_changes();
