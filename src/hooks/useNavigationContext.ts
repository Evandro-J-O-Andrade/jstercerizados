import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import type { RoleName } from '@/types/auth';

export interface NavItem {
  label: string;
  href: string;
  permission?: string;
  permissions?: string[];
  mode?: 'any' | 'all';
  roles?: RoleName[];
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavigationContextValue {
  isAuthenticated: boolean;
  primaryRole: RoleName | null;
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissionKeys: string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
  isAdminMaster: boolean;
  availableModules: {
    id: string;
    title: string;
    route: string;
    requiredPermissions?: string[];
  }[];
}

export function useNavigationContext(): NavigationContextValue {
  const {
    isAuthenticated,
    roles,
    isAdminMaster,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuth();

  const { availableModules } = useAccount();

  const primaryRole = useMemo(() => {
    if (!roles.length) return null;
    return roles[0].name as RoleName;
  }, [roles]);

  return {
    isAuthenticated,
    primaryRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdminMaster,
    availableModules: availableModules.map((m) => ({
      id: m.id,
      title: m.title,
      route: m.route,
      requiredPermissions: m.requiredPermissions,
    })),
  };
}
