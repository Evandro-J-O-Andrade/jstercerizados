-- =============================================================================
-- FASE 3 — Audit: políticas de audit trail para tabelas principais
-- =============================================================================
-- Cria função genérica de auditoria e a aplica nas tabelas canônicas.
-- =============================================================================

-- 1. Função genérica de auditoria
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    INSERT INTO public.activity_logs (
      tenant_id,
      action,
      entity_type,
      entity_id,
      changes,
      metadata
    ) VALUES (
      COALESCE(OLD.tenant_id, '00000000-0000-0000-0000-000000000000'::uuid),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id,
      jsonb_build_object('old', v_old),
      jsonb_build_object('trigger', 'audit_trigger_fn')
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    INSERT INTO public.activity_logs (
      tenant_id,
      action,
      entity_type,
      entity_id,
      changes,
      metadata
    ) VALUES (
      COALESCE(NEW.tenant_id, '00000000-0000-0000-0000-000000000000'::uuid),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('old', v_old, 'new', v_new),
      jsonb_build_object('trigger', 'audit_trigger_fn')
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
    INSERT INTO public.activity_logs (
      tenant_id,
      action,
      entity_type,
      entity_id,
      changes,
      metadata
    ) VALUES (
      COALESCE(NEW.tenant_id, '00000000-0000-0000-0000-000000000000'::uuid),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('new', v_new),
      jsonb_build_object('trigger', 'audit_trigger_fn')
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Aplicar trigger em tabelas principais (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'audit_companies'
      AND event_object_table = 'companies'
  ) THEN
    CREATE TRIGGER audit_companies
      AFTER INSERT OR UPDATE OR DELETE ON public.companies
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'audit_candidates'
      AND event_object_table = 'candidates'
  ) THEN
    CREATE TRIGGER audit_candidates
      AFTER INSERT OR UPDATE OR DELETE ON public.candidates
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'audit_jobs'
      AND event_object_table = 'jobs'
  ) THEN
    CREATE TRIGGER audit_jobs
      AFTER INSERT OR UPDATE OR DELETE ON public.jobs
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'audit_recruitment_demands'
      AND event_object_table = 'recruitment_demands'
  ) THEN
    CREATE TRIGGER audit_recruitment_demands
      AFTER INSERT OR UPDATE OR DELETE ON public.recruitment_demands
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'audit_job_matches'
      AND event_object_table = 'job_matches'
  ) THEN
    CREATE TRIGGER audit_job_matches
      AFTER INSERT OR UPDATE OR DELETE ON public.job_matches
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
  END IF;
END $$;
