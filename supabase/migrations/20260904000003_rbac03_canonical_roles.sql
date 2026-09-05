-- Migration: RBAC-03 — Canonical Roles V3
-- Data: 2026-09-04
-- Descrição: Estende o catálogo de roles com campos canônicos e adiciona 28 novas roles.
-- Estratégia: idempotente, sem apagar histórico, sem alterar permissions/RLS/assignments.

BEGIN;

-- ============================================
-- 1. EXTENDER TABELA roles COM CAMPOS CANÔNICOS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'roles'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.roles
      ADD COLUMN status text NOT NULL DEFAULT 'active',
      ADD COLUMN slug text,
      ADD COLUMN level integer,
      ADD COLUMN sector text,
      ADD COLUMN replacement_role_id uuid;
  END IF;
END $$;

-- Índice único para slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'roles'
      AND indexname = 'roles_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX roles_slug_unique ON public.roles (slug);
  END IF;
END $$;

-- Índice para level/sector/scope
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'roles'
      AND indexname = 'idx_roles_level_sector'
  ) THEN
    CREATE INDEX idx_roles_level_sector ON public.roles (level, sector, scope);
  END IF;
END $$;

-- ============================================
-- 2. ATUALIZAR ROLES EXISTENTES COM CAMPOS CANÔNICOS
-- ============================================

UPDATE public.roles SET status = 'active' WHERE status IS NULL OR status = '';

UPDATE public.roles SET slug = LOWER(REPLACE(name, ' ', '_')) WHERE slug IS NULL;

-- Níveis e setores para roles existentes
UPDATE public.roles SET level = 0, sector = 'system' WHERE name = 'admin_master';
UPDATE public.roles SET level = 1, sector = 'tenant' WHERE name = 'tenant_admin';
UPDATE public.roles SET level = 2, sector = 'rh' WHERE name = 'rh_manager';
UPDATE public.roles SET level = 2, sector = 'finance' WHERE name = 'finance_manager';
UPDATE public.roles SET level = 2, sector = 'operations' WHERE name = 'operations_manager';
UPDATE public.roles SET level = 4, sector = 'recruitment' WHERE name = 'recruiter';
UPDATE public.roles SET level = 2, sector = 'finance' WHERE name = 'billing_manager';
UPDATE public.roles SET level = 2, sector = 'accounting' WHERE name = 'accounting_manager';
UPDATE public.roles SET level = 2, sector = 'fiscal' WHERE name = 'fiscal_manager';
UPDATE public.roles SET level = 2, sector = 'stock' WHERE name = 'stock_manager';
UPDATE public.roles SET level = 2, sector = 'security' WHERE name = 'security_manager';
UPDATE public.roles SET level = 2, sector = 'facilities' WHERE name = 'facilities_manager';
UPDATE public.roles SET level = 4, sector = 'legal' WHERE name = 'lawyer';
UPDATE public.roles SET level = 4, sector = 'it' WHERE name = 'it_admin';
UPDATE public.roles SET level = 4, sector = 'finance' WHERE name = 'finance';
UPDATE public.roles SET level = 4, sector = 'operations' WHERE name = 'operator';
UPDATE public.roles SET level = 4, sector = 'support' WHERE name = 'support';
UPDATE public.roles SET level = 4, sector = 'commercial' WHERE name = 'commercial';
UPDATE public.roles SET level = 7, sector = 'special' WHERE name = 'viewer';
UPDATE public.roles SET level = 7, sector = 'special' WHERE name = 'candidato';

-- ============================================
-- 3. CRIAR 28 NOVAS ROLES CANÔNICAS
-- ============================================

