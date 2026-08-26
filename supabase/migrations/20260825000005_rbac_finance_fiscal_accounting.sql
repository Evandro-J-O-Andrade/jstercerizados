-- =============================================================================
-- V2.2 — RBAC Finance / Fiscal / Accounting Seed (idempotent)
-- Data: 2026-08-25
-- Empresa: J&S Empregos LTDA
-- Escopo: Domínios Financeiro, Fiscal e Contabilidade
-- Ordem: 51
-- Dependencies: 007_rbac, 048_rbac_recruitment_seed
-- =============================================================================
-- Propósito:
--   Fechar o contrato RBAC dos domínios financeiro/fiscal/contábil no banco,
--   adicionando permissões granulares, roles especializadas e vínculos.
-- =============================================================================
-- Regras:
--   - Tudo idempotente: ON CONFLICT DO NOTHING
--   - Não executar operações destrutivas
--   - Não remover permissions existentes
--   - Seguir exatamente o schema local: permissions(name, module, description)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. PERMISSIONS — Financeiro
-- =============================================================================

INSERT INTO public.permissions (name, module, description) VALUES
  -- Dashboard
  ('finance.dashboard.read', 'finance', 'Visualizar dashboard financeiro'),

  -- Contas a receber
  ('finance.accounts_receivable.read', 'finance', 'Visualizar contas a receber'),
  ('finance.accounts_receivable.create', 'finance', 'Criar contas a receber'),
  ('finance.accounts_receivable.update', 'finance', 'Atualizar contas a receber'),
  ('finance.accounts_receivable.delete', 'finance', 'Excluir contas a receber'),

  -- Contas a pagar
  ('finance.accounts_payable.read', 'finance', 'Visualizar contas a pagar'),
  ('finance.accounts_payable.create', 'finance', 'Criar contas a pagar'),
  ('finance.accounts_payable.update', 'finance', 'Atualizar contas a pagar'),
  ('finance.accounts_payable.delete', 'finance', 'Excluir contas a pagar'),

  -- Fluxo de caixa
  ('finance.cashflow.read', 'finance', 'Visualizar fluxo de caixa'),

  -- Faturamento
  ('finance.billing.read', 'finance', 'Visualizar faturamento'),
  ('finance.billing.create', 'finance', 'Criar faturamento'),
  ('finance.billing.update', 'finance', 'Atualizar faturamento'),
  ('finance.billing.cancel', 'finance', 'Cancelar faturamento'),

  -- Cobranças
  ('finance.collections.read', 'finance', 'Visualizar cobranças'),
  ('finance.collections.manage', 'finance', 'Gerenciar cobranças'),

  -- Clientes / Fornecedores
  ('finance.customers.read', 'finance', 'Visualizar clientes financeiros'),
  ('finance.suppliers.read', 'finance', 'Visualizar fornecedores financeiros'),

  -- Relatórios
  ('finance.reports.read', 'finance', 'Visualizar relatórios financeiros'),
  ('finance.reports.export', 'finance', 'Exportar relatórios financeiros')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 2. PERMISSIONS — Fiscal
-- =============================================================================

INSERT INTO public.permissions (name, module, description) VALUES
  -- Dashboard fiscal
  ('fiscal.dashboard.read', 'fiscal', 'Visualizar dashboard fiscal'),

  -- Notas fiscais
  ('fiscal.invoices.read', 'fiscal', 'Visualizar notas fiscais'),
  ('fiscal.invoices.issue', 'fiscal', 'Emitir nota fiscal'),
  ('fiscal.invoices.cancel', 'fiscal', 'Cancelar nota fiscal'),
  ('fiscal.invoices.void', 'fiscal', 'Inutilizar nota fiscal'),

  -- Documentos fiscais
  ('fiscal.documents.read', 'fiscal', 'Visualizar documentos fiscais'),

  -- Tributos
  ('fiscal.taxes.read', 'fiscal', 'Visualizar tributos'),

  -- Relatórios fiscais
  ('fiscal.reports.read', 'fiscal', 'Visualizar relatórios fiscais'),
  ('fiscal.reports.export', 'fiscal', 'Exportar relatórios fiscais')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 3. PERMISSIONS — Contabilidade
-- =============================================================================

