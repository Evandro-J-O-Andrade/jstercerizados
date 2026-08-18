import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeError } from '@/lib/error-normalizer';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAdminMaster?: boolean;
  requireTenantAccess?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAdminMaster,
  requireTenantAccess,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile, authError } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (authError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    const fallback = profile.is_admin_master ? '/admin' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  if (requireAdminMaster && profile && !profile.is_admin_master) {
    const fallback = profile.is_admin_master ? '/admin' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  if (requireTenantAccess && profile && !profile.tenant_id) {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
