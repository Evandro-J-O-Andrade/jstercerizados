import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dispatcherMaster, type DispatchContext } from '@/core/dispatcher';
import { generateCorrelationId } from '@/core/execution/ExecutionContract';
import GlobalDashboardPage from '@/pages/dashboard/GlobalDashboardPage';

export default function DashboardHome() {
  const location = useLocation();
  const {
    isAdminMaster,
    isCandidate,
    currentTenantId,
    roles,
    permissions,
    person,
    tenantMemberships,
    firstLoginState,
    legalAcceptances,
    recoveryMode,
  } = useAuth();

  const welcomeCompleted = Boolean(firstLoginState?.welcome_completed_at);
  const hasAcceptedTerms =
    legalAcceptances.some((a) => a.document_type === 'terms') ||
    Boolean(firstLoginState?.terms_version);
  const hasMembership = tenantMemberships.length > 0;
  const mustChangePassword = Boolean(firstLoginState?.must_change_password);

  const dispatchContext: DispatchContext = {
    correlationId: generateCorrelationId(),
    personId: person?.id || '',
    tenantId: currentTenantId,
    roleIds: roles.map((r) => r.id),
    permissionKeys: permissions.map((p) => p.name),
    effectivePermissions: permissions,
    isAdminMaster,
  };

  const destination = dispatcherMaster.resolveDestination(
    dispatchContext,
    welcomeCompleted,
    mustChangePassword,
    hasAcceptedTerms,
    hasMembership,
    {
      recoveryMode,
      roleNames: roles.map((r) => r.name),
      isCandidate,
    },
  );

  if (!destination || destination === '/dashboard' || destination === location.pathname) {
    return <GlobalDashboardPage />;
  }

  return <Navigate to={destination} replace />;
}
