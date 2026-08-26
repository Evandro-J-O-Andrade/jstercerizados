import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';

interface FirstAccessRouteProps {
  children: React.ReactNode;
}

export function FirstAccessRoute({ children }: FirstAccessRouteProps) {
  const { isAuthenticated, isLoading, person, firstLoginState } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !person) {
    return <Navigate to="/login" replace />;
  }

  if (firstLoginState?.first_login_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
