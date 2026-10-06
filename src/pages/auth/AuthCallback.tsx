import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, person, isLoading, resolvePostLoginDestination } =
    useAuth();

  const error = new URLSearchParams(location.search).get('error');
  const errorDescription = new URLSearchParams(location.search).get(
    'error_description',
  );

  useEffect(() => {
    if (error) {
      const target = `/login?error=${encodeURIComponent(errorDescription || error)}`;
      navigate(target, { replace: true });
      return;
    }

    if (isAuthenticated && person) {
      const target = resolvePostLoginDestination();
      navigate(target, { replace: true });
    }
  }, [
    isAuthenticated,
    person,
    isLoading,
    error,
    errorDescription,
    navigate,
    resolvePostLoginDestination,
  ]);

  if (error) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="md" />
        <p className="text-muted-foreground mt-4 text-sm">
          {isLoading ? 'Finalizando autenticação...' : 'Redirecionando...'}
        </p>
      </div>
    </div>
  );
}
