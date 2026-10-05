-- =============================================================================
-- P3-A.1 — Media Permissions Seed (idempotent, reduced scope, actual schema)
-- Date: 2026-10-04
-- Empresa: J&S Empregos LTDA
-- Escopo: Permissões de mídia para CMS P3 (empresas, serviços, parceiros, fornecedores)
-- Ordem: 90 (após RBAC financeiro/fiscal)
-- Dependencies: 007_rbac, 048_rbac_recruitment_seed, 051_rbac_finance_fiscal_accounting
-- =============================================================================
-- Propósito:
--   Fechar o contrato RBAC de mídia para upload/remoção de assets no CMS P3.
--   Apenas 4 recursos necessários agora × 3 ações = 12 permissões.
--   Schema real: permissions(code, resource, action, description)
--   Roles reais: admin_master, tenant_admin, rh_manager, recruiter, finance, finance_manager, viewer, support_agent
-- =============================================================================
-- Regras:
--   - Tudo idempotente: ON CONFLICT DO NOTHING
--   - Não executar operações destrutivas
--   - Não remover permissions existentes
--   - Seguir exatamente o schema: permissions(code, resource, action, description)
--   - Conceder apenas a roles que EXISTEM no banco
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. PERMISSIONS — Mídia (CMS P3) — 12 PERMISSÕES
-- =============================================================================
-- Padrão code: {resource}.media.{action}
-- resource: companies.media, services.media, partners.media, suppliers.media
-- action: read, write, delete

INSERT INTO public.permissions (code, resource, action, description) VALUES
  -- Companies (empresas, clientes)
  ('companies.media.read',   'companies.media', 'read',   'Visualizar mídia de empresas'),
  ('companies.media.write',  'companies.media', 'write',  'Upload/atualizar mídia de empresas'),
  ('companies.media.delete', 'companies.media', 'delete', 'Remover mídia de empresas'),

  -- Services (serviços)
  ('services.media.read',   'services.media', 'read',   'Visualizar mídia de serviços'),
  ('services.media.write',  'services.media', 'write',  'Upload/atualizar mídia de serviços'),
  ('services.media.delete', 'services.media', 'delete', 'Remover mídia de serviços'),

  -- Partners (parceiros)
  ('partners.media.read',   'partners.media', 'read',   'Visualizar mídia de parceiros'),
  ('partners.media.write',  'partners.media', 'write',  'Upload/atualizar mídia de parceiros'),
  ('partners.media.delete', 'partners.media', 'delete', 'Remover mídia de parceiros'),

  -- Suppliers (fornecedores)
  ('suppliers.media.read',   'suppliers.media', 'read',   'Visualizar mídia de fornecedores'),
  ('suppliers.media.write',  'suppliers.media', 'write',  'Upload/atualizar mídia de fornecedores'),
  ('suppliers.media.delete', 'suppliers.media', 'delete', 'Remover mídia de fornecedores')

ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 2. ROLE_PERMISSIONS — Admin Master (global)
-- =============================================================================
-- Bypass total. Garantir que tenha todas as permissions de mídia existentes.

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin_master'
  AND r.scope = 'global'
  AND p.resource LIKE '%.media'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 3. ROLE_PERMISSIONS — Tenant Admin
-- =============================================================================
-- Acesso total a mídia dentro do tenant (4 recursos P3).

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'tenant_admin'
  AND r.scope = 'tenant'
  AND p.resource LIKE '%.media'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 4. OUTRAS ROLES EXISTENTES — NÃO RECEBEM PERMISSÕES DE MÍDIA NESTA MIGRATION
-- =============================================================================
-- rh_manager, recruiter, finance, finance_manager, viewer, support_agent, etc.
-- receberão permissões de mídia APENAS quando houver CRUD real que as exija.
-- Princípio: menor privilégio, expansão sob demanda.

-- =============================================================================
-- 5. VALIDAÇÃO: assertions pós-seed
-- =============================================================================

DO $$
BEGIN
  -- Validar que as 12 permissions de mídia existem
  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE resource LIKE '%.media'
  ) >= 12, 'Nem todas as 12 permissions de mídia foram criadas';

  -- Validar que admin_master tem todas as 12 permissions de mídia
  ASSERT (
    SELECT count(*) FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE r.name = 'admin_master'
      AND r.scope = 'global'
      AND p.resource LIKE '%.media'
  ) = 12, 'admin_master não tem todas as 12 permissions de mídia';

  -- Validar que tenant_admin tem todas as 12 permissions de mídia
  ASSERT (
    SELECT count(*) FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE r.name = 'tenant_admin'
      AND r.scope = 'tenant'
      AND p.resource LIKE '%.media'
  ) = 12, 'tenant_admin não tem todas as 12 permissions de mídia';

  -- Validar que NÃO existem permissions de jobs/blog_post/pages
  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE resource IN ('jobs.media', 'blog_post.media', 'pages.media')
  ) = 0, 'Permissions de jobs/blog_post/pages não deveriam existir neste momento';

  -- Validar que NÃO houve grant para roles não autorizadas nesta migration
  -- (rh_manager, recruiter, finance, finance_manager, viewer, support_agent, etc.)
  ASSERT (
    SELECT count(*) FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE r.name NOT IN ('admin_master', 'tenant_admin')
      AND p.resource LIKE '%.media'
  ) = 0, 'Roles não autorizadas receberam permissions de mídia';

END $$;

-- =============================================================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE public.permissions IS
  'Permissions canônicas: core, recruitment, finance, fiscal, accounting, media, platform. 12 media permissions (P3-A.1: companies/services/partners/suppliers × read/write/delete). jobs/blog_post/pages diferidos.';

-- =============================================================================
-- 7. MARCAÇÃO DE AUDITORIA
-- =============================================================================
-- Esta migration é idempotente e não destrutiva.
-- Pode ser reexecutada com segurança em qualquer ambiente.
-- Referência: P3-A.1 Media Permissions (reduced scope, actual roles)

COMMIT;