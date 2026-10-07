import { X, Star, ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils';
import type { MediaAsset } from './MediaUploader.types';

interface PreviewProps {
  asset: MediaAsset;
  purpose: 'logo' | 'hero' | 'card' | 'gallery';
  isPrimary?: boolean;
  onRemove?: (assetId: string) => void;
  onSetPrimary?: (assetId: string) => void;
  onReorder?: (assetId: string, newSortOrder: number) => void;
  sortOrder?: number;
  disabled?: boolean;
  className?: string;
}

export function Preview({
  asset,
  purpose,
  isPrimary = false,
  onRemove,
  onSetPrimary,
  onReorder,
  sortOrder = 0,
  disabled = false,
  className,
}: PreviewProps) {
  const aspectRatio = purpose === 'hero' ? 'aspect-video' : purpose === 'card' ? 'aspect-[4/3]' : 'aspect-square';

  return (
    <div className={cn('relative group', className)}>
      <div className={cn('rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800', aspectRatio)}>
        <img
          src={asset.file_url}
          alt={asset.alt_text || `Imagem ${asset.file_name}`}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex flex-col items-start gap-1">
          {onSetPrimary && !isPrimary && (
            <button
              onClick={() => onSetPrimary?.(asset.id)}
              disabled={disabled}
              className={cn(
                'p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
                'hover:bg-primary/10 text-primary hover:text-primary',
                'transition-colors disabled:opacity-50',
                'shadow-sm'
              )}
              title="Definir como principal"
              aria-label="Definir como principal"
            >
              <Star className="w-4 h-4" fill="currentColor" />
            </button>
          )}

          {onRemove && (
            <button
              onClick={() => onRemove?.(asset.id)}
              disabled={disabled}
              className={cn(
                'p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
                'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700',
                'transition-colors disabled:opacity-50',
                'shadow-sm'
              )}
              title="Remover imagem"
              aria-label="Remover imagem"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {purpose === 'gallery' && onReorder && (
          <div className="flex flex-col items-end gap-1 pointer-events-auto">
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => onReorder?.(asset.id, parseInt(e.target.value, 10) || 0)}
              min={0}
              className="w-16 px-2 py-1 text-xs text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              disabled={disabled}
              aria-label="Ordem de exibição"
            />
            <button
              className="p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 shadow-sm"
              disabled={disabled}
              aria-label="Reordenar"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isPrimary && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-primary rounded-full shadow-sm">
            <Star className="w-3 h-3" fill="currentColor" />
            Principal
          </span>
        </div>
      )}

      {asset.alt_text && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs truncate pointer-events-none">
          {asset.alt_text}
        </div>
      )}
    </div>
  );
}