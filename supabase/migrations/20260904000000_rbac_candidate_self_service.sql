-- =============================================================================
-- GATE-DATA-04.011 — RBAC: Candidate Self-Service Permissions
-- =============================================================================
-- Purpose:
--   - Grant self-service permissions to the 'candidato' role
--   - Ensure the 'candidato' role exists
--   - Separate candidate experience from backoffice admin modules
--
-- IMPORTANT: This migration uses the REAL database schema:
--   - roles: scope (not is_global)
--   - permissions: code, resource, action (not name/module)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ensure 'candidato' role exists
-- -----------------------------------------------------------------------------

INSERT INTO public.roles (name, scope, description)
VALUES ('candidato', 'tenant', 'Candidato a vagas — acesso only ao portal do candidato')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Self-service permissions for candidates
-- -----------------------------------------------------------------------------

INSERT INTO public.permissions (code, resource, action, description)
VALUES
  ('candidates.self.read', 'candidates', 'self.read', 'Visualizar próprio perfil de candidato'),
  ('candidates.self.update', 'candidates', 'self.update', 'Atualizar próprio perfil de candidato'),
  ('jobs.read', 'jobs', 'read', 'Visualizar vagas públicas'),
  ('applications.read', 'applications', 'read', 'Visualizar próprias candidaturas'),
  ('applications.create', 'applications', 'create', 'Candidatar-se a vagas'),
  ('applications.update', 'applications', 'update', 'Atualizar próprias candidaturas'),
  ('candidate_documents.read', 'candidate_documents', 'read', 'Visualizar próprios documentos'),
  ('candidate_documents.create', 'candidate_documents', 'create', 'Enviar currículo e documentos'),
  ('candidate_documents.update', 'candidate_documents', 'update', 'Atualizar próprios documentos'),
  ('candidate_profile.read', 'candidate_profile', 'read', 'Visualizar próprio perfil profissional'),
  ('candidate_profile.update', 'candidate_profile', 'update', 'Atualizar próprio perfil profissional'),
  ('notifications.read', 'notifications', 'read', 'Visualizar notificações do processo seletivo'),
  ('account.read', 'account', 'read', 'Visualizar configurações da própria conta'),
  ('account.update', 'account', 'update', 'Atualizar configurações da própria conta')
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Grant self-service permissions to 'candidato' role
-- -----------------------------------------------------------------------------

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'candidato'
  AND p.code IN (
    'candidates.self.read',
    'candidates.self.update',
    'jobs.read',
    'applications.read',
    'applications.create',
    'applications.update',
    'candidate_documents.read',
    'candidate_documents.create',
    'candidate_documents.update',
    'candidate_profile.read',
    'candidate_profile.update',
    'notifications.read',
    'account.read',
    'account.update'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. Ensure candidate role has NO backoffice permissions
-- -----------------------------------------------------------------------------
-- Remove any accidentally granted admin permissions from 'candidato'
-- (defensive cleanup — should be empty by design)

DELETE FROM public.role_permissions
WHERE role_id = (SELECT id FROM public.roles WHERE name = 'candidato' AND scope = 'tenant')
  AND permission_id IN (
    SELECT id FROM public.permissions
    WHERE code NOT IN (
      'candidates.self.read',
      'candidates.self.update',
      'jobs.read',
      'applications.read',
      'applications.create',
      'applications.update',
      'candidate_documents.read',
      'candidate_documents.create',
      'candidate_documents.update',
      'candidate_profile.read',
      'candidate_profile.update',
      'notifications.read',
      'account.read',
      'account.update'
    )
  );
