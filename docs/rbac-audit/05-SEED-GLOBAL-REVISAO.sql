-- =============================================================================
-- SEED GLOBAL COMPLETO — RBAC (REVISÃO APENAS — NÃO APLICAR NO REMOTO)
-- =============================================================================
-- Data: 2026-10-30
-- Empresa: J&S Empregos LTDA
-- Objetivo: Popular papéis, permissões, vínculos role_permissions e role_assignments
--           para todos os domínios, de forma idempotente e rastreável.
--
-- RESTRITÇÕES DO PROJETO:
--   - Não aplicar no Supabase remoto sem aprovação explícita.
--   - Não alterar dados reais.
--   - Não excluir papéis, permissões ou atribuições existentes.
--   - Idempotente (ON CONFLICT DO NOTHING).
--   - Não definir proprietário por e-mail, nome ou UUID fixo.
--   - Não transformar usuário de teste em administrador ou proprietário.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. VERIFICAÇÃO: garantir que o tenant J&S Empregos LTDA existe
-- -----------------------------------------------------------------------------

INSERT INTO public.tenants (name, slug, status)
VALUES ('J&S Empregos LTDA', 'js-empregos', 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status;

-- -----------------------------------------------------------------------------
-- 1. PAPÉIS (garantir existência, sem sobrescrever descrições existentes reais)
-- -----------------------------------------------------------------------------

-- admin_master (já deve existir — garantir campos)
UPDATE public.roles
SET description = COALESCE(description, 'Administrador global do sistema (ROOT)'),
    scope = 'global',
    status = 'active',
    slug = 'admin_master',
    level = 0,
    sector = 'system'
WHERE name = 'admin_master';

-- owner
INSERT INTO public.roles (name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES ('owner', 'Proprietário do tenant — autoridade máxima interna, sem autoridade global', 'tenant', 'active', 'owner', 1, 'tenant', now(), now())
ON CONFLICT (name) DO UPDATE SET
  description = COALESCE(public.roles.description, EXCLUDED.description),
  scope = EXCLUDED.scope,
  status = EXCLUDED.status,
  slug = EXCLUDED.slug,
  level = EXCLUDED.level,
  sector = EXCLUDED.sector;

-- tenant_admin (pode já existir via renomeação de admin_tenant)
UPDATE public.roles
SET description = COALESCE(description, 'Administrador delegado do tenant'),
    scope = 'tenant',
    status = 'active',
    slug = 'tenant_admin',
    level = 1,
    sector = 'tenant'
WHERE name = 'tenant_admin';

-- gestor
INSERT INTO public.roles (name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES ('gestor', 'Gestor operacional — supervisiona equipes e operações autorizadas', 'tenant', 'active', 'gestor', 3, 'operations', now(), now())
ON CONFLICT (name) DO UPDATE SET
  description = COALESCE(public.roles.description, EXCLUDED.description),
  scope = EXCLUDED.scope,
  status = EXCLUDED.status,
  slug = EXCLUDED.slug,
  level = EXCLUDED.level,
  sector = EXCLUDED.sector;

-- recrutador_master
INSERT INTO public.roles (name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES ('recrutador_master', 'Líder da célula de recrutamento dentro do escopo autorizado', 'tenant', 'active', 'recrutador_master', 2, 'recruitment', now(), now())
ON CONFLICT (name) DO UPDATE SET
  description = COALESCE(public.roles.description, EXCLUDED.description),
  scope = EXCLUDED.scope,
  status = EXCLUDED.status,
  slug = EXCLUDED.slug,
  level = EXCLUDED.level,
  sector = EXCLUDED.sector;

-- recrutador (pode já existir como 'recruiter' — manter ambos, não renomear)
INSERT INTO public.roles (name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES ('recrutador', 'Execução de atividades de recrutamento', 'tenant', 'active', 'recrutador', 5, 'recruitment', now(), now())
ON CONFLICT (name) DO UPDATE SET
  description = COALESCE(public.roles.description, EXCLUDED.description),
  scope = EXCLUDED.scope,
  status = EXCLUDED.status,
  slug = EXCLUDED.slug,
  level = EXCLUDED.level,
  sector = EXCLUDED.sector;

-- funcionario
INSERT INTO public.roles (name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES ('funcionario', 'Colaborador com acesso operacional conforme atribuições', 'tenant', 'active', 'funcionario', 6, 'operations', now(), now())
ON CONFLICT (name) DO UPDATE SET
  description = COALESCE(public.roles.description, EXCLUDED.description),
  scope = EXCLUDED.scope,
  status = EXCLUDED.status,
  slug = EXCLUDED.slug,
  level = EXCLUDED.level,
  sector = EXCLUDED.sector;

-- candidato (já deve existir)
UPDATE public.roles
SET description = COALESCE(description, 'Candidato — acesso apenas aos próprios dados'),
    scope = 'tenant',
    status = 'active',
    slug = 'candidato',
    level = 7,
    sector = 'special'
WHERE name = 'candidato';

-- Domínios especializados (pares _master / operação)
INSERT INTO public.roles (name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('financeiro_master', 'Liderança do domínio financeiro dentro do escopo autorizado', 'tenant', 'active', 'financeiro_master', 2, 'finance', now(), now()),
  ('financeiro', 'Execução das operações financeiras permitidas', 'tenant', 'active', 'financeiro', 5, 'finance', now(), now()),
  ('rh_master', 'Liderança do domínio de RH dentro do escopo autorizado', 'tenant', 'active', 'rh_master', 2, 'rh', now(), now()),
  ('rh', 'Profissional de RH — execução operacional', 'tenant', 'active', 'rh', 5, 'rh', now(), now()),
  ('comercial_master', 'Liderança do domínio comercial dentro do escopo autorizado', 'tenant', 'active', 'comercial_master', 2, 'commercial', now(), now()),
  ('comercial', 'Execução das operações comerciais permitidas', 'tenant', 'active', 'comercial', 5, 'commercial', now(), now()),
  ('operacao_master', 'Liderança do domínio de operações dentro do escopo autorizado', 'tenant', 'active', 'operacao_master', 2, 'operations', now(), now()),
  ('operacao', 'Execução das operações operacionais permitidas', 'tenant', 'active', 'operacao', 5, 'operations', now(), now()),
  ('suporte_master', 'Liderança do domínio de suporte dentro do escopo autorizado', 'tenant', 'active', 'suporte_master', 2, 'support', now(), now()),
  ('suporte_ti', 'Suporte técnico especializado', 'tenant', 'active', 'suporte_ti', 5, 'support', now(), now()),
  ('suporte', 'Atendimento e suporte ao usuário', 'tenant', 'active', 'suporte', 6, 'support', now(), now())
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. VÍNCULOS role_permissions POR PAPEL (aditivo, sem remover existentes)
--   Cada papel recebe apenas as permissões de seu domínio e escopo.
-- -----------------------------------------------------------------------------

-- admin_master: todas as permissões (ROOT explícito)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin_master'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- owner: todas as permissões de tenant (exceto platform-global: tenants.create/delete, roles.manage, etc.)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'owner'
  AND p.resource NOT IN ('tenants', 'roles', 'permissions', 'role_assignments', 'tenant_memberships', 'system', 'audit_logs')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- tenant_admin: subconjunto delegado do owner
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'tenant_admin'
  AND p.resource IN (
    'people', 'units', 'departments', 'teams', 'jobs', 'candidates',
    'candidates.documents', 'candidates.profile', 'recruitment', 'recruitment.stage',
    'applications', 'applications.history', 'talent_pool', 'recruitment_demands',
    'finance', 'employees', 'positions', 'companies', 'contracts',
    'operations', 'stock', 'support_tickets', 'dashboard'
  )
  AND p.action IN ('read', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- gestor: leitura/gestão de equipes, departamentos, unidades
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'gestor'
  AND p.resource IN ('units', 'departments', 'teams', 'people', 'jobs', 'candidates', 'recruitment', 'applications', 'dashboard')
  AND p.action IN ('read', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- recrutador_master: liderança de recrutamento (não financeiro, não RH admin, não global)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'recrutador_master'
  AND p.resource IN (
    'jobs', 'candidates', 'candidates.documents', 'candidates.profile',
    'recruitment', 'recruitment.stage', 'applications', 'applications.history',
    'talent_pool', 'recruitment_demands', 'dashboard'
  )
  AND p.action IN ('read', 'create', 'update', 'publish', 'close', 'advance', 'reject', 'manage', 'match', 'self.read', 'self.update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- recrutador: execução operacional (sem deletar, sem publicar/encerrar, sem gerenciar etapas)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'recrutador'
  AND p.resource IN (
    'jobs', 'candidates', 'candidates.documents', 'candidates.profile',
    'recruitment', 'applications', 'applications.history', 'talent_pool', 'recruitment_demands', 'dashboard'
  )
  AND p.action IN ('read', 'create', 'update', 'advance', 'reject', 'match', 'self.read', 'self.update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- funcionario: apenas leitura e operações próprias (sem escrever em dados de outros)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'funcionario'
  AND p.resource IN (
    'people', 'jobs', 'candidates', 'candidates.profile', 'applications',
    'candidates.documents', 'dashboard', 'support_tickets'
  )
  AND p.action IN ('read', 'self.read', 'self.update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- candidato: apenas self
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'candidato'
  AND p.action LIKE 'self.%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Domínios especializados: _master lidera, operação executa
-- financeiro_master
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'financeiro_master'
  AND p.resource LIKE 'finance.%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- financeiro: leitura e criação (sem reconciliação/exclusão)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'financeiro'
  AND p.resource LIKE 'finance.%'
  AND p.action IN ('read', 'create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- rh_master
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'rh_master'
  AND p.resource IN ('employees', 'departments', 'positions', 'dashboard')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- rh: leitura e criação limitada
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'rh'
  AND p.resource IN ('employees', 'departments', 'positions')
  AND p.action IN ('read', 'create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- comercial_master
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'comercial_master'
  AND p.resource IN ('companies', 'contracts', 'dashboard')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- comercial
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'comercial'
  AND p.resource IN ('companies', 'contracts')
  AND p.action IN ('read', 'create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- operacao_master
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'operacao_master'
  AND p.resource IN ('operations', 'stock', 'dashboard')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- operacao
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'operacao'
  AND p.resource IN ('operations', 'stock')
  AND p.action IN ('read', 'create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- suporte_master
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'suporte_master'
  AND p.resource IN ('support_tickets', 'dashboard')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- suporte_ti
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'suporte_ti'
  AND p.resource IN ('support_tickets')
  AND p.action IN ('read', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- suporte
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'suporte'
  AND p.resource IN ('support_tickets')
  AND p.action IN ('read', 'create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2.5. VÍNCULOS role_resource_permissions POR PAPEL (matriz canônica)
--   Mantém consistência com a tabela role_resource_permissions criada na
--   migração 20260816001200. Aditivo, idempotente, não remove linhas existentes.
-- -----------------------------------------------------------------------------

-- admin_master: todas as resources/actions da matriz canônica
INSERT INTO public.role_resource_permissions (role_id, resource, action)
SELECT r.id, res.resource, res.action
FROM public.roles r
CROSS JOIN (
  VALUES
    ('people','create'),('people','read'),('people','update'),('people','delete'),
    ('tenants','create'),('tenants','read'),('tenants','update'),('tenants','delete'),
    ('tenant_memberships','create'),('tenant_memberships','read'),('tenant_memberships','update'),('tenant_memberships','delete'),
    ('candidates','create'),('candidates','read'),('candidates','update'),('candidates','delete'),
    ('jobs','create'),('jobs','read'),('jobs','update'),('jobs','delete'),
    ('applications','create'),('applications','read'),('applications','update'),('applications','delete'),
    ('companies','create'),('companies','read'),('companies','update'),('companies','delete'),
    ('files','create'),('files','read'),('files','update'),('files','delete'),
    ('domain_events','read'),('domain_events','create'),
    ('notifications','read'),('notifications','create'),('notifications','update'),
    ('notification_deliveries','read'),('notification_deliveries','create'),('notification_deliveries','update'),
    ('talent_pool_memberships','create'),('talent_pool_memberships','read'),('talent_pool_memberships','update'),('talent_pool_memberships','delete'),
    ('candidate_preferences','read'),('candidate_preferences','update'),
    ('job_matches','read'),('job_matches','create'),('job_matches','update'),
    ('candidate_skills','create'),('candidate_skills','read'),('candidate_skills','update'),('candidate_skills','delete'),
    ('candidate_experiences','create'),('candidate_experiences','read'),('candidate_experiences','update'),('candidate_experiences','delete'),
    ('candidate_education','create'),('candidate_education','read'),('candidate_education','update'),('candidate_education','delete'),
    ('candidate_courses','create'),('candidate_courses','read'),('candidate_courses','update'),('candidate_courses','delete'),
    ('candidate_languages','create'),('candidate_languages','read'),('candidate_languages','update'),('candidate_languages','delete'),
    ('candidate_documents','create'),('candidate_documents','read'),('candidate_documents','update'),('candidate_documents','delete'),
    ('skills','read'),
    ('role_assignments','create'),('role_assignments','read'),('role_assignments','update'),('role_assignments','delete'),
    ('roles','read')
) AS res(resource, action)
WHERE r.name = 'admin_master'
ON CONFLICT (role_id, resource, action) DO NOTHING;

-- owner: todas exceto platform-global
INSERT INTO public.role_resource_permissions (role_id, resource, action)
SELECT r.id, res.resource, res.action
FROM public.roles r
CROSS JOIN (
  VALUES
    ('people','create'),('people','read'),('people','update'),('people','delete'),
    ('units','create'),('units','read'),('units','update'),('units','delete'),
    ('departments','create'),('departments','read'),('departments','update'),('departments','delete'),
    ('teams','create'),('teams','read'),('teams','update'),('teams','delete'),
    ('candidates','create'),('candidates','read'),('candidates','update'),('candidates','delete'),
    ('jobs','create'),('jobs','read'),('jobs','update'),('jobs','delete'),
    ('applications','create'),('applications','read'),('applications','update'),('applications','delete'),
    ('companies','create'),('companies','read'),('companies','update'),('companies','delete'),
    ('contracts','create'),('contracts','read'),('contracts','update'),('contracts','delete'),
    ('finance','read'),('finance','create'),
    ('employees','create'),('employees','read'),('employees','update'),('employees','delete'),
    ('positions','create'),('positions','read'),('positions','update'),('positions','delete'),
    ('operations','create'),('operations','read'),('operations','update'),('operations','delete'),
    ('stock','create'),('stock','read'),('stock','update'),('stock','delete'),
    ('support_tickets','create'),('support_tickets','read'),('support_tickets','update'),('support_tickets','resolve'),
    ('dashboard','read'),
    ('role_assignments','read'),('role_assignments','create'),('role_assignments','update'),
    ('tenant_memberships','read'),('tenant_memberships','create'),('tenant_memberships','update')
) AS res(resource, action)
WHERE r.name = 'owner'
ON CONFLICT (role_id, resource, action) DO NOTHING;

-- tenant_admin: subconjunto delegado
INSERT INTO public.role_resource_permissions (role_id, resource, action)
SELECT r.id, res.resource, res.action
FROM public.roles r
CROSS JOIN (
  VALUES
    ('people','read'),('people','create'),('people','update'),
    ('units','read'),('units','manage'),
    ('departments','read'),('departments','manage'),
    ('teams','read'),('teams','manage'),
    ('candidates','read'),('candidates','create'),('candidates','update'),('candidates','delete'),
    ('jobs','read'),('jobs','create'),('jobs','update'),('jobs','delete'),
    ('applications','read'),('applications','create'),('applications','update'),('applications','delete'),
    ('companies','read'),('companies','update'),
    ('contracts','read'),('contracts','create'),
    ('finance','read'),('finance','create'),
    ('employees','read'),('employees','create'),('employees','update'),
    ('positions','read'),
    ('operations','read'),('operations','create'),('operations','update'),
    ('stock','read'),('stock','create'),
    ('support_tickets','read'),('support_tickets','create'),('support_tickets','update'),
    ('dashboard','read')
) AS res(resource, action)
WHERE r.name = 'tenant_admin'
ON CONFLICT (role_id, resource, action) DO NOTHING;

-- recrutador_master: recrutamento completo dentro do escopo
INSERT INTO public.role_resource_permissions (role_id, resource, action)
SELECT r.id, res.resource, res.action
FROM public.roles r
CROSS JOIN (
  VALUES
    ('jobs','read'),('jobs','create'),('jobs','update'),('jobs','delete'),('jobs','publish'),('jobs','close'),
    ('candidates','read'),('candidates','create'),('candidates','update'),('candidates','delete'),
    ('candidate_documents','read'),('candidate_documents','manage'),
    ('recruitment','read'),('recruitment','create'),('recruitment','update'),('recruitment','delete'),
    ('recruitment','advance'),('recruitment','reject'),('recruitment.stage','manage'),
    ('applications','read'),('applications','create'),('applications','update'),('applications','delete'),('applications','advance'),('applications','reject'),
    ('talent_pool','read'),('talent_pool','manage'),('talent_pool','match'),
    ('recruitment_demands','read'),('recruitment_demands','create'),('recruitment_demands','update'),('recruitment_demands','delete'),
    ('dashboard','read')
) AS res(resource, action)
WHERE r.name = 'recrutador_master'
ON CONFLICT (role_id, resource, action) DO NOTHING;

-- recrutador: execução operacional
INSERT INTO public.role_resource_permissions (role_id, resource, action)
SELECT r.id, res.resource, res.action
FROM public.roles r
CROSS JOIN (
  VALUES
    ('jobs','read'),('jobs','create'),('jobs','update'),
    ('candidates','read'),('candidates','create'),('candidates','update'),
    ('candidate_documents','read'),
    ('recruitment','read'),('recruitment','create'),('recruitment','update'),
    ('recruitment','advance'),('recruitment','reject'),
    ('applications','read'),('applications','create'),('applications','update'),('applications','advance'),('applications','reject'),
    ('talent_pool','read'),('talent_pool','match'),
    ('recruitment_demands','read'),('recruitment_demands','create'),('recruitment_demands','update'),
    ('dashboard','read')
) AS res(resource, action)
WHERE r.name = 'recrutador'
ON CONFLICT (role_id, resource, action) DO NOTHING;

-- funcionario: leitura e operações próprias
INSERT INTO public.role_resource_permissions (role_id, resource, action)
SELECT r.id, res.resource, res.action
FROM public.roles r
CROSS JOIN (
  VALUES
    ('people','read'),('people','self.read'),('people','self.update'),
    ('jobs','read'),
    ('candidates','read'),('candidates','self.read'),('candidates','self.update'),
    ('candidate_documents','self.read'),('candidate_documents','self.upload'),
    ('applications','read'),('applications','self.read'),('applications','self.create'),
    ('dashboard','read'),
    ('support_tickets','read'),('support_tickets','create')
) AS res(resource, action)
WHERE r.name = 'funcionario'
ON CONFLICT (role_id, resource, action) DO NOTHING;

-- candidato: apenas self
INSERT INTO public.role_resource_permissions (role_id, resource, action)
SELECT r.id, res.resource, res.action
FROM public.roles r
CROSS JOIN (
  VALUES
    ('candidates','self.read'),('candidates','self.update'),
    ('candidate_documents','self.read'),('candidate_documents','self.upload'),
    ('applications','self.read'),('applications','self.create')
) AS res(resource, action)
WHERE r.name = 'candidato'
ON CONFLICT (role_id, resource, action) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. ROLE ASSIGNMENTS — NÃO CRIAR ATRIBUIÇÕES REAIS AQUI
--   As atribuições de usuários existentes devem ser auditadas individualmente
--   e aprovadas antes de qualquer alteração. Este seed NÃO toca em
--   role_assignments de usuários reais.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 4. VALIDAÇÃO (apenas leitura — não altera dados)
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  v_total_roles integer;
  v_total_permissions integer;
  v_total_role_permissions integer;
  v_admin_master_permissions integer;
  v_tenant_admin_permissions integer;
  v_recrutador_master_permissions integer;
  v_recrutador_permissions integer;
BEGIN
  SELECT COUNT(*) INTO v_total_roles FROM public.roles;
  SELECT COUNT(*) INTO v_total_permissions FROM public.permissions;
  SELECT COUNT(*) INTO v_total_role_permissions FROM public.role_permissions;

  SELECT COUNT(*) INTO v_admin_master_permissions
  FROM public.role_permissions rp
  JOIN public.roles r ON r.id = rp.role_id
  WHERE r.name = 'admin_master';

  SELECT COUNT(*) INTO v_tenant_admin_permissions
  FROM public.role_permissions rp
  JOIN public.roles r ON r.id = rp.role_id
  WHERE r.name = 'tenant_admin';

  SELECT COUNT(*) INTO v_recrutador_master_permissions
  FROM public.role_permissions rp
  JOIN public.roles r ON r.id = rp.role_id
  WHERE r.name = 'recrutador_master';

  SELECT COUNT(*) INTO v_recrutador_permissions
  FROM public.role_permissions rp
  JOIN public.roles r ON r.id = rp.role_id
  WHERE r.name = 'recrutador';

  RAISE NOTICE 'SEED RBAC REVISAO: roles=% | permissions=% | role_permissions=%', v_total_roles, v_total_permissions, v_total_role_permissions;
  RAISE NOTICE 'admin_master=% | tenant_admin=% | recrutador_master=% | recrutador=%',
    v_admin_master_permissions, v_tenant_admin_permissions, v_recrutador_master_permissions, v_recrutador_permissions;
END $$;

-- =============================================================================
-- FIM DO SEED EM REVISÃO. Nenhuma alteração foi aplicada a role_assignments
-- de usuários reais. Todas as mudanças são aditivas e idempotentes.
-- =============================================================================
