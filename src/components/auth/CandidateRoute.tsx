import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRoute } from '@/components/auth/AuthRoute';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';

interface CandidateRouteProps {
  children: React.ReactNode;
}

export function CandidateRoute({ children }: CandidateRouteProps) {
  const { isAuthenticated, isCandidate, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isCandidate) {
    const fallback = window.location.pathname.startsWith('/candidato')
      ? '/dashboard'
      : '/login';
    return <Navigate to={fallback} replace />;
  }

  return <AuthRoute>{children}</AuthRoute>;
}
