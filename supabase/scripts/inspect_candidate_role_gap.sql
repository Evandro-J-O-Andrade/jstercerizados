-- =============================================================================
-- INSPECTION SCRIPT — Candidate Role Assignment Gap
-- =============================================================================
-- Purpose:
--   - Inspect current state WITHOUT modifying data
--   - Verify if role 'candidato' exists
--   - Identify candidates without role_assignments
--   - Check tenant_memberships for existing candidate
-- =============================================================================

-- 1. Check if role 'candidato' exists
SELECT 
  'ROLE' AS check_type,
  id,
  name,
  scope,
  description
FROM public.roles
WHERE name = 'candidato';

-- 2. Count candidates without role_assignments
SELECT 
  'CANDIDATES_WITHOUT_ROLE' AS check_type,
  count(*) AS total
FROM public.candidates c
LEFT JOIN public.role_assignments ra ON ra.person_id = c.person_id
WHERE ra.id IS NULL;

-- 3. List candidates without role_assignments (with tenant info)
SELECT 
  'CANDIDATES_WITHOUT_ROLE' AS check_type,
  c.id AS candidate_id,
  c.person_id,
  p.full_name,
  p.email,
  c.tenant_id,
  t.slug AS tenant_slug,
  t.name AS tenant_name
FROM public.candidates c
JOIN public.people p ON p.id = c.person_id
JOIN public.tenants t ON t.id = c.tenant_id
LEFT JOIN public.role_assignments ra ON ra.person_id = c.person_id
WHERE ra.id IS NULL;

-- 4. Check tenant_memberships for the existing candidate
-- (replace with actual person_id if known)
SELECT 
  'TENANT_MEMBERSHIPS' AS check_type,
  tm.id,
  tm.person_id,
  p.full_name,
  p.email,
  tm.tenant_id,
  t.slug,
  tm.status,
  tm.joined_at
FROM public.tenant_memberships tm
JOIN public.people p ON p.id = tm.person_id
JOIN public.tenants t ON t.id = tm.tenant_id
WHERE p.email = 'darkangelyas.yash@gmail.com'
   OR p.auth_user_id = '4918ef14-...';  -- replace with actual auth user id

-- 5. Check existing role_assignments for this person
SELECT 
  'ROLE_ASSIGNMENTS' AS check_type,
  ra.id,
  ra.person_id,
  p.full_name,
  p.email,
  ra.role_id,
  r.name AS role_name,
  r.scope,
  ra.tenant_id,
  t.slug AS tenant_slug,
  ra.assigned_at
FROM public.role_assignments ra
JOIN public.people p ON p.id = ra.person_id
LEFT JOIN public.roles r ON r.id = ra.role_id
LEFT JOIN public.tenants t ON t.id = ra.tenant_id
WHERE p.email = 'darkangelyas.yash@gmail.com'
   OR p.auth_user_id = '4918ef14-...';  -- replace with actual auth user id

-- 6. Verify role_assignments table structure
SELECT 
  'ROLE_ASSIGNMENTS_SCHEMA' AS check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'role_assignments'
ORDER BY ordinal_position;

-- 7. Verify roles table structure
SELECT 
  'ROLES_SCHEMA' AS check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'roles'
ORDER BY ordinal_position;
