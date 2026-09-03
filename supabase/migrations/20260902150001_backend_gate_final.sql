-- =============================================================================
-- BACKEND GATE FINAL — Fechamento do contrato canônico
-- =============================================================================
-- Data:    2026-09-02
-- Escopo:  Gaps reais identificados na auditoria BACKEND-AUDIT-20260902.md
-- Status:  AGUARDANDO OK EXPLÍCITO
-- =============================================================================
-- Notas:
--   - FAIL-01 (bootstrap_candidate_identity) não é falha: people.phone existe
--   - FAIL-02..05 (4 índices) não são falhas: índices existem com _id suffix
--   - companies.segment existe como company_segment (naming difference)
--   - tenants.legal_name/tax_id/settings não são críticos (tenant_settings table existe)
-- =============================================================================
-- Rollback:
--   Ver BACKEND-AUDIT-20260902.md seção "GAPs TO CLOSE"
-- =============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 1. repair_candidate_chain: adicionar search_path
-- ═══════════════════════════════════════════════════════════
ALTER FUNCTION public.repair_candidate_chain(uuid, uuid, text)
  SET search_path = public, pg_temp;

-- ═══════════════════════════════════════════════════════════
-- 2. RLS: integration_connections write policy (gap de segurança)
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS integration_connections_tenant_write ON public.integration_connections;
CREATE POLICY integration_connections_tenant_write
  ON public.integration_connections
  FOR ALL TO authenticated
  USING (is_tenant_member(tenant_id))
  WITH CHECK (is_tenant_member(tenant_id));

-- ═══════════════════════════════════════════════════════════
-- 3. tenant_memberships: membership_role (RBAC differentiation)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.tenant_memberships
  ADD COLUMN IF NOT EXISTS membership_role text NOT NULL DEFAULT 'member';

UPDATE public.tenant_memberships
  SET membership_role = 'member'
  WHERE membership_role IS NULL OR membership_role = '';

-- ═══════════════════════════════════════════════════════════
-- 4. applications: applied_at (tracking de candidatura)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS applied_at timestamptz;

UPDATE public.applications
  SET applied_at = created_at
  WHERE applied_at IS NULL;

ALTER TABLE public.applications
  ALTER COLUMN applied_at SET DEFAULT now();

-- ═══════════════════════════════════════════════════════════
-- 5. people: metadata (extensibilidade)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ═══════════════════════════════════════════════════════════
-- 6. permissions: code + updated_at
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.permissions
  ADD COLUMN IF NOT EXISTS code text;

ALTER TABLE public.permissions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill code from resource.action (idempotent)
UPDATE public.permissions
  SET code = resource || '.' || action
  WHERE code IS NULL;

-- Unique constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.permissions'::regclass
      AND conname = 'permissions_code_unique'
  ) THEN
    ALTER TABLE public.permissions
      ADD CONSTRAINT permissions_code_unique UNIQUE (code);
  END IF;
END $$;

-- updated_at trigger
DROP TRIGGER IF EXISTS update_permissions_updated_at ON public.permissions;
CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 7. role_assignments: updated_at (auditoria)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.role_assignments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- updated_at trigger
DROP TRIGGER IF EXISTS update_role_assignments_updated_at ON public.role_assignments;
CREATE TRIGGER update_role_assignments_updated_at
  BEFORE UPDATE ON public.role_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

COMMIT;
