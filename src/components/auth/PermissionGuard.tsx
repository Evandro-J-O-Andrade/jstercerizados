import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeError } from '@/lib/error-normalizer';
import { hasAnyPermission, hasAllPermissions } from '@/utils/rbac';
import DashboardForbidden from '@/pages/dashboard/DashboardForbidden';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  mode?: 'any' | 'all';
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  mode = 'any',
  fallback,
}: PermissionGuardProps) {
  const {
    isAuthenticated,
    isLoading,
    person,
    isAdminMaster,
    permissions: userPermissions,
    authError,
  } = useAuth();
  const location = useLocation();

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

  if (isAdminMaster) {
    return <>{children}</>;
  }

  const requiredPermissions = permission
    ? [permission, ...permissions]
    : permissions;

  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  const hasAccess =
    mode === 'all'
      ? hasAllPermissions(userPermissions, requiredPermissions)
      : hasAnyPermission(userPermissions, requiredPermissions);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <DashboardForbidden />;
  }

  return <>{children}</>;
}
