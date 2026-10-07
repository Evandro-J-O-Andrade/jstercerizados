import { useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import type { MediaUploaderProps } from '@/components/media/MediaUploader.types';

interface UploadProgress {
  [fileName: string]: number;
}

interface UploadError {
  [fileName: string]: string;
}

interface UseMediaUploadResult {
  uploading: boolean;
  progress: UploadProgress;
  errors: UploadError;
  uploadFile: (file: File) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  setPrimaryAsset: (assetId: string) => Promise<void>;
  reorderAssets: (assetId: string, newSortOrder: number) => Promise<void>;
}

async function invokeMediaAdmin(
  action: 'archive' | 'set_primary' | 'reorder',
  props: MediaUploaderProps,
  mediaId: string,
  sortOrder?: number,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase.functions.invoke('media-admin', {
    body: {
      action,
      media_id: mediaId,
      entity_type: props.entityType,
      entity_id: props.entityId,
      sort_order: sortOrder,
    },
    method: 'POST',
  });

  if (error) {
    throw new Error(error.message || `Erro na operação ${action}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || `Falha na operação ${action}`);
  }
}

export function useMediaUpload(props: MediaUploaderProps): UseMediaUploadResult {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({});
  const [errors, setErrors] = useState<UploadError>({});

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Formato não suportado. Use PNG, JPG ou WebP.';
    }
    const maxSize = (props.maxSizeMB ?? 10) * 1024 * 1024;
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo ${props.maxSizeMB ?? 10} MB.`;
    }
    return null;
  }, [props.maxSizeMB]);

  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrors((e) => ({ ...e, [file.name]: validationError }));
      props.onError?.(new Error(validationError));
      return;
    }

    setUploading(true);
    setProgress((p) => ({ ...p, [file.name]: 0 }));
    setErrors((e) => { const n = { ...e }; delete n[file.name]; return n; });

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase não configurado.');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', props.entityType);
      formData.append('entity_id', props.entityId);
      formData.append('purpose', props.purpose);
      if (props.purpose === 'gallery') {
        // sort_order will be auto-assigned server-side if not provided
      }

      const { data, error } = await supabase.functions.invoke('media-upload', {
        body: formData,
        method: 'POST',
      });

      // Note: supabase.functions.invoke doesn't provide progress events
      // For progress, we'd need to use XMLHttpRequest or fetch with stream
      setProgress((p) => ({ ...p, [file.name]: 100 }));

      if (error) {
        const msg = error.message || 'Erro no upload';
        throw new Error(msg);
      }

      if (!data?.success || !data.asset) {
        throw new Error(data?.error || 'Resposta inválida do servidor');
      }

      props.onUploadComplete?.(data.asset);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setErrors((e) => ({ ...e, [file.name]: message }));
      props.onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setUploading(false);
      setProgress((p) => { const n = { ...p }; delete n[file.name]; return n; });
    }
  }, [props]);

  const deleteAsset = useCallback(async (assetId: string) => {
    await invokeMediaAdmin('archive', props, assetId);
    props.onDelete?.(assetId);
  }, [props]);

  const setPrimaryAsset = useCallback(async (assetId: string) => {
    await invokeMediaAdmin('set_primary', props, assetId);
  }, [props]);

  const reorderAssets = useCallback(async (assetId: string, newSortOrder: number) => {
    await invokeMediaAdmin('reorder', props, assetId, newSortOrder);
  }, [props]);

  return {
    uploading,
    progress,
    errors,
    uploadFile,
    deleteAsset,
    setPrimaryAsset,
    reorderAssets,
  };
}