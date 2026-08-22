-- Migration: RBAC Canonical Roles V2.1
-- Data: 2026-08-22
-- Descrição: Mapeia 18 roles canônicos a partir das 63 permissions existentes
-- Preserva role_assignments existentes via mapeamento de compatibilidade

BEGIN;

-- ============================================
-- 1. CRIAR 14 ROLES CANÔNICOS FALTANTES
-- ============================================

INSERT INTO public.roles (id, name, description, scope, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'tenant_admin', 'Administrador do tenant', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'rh_manager', 'Gerente de Recursos Humanos', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000003', 'recruiter', 'Recrutador', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000004', 'finance_manager', 'Gerente Financeiro', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000005', 'finance', 'Analista Financeiro', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000006', 'support', 'Suporte', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000007', 'commercial', 'Comercial', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000008', 'operations_manager', 'Gerente de Operações', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000009', 'stock_manager', 'Gerente de Estoque', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000010', 'security_manager', 'Gerente de Segurança', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000011', 'facilities_manager', 'Gerente de Facilities', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000012', 'lawyer', 'Jurídico', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000013', 'it_admin', 'Administrador de TI', 'tenant', now(), now()),
  ('10000000-0000-0000-0000-000000000014', 'viewer', 'Visualizador', 'tenant', now(), now());

-- ============================================
-- 2. PERMISSIONS POR ROLE CANÔNICO
-- ============================================

-- admin_master já tem todas as 63 permissions, não mexer
-- admin_tenant já tem 62 permissions, não mexer

-- manager -> operations_manager + stock_manager + tasks_manager (subset)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000008', p.id FROM public.permissions p
WHERE p.name IN (
  'companies.read', 'companies.update',
  'contracts.read', 'contracts.update',
  'dashboard.read',
  'documents.read', 'documents.create',
  'files.read',
  'people.read', 'people.update',
  'products.read', 'products.update',
  'purchase_orders.read', 'purchase_orders.update',
  'purchase_receipts.read', 'purchase_receipts.update',
  'reports.read',
  'service_orders.read', 'service_orders.update',
  'stock_movements.read', 'stock_movements.create',
  'support_tickets.read', 'support_tickets.update',
  'tasks.read', 'tasks.update'
);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000009', p.id FROM public.permissions p
WHERE p.name IN (
  'products.read', 'products.update',
  'stock_movements.read', 'stock_movements.create',
  'purchase_orders.read', 'purchase_orders.create',
  'purchase_receipts.read', 'purchase_receipts.create',
  'dashboard.read'
);

-- operator -> tasks_operator + service_orders_operator + support_operator
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000005', p.id FROM public.permissions p
WHERE p.name IN (
  'companies.read',
  'contracts.read',
  'documents.read', 'documents.create',
  'files.read',
  'people.read',
  'products.read',
  'purchase_orders.read', 'purchase_orders.create',
  'purchase_receipts.read', 'purchase_receipts.create',
  'service_orders.read', 'service_orders.create',
  'stock_movements.read', 'stock_movements.create',
  'support_tickets.read', 'support_tickets.create',
  'tasks.read', 'tasks.create'
);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000006', p.id FROM public.permissions p
WHERE p.name IN (
  'support_tickets.read', 'support_tickets.create', 'support_tickets.update',
  'chat.read', 'chat.create'
);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000007', p.id FROM public.permissions p
WHERE p.name IN (
  'companies.read', 'companies.update',
  'contracts.read', 'contracts.create',
  'documents.read', 'documents.create',
  'files.read',
  'people.read',
  'purchase_orders.read', 'purchase_orders.create',
  'purchase_receipts.read', 'purchase_receipts.create',
  'service_orders.read', 'service_orders.create',
  'support_tickets.read', 'support_tickets.create',
  'tasks.read', 'tasks.create',
  'dashboard.read'
);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000010', p.id FROM public.permissions p
WHERE p.name IN (
  'security_events.read',
  'people.read', 'people.update',
  'documents.read', 'documents.create'
);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000011', p.id FROM public.permissions p
WHERE p.name IN (
  'service_orders.read', 'service_orders.create', 'service_orders.update', 'service_orders.complete',
  'documents.read', 'documents.create',
  'files.read',
  'tasks.read', 'tasks.create', 'tasks.update', 'tasks.assign'
);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000012', p.id FROM public.permissions p
WHERE p.name IN (
  'contracts.read', 'contracts.update', 'contracts.create',
  'documents.read', 'documents.create', 'documents.version',
  'files.read',
  'people.read'
);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000013', p.id FROM public.permissions p
WHERE p.name IN (
  'roles.read', 'roles.create', 'roles.update',
  'people.read', 'people.create', 'people.update',
  'documents.read', 'documents.create',
  'files.read', 'files.upload'
);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000014', p.id FROM public.permissions p
WHERE p.name IN (
  'dashboard.read',
  'companies.read',
  'contracts.read',
  'documents.read',
  'files.read',
  'people.read',
  'products.read',
  'purchase_orders.read',
  'purchase_receipts.read',
  'reports.read',
  'service_orders.read',
  'stock_movements.read',
  'support_tickets.read',
  'tasks.read'
);

-- ============================================
-- 3. COMPATIBILIDADE: role_assignments existentes
-- ============================================

-- admin_tenant -> tenant_admin (renomeia role existente)
UPDATE public.roles SET name = 'tenant_admin' WHERE name = 'admin_tenant';

-- manager -> operations_manager (mapeia para o role canônico mais próximo)
UPDATE public.role_assignments
SET role_id = '10000000-0000-0000-0000-000000000008'
WHERE role_id = (SELECT id FROM public.roles WHERE name = 'manager');

-- operator -> operator (já existe, só garante)
UPDATE public.roles SET description = 'Operador' WHERE name = 'operator';

COMMIT;
