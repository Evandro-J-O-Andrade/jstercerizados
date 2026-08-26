import type { Permission } from '@/types/auth';
import { getPermissionKey, normalizePermissions } from './rbac-normalize';

export function hasPermission(
  permissions: Permission[],
  permissionKey: string,
): boolean {
  return permissions.some((p) => getPermissionKey(p) === permissionKey);
}

export function hasAnyPermission(
  permissions: Permission[],
  permissionKeys: string[],
): boolean {
  return permissionKeys.some((key) => hasPermission(permissions, key));
}

export function hasAllPermissions(
  permissions: Permission[],
  permissionKeys: string[],
): boolean {
  return permissionKeys.every((key) => hasPermission(permissions, key));
}

export { getPermissionKey, normalizePermissions };
