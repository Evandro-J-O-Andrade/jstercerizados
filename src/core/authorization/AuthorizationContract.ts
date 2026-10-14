/**
 * AuthorizationContract — decides access based on effective permissions.
 * Default is DENY. No implicit grants. No client-side bypass.
 */

import type { Permission, Role, RolePermission } from '../types';

export interface AuthorizationDecision {
  granted: boolean;
  permissionName: string;
  reason?: string;
  isGlobal: boolean;
}

/**
 * Computes effective permissions from the role chain.
 * roles → role_permissions → permissions
 *
 * A permission is only effective if:
 * - The role is assigned to the person in the current tenant context
 * - The permission record exists
 * - The role_permission row exists (existence = grant)
 *
 * NOTE: The real schema for role_permissions does NOT have a `granted` column.
 * A row in role_permissions means the permission IS granted.
 * See: public.role_permissions(id, role_id, permission_id, created_at)
 *
 * admin_master is NOT special-cased: it receives only the permissions
 * explicitly listed in role_permissions for that role.
 * Permissao real > nome da role (see docs/V21-RBAC-MATRIX.md:135).
 *
 * @param _isAdminMaster Kept for API compatibility. Not used — authorization
 *   is derived exclusively from role_permissions, never from role name.
 */
export function computeEffectivePermissions(
  roles: Role[],
  rolePermissions: RolePermission[],
  permissionRecords: Permission[],
  _isAdminMaster: boolean = false,
): Permission[] {
  const effective: Permission[] = [];

  // In the real schema, role_permissions has NO `granted` column.
  // The mere existence of a row IS the grant.
  // We do NOT filter on rp.granted — that field does not exist in the DB.
  const grantedRps = rolePermissions;

  for (const rp of grantedRps) {
    const role = roles.find((r) => r.id === rp.role_id);
    if (!role) continue;

    const perm = permissionRecords.find((p) => p.id === rp.permission_id);

    if (perm) {
      const exists = effective.some((e) => e.id === perm.id);
      if (!exists) {
        effective.push(perm);
      }
    }
  }

  return effective;
}

/**
 * Decides if a specific permission is granted.
 * Default: denied.
 */
export function decidePermission(
  effectivePermissions: Permission[],
  permissionName: string,
  roles: Role[] = [],
  rolePermissions: RolePermission[] = [],
  permissionRecords: Permission[] = [],
): AuthorizationDecision {
  const perm = effectivePermissions.find((p) => p.name === permissionName);

  if (perm) {
    // Find which role granted this permission to determine scope
    let isGlobal = false;
    const rp = rolePermissions.find((rp) => {
      const p = permissionRecords.find((p) => p.id === rp.permission_id);
      return p?.name === permissionName;
    });
    if (rp) {
      const role = roles.find((r) => r.id === rp.role_id);
      if (role) isGlobal = role.is_global;
    }

    return {
      granted: true,
      permissionName,
      isGlobal,
    };
  }

  return {
    granted: false,
    permissionName,
    reason: `Permission ${permissionName} not granted`,
    isGlobal: false,
  };
}

/**
 * Checks if any of the required permissions are granted.
 * Used for route-level access (any permission = access).
 */
export function hasAnyPermission(
  effectivePermissions: Permission[],
  requiredPermissions: string[],
): boolean {
  if (requiredPermissions.length === 0) return true;

  return requiredPermissions.some((req) =>
    effectivePermissions.some((p) => p.name === req),
  );
}

/**
 * Checks if ALL required permissions are granted.
 */
export function hasAllPermissions(
  effectivePermissions: Permission[],
  requiredPermissions: string[],
): boolean {
  if (requiredPermissions.length === 0) return true;

  return requiredPermissions.every((req) =>
    effectivePermissions.some((p) => p.name === req),
  );
}

/**
 * Gets the scope (global/tenant) of a specific permission based on the role that granted it.
 */
export function getPermissionScope(
  permissionName: string,
  roles: Role[],
  rolePermissions: RolePermission[],
  permissionRecords: Permission[],
): 'global' | 'tenant' | null {
  const rp = rolePermissions.find((rp) => {
    const perm = permissionRecords.find((p) => p.id === rp.permission_id);
    return perm?.name === permissionName;
  });

  if (!rp) return null;

  const role = roles.find((r) => r.id === rp.role_id);
  return role?.is_global ? 'global' : 'tenant';
}

// Re-export types for convenience
export type { Permission, Role, RolePermission } from '../types';
