import { Navigate, useLocation } from 'react-router-dom';
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
    currentTenantId,
    isAdminMaster,
    isCandidate,
  } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !person) {
    return <Navigate to="/login" replace />;
  }

  if (recoveryMode) {
    return <Navigate to="/redefinir-senha" replace />;
  }

  if (firstLoginState?.must_change_password) {
    return <Navigate to="/primeiro-acesso/senha" replace />;
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

  const hasMembership = Array.isArray(tenantMemberships)
    ? tenantMemberships.length > 0
    : false;

  // Usuários corporativos exigem membership ativa; Candidatos e Admin Master global são isentos
  if (!hasMembership && !isAdminMaster && !isCandidate) {
    return <Navigate to="/onboarding" replace />;
  }

  const isTenantSelectionRoute =
    location.pathname.replace(/\/+$/, '') === '/selecionar-tenant';
  const normalizedPath = location.pathname.replace(/\/+$/, '');
  const isGlobalAdminRoute =
    isAdminMaster &&
    new Set([
      '/dashboard',
      '/dashboard/global',
      '/dashboard/seguranca',
      '/dashboard/tenants',
      '/dashboard/pessoas',
      '/dashboard/roles-permissoes',
      '/dashboard/gestao-saas',
      '/dashboard/onboarding',
    ]).has(normalizedPath);

  if (
    isAdminMaster &&
    !currentTenantId &&
    normalizedPath.startsWith('/dashboard') &&
    !isGlobalAdminRoute
  ) {
    return <Navigate to="/dashboard/global" replace />;
  }

  if (
    hasMembership &&
    !currentTenantId &&
    !isTenantSelectionRoute &&
    !isGlobalAdminRoute
  ) {
    return (
      <Navigate to="/selecionar-tenant" replace state={{ from: location }} />
    );
  }

  return <>{children}</>;
}
