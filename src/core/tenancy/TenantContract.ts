/**
 * TenantContract — validates tenant context and isolation boundaries.
 * The tenantId from the client is NEVER trusted as proof of authorization.
 */

import type { UUID, TenantMembership, Person } from '../types';

export interface TenantContext {
  tenantId: UUID | null;
  tenantName: string | null;
  membership: TenantMembership | null;
  isValid: boolean;
  reason?: string;
}

/**
 * Validates that a tenantId is associated with the authenticated person.
 * The requested tenantId comes from the client — it must be verified
 * against the server-side membership list.
 */
export function validateTenantContext(
  person: Person | null,
  memberships: TenantMembership[],
  requestedTenantId: UUID | null,
): TenantContext {
  if (!person) {
    return { tenantId: null, tenantName: null, membership: null, isValid: false, reason: 'No person record' };
  }

  if (!requestedTenantId) {
    return { tenantId: null, tenantName: null, membership: null, isValid: false, reason: 'No tenantId provided' };
  }

  const active = memberships.filter((m) => m.status === 'active');
  const match = active.find((m) => m.tenant_id === requestedTenantId && m.person_id === person.id);

  if (!match) {
    return {
      tenantId: null,
      tenantName: null,
      membership: null,
      isValid: false,
      reason: `Tenant ${requestedTenantId} is not an active membership for this person`,
    };
  }

  return {
    tenantId: match.tenant_id,
    tenantName: null, // name comes from tenants table, not from client
    membership: match,
    isValid: true,
  };
}

/**
 * Asserts that a tenantId matches the expected context.
 * Throws if mismatch — use in service layer for defense in depth.
 */
export function assertTenantMatch(
  contextTenantId: UUID | null,
  requestedTenantId: UUID | null,
): void {
  if (!contextTenantId) {
    throw new Error('No tenant context available');
  }
  if (!requestedTenantId) {
    throw new Error('No tenantId in request');
  }
  if (contextTenantId !== requestedTenantId) {
    throw new Error(`Tenant mismatch: context=${contextTenantId}, request=${requestedTenantId}`);
  }
}