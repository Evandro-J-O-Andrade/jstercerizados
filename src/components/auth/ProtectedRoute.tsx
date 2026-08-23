import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeError } from '@/lib/error-normalizer';
import type { Role } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedPermissions?: string[];
  requireAdminMaster?: boolean;
  requireTenantAccess?: boolean;
  requireAnyRole?: boolean;
}

function hasRole(roles: Role[], roleName: string): boolean {
  return roles.some((r) => r.name === roleName);
}

function hasPermission(
  permissions: { name: string }[],
  permissionName: string,
): boolean {
  return permissions.some((p) => p.name === permissionName);
}

export function ProtectedRoute({
  children,
  allowedRoles,
  allowedPermissions,
  requireAdminMaster,
  requireTenantAccess,
  requireAnyRole,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    person,
    tenantMemberships,
    roles,
    permissions,
    isAdminMaster,
    authError,
  } = useAuth();
  const location = useLocation();

  const decision = (() => {
    if (isLoading) return 'loading';
    if (authError) return 'auth_error';
    if (!isAuthenticated || !person) return 'redirect_login';
    if (requireAdminMaster && !isAdminMaster)
      return 'redirect_dashboard_admin_required';
    if (requireTenantAccess && tenantMemberships.length === 0)
      return 'redirect_onboarding';
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some((role) => hasRole(roles, role));
      if (!hasAllowedRole)
        return `redirect_dashboard_role_denied:${isAdminMaster ? '/admin' : '/dashboard'}`;
    }
    if (allowedPermissions && allowedPermissions.length > 0) {
      const hasAllowedPermission = allowedPermissions.some((perm) =>
        hasPermission(permissions, perm),
      );
      if (!hasAllowedPermission)
        return `redirect_dashboard_permission_denied:${isAdminMaster ? '/admin' : '/dashboard'}`;
    }
    if (requireAnyRole && roles.length === 0)
      return 'redirect_dashboard_any_role_required';
    return 'allow';
  })();

  console.log('[AUTH:HANDOFF] ProtectedRoute decision', {
    isLoading,
    authenticated: isAuthenticated,
    hasPerson: !!person,
    membershipCount: tenantMemberships.length,
    roleCount: roles.length,
    permissionCount: permissions.length,
    isAdminMaster,
    decision,
  });

  console.log('[AUTH:HANDOFF] ProtectedRoute', {
    pathname: location.pathname,
    isAuthenticated,
    isLoading,
    person: !!person,
    membershipCount: tenantMemberships.length,
    roleCount: roles.length,
    permissionCount: permissions.length,
    isAdminMaster,
    decision,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (authError) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="bg-warning/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Shield className="text-warning h-10 w-10" />
          </div>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Autenticação indisponível
          </h2>
          <p className="text-muted-foreground mb-6">
            {normalizeError(authError).userMessage}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              window.location.reload();
            }}
          >
            Tentar novamente
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !person) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdminMaster && !isAdminMaster) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireTenantAccess && tenantMemberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => hasRole(roles, role));
    if (!hasAllowedRole) {
      const fallback = isAdminMaster ? '/admin' : '/dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  if (allowedPermissions && allowedPermissions.length > 0) {
    const hasAllowedPermission = allowedPermissions.some((perm) =>
      hasPermission(permissions, perm),
    );
    if (!hasAllowedPermission) {
      const fallback = isAdminMaster ? '/admin' : '/dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  if (requireAnyRole && roles.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
