-- =============================================================================
-- VALIDATION SCRIPT — Candidate Bootstrap Flow (V2.1)
-- =============================================================================
-- Purpose:
--   - Inspect current state WITHOUT modifying data
--   - Validate role, RPC signature, tenant, and post-registration chain
--   - Detect duplicates or integrity issues
--
-- Usage:
--   1. Run BEFORE migration to capture baseline
--   2. Apply migration: 20260830000001_candidate_role.sql
--   3. Run AFTER migration to confirm changes
--   4. Register a test candidate in the app
--   5. Run POST-REGISTRATION section to validate the full chain
-- =============================================================================

-- =============================================================================
-- 0. SAFETY CHECK — ensure we are in a test/homologation environment
-- =============================================================================

DO $$
BEGIN
  IF current_database() = 'production' OR current_database() ILIKE '%prod%' THEN
    RAISE EXCEPTION 'ABORT: This script must NOT run in production. Current DB: %', current_database();
  END IF;
END $$;

-- =============================================================================
-- 1. BASELINE — Current tenant and roles
-- =============================================================================

-- 1.1 Tenants
SELECT 'BASELINE' AS phase, 'tenants' AS entity, count(*) AS total
FROM public.tenants;

SELECT 'BASELINE' AS phase, 'tenant_js_empregos' AS entity, id, name, slug, status
FROM public.tenants
WHERE slug = 'js-empregos';

-- 1.2 Roles (before migration — should NOT have 'candidato' yet)
SELECT 'BASELINE' AS phase, 'roles' AS entity, count(*) AS total
FROM public.roles;

SELECT 'BASELINE' AS phase, 'role_candidato_exists' AS entity,
  CASE WHEN EXISTS (SELECT 1 FROM public.roles WHERE name = 'candidato') THEN 'YES' ELSE 'NO' END AS exists
FROM dual;

-- =============================================================================
-- 2. RPC INSPECTION — bootstrap_candidate_identity
-- =============================================================================

-- 2.1 Function exists?
SELECT 'RPC' AS phase, 'function_exists' AS entity,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'bootstrap_candidate_identity'
  ) THEN 'YES' ELSE 'NO' END AS exists;

-- 2.2 Function signature and return type
SELECT 'RPC' AS phase, 'function_signature' AS entity,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'bootstrap_candidate_identity';

-- 2.3 Function source code (for diff comparison)
SELECT 'RPC' AS phase, 'function_source' AS entity,
  pg_get_functiondef(p.oid) AS source
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'bootstrap_candidate_identity';

-- =============================================================================
-- 3. GRANTS ON THE RPC
-- =============================================================================

SELECT 'RPC' AS phase, 'grants' AS entity,
  grantee, privilege_type, is_grantable
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'bootstrap_candidate_identity';

-- =============================================================================
-- 4. PRE-REGISTRATION DATA SNAPSHOT
-- =============================================================================

-- Capture current state to compare after registration
SELECT 'PRE_REG' AS phase, 'people_count' AS entity, count(*) AS total FROM public.people;
SELECT 'PRE_REG' AS phase, 'tenant_memberships_count' AS entity, count(*) AS total FROM public.tenant_memberships;
SELECT 'PRE_REG' AS phase, 'role_assignments_count' AS entity, count(*) AS total FROM public.role_assignments;
SELECT 'PRE_REG' AS phase, 'candidates_count' AS entity, count(*) AS total FROM public.candidates;
SELECT 'PRE_REG' AS phase, 'first_login_state_count' AS entity, count(*) AS total FROM public.first_login_state;

-- =============================================================================
-- 5. POST-REGISTRATION VALIDATION
-- =============================================================================
-- Replace 'TEST_USER_EMAIL' with the actual email used for registration

\set test_email 'candidate_test_placeholder'

-- 5.1 auth.users
SELECT 'POST_REG' AS phase, 'auth_users' AS entity, id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = :'test_email';

-- 5.2 people
SELECT 'POST_REG' AS phase, 'people' AS entity,
  p.id, p.auth_user_id, p.full_name, p.email, p.phone, p.status, p.created_at
FROM public.people p
WHERE p.email = :'test_email'
   OR p.auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email');

