import type {
  MediaRequest,
  MediaResponse,
} from '../contracts/MediaRequestContract';
import type { MediaContext } from '../contracts/MediaContextContract';
import { mediaAssetsRepository } from '../../../repositories/media-assets.repository';
import { getSupabaseClient } from '../../../lib/supabase';

/**
 * MediaService — Serviço operacional da Célula Media
 *
 * Executa operações de upload, consulta, exclusão e URL.
 * Recebe contexto validado pelo MediaDispatcher.
 * Não cria identidade, não escolhe permissões.
 */
export class MediaService {
  async execute<T>(
    request: Partial<MediaRequest<T>>,
    context: MediaContext,
    requestId: string,
    correlationId: string,
  ): Promise<MediaResponse<T>> {
    switch (request.operation) {
      case 'upload':
        return this.upload(request, context, requestId, correlationId);
      case 'list':
        return this.list(request, context, requestId);
      case 'search':
        return this.search(request, context, requestId);
      case 'get':
        return this.get(request, context, requestId);
      case 'archive':
        return this.archive(request, context, requestId);
      case 'delete':
        return this.delete(request, context, requestId);
      default:
        return {
          success: false,
          requestId,
          errorCode: 'MEDIA_OPERATION_FAILED',
          message: 'Operação não suportada',
          retryable: false,
        } as MediaResponse<T>;
    }
  }

  private async upload<T>(
    request: Partial<MediaRequest<T>>,
    context: MediaContext,
    requestId: string,
    correlationId: string,
  ): Promise<MediaResponse<T>> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        requestId,
        errorCode: 'MEDIA_STORAGE_UNAVAILABLE',
        message: 'Supabase não configurado',
        retryable: true,
      } as MediaResponse<T>;
    }

    try {
      const formData = new FormData();
      formData.append('file', (request.data as any).file);
      formData.append('entity_type', request.entity?.type || '');
      formData.append('entity_id', request.entity?.id || '');
      formData.append('purpose', (request.data as any).purpose || '');
      formData.append('tenant_id', context.tenantId);
      formData.append('person_id', context.personId);

      const { data, error } = await supabase.functions.invoke('media-upload', {
        body: formData,
        method: 'POST',
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Falha no upload');

      return {
        success: true,
        requestId,
        operation: 'upload',
        asset: data.asset,
        metadata: { correlationId },
      } as MediaResponse<T>;
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

  private async list<T>(
    request: Partial<MediaRequest<T>>,
    context: MediaContext,
    requestId: string,
  ): Promise<MediaResponse<T>> {
    try {
      const assets = await mediaAssetsRepository.findByEntity(
        context.tenantId,
        (request.entity?.type as any) || 'company',
        request.entity?.id || '',
      );
      return {
        success: true,
        requestId,
        operation: 'list',
        data: assets as unknown as T,
      } as MediaResponse<T>;
    } catch (error) {
      return {
        success: false,
        requestId,
        errorCode: 'MEDIA_OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Erro',
        retryable: false,
      } as MediaResponse<T>;
    }
  }

  private async search<T>(
    request: Partial<MediaRequest<T>>,
    context: MediaContext,
    requestId: string,
  ): Promise<MediaResponse<T>> {
    return this.list(request, context, requestId);
  }

  private async get<T>(
    request: Partial<MediaRequest<T>>,
    context: MediaContext,
    requestId: string,
  ): Promise<MediaResponse<T>> {
    try {
      const asset = await mediaAssetsRepository.findPrimary(
        context.tenantId,
        (request.entity?.type as any) || 'company',
        request.entity?.id || '',
      );
      return {
        success: true,
        requestId,
        operation: 'get',
        asset,
        data: asset as unknown as T,
      } as MediaResponse<T>;
    } catch (error) {
      return {
        success: false,
        requestId,
        errorCode: 'MEDIA_NOT_FOUND',
        message:
          error instanceof Error ? error.message : 'Ativo não encontrado',
        retryable: false,
      } as MediaResponse<T>;
    }
  }

  private async archive<T>(
    request: Partial<MediaRequest<T>>,
    context: MediaContext,
    requestId: string,
  ): Promise<MediaResponse<T>> {
    try {
      const asset = await mediaAssetsRepository.archive(
        context.tenantId,
        (request.data as any).assetId,
      );
      return {
        success: true,
        requestId,
        operation: 'archive',
        asset,
      } as MediaResponse<T>;
    } catch (error) {
      return {
        success: false,
        requestId,
        errorCode: 'MEDIA_OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Erro',
        retryable: false,
      } as MediaResponse<T>;
    }
  }

  private async delete<T>(
    request: Partial<MediaRequest<T>>,
    context: MediaContext,
    requestId: string,
  ): Promise<MediaResponse<T>> {
    try {
      await mediaAssetsRepository.delete(
        context.tenantId,
        (request.data as any).assetId,
      );
      return {
        success: true,
        requestId,
        operation: 'delete',
      } as MediaResponse<T>;
    } catch (error) {
      return {
        success: false,
        requestId,
        errorCode: 'MEDIA_OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Erro',
        retryable: false,
      } as MediaResponse<T>;
    }
  }
}
