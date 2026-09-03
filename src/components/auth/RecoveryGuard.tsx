import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';

interface RecoveryGuardProps {
  children: React.ReactNode;
}

export function RecoveryGuard({ children }: RecoveryGuardProps) {
  const { isLoading, isAuthenticated, person, recoveryMode } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (recoveryMode) {
    return <>{children}</>;
  }

  if (isAuthenticated && person) {
    return (
      <Navigate to="/dashboard" state={{ from: location.pathname }} replace />
    );
  }

  return (
    <Navigate
      to="/recuperar-senha"
      state={{ from: location.pathname }}
      replace
    />
  );
}
