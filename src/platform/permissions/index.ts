export { PermissionGuard } from '@/components/auth/PermissionGuard';
export { ProtectedRoute } from '@/components/auth/ProtectedRoute';
export { AuthRoute } from '@/components/auth/AuthRoute';
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/utils/rbac';
export type { Permission } from '@/types/auth';

import { useAuth } from '@/contexts/AuthContext';

export function usePermissionCheck() {
  const { permissions, isLoading } = useAuth();

  const checkPermission = (permissionKey: string): boolean => {
    if (!permissionKey) return true;
    return permissions.some(
      (p) => `${p.resource}.${p.action}` === permissionKey,
    );
  };

  const checkPermissions = (
    permissionKeys: string[],
    mode: 'any' | 'all' = 'any',
  ): boolean => {
    if (!permissionKeys || permissionKeys.length === 0) return true;
    if (mode === 'all') {
      return permissionKeys.every((key) => checkPermission(key));
    }
    return permissionKeys.some((key) => checkPermission(key));
  };

  return {
    permissions,
    isLoading,
    checkPermission,
    checkPermissions,
    hasPermission: checkPermission,
    hasAnyPermission: (keys: string[]) => checkPermissions(keys, 'any'),
    hasAllPermissions: (keys: string[]) => checkPermissions(keys, 'all'),
  };
}
