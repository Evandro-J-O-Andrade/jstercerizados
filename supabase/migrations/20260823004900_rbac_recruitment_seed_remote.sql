-- =============================================================================
-- V2.1 — RBAC Recruitment Domain Seed (canonical, idempotent, remote-compatible)
-- Data: 2026-08-23
-- Empresa: J&S Empregos LTDA
-- Escopo: Domínio de RH/Recrutamento
-- Ordem: 49
-- Dependencies: remote schema already uses (resource, action, description) for permissions
--                and (name, scope) for roles
-- =============================================================================
-- Propósito:
--   Fechar o contrato RBAC de RH/Recrutamento no banco remoto, adicionando:
--   - 21 permissions faltantes no formato resource/action
--   - Garantir role finance_manager
--   - role_permissions para recruiter, rh_manager, tenant_admin, admin_master
--   - tratamento de applications.approve como legacy
-- =============================================================================
-- Regras:
--   - NÃO recriar tabelas roles, permissions, role_permissions
--   - Tudo idempotente: ON CONFLICT DO NOTHING
--   - Não executar operações destrutivas
--   - Não remover permissions existentes
--   - Preservar UUIDs existentes
--   - Formato compatível com schema remoto: permissions(resource, action, description)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. PERMISSIONS FALTANTES (21 novas) — formato resource/action
-- =============================================================================

INSERT INTO public.permissions (resource, action, description) VALUES
  -- Jobs
  ('jobs', 'close', 'Encerrar vaga'),

  -- Candidates
  ('candidates', 'delete', 'Remover candidato'),
  ('candidates.documents', 'read', 'Consultar documentos do candidato'),
  ('candidates.documents', 'manage', 'Gerenciar documentos do candidato'),
  ('candidates.profile', 'read', 'Consultar perfil completo do candidato'),

  -- Recruitment / Processos Seletivos
  ('recruitment', 'read', 'Visualizar processos seletivos'),
  ('recruitment', 'create', 'Criar processo seletivo'),
  ('recruitment', 'update', 'Editar processo seletivo'),
  ('recruitment', 'delete', 'Excluir processo seletivo'),
  ('recruitment', 'advance', 'Avançar candidato para próxima etapa'),
  ('recruitment', 'reject', 'Reprovar candidato'),
  ('recruitment.stage', 'manage', 'Gerenciar etapas do processo'),

  -- Applications
  ('applications', 'advance', 'Avançar status da candidatura'),
  ('applications', 'reject', 'Rejeitar candidatura'),
  ('applications.history', 'read', 'Consultar histórico de status da candidatura'),

  -- Talent Pool
  ('talent_pool', 'read', 'Consultar banco de talentos'),
  ('talent_pool', 'manage', 'Administrar talentos do banco'),
  ('talent_pool', 'match', 'Executar matching candidato-vaga'),

  -- Recruitment Demands
  ('recruitment_demands', 'read', 'Consultar demandas de recrutamento'),
  ('recruitment_demands', 'create', 'Abrir nova demanda de recrutamento'),
  ('recruitment_demands', 'update', 'Editar demanda de recrutamento'),
  ('recruitment_demands', 'delete', 'Excluir demanda de recrutamento')
ON CONFLICT (resource, action) DO NOTHING;

-- =============================================================================
-- 2. ROLE FALTANTE: finance_manager
-- =============================================================================
-- Observação: o banco remoto já possui finance_manager.
-- Esta inserção é idempotente e serve como garantia.

INSERT INTO public.roles (name, scope, description)
VALUES ('finance_manager', 'tenant', 'Gerente Financeiro')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 3. TRATAMENTO DE applications.approve (LEGACY)
-- =============================================================================
-- O banco atual já possui 'applications.approve'.
-- O contrato canônico define 'applications.advance' + 'applications.reject'.
-- Estratégia:
--   - NÃO remover applications.approve (não destrutivo)
--   - NÃO adicionar applications.approve em nenhuma role_permissions nova
--   - O frontend deve mapear advance/reject como regra nova
--   - applications.approve é mantido como legacy para compatibilidade
-- Referência: docs/V21-RBAC-RECRUITMENT-CONTRACT.md §3.4

