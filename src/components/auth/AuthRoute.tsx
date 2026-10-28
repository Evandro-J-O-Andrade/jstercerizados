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
    recoveryMode,
    tenantMemberships,
  } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !person) {
    return <Navigate to="/login" replace />;
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

  const welcomeCompleted = Boolean(firstLoginState?.welcome_completed_at);

  if (!welcomeCompleted) {
    return <Navigate to="/auth/welcome" replace />;
  }

  if (recoveryMode) {
    return <Navigate to="/redefinir-senha" replace />;
  }

  const hasMembership = Array.isArray(tenantMemberships)
    ? tenantMemberships.length > 0
    : false;
  if (!hasMembership) {
    return <Navigate to="/onboarding" replace />;
  }

  if (firstLoginState?.must_change_password) {
    return <Navigate to="/primeiro-acesso/senha" replace />;
  }

  return <>{children}</>;
}