-- 5.3 tenant_memberships — MUST link to js-empregos
SELECT 'POST_REG' AS phase, 'tenant_memberships' AS entity,
  tm.id, tm.person_id, tm.tenant_id, t.slug, t.name, tm.status, tm.joined_at
FROM public.tenant_memberships tm
JOIN public.tenants t ON t.id = tm.tenant_id
WHERE tm.person_id IN (
  SELECT id FROM public.people WHERE email = :'test_email'
     OR auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
);

-- 5.4 role_assignments — MUST link to role 'candidato'
SELECT 'POST_REG' AS phase, 'role_assignments' AS entity,
  ra.id, ra.person_id, ra.role_id, r.name AS role_name, r.is_global,
  ra.tenant_id, t.slug, ra.assigned_at
FROM public.role_assignments ra
JOIN public.roles r ON r.id = ra.role_id
LEFT JOIN public.tenants t ON t.id = ra.tenant_id
WHERE ra.person_id IN (
  SELECT id FROM public.people WHERE email = :'test_email'
     OR auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
);

-- 5.5 candidates — MUST exist
SELECT 'POST_REG' AS phase, 'candidates' AS entity,
  c.id, c.person_id, c.tenant_id, t.slug, c.status, c.created_at
FROM public.candidates c
JOIN public.tenants t ON t.id = c.tenant_id
WHERE c.person_id IN (
  SELECT id FROM public.people WHERE email = :'test_email'
     OR auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
);

-- 5.6 first_login_state — MUST exist
SELECT 'POST_REG' AS phase, 'first_login_state' AS entity,
  fls.person_id, fls.must_change_password, fls.first_login_completed, fls.created_at
FROM public.first_login_state fls
WHERE fls.person_id IN (
  SELECT id FROM public.people WHERE email = :'test_email'
     OR auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
);

-- =============================================================================
-- 6. INTEGRITY CHECKS
-- =============================================================================

-- 6.1 All test records should have exactly one tenant_membership
SELECT 'INTEGRITY' AS phase, 'tenant_memberships_single' AS entity,
  p.id AS person_id, p.email, count(tm.id) AS membership_count
FROM public.people p
LEFT JOIN public.tenant_memberships tm ON tm.person_id = p.id
WHERE p.email = :'test_email'
   OR p.auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
GROUP BY p.id, p.email
HAVING count(tm.id) > 1;

-- 6.2 All test records should have exactly one role_assignment
SELECT 'INTEGRITY' AS phase, 'role_assignments_single' AS entity,
  p.id AS person_id, p.email, count(ra.id) AS assignment_count
FROM public.people p
LEFT JOIN public.role_assignments ra ON ra.person_id = p.id
WHERE p.email = :'test_email'
   OR p.auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
GROUP BY p.id, p.email
HAVING count(ra.id) > 1;

-- 6.3 All test records should have exactly one candidate record per tenant
SELECT 'INTEGRITY' AS phase, 'candidates_single_per_tenant' AS entity,
  p.id AS person_id, p.email, c.tenant_id, t.slug, count(c.id) AS candidate_count
FROM public.people p
LEFT JOIN public.candidates c ON c.person_id = p.id
LEFT JOIN public.tenants t ON t.id = c.tenant_id
WHERE p.email = :'test_email'
   OR p.auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
GROUP BY p.id, p.email, c.tenant_id, t.slug
HAVING count(c.id) > 1;

-- 6.4 Role assignment role must exist in roles table
SELECT 'INTEGRITY' AS phase, 'role_assignment_role_exists' AS entity,
  ra.id, ra.role_id, r.name AS role_name,
  CASE WHEN r.id IS NULL THEN 'ORPHAN' ELSE 'OK' END AS status
FROM public.role_assignments ra
WHERE ra.person_id IN (
  SELECT id FROM public.people WHERE email = :'test_email'
     OR auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
)
  AND ra.role_id NOT IN (SELECT id FROM public.roles);

-- 6.5 Tenant membership tenant must exist in tenants table
SELECT 'INTEGRITY' AS phase, 'tenant_membership_tenant_exists' AS entity,
  tm.id, tm.tenant_id, t.slug,
  CASE WHEN t.id IS NULL THEN 'ORPHAN' ELSE 'OK' END AS status
