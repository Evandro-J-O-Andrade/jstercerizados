import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
        <div className="border-primary mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm">
          {isLoading ? 'Finalizando autenticação...' : 'Redirecionando...'}
        </p>
      </div>
    </div>
  );
}
