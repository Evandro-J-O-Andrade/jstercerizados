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
export function validateExecutionContext(context: Partial<ExecutionContext>): ValidationResult {
  const errors: string[] = [];

  if (!context.tenantId) errors.push('Missing tenantId');
  if (!context.userId) errors.push('Missing userId');
  if (!context.routeId) errors.push('Missing routeId');
  if (!context.moduleId) errors.push('Missing moduleId');
  if (!context.action) errors.push('Missing action');
  if (!context.correlationId) errors.push('Missing correlationId');

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
 * The caller is responsible for ensuring tenantId and userId are authorized.
 */
export function buildExecutionContext(
  tenantId: UUID,
  userId: UUID,
  routeId: string,
  moduleId: string,
  action: string,
  resourceId?: string,
): ExecutionContext {
  return {
    tenantId,
    userId,
    routeId,
    moduleId,
    action,
    resourceId,
    correlationId: generateCorrelationId(),
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