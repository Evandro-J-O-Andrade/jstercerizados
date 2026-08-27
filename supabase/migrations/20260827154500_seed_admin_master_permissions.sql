-- Migration: auto-link all existing permissions to admin_master
-- This ensures admin_master automatically gets access to every permission
-- without requiring manual role_permissions inserts for each new domain.

-- First, ensure the admin_master role exists (idempotent)
INSERT INTO public.roles (id, name, is_global, description)
SELECT '68c5ae35-219d-41ad-bfef-68c46c91cdc5', 'admin_master', TRUE, 'Administrador global do sistema'
WHERE NOT EXISTS (
  SELECT 1 FROM public.roles WHERE id = '68c5ae35-219d-41ad-bfef-68c46c91cdc5'
);

-- Auto-link every existing permission to admin_master
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin_master'
  AND r.is_global = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
  );