FROM public.tenant_memberships tm
WHERE tm.person_id IN (
  SELECT id FROM public.people WHERE email = :'test_email'
     OR auth_user_id IN (SELECT id FROM auth.users WHERE email = :'test_email')
)
  AND tm.tenant_id NOT IN (SELECT id FROM public.tenants);

-- =============================================================================
-- 7. DUPLICATE DETECTION (GLOBAL)
-- =============================================================================

-- 7.1 Duplicate people by auth_user_id
SELECT 'DUPES' AS phase, 'people_by_auth_user' AS entity,
  auth_user_id, count(*) AS duplicates
FROM public.people
GROUP BY auth_user_id
HAVING count(*) > 1;

-- 7.2 Duplicate tenant_memberships by (person_id, tenant_id)
SELECT 'DUPES' AS phase, 'tenant_memberships_by_person_tenant' AS entity,
  person_id, tenant_id, count(*) AS duplicates
FROM public.tenant_memberships
GROUP BY person_id, tenant_id
HAVING count(*) > 1;

-- 7.3 Duplicate role_assignments by (person_id, role_id, tenant_id)
SELECT 'DUPES' AS phase, 'role_assignments_by_person_role_tenant' AS entity,
  person_id, role_id, tenant_id, count(*) AS duplicates
FROM public.role_assignments
GROUP BY person_id, role_id, tenant_id
HAVING count(*) > 1;

-- 7.4 Duplicate candidates by (person_id, tenant_id)
SELECT 'DUPES' AS phase, 'candidates_by_person_tenant' AS entity,
  person_id, tenant_id, count(*) AS duplicates
FROM public.candidates
GROUP BY person_id, tenant_id
HAVING count(*) > 1;

-- =============================================================================
-- 8. RBAC VALIDATION — does the candidate role have expected permissions?
-- =============================================================================

-- 8.1 Permissions assigned to 'candidato' role
SELECT 'RBAC' AS phase, 'candidate_permissions' AS entity,
  r.name AS role_name,
  p.name AS permission_name,
  p.module
FROM public.role_permissions rp
JOIN public.roles r ON r.id = rp.role_id
JOIN public.permissions p ON p.id = rp.permission_id
WHERE r.name = 'candidato';

-- 8.2 Count of permissions for 'candidato' role
SELECT 'RBAC' AS phase, 'candidate_permission_count' AS entity,
  r.name AS role_name, count(rp.permission_id) AS permission_count
FROM public.roles r
LEFT JOIN public.role_permissions rp ON rp.role_id = r.id
WHERE r.name = 'candidato'
GROUP BY r.name;

-- =============================================================================
-- 9. CLEANUP (OPTIONAL — only if duplicates found)
-- =============================================================================
-- Uncomment and review carefully if duplicates are detected
-- THIS SECTION IS COMMENTED OUT BY DEFAULT FOR SAFETY

/*
DELETE FROM public.role_assignments
WHERE id IN (
  SELECT id FROM public.role_assignments ra1
  WHERE ra1.person_id IN (
    SELECT id FROM public.people WHERE email = :'test_email'
  )
  AND EXISTS (
    SELECT 1 FROM public.role_assignments ra2
    WHERE ra2.person_id = ra1.person_id
      AND ra2.role_id = ra1.role_id
      AND ra2.tenant_id = ra1.tenant_id
      AND ra2.id < ra1.id
  )
);

DELETE FROM public.tenant_memberships
WHERE id IN (
  SELECT id FROM public.tenant_memberships tm1
  WHERE tm1.person_id IN (
    SELECT id FROM public.people WHERE email = :'test_email'
  )
  AND EXISTS (
    SELECT 1 FROM public.tenant_memberships tm2
    WHERE tm2.person_id = tm1.person_id
      AND tm2.tenant_id = tm1.tenant_id
      AND tm2.id < tm1.id
  )
);
*/

-- =============================================================================
-- 10. SUMMARY
-- =============================================================================

SELECT 'SUMMARY' AS phase, 'validation_complete' AS entity,
  'Check results above. All POST_REG rows should be present, INTEGRITY should show no rows, DUPES should show no rows.' AS note;
