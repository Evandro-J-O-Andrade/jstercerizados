/**
 * IdentityContract — validates authenticated identity and person linkage.
 * Separates authentication (is this a real session?) from authorization
 * (is this person allowed to do this action in this tenant?).
 */

import type { AuthUser, Person, TenantMembership, IdentityContext, UUID } from '../types';

/**
 * Validates that an authUser has a corresponding person record.
 * A failed person lookup does NOT invalidate the session — it means
 * the domain identity is incomplete, not that the user is unauthorized.
 */
export function validatePersonLink(
  authUser: AuthUser | null,
  person: Person | null,
): { valid: boolean; reason?: string } {
  if (!authUser) {
    return { valid: false, reason: 'No authenticated user' };
  }
  if (!person) {
    return { valid: false, reason: 'No person record linked to auth user' };
  }
  if (person.auth_user_id !== authUser.id) {
    return { valid: false, reason: 'Person auth_user_id does not match session' };
  }
  return { valid: true };
}

/**
 * Resolves the active tenant from memberships.
 * Only 'active' memberships are considered.
 */
export function resolveActiveTenant(
  memberships: TenantMembership[],
  requestedTenantId?: UUID,
): { tenantId: UUID | null; membership: TenantMembership | null; reason?: string } {
  const active = memberships.filter((m) => m.status === 'active');

  if (active.length === 0) {
    return { tenantId: null, membership: null, reason: 'No active tenant memberships' };
  }

  if (requestedTenantId) {
    const match = active.find((m) => m.tenant_id === requestedTenantId);
    if (!match) {
      return {
        tenantId: null,
        membership: null,
        reason: `Requested tenant ${requestedTenantId} is not in active memberships`,
      };
    }
    return { tenantId: match.tenant_id, membership: match };
  }

  // Default: first active membership
  const first = active[0];
  return { tenantId: first.tenant_id, membership: first };
}

/**
 * Builds the IdentityContext from raw data.
 * This is a pure function — no side effects, no React.
 */
export function buildIdentityContext(
  authUser: AuthUser | null,
  person: Person | null,
  memberships: TenantMembership[],
  currentTenantId?: UUID,
): IdentityContext {
  const resolution = resolveActiveTenant(memberships, currentTenantId);

  return {
    authUser,
    person,
    memberships,
    currentTenantId: resolution.tenantId,
    availableTenants: memberships
      .filter((m) => m.status === 'active')
      .map((m) => ({ id: m.tenant_id, name: '' })),
    isAuthenticated: Boolean(authUser),
    isLoading: false,
  };
}

/**
 * Checks if a business operation can proceed.
 * A business operation requires both authentication AND a valid person.
 */
export function canExecuteBusinessOperation(identity: IdentityContext): {
  canProceed: boolean;
  reason?: string;
} {
  if (!identity.isAuthenticated) {
    return { canProceed: false, reason: 'User not authenticated' };
  }
  if (!identity.person) {
    return { canProceed: false, reason: 'No person record — business operation requires domain identity' };
  }
  if (!identity.currentTenantId) {
    return { canProceed: false, reason: 'No active tenant — business operation requires tenant context' };
  }
  return { canProceed: true };
}