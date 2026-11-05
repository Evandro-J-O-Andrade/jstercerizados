/**
 * MediaPicker — Componente de seleção e reutilização de ativos
 *
 * Permite selecionar imagens já existentes na biblioteca da entidade
 * sem necessidade de upload duplicado. Consumidor da Célula Media.
 */

import { useState, useCallback, useEffect } from 'react';
import { Image, Search } from 'lucide-react';
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
      onError?.(
        err instanceof Error ? err : new Error('Falha ao carregar ativos'),
      );
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
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busar ativos existentes..."
                disabled={disabled || isLoading}
                className="bg-surface text-foreground w-full rounded-lg border py-2 pr-3 pl-9 text-sm"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center py-8">
              <Image className="h-6 w-6 animate-pulse" />
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleAssetClick(asset)}
                  disabled={disabled}
                  className={cn(
                    'relative overflow-hidden rounded-lg border-2 transition-all',
                    'hover:border-primary hover:shadow-md',
                    disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <img
                    src={asset.file_url}
                    alt={asset.alt_text || asset.file_name}
                    className="h-24 w-full object-cover"
                    loading="lazy"
                  />
                  {asset.is_primary && (
                    <span className="bg-primary absolute top-1 right-1 rounded px-1.5 py-0.5 text-xs text-white">
                      Principal
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center text-sm">
              <Image className="mx-auto mb-2 h-8 w-8 opacity-50" />
              Nenhum ativo encontrado para esta entidade.
            </div>
          )}
        </div>
      )}

      {/* Separador */}
      {showExisting && existingAssets.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="border-border flex-1 border-t" />
          <span className="text-muted-foreground text-xs">ou</span>
          <div className="border-border flex-1 border-t" />
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