-- Gestores (3)
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'commercial_manager', 'Gerente Comercial', 'tenant', 'active', 'commercial_manager', 2, 'commercial', now(), now()),
  ('30000000-0000-0000-0000-000000000002', 'it_manager', 'Gerente de TI', 'tenant', 'active', 'it_manager', 2, 'it', now(), now()),
  ('30000000-0000-0000-0000-000000000003', 'support_manager', 'Gerente de Suporte', 'tenant', 'active', 'support_manager', 2, 'support', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Supervisores (12)
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000004', 'rh_supervisor', 'Supervisor de RH', 'tenant', 'active', 'rh_supervisor', 3, 'rh', now(), now()),
  ('30000000-0000-0000-0000-000000000005', 'finance_supervisor', 'Supervisor Financeiro', 'tenant', 'active', 'finance_supervisor', 3, 'finance', now(), now()),
  ('30000000-0000-0000-0000-000000000006', 'billing_supervisor', 'Supervisor de Faturamento', 'tenant', 'active', 'billing_supervisor', 3, 'finance', now(), now()),
  ('30000000-0000-0000-0000-000000000007', 'accounting_supervisor', 'Supervisor Contábil', 'tenant', 'active', 'accounting_supervisor', 3, 'accounting', now(), now()),
  ('30000000-0000-0000-0000-000000000008', 'fiscal_supervisor', 'Supervisor Fiscal', 'tenant', 'active', 'fiscal_supervisor', 3, 'fiscal', now(), now()),
  ('30000000-0000-0000-0000-000000000009', 'operations_supervisor', 'Supervisor de Operações', 'tenant', 'active', 'operations_supervisor', 3, 'operations', now(), now()),
  ('30000000-0000-0000-0000-000000000010', 'stock_supervisor', 'Supervisor de Estoque', 'tenant', 'active', 'stock_supervisor', 3, 'stock', now(), now()),
  ('30000000-0000-0000-0000-000000000011', 'security_supervisor', 'Supervisor de Segurança', 'tenant', 'active', 'security_supervisor', 3, 'security', now(), now()),
  ('30000000-0000-0000-0000-000000000012', 'facilities_supervisor', 'Supervisor de Facilities', 'tenant', 'active', 'facilities_supervisor', 3, 'facilities', now(), now()),
  ('30000000-0000-0000-0000-000000000013', 'commercial_supervisor', 'Supervisor Comercial', 'tenant', 'active', 'commercial_supervisor', 3, 'commercial', now(), now()),
  ('30000000-0000-0000-0000-000000000014', 'it_supervisor', 'Supervisor de TI', 'tenant', 'active', 'it_supervisor', 3, 'it', now(), now()),
  ('30000000-0000-0000-0000-000000000015', 'support_supervisor', 'Supervisor de Suporte', 'tenant', 'active', 'support_supervisor', 3, 'support', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Profissional (1 nova)
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000016', 'rh', 'Profissional de RH', 'tenant', 'active', 'rh', 4, 'rh', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Profissionais substitutas (legacy → professional rename)
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000029', 'it_operator', 'Operador de TI', 'tenant', 'active', 'it_operator', 4, 'it', now(), now()),
  ('30000000-0000-0000-0000-000000000030', 'support_agent', 'Agente de Suporte', 'tenant', 'active', 'support_agent', 4, 'support', now(), now()),
  ('30000000-0000-0000-0000-000000000031', 'operations_operator', 'Operador de Operações', 'tenant', 'active', 'operations_operator', 4, 'operations', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Auxiliares (12)
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000017', 'rh_assistant', 'Auxiliar de RH', 'tenant', 'active', 'rh_assistant', 5, 'rh', now(), now()),
  ('30000000-0000-0000-0000-000000000018', 'finance_assistant', 'Auxiliar Financeiro', 'tenant', 'active', 'finance_assistant', 5, 'finance', now(), now()),
  ('30000000-0000-0000-0000-000000000019', 'billing_assistant', 'Auxiliar de Faturamento', 'tenant', 'active', 'billing_assistant', 5, 'finance', now(), now()),
  ('30000000-0000-0000-0000-000000000020', 'accounting_assistant', 'Auxiliar Contábil', 'tenant', 'active', 'accounting_assistant', 5, 'accounting', now(), now()),
  ('30000000-0000-0000-0000-000000000021', 'fiscal_assistant', 'Auxiliar Fiscal', 'tenant', 'active', 'fiscal_assistant', 5, 'fiscal', now(), now()),
  ('30000000-0000-0000-0000-000000000022', 'stock_assistant', 'Auxiliar de Estoque', 'tenant', 'active', 'stock_assistant', 5, 'stock', now(), now()),
  ('30000000-0000-0000-0000-000000000023', 'operations_assistant', 'Auxiliar de Operações', 'tenant', 'active', 'operations_assistant', 5, 'operations', now(), now()),
  ('30000000-0000-0000-0000-000000000024', 'facilities_assistant', 'Auxiliar de Facilities', 'tenant', 'active', 'facilities_assistant', 5, 'facilities', now(), now()),
  ('30000000-0000-0000-0000-000000000025', 'security_assistant', 'Auxiliar de Segurança', 'tenant', 'active', 'security_assistant', 5, 'security', now(), now()),
  ('30000000-0000-0000-0000-000000000026', 'commercial_assistant', 'Auxiliar Comercial', 'tenant', 'active', 'commercial_assistant', 5, 'commercial', now(), now()),
  ('30000000-0000-0000-0000-000000000027', 'it_assistant', 'Auxiliar de TI', 'tenant', 'active', 'it_assistant', 5, 'it', now(), now()),
  ('30000000-0000-0000-0000-000000000028', 'support_assistant', 'Auxiliar de Suporte', 'tenant', 'active', 'support_assistant', 5, 'support', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. DEPRECIAR ROLES ANTIGAS (sem apagar)
-- ============================================

UPDATE public.roles
SET status = 'deprecated',
    replacement_role_id = (
      SELECT id FROM public.roles WHERE name = 'it_operator'
    )
WHERE name = 'it_admin';

UPDATE public.roles
SET status = 'deprecated',
    replacement_role_id = (
      SELECT id FROM public.roles WHERE name = 'support_agent'
    )
WHERE name = 'support';

UPDATE public.roles
SET status = 'deprecated',
    replacement_role_id = (
      SELECT id FROM public.roles WHERE name = 'operations_operator'
    )
WHERE name = 'operator';

-- ============================================
-- 5. GARANTIR NÃO-APAGAMENTO DE ROLES COM ASSIGNMENTS
-- ============================================

DO $$
DECLARE
  affected integer;
BEGIN
  SELECT COUNT(*) INTO affected FROM public.role_assignments;
  IF affected > 0 THEN
    RAISE NOTICE 'Existem % role_assignments. Roles antigas preservadas para rastreabilidade.', affected;
  END IF;
END $$;

-- ============================================
-- 6. SNAPSHOT FINAL
-- ============================================

DO $$
DECLARE
  total integer;
  active integer;
  deprecated integer;
BEGIN
  SELECT COUNT(*) INTO total FROM public.roles;
  SELECT COUNT(*) INTO active FROM public.roles WHERE status = 'active';
  SELECT COUNT(*) INTO deprecated FROM public.roles WHERE status = 'deprecated';
  RAISE NOTICE 'RBAC-03 concluído: total=% | active=% | deprecated=%', total, active, deprecated;
END $$;

COMMIT;
