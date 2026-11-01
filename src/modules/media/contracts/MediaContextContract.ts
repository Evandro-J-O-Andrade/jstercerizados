/**
 * MediaContextContract — Contrato de contexto de operação
 *
 * Define os campos obrigatórios do contexto para qualquer operação da Célula Media.
 * userId, tenantId, papéis e permissões são derivados e validados pelo contexto
 * autenticado e pelo mecanismo oficial de autorização. O frontend não pode
 * declarar unilateralmente que possui autorização sobre uma entidade.
 */

export interface MediaContext {
  requestId: string;
  userId: string;
  personId: string;
  tenantId: string;
  roleIds: string[];
  permissions: string[];
  module: string;
  operation: string;
  entityType?: string;
  entityId?: string;
  correlationId: string;
}

export interface MediaContextValidation {
  valid: boolean;
  errors: string[];
  context?: MediaContext;
}

export function createMediaContext(input: Partial<MediaContext>): MediaContextValidation {
  const errors: string[] = [];

  if (!input.requestId) errors.push('requestId é obrigatório');
  if (!input.userId) errors.push('userId é obrigatório');
  if (!input.personId) errors.push('personId é obrigatório');
  if (!input.tenantId) errors.push('tenantId é obrigatório');
  if (!input.roleIds || !Array.isArray(input.roleIds)) errors.push('roleIds é obrigatório');
  if (!input.permissions || !Array.isArray(input.permissions)) errors.push('permissions é obrigatório');
  if (!input.module) errors.push('module é obrigatório');
  if (!input.operation) errors.push('operation é obrigatório');
  if (!input.correlationId) errors.push('correlationId é obrigatório');

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], context: input as MediaContext };
}