INSERT INTO public.permissions (name, module, description) VALUES
  -- Dashboard contábil
  ('accounting.dashboard.read', 'accounting', 'Visualizar dashboard contábil'),

  -- Plano de contas
  ('accounting.chart_of_accounts.read', 'accounting', 'Visualizar plano de contas'),
  ('accounting.chart_of_accounts.create', 'accounting', 'Criar plano de contas'),
  ('accounting.chart_of_accounts.update', 'accounting', 'Atualizar plano de contas'),
  ('accounting.chart_of_accounts.delete', 'accounting', 'Excluir plano de contas'),

  -- Lançamentos
  ('accounting.entries.read', 'accounting', 'Visualizar lançamentos'),
  ('accounting.entries.create', 'accounting', 'Criar lançamentos'),
  ('accounting.entries.update', 'accounting', 'Atualizar lançamentos'),
  ('accounting.entries.delete', 'accounting', 'Excluir lançamentos'),

  -- Conciliação
  ('accounting.reconciliation.read', 'accounting', 'Visualizar conciliação'),
  ('accounting.reconciliation.manage', 'accounting', 'Gerenciar conciliação'),

  -- Balancetes / DRE / Balanço
  ('accounting.trial_balance.read', 'accounting', 'Visualizar balancetes'),
  ('accounting.income_statement.read', 'accounting', 'Visualizar DRE'),
  ('accounting.balance_sheet.read', 'accounting', 'Visualizar balanço patrimonial'),

  -- Relatórios contábeis
  ('accounting.reports.read', 'accounting', 'Visualizar relatórios contábeis'),
  ('accounting.reports.export', 'accounting', 'Exportar relatórios contábeis')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 4. ROLES — Especializadas
-- =============================================================================

INSERT INTO public.roles (name, is_global, description) VALUES
  ('finance_manager', FALSE, 'Gerente Financeiro'),
  ('accountant', FALSE, 'Contador'),
  ('fiscal', FALSE, 'Fiscal')
ON CONFLICT (is_global, name) DO NOTHING;

-- =============================================================================
-- 5. ROLE_PERMISSIONS — Financeiro (finance_manager + finance)
-- =============================================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'finance_manager'
  AND p.module = 'finance'
  AND p.name NOT LIKE 'finance.billing.%'
  AND p.name NOT LIKE 'finance.collections.%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'finance_manager'
  AND p.module = 'finance'
  AND (
    p.name LIKE 'finance.billing.%'
    OR p.name LIKE 'finance.collections.%'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'finance'
  AND p.module = 'finance'
  AND (
    p.name LIKE 'finance.billing.%'
    OR p.name LIKE 'finance.collections.%'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 6. ROLE_PERMISSIONS — Fiscal
-- =============================================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'fiscal'
  AND p.module = 'fiscal'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 7. ROLE_PERMISSIONS — Contabilidade
-- =============================================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'accountant'
  AND p.module = 'accounting'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 8. ROLE_PERMISSIONS — Admin Master (all new permissions)
-- =============================================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  r.id AS role_id,
  p.id AS permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin_master'
  AND p.module IN ('finance', 'fiscal', 'accounting')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 9. VALIDAÇÃO
-- =============================================================================

DO $$
BEGIN
  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE module = 'finance'
  ) >= 20, 'Permissões de financeiro insuficientes';

  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE module = 'fiscal'
  ) >= 8, 'Permissões de fiscal insuficientes';

  ASSERT (
    SELECT count(*) FROM public.permissions
    WHERE module = 'accounting'
  ) >= 16, 'Permissões de contabilidade insuficientes';

  ASSERT (
    SELECT count(*) FROM public.roles
    WHERE name IN ('finance_manager', 'fiscal', 'accountant')
  ) >= 3, 'Roles especializadas não foram criadas';

  ASSERT (
    SELECT count(*) FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.name = 'finance_manager'
  ) >= 15, 'finance_manager não tem permissões suficientes';

  ASSERT (
    SELECT count(*) FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.name = 'fiscal'
  ) >= 8, 'fiscal não tem permissões suficientes';

  ASSERT (
    SELECT count(*) FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.name = 'accountant'
  ) >= 16, 'accountant não tem permissões suficientes';
END $$;

-- =============================================================================
-- 10. DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE public.roles IS 'Roles canônicos V2.2: admin_master (global), finance_manager, fiscal, accountant (tenant).';
COMMENT ON TABLE public.permissions IS 'Permissions canônicas V2.2 no formato resource.action. Domínios: core, recruitment, finance, fiscal, accounting, platform.';
COMMENT ON TABLE public.role_permissions IS 'Mapeamento roles ↔ permissions. finance_manager, fiscal e accountant adicionados em migration 051.';

COMMIT;
