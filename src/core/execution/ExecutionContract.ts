/**
 * ExecutionContract — validates execution context and generates correlation IDs.
 * Structural validation is DISTINCT from authorization decisions.
 */

import type { ExecutionContext, UUID } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates that all required fields are present.
 * This is STRUCTURAL validation — it does NOT check permissions.
 */
export function validateExecutionContext(
  context: Partial<ExecutionContext>,
): ValidationResult {
  const errors: string[] = [];

  if (!context.tenantId) errors.push('Missing tenantId');
  if (!context.personId) errors.push('Missing personId');
  if (!context.roleIds || context.roleIds.length === 0)
    errors.push('Missing roleIds');
  if (!context.permissions || context.permissions.length === 0)
    errors.push('Missing permissions');

  return { valid: errors.length === 0, errors };
}

/**
 * Generates a unique correlation ID for tracing operations.
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `corr_${timestamp}_${random}`;
}

/**
 * Builds an ExecutionContext from validated inputs.
 * The caller is responsible for ensuring tenantId and personId are authorized.
 */
export function buildExecutionContext(
  tenantId: UUID | null,
  personId: UUID,
  roleIds: UUID[],
  permissions: string[],
): ExecutionContext {
  return {
    tenantId,
    personId,
    roleIds,
    permissions,
  };
}

/**
 * Asserts that the context is valid. Throws if not.
 */
export function assertValidContext(context: Partial<ExecutionContext>): void {
  const result = validateExecutionContext(context);
  if (!result.valid) {
    throw new Error(`Invalid execution context: ${result.errors.join(', ')}`);
  }
}
