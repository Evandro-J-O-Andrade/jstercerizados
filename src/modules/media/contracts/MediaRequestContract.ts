/**
 * MediaRequestContract — Contrato de requisição
 *
 * Toda operação da Célula Media utiliza uma estrutura padronizada com
 * identificador, operação, contexto, entidade, dados, idempotência e metadados.
 */

export interface MediaResponse<T = unknown> {
  success: boolean;
  requestId: string;
  correlationId?: string;
  data?: T;
  errorCode?: string;
  message?: string;
  retryable?: boolean;
}

export type MediaOperation =
  | 'upload'
  | 'list'
  | 'search'
  | 'get'
  | 'preview'
  | 'reuse'
  | 'replace'
  | 'set_primary'
  | 'reorder'
  | 'archive'
  | 'delete'
  | 'restore';

export interface MediaRequest<T = unknown> {
  requestId: string;
  operation: MediaOperation;
  context: {
    userId: string;
    personId: string;
    tenantId: string;
    roleIds: string[];
    permissions: string[];
    module: string;
    correlationId: string;
  };
  entity?: {
    type: string;
    id: string;
  };
  data?: T;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export function createMediaRequest<T>(
  input: Partial<MediaRequest<T>>,
): MediaRequest<T> {
  return {
    requestId: input.requestId || crypto.randomUUID(),
    operation: input.operation || 'upload',
    context: {
      userId: input.context?.userId || '',
      personId: input.context?.personId || '',
      tenantId: input.context?.tenantId || '',
      roleIds: input.context?.roleIds || [],
      permissions: input.context?.permissions || [],
      module: input.context?.module || 'unknown',
      correlationId: input.context?.correlationId || crypto.randomUUID(),
    },
    entity: input.entity,
    data: input.data,
    idempotencyKey: input.idempotencyKey,
    metadata: input.metadata,
  };
}
