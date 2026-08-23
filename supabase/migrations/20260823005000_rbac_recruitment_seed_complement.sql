-- =============================================================================
-- V2.1 — RBAC Recruitment Domain Seed (complement, idempotent)
-- Data: 2026-08-23
-- Empresa: J&S Empregos LTDA
-- Escopo: Domínio de RH/Recrutamento — permissions básicas faltantes
-- Ordem: 50
-- Dependencies: 049_rbac_recruitment_seed_remote
-- =============================================================================
-- Propósito:
--   Adicionar permissions básicas de recruitment que estavam faltando:
--   - jobs: read, create, update, delete, publish
--   - candidates: read, create, update
--   - applications: read, create, update
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. PERMISSIONS BÁSICAS FALTANTES
-- =============================================================================

INSERT INTO public.permissions (resource, action, description) VALUES
  -- Jobs
  ('jobs', 'read', 'Visualizar vagas'),
  ('jobs', 'create', 'Criar vaga'),
  ('jobs', 'update', 'Editar vaga'),
  ('jobs', 'delete', 'Excluir vaga'),
  ('jobs', 'publish', 'Publicar vaga'),

  -- Candidates
  ('candidates', 'read', 'Visualizar candidatos'),
  ('candidates', 'create', 'Cadastrar candidato'),
  ('candidates', 'update', 'Editar candidato'),

  -- Applications
  ('applications', 'read', 'Visualizar candidaturas'),
  ('applications', 'create', 'Registrar candidatura'),
  ('applications', 'update', 'Atualizar candidatura')
ON CONFLICT (resource, action) DO NOTHING;

-- =============================================================================
-- 2. ROLE_PERMISSIONS — Recruiter (completo)
-- =============================================================================
-- Agora com as permissions básicas incluídas

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'recruiter'
  AND (p.resource, p.action) IN (
    -- Jobs
    ('jobs', 'read'),
    ('jobs', 'create'),
    ('jobs', 'update'),
    ('jobs', 'publish'),
    -- Candidates
    ('candidates', 'read'),
    ('candidates', 'create'),
    ('candidates', 'update'),
    ('candidates.documents', 'read'),
    ('candidates.profile', 'read'),
    -- Recruitment
    ('recruitment', 'read'),
    ('recruitment', 'create'),
    ('recruitment', 'update'),
    ('recruitment', 'advance'),
    ('recruitment', 'reject'),
    -- Applications
    ('applications', 'read'),
    ('applications', 'create'),
    ('applications', 'update'),
    ('applications', 'advance'),
    ('applications', 'reject'),
    ('applications.history', 'read'),
    -- Talent Pool
    ('talent_pool', 'read'),
    ('talent_pool', 'match'),
    -- Recruitment Demands
    ('recruitment_demands', 'read')
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 3. ROLE_PERMISSIONS — RH Manager (completo)
-- =============================================================================
-- Agora com as permissions básicas incluídas

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'rh_manager'
  AND (p.resource, p.action) IN (
    -- Jobs
    ('jobs', 'read'),
    ('jobs', 'create'),
    ('jobs', 'update'),
    ('jobs', 'delete'),
    ('jobs', 'publish'),
    ('jobs', 'close'),
    -- Candidates
    ('candidates', 'read'),
    ('candidates', 'create'),
    ('candidates', 'update'),
    ('candidates', 'delete'),
    ('candidates.documents', 'read'),
    ('candidates.documents', 'manage'),
    ('candidates.profile', 'read'),
    -- Recruitment
    ('recruitment', 'read'),
    ('recruitment', 'create'),
    ('recruitment', 'update'),
    ('recruitment', 'delete'),
    ('recruitment', 'advance'),
    ('recruitment', 'reject'),
    ('recruitment.stage', 'manage'),
    -- Applications
    ('applications', 'read'),
    ('applications', 'create'),
    ('applications', 'update'),
    ('applications', 'advance'),
    ('applications', 'reject'),
    ('applications.history', 'read'),
    -- Talent Pool
    ('talent_pool', 'read'),
    ('talent_pool', 'manage'),
    ('talent_pool', 'match'),
    -- Recruitment Demands
    ('recruitment_demands', 'read'),
    ('recruitment_demands', 'create'),
    ('recruitment_demands', 'update'),
    ('recruitment_demands', 'delete')
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 4. ROLE_PERMISSIONS — Tenant Admin (completo)
-- =============================================================================
-- Agora com as permissions básicas incluídas

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'tenant_admin'
  AND p.resource IN (
    'jobs',
    'candidates',
    'candidates.documents',
    'candidates.profile',
    'recruitment',
    'recruitment.stage',
    'applications',
    'applications.history',
    'talent_pool',
    'recruitment_demands'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 5. ROLE_PERMISSIONS — Admin Master (completo)
-- =============================================================================
-- Agora com as permissions básicas incluídas

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin_master'
  AND p.resource IN (
    'jobs',
    'candidates',
    'candidates.documents',
    'candidates.profile',
    'recruitment',
    'recruitment.stage',
    'applications',
    'applications.history',
    'talent_pool',
    'recruitment_demands'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 6. VALIDAÇÃO
-- =============================================================================

DO $$
BEGIN
  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE resource IN ('jobs', 'candidates', 'candidates.documents', 'candidates.profile', 'recruitment', 'recruitment.stage', 'applications', 'applications.history', 'talent_pool', 'recruitment_demands')
  ) >= 33, 'Permissões de recruitment incompletas';
END $$;

COMMIT;
