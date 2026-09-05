import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRoute } from '@/components/auth/AuthRoute';

interface CandidateRouteProps {
  children: React.ReactNode;
}

export function CandidateRoute({ children }: CandidateRouteProps) {
  const { isAuthenticated, isCandidate, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/entrar" replace />;
  }

  if (!isCandidate) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthRoute>{children}</AuthRoute>;
}
