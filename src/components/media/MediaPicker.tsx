/**
 * MediaPicker — Componente de seleção e reutilização de ativos
 *
 * Permite selecionar imagens já existentes na biblioteca da entidade
 * sem necessidade de upload duplicado. Consumidor da Célula Media.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Image, Search, Upload, X } from 'lucide-react';
import { cn } from '@/utils';
import { MediaUploader } from './MediaUploader';
import { mediaAssetsRepository } from '@/repositories/media-assets.repository';
import type { MediaAsset } from './MediaUploader.types';
import type { MediaPickerProps } from './MediaPicker.types';

export function MediaPicker({
  entityType,
  entityId,
  purpose,
  multiple = false,
  maxFiles = purpose === 'gallery' ? 10 : 1,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMB = 10,
  showExisting = true,
  onAssetSelect,
  onUploadComplete,
  onError,
  disabled = false,
  className,
  tenantId,
}: MediaPickerProps) {
  const [existingAssets, setExistingAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadExistingAssets = useCallback(async () => {
    if (!tenantId || !showExisting) return;

    setIsLoading(true);
    try {
      const assets = await mediaAssetsRepository.findByEntity(
        tenantId,
        entityType as any,
        entityId,
        purpose as any,
      );
      setExistingAssets(assets);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Falha ao carregar ativos'));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, entityType, entityId, purpose, showExisting, onError]);

  useEffect(() => {
    loadExistingAssets();
  }, [loadExistingAssets]);

  const filteredAssets = existingAssets.filter((asset) =>
    asset.file_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAssetClick = useCallback(
    (asset: MediaAsset) => {
      if (disabled) return;
      onAssetSelect?.(asset);
    },
    [onAssetSelect, disabled],
  );

  const handleUploadComplete = useCallback(
    (asset: MediaAsset) => {
      setExistingAssets((prev) => [asset, ...prev]);
      onUploadComplete?.(asset);
    },
    [onUploadComplete],
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Seletor de arquivos existentes */}
      {showExisting && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busar ativos existentes..."
                disabled={disabled || isLoading}
                className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm bg-surface text-foreground"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Image className="h-6 w-6 animate-pulse" />
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleAssetClick(asset)}
                  disabled={disabled}
                  className={cn(
                    'relative rounded-lg overflow-hidden border-2 transition-all',
                    'hover:border-primary hover:shadow-md',
                    disabled && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <img
                    src={asset.file_url}
                    alt={asset.alt_text || asset.file_name}
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                  {asset.is_primary && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded">
                      Principal
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Nenhum ativo encontrado para esta entidade.
            </div>
          )}
        </div>
      )}

      {/* Separador */}
      {showExisting && existingAssets.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="flex-1 border-t border-border" />
        </div>
      )}

      {/* Upload de novos arquivos */}
      <MediaUploader
        entityType={entityType}
        entityId={entityId}
        purpose={purpose}
        onUploadComplete={handleUploadComplete}
        onError={onError}
        maxFiles={maxFiles}
        accept={accept}
        maxSizeMB={maxSizeMB}
        showPreview={true}
        disabled={disabled}
        existingAssets={existingAssets}
        multiple={multiple}
      />
    </div>
  );
}

export default MediaPicker;