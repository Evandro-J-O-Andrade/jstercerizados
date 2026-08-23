-- =============================================================================
-- V2.1 — RBAC Recruitment Domain Seed (canonical, idempotent)
-- Data: 2026-08-23
-- Empresa: J&S Empregos LTDA
-- Escopo: Domínio de RH/Recrutamento
-- Ordem: 48
-- Dependencies: 001_core, 002_identity, 007_rbac, 012_rls_consolidation,
--               013_seed, 017_enable_rls_role_resource_permissions
-- =============================================================================
-- Propósito:
--   Fechar o contrato RBAC de RH/Recrutamento no banco, adicionando:
--   - 21 permissions faltantes
--   - role finance_manager
--   - role_permissions para recruiter, rh_manager, tenant_admin, admin_master
--   - tratamento de aplicações.approve como legacy
-- =============================================================================
-- Regras:
--   - NÃO recriar tabelas roles, permissions, role_permissions
--   - Tudo idempotente: ON CONFLICT DO NOTHING
--   - Não executar operações destrutivas
--   - Não remover permissions existentes
--   - Preservar UUIDs existentes
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. PERMISSIONS FALTANTES (21 novas)
-- =============================================================================
-- Estratégia: INSERT com ON CONFLICT (name) DO NOTHING
-- Assim não duplicamos se a migration for executada mais de uma vez.

INSERT INTO public.permissions (name, module, description) VALUES
  -- Jobs
  ('jobs.close', 'recruitment', 'Encerrar vaga'),

  -- Candidates
  ('candidates.delete', 'recruitment', 'Remover candidato'),
  ('candidates.documents.read', 'recruitment', 'Consultar documentos do candidato'),
  ('candidates.documents.manage', 'recruitment', 'Gerenciar documentos do candidato'),
  ('candidates.profile.read', 'recruitment', 'Consultar perfil completo do candidato'),

  -- Recruitment / Processos Seletivos
  ('recruitment.read', 'recruitment', 'Visualizar processos seletivos'),
  ('recruitment.create', 'recruitment', 'Criar processo seletivo'),
  ('recruitment.update', 'recruitment', 'Editar processo seletivo'),
  ('recruitment.delete', 'recruitment', 'Excluir processo seletivo'),
  ('recruitment.advance', 'recruitment', 'Avançar candidato para próxima etapa'),
  ('recruitment.reject', 'recruitment', 'Reprovar candidato'),
  ('recruitment.stage.manage', 'recruitment', 'Gerenciar etapas do processo'),

  -- Applications
  ('applications.advance', 'recruitment', 'Avançar status da candidatura'),
  ('applications.reject', 'recruitment', 'Rejeitar candidatura'),
  ('applications.history.read', 'recruitment', 'Consultar histórico de status da candidatura'),

  -- Talent Pool
  ('talent_pool.read', 'recruitment', 'Consultar banco de talentos'),
  ('talent_pool.manage', 'recruitment', 'Administrar talentos do banco'),
  ('talent_pool.match', 'recruitment', 'Executar matching candidato-vaga'),

  -- Recruitment Demands
  ('recruitment_demands.read', 'recruitment', 'Consultar demandas de recrutamento'),
  ('recruitment_demands.create', 'recruitment', 'Abrir nova demanda de recrutamento'),
  ('recruitment_demands.update', 'recruitment', 'Editar demanda de recrutamento'),
  ('recruitment_demands.delete', 'recruitment', 'Excluir demanda de recrutamento')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 2. ROLE FALTANTE: finance_manager
-- =============================================================================
-- Observação: o seed atual tem apenas 'finance'.
-- O contrato exige 'finance_manager'.
-- Esta role terá zero permissions de recruitment por padrão.