-- =============================================================================
-- 4. ROLE_PERMISSIONS — Recruiter
-- =============================================================================
-- Permissões operacionais: pode criar/editar vagas e candidatos,
-- mas NÃO pode excluir, publicar/encerrar vagas, nem gerenciar etapas.

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
-- 5. ROLE_PERMISSIONS — RH Manager
-- =============================================================================
-- Permissões gerenciais: acesso total ao domínio de RH/Recrutamento,
-- incluindo exclusão, publicação/encerramento e gerenciamento de etapas.

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
-- 6. ROLE_PERMISSIONS — Tenant Admin
-- =============================================================================
-- Acesso total dentro do tenant, mas NÃO cross-tenant.
-- Recebe todas as permissions do domínio recruitment.

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
-- 7. ROLE_PERMISSIONS — Admin Master
-- =============================================================================
-- Bypass total. Garantir que tenha todas as permissions.
-- Isso é defensivo: o admin_master já deve ter acesso total via código,
-- mas ter todas as permissions no banco facilita queries e auditoria.

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
-- 8. ROLE_PERMISSIONS — Finance Manager
-- =============================================================================
-- NENHUMA permission de recruitment por padrão.
-- Esta inserção é vazia intencionalmente.
-- O finance_manager terá permissions apenas do domínio financeiro,
-- que devem ser definidas em outro contrato/migration.

-- Nenhuma linha inserida aqui.

-- =============================================================================
-- 9. VALIDAÇÃO: assertions pós-seed (somente leitura)
-- =============================================================================
-- Não altera dados, apenas valida que o seed foi aplicado corretamente.

DO $$
BEGIN
  -- Validar que as 21 permissions novas existem
  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE (resource, action) IN (
      ('jobs', 'close'),
      ('candidates', 'delete'),
      ('candidates.documents', 'read'),
      ('candidates.documents', 'manage'),
      ('candidates.profile', 'read'),
      ('recruitment', 'read'),
      ('recruitment', 'create'),
      ('recruitment', 'update'),
      ('recruitment', 'delete'),
      ('recruitment', 'advance'),
      ('recruitment', 'reject'),
      ('recruitment.stage', 'manage'),
      ('applications', 'advance'),
      ('applications', 'reject'),
      ('applications.history', 'read'),
      ('talent_pool', 'read'),
      ('talent_pool', 'manage'),
      ('talent_pool', 'match'),
      ('recruitment_demands', 'read'),
      ('recruitment_demands', 'create'),
      ('recruitment_demands', 'update'),
      ('recruitment_demands', 'delete')
    )
  ) >= 21, 'Nem todas as permissions de recruitment foram criadas';

  -- Validar que finance_manager existe
  ASSERT (
    SELECT count(*) FROM public.roles
    WHERE name = 'finance_manager' AND scope = 'tenant'
  ) >= 1, 'Role finance_manager não foi criada';
END $$;

-- =============================================================================
-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE public.roles IS 'Roles canônicos V2.1: admin_master (global scope), tenant roles com scope=tenant. finance_manager adicionado em migration 049.';
COMMENT ON TABLE public.permissions IS 'Permissions canônicas V2.1 no formato resource.action. Domínios: core, recruitment, finance, platform, etc. 84 permissions totais após migration 049.';
COMMENT ON TABLE public.role_permissions IS 'Mapeamento roles ↔ permissions. admin_master bypassa via código, mas também tem todas as permissions no banco.';

-- =============================================================================
-- 11. MARCAÇÃO DE AUDITORIA
-- =============================================================================
-- Esta migration é idempotente e não destrutiva.
-- Pode ser reexecutada com segurança em qualquer ambiente.
-- Formato compatível com schema remoto existente:
--   permissions: (id, resource, action, description, created_at)
--   roles: (id, name, description, scope, created_at, updated_at)
--   role_permissions: (id, role_id, permission_id, created_at)
-- Referência: docs/V21-RBAC-RECRUITMENT-CONTRACT.md
--             docs/V21-RBAC-RECRUITMENT-AUDIT.md

COMMIT;
