/**
 * MediaDispatcher — Orquestrador da Célula Media
 *
 * Valida o contrato e direciona a execução para o service apropriado.
 * Não cria identidade, não escolhe permissões por conta própria.
 * O DispatcherMaster é a autoridade de despacho global.
 */

import type { MediaRequest, MediaResponse } from '../contracts/MediaRequestContract';
import type { MediaContext } from '../contracts/MediaContextContract';
import { MediaService } from './MediaService';
import type { MediaAuthorizationResult } from '../contracts/MediaAuthorizationContract';
import { validateMediaAuthorization } from '../contracts/MediaAuthorizationContract';

export interface MediaDispatcherDeps {
  mediaService: MediaService;
  getCurrentPersonId: () => string | null;
  getCurrentUserId: () => string | null;
  getCurrentTenantId: () => string | null;
  getUserPermissions: () => string[];
  isAdminMaster: () => boolean;
  isTenantAdmin: () => boolean;
  isOwner: (entityType: string, entityId: string) => boolean;
  generateRequestId: () => string;
  generateCorrelationId: () => string;
}

export class MediaDispatcher {
  constructor(private readonly deps: MediaDispatcherDeps) {}

  async dispatch<T>(request: Partial<MediaRequest<T>>): Promise<MediaResponse<T>> {
    const requestId = request.requestId || this.deps.generateRequestId();
    const correlationId = request.context?.correlationId || this.deps.generateCorrelationId();

    // 1. Validar contexto
    const context = this.buildContext(request, requestId, correlationId);
    if (!context) {
      return {
        success: false,
        requestId,
        errorCode: 'MEDIA_INVALID_CONTEXT',
        message: 'Contexto inválido',
        retryable: false,
      } as MediaResponse<T>;
    }

    // 2. Validar autorização
    if (request.entity && request.operation) {
      const resource = this.mapEntityToResource(request.entity.type);
      const action = this.mapOperationToAction(request.operation);
      if (resource && action) {
        const authResult = this.validateAuthorization(context, request.entity.type, request.entity.id, resource, action);
        if (!authResult.allowed) {
          return {
            success: false,
            requestId,
            errorCode: 'MEDIA_FORBIDDEN',
            message: authResult.reason || 'Permissão negada',
            retryable: false,
          } as MediaResponse<T>;
        }
      }
    }

    // 3. Direcionar para o service
    try {
      return await this.deps.mediaService.execute(request, context, requestId, correlationId);
    } catch (error) {
      return {
        success: false,
        requestId,
        errorCode: 'MEDIA_OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        retryable: false,
      } as MediaResponse<T>;
    }
  }

  private buildContext(
    request: Partial<MediaRequest>,
    requestId: string,
    correlationId: string,
  ): MediaContext | null {
    const userId = this.deps.getCurrentUserId();
    const personId = this.deps.getCurrentPersonId();
    const tenantId = this.deps.getCurrentTenantId();

    if (!userId || !personId || !tenantId) {
      return null;
    }

    return {
      requestId,
      userId,
      personId,
      tenantId,
      roleIds: [],
      permissions: this.deps.getUserPermissions(),
      module: request.context?.module || 'media',
      operation: request.operation || 'unknown',
      entityType: request.entity?.type,
      entityId: request.entity?.id,
      correlationId,
    };
  }

  private mapEntityToResource(entityType: string): string | null {
    const map: Record<string, string> = {
      company: 'companies.media',
      service: 'services.media',
      partner: 'partners.media',
      supplier: 'suppliers.media',
      person: 'people.media',
      job: 'jobs.media',
    };
    return map[entityType] || null;
  }

  private mapOperationToAction(operation: string): 'read' | 'write' | 'delete' | null {
    if (operation === 'list' || operation === 'search' || operation === 'get' || operation === 'preview') {
      return 'read';
    }
    if (operation === 'upload' || operation === 'replace' || operation === 'set_primary' || operation === 'reorder') {
      return 'write';
    }
    if (operation === 'delete') {
      return 'delete';
    }
    return null;
  }

  private validateAuthorization(
    context: MediaContext,
    entityType: string,
    entityId: string,
    resource: string,
    action: 'read' | 'write' | 'delete',
  ): MediaAuthorizationResult {
    return validateMediaAuthorization(
      {
        userId: context.userId,
        personId: context.personId,
        tenantId: context.tenantId,
        resource: resource as any,
        action,
        entityType,
        entityId,
      },
      context.permissions,
      this.deps.isAdminMaster(),
      this.deps.isTenantAdmin(),
      this.deps.isOwner(entityType, entityId),
    );
  }
}