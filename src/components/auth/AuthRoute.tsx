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
      '/dashboard/admin-master',
      '/dashboard/candidatos',
      '/dashboard/seguranca',
      '/dashboard/tenants',
      '/dashboard/pessoas',
      '/dashboard/roles-permissoes',
      '/dashboard/onboarding',
    ]).has(normalizedPath);
  // Rota operacional tenant-scoped (recrutamento/candidatos): não tratar como global
  // para contornar validação de tenant. Admin Master sem tenant não deve ser
  // devolvido silenciosamente ao /dashboard/admin-master; sem tenant explícito,
  // o fluxo de seleção de tenant (quando aplicável) ou o estado fail-closed da
  // célula/repositório é preservado.
  const isRecruitmentCandidatesRoute =
    normalizedPath === '/dashboard/recrutamento/candidatos' ||
    normalizedPath.startsWith('/dashboard/recrutamento/candidatos/');

  if (
    isAdminMaster &&
    !currentTenantId &&
    normalizedPath.startsWith('/dashboard') &&
    !isGlobalAdminRoute
  ) {
    if (isRecruitmentCandidatesRoute) {
      // Não redirecionar silenciosamente para Admin Master; encaminhar para
      // seleção explícita de tenant quando houver memberships, caso contrário
      // estado de contexto requerido (rota permanece e a célula fica fail-closed).
      if (hasMembership) {
        return (
          <Navigate
            to="/selecionar-tenant"
            replace
            state={{ from: location }}
          />
        );
      }
      return <>{children}</>;
    }
    return <Navigate to="/dashboard/admin-master" replace />;
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
