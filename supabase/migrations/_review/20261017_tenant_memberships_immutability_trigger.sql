-- 20261017_tenant_memberships_immutability_trigger.sql
-- MODO REVISÃO — NÃO EXECUTAR
-- Ambiente: staging okxqfyoqbhcmflpurfrw
-- Objetivo: imutabilidade via trigger BEFORE UPDATE; preservar políticas RLS existentes

-- 1) Função: impede alteração de colunas imutáveis
CREATE OR REPLACE FUNCTION public.tenant_memberships_prevent_immutable_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS 
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.person_id IS DISTINCT FROM OLD.person_id
       OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       OR NEW.joined_at IS DISTINCT FROM OLD.joined_at
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN
      RAISE EXCEPTION 'Cannot modify immutable columns of tenant_memberships (id, person_id, tenant_id, joined_at, created_at)';
    END IF;
  END IF;
  RETURN NEW;
END;
;

-- 2) Trigger: só cria se não existir (não substitui silenciosamente)
DO 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'tenant_memberships'
      AND t.tgname = 'trg_tenant_memberships_prevent_immutable'
  ) THEN
    CREATE TRIGGER trg_tenant_memberships_prevent_immutable
    BEFORE UPDATE ON public.tenant_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.tenant_memberships_prevent_immutable_changes();
  ELSE
    RAISE EXCEPTION 'Trigger trg_tenant_memberships_prevent_immutable already exists on public.tenant_memberships - revisar antes de prosseguir';
  END IF;
END;
;
