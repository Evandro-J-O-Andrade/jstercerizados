/**

- STAGE 2 DIFF — AuthContext Tenant Isolation
-
- This diff prepares the changes for tenant isolation in AuthContext.
- DO NOT APPLY YET — requires explicit authorization.
-
- Changes:
- 1.  Filter role_assignments by active tenant + global roles with valid expires_at
- 2.  Separate global vs tenant role IDs before loading roles/permissions
- 3.  Ensure switchTenant properly invalidates and recalculates
      */

// ============================================================
// FILE: src/contexts/AuthContext.tsx
// ============================================================

// --- SECTION 1: role_assignments query (lines 188-212) ---
// CURRENT:
/*
const { data: roleAssignmentData, error: roleAssignmentError } =
await supabase
.from('role_assignments')
.select('*')
.eq('person_id', personData.id);

const roleIds = Array.from(
new Set(
(roleAssignmentData || [])
.map((ra: RoleAssignment) => ra.role_id)
.filter(Boolean),
),
);
*/

// PROPOSED:
/*
const currentTenantIdForQuery = currentTenantId; // from state or parameter

// Fetch all role_assignments for this person, then filter in memory
// (Could optimize with .or() filter but in-memory is clearer for audit)
const { data: roleAssignmentData, error: roleAssignmentError } =
await supabase
.from('role_assignments')
.select('*')
.eq('person_id', personData.id);

const now = new Date().toISOString();

// Filter: valid global assignments (tenant_id IS NULL, role.is_global=true, not expired)
// + valid tenant assignments for current tenant (tenant_id = currentTenantId, not expired)
const validAssignments = (roleAssignmentData || []).filter((ra: RoleAssignment) => {
// Check expiration
if (ra.expires_at && ra.expires_at < now) {
return false; // expired
}
// Global role assignment
if (ra.tenant_id === null) {
// Will validate role.is_global=true when roles are loaded
return true;
}
// Tenant-scoped assignment
if (ra.tenant_id === currentTenantIdForQuery) {
return true;
}
// Assignment for another tenant — EXCLUDE
return false;
});

const roleIds = Array.from(
new Set(
validAssignments
.map((ra: RoleAssignment) => ra.role_id)
.filter(Boolean),
),
);
*/

// --- SECTION 2: roles loading (lines 216-228) ---
// CURRENT:
/*
const { data: rolesData } = await supabase
.from('roles')
.select('*')
.in('id', roleIds);
*/

// PROPOSED: Same query, but we'll separate global vs tenant roles after loading
/*
const { data: rolesData } = await supabase
.from('roles')
.select('*')
.in('id', roleIds);

// Separate global and tenant roles for clarity
const globalRoles = (rolesData || []).filter((r: Role) => r.is_global === true);
const tenantRoles = (rolesData || []).filter((r: Role) => r.is_global === false);

// Validate global role assignments: only keep those where role.is_global=true
const globalRoleIds = new Set(globalRoles.map((r) => r.id));
const validGlobalAssignments = validAssignments.filter(
(ra) => ra.tenant_id === null && globalRoleIds.has(ra.role_id)
);

// Validate tenant role assignments: only keep those where role.is_global=false
// and assignment.tenant_id = currentTenantId
const tenantRoleIds = new Set(tenantRoles.map((r) => r.id));
const validTenantAssignments = validAssignments.filter(
(ra) => ra.tenant_id === currentTenantIdForQuery && tenantRoleIds.has(ra.role_id)
);

// Combine validated role IDs
const validatedRoleIds = Array.from(
new Set([
...validGlobalAssignments.map((ra) => ra.role_id),
...validTenantAssignments.map((ra) => ra.role_id),
]).filter(Boolean),
);

// Re-filter rolesData to only validated roles
const validatedRoles = (rolesData || []).filter((r) => validatedRoleIds.includes(r.id));
*/

// --- SECTION 3: permissions loading (lines 263-287) ---
// CURRENT: Uses roleIds (all roles from assignments)
// PROPOSED: Uses validatedRoleIds (only validated global + current tenant)

/*
let permissionsData: Permission[] = [];
if (validatedRoleIds.length > 0) {
const { data: rolePerms } = await supabase
.from('role_permissions')
.select('permission_id')
.in('role_id', validatedRoleIds);

const permissionIds = Array.from(
new Set(
(rolePerms || [])
.map((rp: { permission_id: string }) => rp.permission_id)
.filter(Boolean),
),
);

if (permissionIds.length > 0) {
const { data: perms } = await supabase
.from('permissions')
.select('*')
.in('id', permissionIds);

    const normalizedPermissions = (perms || []).map(normalizePermission).filter((p): p is Permission => p !== null);
    permissionsData = normalizedPermissions;

}
}
*/

