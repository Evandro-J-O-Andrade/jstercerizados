import { useState, useCallback, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import { DropZone } from './DropZone';
import { Preview } from './Preview';
import { GalleryGrid } from './GalleryGrid';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import type { MediaAsset, MediaUploaderProps } from './MediaUploader.types';

const EMPTY_ASSETS: MediaAsset[] = [];

export function MediaUploader({
  entityType,
  entityId,
  purpose,
  onUploadComplete,
  onError,
  onDelete,
  disabled = false,
  maxFiles,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMB = 10,
  showPreview = true,
  className,
  existingAssets = EMPTY_ASSETS,
  multiple = false,
}: MediaUploaderProps) {
  const defaultMaxFiles = purpose === 'gallery' ? 10 : multiple ? 10 : 1;
  const effectiveMaxFiles = maxFiles ?? defaultMaxFiles;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>(existingAssets);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    uploading,
    progress,
    errors,
    uploadFile,
    deleteAsset: deleteAssetHook,
    setPrimaryAsset,
    reorderAssets,
  } = useMediaUpload({
    entityType,
    entityId,
    purpose,
    onUploadComplete: (asset) => {
      setAssets((prev) =>
        purpose === 'gallery'
          ? [...prev, asset]
          : [{ ...asset, is_primary: true }],
      );
      onUploadComplete?.(asset);
    },
    onError,
    onDelete,
  });

  // Sync existingAssets prop
  useEffect(() => {
    setAssets(existingAssets);
  }, [existingAssets]);

  const handleFilesSelected = useCallback((files: File[]) => {
    setValidationError(null);
    const remainingSlots = effectiveMaxFiles - assets.length - selectedFiles.length;
    const filesToAdd = files.slice(0, Math.max(0, remainingSlots));
    setSelectedFiles((prev) => [...prev, ...filesToAdd]);
  }, [assets.length, effectiveMaxFiles, selectedFiles.length]);

  const handleValidationError = useCallback((error: string | null) => {
    setValidationError(error);
  }, []);

  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadAll = useCallback(async () => {
    for (const file of selectedFiles) {
      await uploadFile(file);
    }
    setSelectedFiles([]);
  }, [selectedFiles, uploadFile]);

  const handleRemoveAsset = useCallback(async (assetId: string) => {
    await deleteAssetHook(assetId);
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  }, [deleteAssetHook]);

  const handleSetPrimary = useCallback(async (assetId: string) => {
    await setPrimaryAsset(assetId);
    setAssets((prev) =>
      prev.map((a) => ({ ...a, is_primary: a.id === assetId }))
    );
  }, [setPrimaryAsset]);

  const handleReorder = useCallback(async (assetId: string, newSortOrder: number) => {
    await reorderAssets(assetId, newSortOrder);
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, sort_order: newSortOrder } : a))
    );
  }, [reorderAssets]);

  const hasPrimary = assets.some((a) => a.is_primary);
  const primaryAsset = assets.find((a) => a.is_primary);

  // For non-gallery purposes, show only primary (or first) as main preview
  const showMainPreview = purpose !== 'gallery' && showPreview && assets.length > 0;
  const showGallery = purpose === 'gallery' && showPreview;

  return (
    <div className={cn('space-y-4', className)}>
      {validationError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{validationError}</p>
          </div>
        </div>
      )}

      {/* Drop Zone / Upload Area (single-image purposes only; gallery uses its own selector below) */}
      {purpose !== 'gallery' && (!assets.length || !hasPrimary) ? (
        <DropZone
          onFilesSelected={handleFilesSelected}
          onError={handleValidationError}
          accept={accept}
          maxFiles={effectiveMaxFiles - assets.length - selectedFiles.length}
          maxSizeMB={maxSizeMB}
          disabled={disabled || uploading}
          multiple={multiple || effectiveMaxFiles > 1}
        />
      ) : null}

      {/* Selected Files Queue (before upload) */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Aguardando upload ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <div className="text-2xl">📄</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                  </p>
                  {errors[file.name] && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[file.name]}
                    </p>
                  )}
                  {progress[file.name] !== undefined && (
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress[file.name]}%` }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeSelectedFile(index)}
                  disabled={uploading}
                  className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                  aria-label="Remover arquivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {!uploading && (
            <button
              onClick={handleUploadAll}
              disabled={selectedFiles.length === 0 || uploading}
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviar {selectedFiles.length} arquivo(s)
            </button>
          )}
        </div>
      )}

      {/* Main Preview (logo/hero/card) */}
      {showMainPreview && primaryAsset && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Imagem atual
          </h4>
          <Preview
            asset={primaryAsset}
            purpose={purpose}
            isPrimary={true}
            onRemove={handleRemoveAsset}
            onSetPrimary={undefined} // Already primary
            disabled={disabled || uploading}
          />
        </div>
      )}

      {/* Gallery Grid */}
      {showGallery && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Galeria ({assets.filter((a) => !a.metadata?.archived).length}/{effectiveMaxFiles})
            </h4>
            {assets.length < effectiveMaxFiles && !uploading && (
              <DropZone
                onFilesSelected={handleFilesSelected}
                onError={handleValidationError}
                accept={accept}
                maxFiles={effectiveMaxFiles - assets.length}
                maxSizeMB={maxSizeMB}
                disabled={disabled || uploading}
                multiple={true}
                className="w-48"
              />
            )}
          </div>
          <GalleryGrid
            assets={assets.filter((a) => !a.metadata?.archived)}
            primaryAssetId={primaryAsset?.id || null}
            onRemove={handleRemoveAsset}
            onSetPrimary={handleSetPrimary}
            onReorder={handleReorder}
            disabled={disabled || uploading}
          />
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Enviando...
        </div>
      )}

      {/* Global Error */}
      {Object.keys(errors).length > 0 && !selectedFiles.length && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Erros no upload
              </p>
              <ul className="text-xs text-red-700 dark:text-red-300 mt-1 space-y-1">
                {Object.entries(errors).map(([fileName, msg]) => (
                  <li key={fileName} className="flex items-center gap-1">
                    <span className="font-mono">{fileName}:</span>
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}