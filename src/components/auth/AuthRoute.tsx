import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';

interface AuthRouteProps {
  children: React.ReactNode;
}

export function AuthRoute({ children }: AuthRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    person,
    firstLoginState,
    legalAcceptances,
  } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !person) {
    return <Navigate to="/entrar" replace />;
  }

  const hasAcceptedTerms = legalAcceptances.some(
    (a) => a.document_type === 'terms',
  );

  const termsVersion = firstLoginState?.terms_version;
  const hasTermsInFirstLogin = Boolean(termsVersion);

  const termsAccepted = hasAcceptedTerms || hasTermsInFirstLogin;

  if (!termsAccepted) {
    return <Navigate to="/auth/terms" replace />;
  }

  const welcomeCompleted =
    Boolean(firstLoginState?.welcome_completed_at) ||
    firstLoginState?.first_login_completed === true;

  if (!welcomeCompleted) {
    return <Navigate to="/auth/welcome" replace />;
  }

  return <>{children}</>;
}