// --- SECTION 4: adminMaster / isCandidate / isEmpresa flags ---
// CURRENT: Uses rolesData (all loaded roles)
// PROPOSED: Uses validatedRoles (only validated)

/*
const adminMaster = validatedRoles.some(
(r: Role) => r.is_global === true && r.name === 'admin_master',
);

let isCandidate = validatedRoles.some(
(r: Role) => r.name === 'candidato',
);

const isEmpresa = validatedRoles.some(
(r: Role) => r.name === 'company_representative',
);
*/

// --- SECTION 5: switchTenant (lines 1084-1123) ---
// CURRENT: Validates membership, sets currentTenantId, calls loadAuthData
// PROPOSED: Add explicit cache invalidation and error handling

/*
const switchTenant = useCallback(
async (tenantId: string | null) => {
if (!user) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Validate target tenant membership if switching to a tenant
    if (tenantId !== null) {
      const { data: targetMembership, error: membershipError } =
        await supabase
          .from('tenant_memberships')
          .select('*')
          .eq('person_id', person?.id || '')
          .eq('tenant_id', tenantId)
          .eq('status', 'active')
          .maybeSingle();

      if (membershipError) {
        console.error('[AUTH:switchTenant] membership check failed', membershipError);
        throw new Error('Não foi possível validar a tenant de destino.');
      }

      if (!targetMembership) {
        console.error('[AUTH:switchTenant] no active membership for target tenant');
        throw new Error('Você não possui acesso ativo a este tenant. Solicite acesso ao administrador.');
      }
    }

    // CRITICAL: Clear permissions/roles BEFORE loading new ones
    // Prevents stale permissions during async load
    setPermissions([]);
    setRoles([]);
    setRoleAssignments([]);
    setIsAdminMaster(false);
    setIsCandidate(false);
    setIsEmpresa(false);

    setCurrentTenantId(tenantId);

    try {
      await loadAuthData(user.id);
    } catch (error) {
      // On failure, ensure we don't leave partial state
      setPermissions([]);
      setRoles([]);
      setRoleAssignments([]);
      setIsAdminMaster(false);
      setIsCandidate(false);
      setIsEmpresa(false);
      throw error;
    }

},
[user, person, loadAuthData],
);
*/

// ============================================================
// FILE: src/contexts/AccountContext.tsx (review only)
// ============================================================
// switchAccount calls handleSwitchAccount which calls switchTenant
// The current flow: switchAccount -> handleSwitchAccount -> switchTenant -> loadAuthData
// This should correctly recalculate permissions. Verify:
// 1. handleSwitchAccount doesn't cache old permissions
// 2. Error during switch doesn't leave stale permissions
// 3. Loading state during switch prevents UI flicker with old perms

// ============================================================
// TEST SCENARIOS (for validation after apply)
// ============================================================
/*
TEST 1: Cross-tenant isolation

- User has role "finance_manager" (tenant-scoped) in Tenant A
- User has role "recruiter" (tenant-scoped) in Tenant B
- User has role "viewer" (global) in both
- Login → select Tenant A → permissions = viewer + finance_manager
- switchAccount(Tenant B) → permissions = viewer + recruiter
- ASSERT: finance_manager permissions NOT present in Tenant B context

TEST 2: Global role persistence

- User has role "admin_master" (global, is_global=true)
- Login → any tenant → adminMaster = true, all global permissions present
- switchAccount(any) → adminMaster = true, global permissions persist

TEST 3: Expired assignment

- User has role_assignment with expires_at = yesterday
- Login → role should be excluded, no permissions from that role

TEST 4: Assignment for other tenant excluded

- User has role_assignment for Tenant C (not current)
- Login with currentTenantId = Tenant A → Tenant C assignment excluded

TEST 5: Switch failure rollback

- switchAccount(Tenant B) → network error during loadAuthData
- ASSERT: permissions/roles cleared, no stale privileged state
  */

// ============================================================
// RUNTIME BEHAVIOR NOTES
// ============================================================
/*

- RLS: The view public_services_v1 has security_invoker=false (fixed in prod).
  This diff does NOT change RLS. The role_assignments query runs as the
  authenticated user (anon/authenticated) — verify RLS on role_assignments
  allows reading own assignments.

- role_assignments RLS: Should have policy allowing person to read their own
  assignments (person_id = auth.uid() or similar). If not, query returns empty.

- Expires_at: Stored as timestamptz. Comparison uses ISO string which works
  for timestamptz in Postgres.

- Performance: In-memory filter on role_assignments is acceptable (typically
  <20 assignments per person). If scale requires, can push to DB with .or().

- Race condition: switchTenant clears state BEFORE loadAuthData. If loadAuthData
  fails, state stays cleared (safe). If loadAuthData succeeds, new state applied.
  No window where stale permissions are exposed.
  */
