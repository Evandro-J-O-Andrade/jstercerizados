-- =============================================================================
-- GATE-DATA-04.010 — RBAC: Permissions & Role Assignment Fixes
-- =============================================================================
-- Purpose:
--   - Add missing permissions referenced in the frontend App.tsx
--   - Rename role 'candidate' → 'candidato' to match frontend expectations
--   - Assign missing permissions to appropriate roles
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add missing permissions
-- -----------------------------------------------------------------------------

INSERT INTO permissions (code, resource, action, description, created_at, updated_at)
VALUES
  ('employees.read', 'employees', 'read', 'Visualizar funcionários', now(), now()),
  ('employees.create', 'employees', 'create', 'Criar funcionários', now(), now()),
  ('employees.update', 'employees', 'update', 'Atualizar funcionários', now(), now()),
  ('employees.delete', 'employees', 'delete', 'Remover funcionários', now(), now()),
  ('sessions.read', 'sessions', 'read', 'Ler sessões de usuário', now(), now()),
  ('stock.dashboard.read', 'stock.dashboard', 'read', 'Acessar dashboard de estoque', now(), now()),
  ('warehouse.dashboard.read', 'warehouse.dashboard', 'read', 'Acessar dashboard de almoxarifado', now(), now()),
  ('service_orders.dashboard.read', 'service_orders.dashboard', 'read', 'Acessar dashboard de ordens de serviço', now(), now()),
  ('support.dashboard.read', 'support.dashboard', 'read', 'Acessar dashboard de suporte', now(), now())
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Rename role 'candidate' → 'candidato' to match frontend RoleName type
-- -----------------------------------------------------------------------------

UPDATE roles
SET name = 'candidato'
WHERE name = 'candidate';

-- -----------------------------------------------------------------------------
-- 3. Assign missing permissions to roles
-- -----------------------------------------------------------------------------

-- rh_manager: employees + sessions
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'rh_manager'
  AND p.code IN ('employees.read', 'sessions.read')
ON CONFLICT DO NOTHING;

-- tenant_admin: all missing permissions
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'tenant_admin'
  AND p.code IN ('employees.read', 'sessions.read', 'stock.dashboard.read', 'warehouse.dashboard.read', 'service_orders.dashboard.read', 'support.dashboard.read')
ON CONFLICT DO NOTHING;

-- stock_manager: stock + warehouse dashboard
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'stock_manager'
  AND p.code IN ('stock.dashboard.read', 'warehouse.dashboard.read')
ON CONFLICT DO NOTHING;

-- support: support dashboard
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'support'
  AND p.code = 'support.dashboard.read'
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. Grant execute on bootstrap_candidate_identity (already in 047, verify)
-- -----------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(uuid, text, text, text, uuid, uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_candidate_identity(uuid, text, text, text, uuid, uuid)
  TO service_role;
