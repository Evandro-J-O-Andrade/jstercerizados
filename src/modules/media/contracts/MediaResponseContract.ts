/**
 * MediaResponseContract — Contrato de resposta
 *
 * Toda operação retorna um resultado padronizado.
 * Não retorna stack traces, credenciais, tokens ou dados sensíveis.
 */

export type MediaErrorCode =
  | 'MEDIA_UNAUTHORIZED'
  | 'MEDIA_FORBIDDEN'
  | 'MEDIA_NOT_FOUND'
  | 'MEDIA_INVALID_FILE'
  | 'MEDIA_INVALID_CONTEXT'
  | 'MEDIA_STORAGE_UNAVAILABLE'
  | 'MEDIA_METADATA_CONFLICT'
  | 'MEDIA_DUPLICATE_REQUEST'
  | 'MEDIA_OPERATION_FAILED'
  | 'MEDIA_INVALID_ENTITY'
  | 'MEDIA_GALLERY_LIMIT_EXCEEDED'
  | 'MEDIA_TENANT_MISMATCH';

export interface MediaSuccessResponse<T = unknown> {
  success: true;
  requestId: string;
  operation: string;
  asset?: unknown;
  data?: T;
  metadata?: Record<string, unknown>;
}

export interface MediaErrorResponse {
  success: false;
  requestId: string;
  errorCode: MediaErrorCode;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export type MediaResponse<T = unknown> = MediaSuccessResponse<T> | MediaErrorResponse;

export function createMediaSuccess<T>(
  requestId: string,
  operation: string,
  data?: T,
  metadata?: Record<string, unknown>,
): MediaSuccessResponse<T> {
  return { success: true, requestId, operation, data, metadata };
}

export function createMediaError(
  requestId: string,
  errorCode: MediaErrorCode,
  message: string,
  retryable = false,
  details?: Record<string, unknown>,
): MediaErrorResponse {
  return { success: false, requestId, errorCode, message, retryable, details };
}

export function isMediaError(response: MediaResponse): response is MediaErrorResponse {
  return response.success === false;
}

export function isMediaSuccess<T>(response: MediaResponse): response is MediaSuccessResponse<T> {
  return response.success === true;
}