INSERT INTO public.roles (name, is_global, description)
VALUES ('finance_manager', FALSE, 'Gerente Financeiro')
ON CONFLICT (is_global, name) DO NOTHING;

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
  AND p.name IN (
    -- Jobs
    'jobs.read',
    'jobs.create',
    'jobs.update',
    -- Candidates
    'candidates.read',
    'candidates.create',
    'candidates.update',
    'candidates.documents.read',
    'candidates.profile.read',
    -- Recruitment
    'recruitment.read',
    'recruitment.create',
    'recruitment.update',
    'recruitment.advance',
    'recruitment.reject',
    -- Applications
    'applications.read',
    'applications.update',
    'applications.advance',
    'applications.reject',
    'applications.history.read',
    -- Talent Pool
    'talent_pool.read',
    'talent_pool.match',
    -- Recruitment Demands
    'recruitment_demands.read'
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
  AND p.name IN (
    -- Jobs
    'jobs.read',
    'jobs.create',
    'jobs.update',
    'jobs.delete',
    'jobs.publish',
    'jobs.close',
    -- Candidates
    'candidates.read',
    'candidates.create',
    'candidates.update',
    'candidates.delete',
    'candidates.documents.read',
    'candidates.documents.manage',
    'candidates.profile.read',
    -- Recruitment
    'recruitment.read',
    'recruitment.create',
    'recruitment.update',
    'recruitment.delete',
    'recruitment.advance',
    'recruitment.reject',
    'recruitment.stage.manage',
    -- Applications
    'applications.read',
    'applications.update',
    'applications.advance',
    'applications.reject',
    'applications.history.read',
    -- Talent Pool
    'talent_pool.read',
    'talent_pool.manage',
    'talent_pool.match',
    -- Recruitment Demands
    'recruitment_demands.read',
    'recruitment_demands.create',
    'recruitment_demands.update',
    'recruitment_demands.delete'
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
  AND p.module = 'recruitment'
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
-- 9. VALIDAÇÃO: assertions pós-seed
-- =============================================================================
-- Não altera dados, apenas valida que o seed foi aplicado corretamente.

DO $$
BEGIN
  -- Validar que as 21 permissions novas existem
  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE name IN (
      'jobs.close',
      'candidates.delete',
      'candidates.documents.read',
      'candidates.documents.manage',
      'candidates.profile.read',
      'recruitment.read',
      'recruitment.create',
      'recruitment.update',
      'recruitment.delete',
      'recruitment.advance',
      'recruitment.reject',
      'recruitment.stage.manage',
      'applications.advance',
      'applications.reject',
      'applications.history.read',
      'talent_pool.read',
      'talent_pool.manage',
      'talent_pool.match',
      'recruitment_demands.read',
      'recruitment_demands.create',
      'recruitment_demands.update',
      'recruitment_demands.delete'
    )
  ) >= 21, 'Nem todas as permissions de recruitment foram criadas';

  -- Validar que finance_manager existe
  ASSERT (
    SELECT count(*) FROM public.roles
    WHERE name = 'finance_manager' AND is_global = FALSE
  ) >= 1, 'Role finance_manager não foi criada';

  -- Validar que recruiter tem pelo menos 20 permissions de recruitment
  ASSERT (
    SELECT count(*) FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.name = 'recruiter'
  ) >= 20, 'Recruiter não tem permissions suficientes';

  -- Validar que rh_manager tem todas as permissions de recruitment
  ASSERT (
    SELECT count(*) FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE r.name = 'rh_manager'
      AND p.module = 'recruitment'
  ) >= 30, 'RH Manager não tem todas as permissions de recruitment';

  -- Validar que applications.approve ainda existe (legacy)
  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE name = 'applications.approve'
  ) >= 1, 'applications.approve foi removido (não deveria ser removido)';
END $$;

-- =============================================================================
-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE public.roles IS 'Roles canônicos V2.1: admin_master (global), tenant roles scoped por is_global=false. finance_manager adicionado em migration 048.';
COMMENT ON TABLE public.permissions IS 'Permissions canônicas V2.1 no formato resource.action. Domínios: core, recruitment, finance, platform. 47 permissions totais após migration 048.';
COMMENT ON TABLE public.role_permissions IS 'Mapeamento roles ↔ permissions. admin_master bypassa via código, mas também tem todas as permissions no banco.';

-- =============================================================================
-- 11. MARCAÇÃO DE AUDITORIA
-- =============================================================================
-- Esta migration é idempotente e não destrutiva.
-- Pode ser reexecutada com segurança em qualquer ambiente.
-- Referência: docs/V21-RBAC-RECRUITMENT-CONTRACT.md
--             docs/V21-RBAC-RECRUITMENT-AUDIT.md

COMMIT;
