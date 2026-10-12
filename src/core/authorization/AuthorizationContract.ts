/**
 * AuthorizationContract — decides access based on effective permissions.
 * Default is DENY. No implicit grants. No client-side bypass.
 */

import type { Permission, Role, RolePermission } from '../types';

export interface AuthorizationDecision {
  granted: boolean;
  resource: string;
  action: string;
  reason?: string;
  scope: 'global' | 'tenant';
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

    const perm = permissionRecords.find((p) => {
      const code = `${p.resource}.${p.action}`;
      return code === rp.permission_id;
    });

    if (perm) {
      const exists = effective.some(
        (e) => e.resource === perm.resource && e.action === perm.action,
      );
      if (!exists) {
        effective.push({
          resource: perm.resource,
          action: perm.action,
          granted: true,
          scope: role.scope,
        });
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
  resource: string,
  action: string,
): AuthorizationDecision {
  const perm = effectivePermissions.find(
    (p) => p.resource === resource && p.action === action,
  );

  if (perm && perm.granted) {
    return {
      granted: true,
      resource,
      action,
      scope: perm.scope,
    };
  }

  return {
    granted: false,
    resource,
    action,
    reason: `Permission ${resource}.${action} not granted`,
    scope: 'tenant',
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

  return requiredPermissions.some((req) => {
    const [resource, action] = req.split('.');
    const decision = decidePermission(effectivePermissions, resource, action);
    return decision.granted;
  });
}

/**
 * Checks if ALL required permissions are granted.
 */
export function hasAllPermissions(
  effectivePermissions: Permission[],
  requiredPermissions: string[],
): boolean {
  if (requiredPermissions.length === 0) return true;

  return requiredPermissions.every((req) => {
    const [resource, action] = req.split('.');
    const decision = decidePermission(effectivePermissions, resource, action);
    return decision.granted;
  });
}