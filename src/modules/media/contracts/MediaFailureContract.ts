/**
 * MediaFailureContract — Contrato de falhas e resiliência
 *
 * A Célula Media deve falhar de forma controlada.
 * Uma falha de upload não deve derrubar o cadastro de empresas,
 * vagas, candidatos ou serviços. Uma indisponibilidade da Media
 * não deve interromper o shell global ou a navegação de células
 * independentes.
 */

export type MediaFailureCode =
  | 'MEDIA_TIMEOUT'
  | 'MEDIA_RETRY_EXHAUSTED'
  | 'MEDIA_IDEMPOTENCY_CONFLICT'
  | 'MEDIA_UPLOAD_INCOMPLETE'
  | 'MEDIA_CATALOG_OBJECT_MISMATCH'
  | 'MEDIA_OPERATION_INTERRUPTED'
  | 'MEDIA_ISOLATION_BREACH';

export interface MediaRetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  retryable: boolean;
}

export interface MediaFailureRecord {
  code: MediaFailureCode;
  message: string;
  requestId: string;
  correlationId: string;
  timestamp: string;
  retryPolicy: MediaRetryPolicy;
  context: Record<string, unknown>;
}

export const DEFAULT_RETRY_POLICY: MediaRetryPolicy = {
  maxAttempts: 3,
  backoffMs: 1000,
  retryable: true,
};

export const NO_RETRY_POLICY: MediaRetryPolicy = {
  maxAttempts: 0,
  backoffMs: 0,
  retryable: false,
};

export function createMediaFailure(
  code: MediaFailureCode,
  message: string,
  requestId: string,
  correlationId: string,
  retryPolicy: MediaRetryPolicy = DEFAULT_RETRY_POLICY,
  context: Record<string, unknown> = {},
): MediaFailureRecord {
  return {
    code,
    message,
    requestId,
    correlationId,
    timestamp: new Date().toISOString(),
    retryPolicy,
    context,
  };
}

export function isRetryableFailure(failure: MediaFailureRecord): boolean {
  return failure.retryPolicy.retryable && failure.retryPolicy.maxAttempts > 0;
}