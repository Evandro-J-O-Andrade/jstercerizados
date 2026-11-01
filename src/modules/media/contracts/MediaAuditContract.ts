/**
 * MediaAuditContract — Contrato de auditoria
 *
 * Toda operação relevante deve permitir reconstruir quem executou,
 * qual tenant estava selecionado, qual célula solicitou, qual entidade
 * foi afetada, qual arquivo foi utilizado, qual operação foi executada,
 * qual permissão foi exigida, qual foi o resultado, quando ocorreu e
 * qual request/correlation ID identifica a execução.
 */

export type MediaAuditEvent =
  | 'media.uploaded'
  | 'media.private_asset_accessed'
  | 'media.reused'
  | 'media.replaced'
  | 'media.set_primary'
  | 'media.reordered'
  | 'media.archived'
  | 'media.deleted'
  | 'media.restored'
  | 'media.authorization_failed'
  | 'media.storage_failed'
  | 'media.tenant_mismatch_detected';

export interface MediaAuditEntry {
  id: string;
  eventId: string;
  tenantId: string;
  userId: string;
  personId: string;
  module: string;
  operation: string;
  entityType: string | null;
  entityId: string | null;
  assetId: string | null;
  permissionRequired: string | null;
  result: 'success' | 'failure';
  errorCode: string | null;
  correlationId: string;
  requestId: string;
  event: MediaAuditEvent;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export function createMediaAuditEntry(input: Partial<MediaAuditEntry>): MediaAuditEntry {
  return {
    id: input.id || crypto.randomUUID(),
    eventId: input.eventId || crypto.randomUUID(),
    tenantId: input.tenantId || '',
    userId: input.userId || '',
    personId: input.personId || '',
    module: input.module || 'unknown',
    operation: input.operation || 'unknown',
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    assetId: input.assetId ?? null,
    permissionRequired: input.permissionRequired ?? null,
    result: input.result || 'failure',
    errorCode: input.errorCode ?? null,
    correlationId: input.correlationId || crypto.randomUUID(),
    requestId: input.requestId || crypto.randomUUID(),
    event: input.event || 'media.authorization_failed',
    metadata: input.metadata || {},
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export const MEDIA_AUDIT_EVENTS: Record<MediaAuditEvent, string> = {
  'media.uploaded': 'Upload realizado',
  'media.private_asset_accessed': 'Consulta de ativo privado',
  'media.reused': 'Reutilização de ativo',
  'media.replaced': 'Substituição de ativo',
  'media.set_primary': 'Alteração de ativo principal',
  'media.reordered': 'Reordenação de ativos',
  'media.archived': 'Arquivamento de ativo',
  'media.deleted': 'Exclusão de ativo',
  'media.restored': 'Restauração de ativo',
  'media.authorization_failed': 'Falha de autorização',
  'media.storage_failed': 'Falha de armazenamento',
  'media.tenant_mismatch_detected': 'Divergência de tenant detectada',
};