import { cn } from '@/utils';
import { Preview } from './Preview';
import type { MediaAsset } from './MediaUploader.types';

interface GalleryGridProps {
  assets: MediaAsset[];
  primaryAssetId?: string | null;
  onRemove?: (assetId: string) => void;
  onSetPrimary?: (assetId: string) => void;
  onReorder?: (assetId: string, newSortOrder: number) => void;
  disabled?: boolean;
  className?: string;
}

export function GalleryGrid({
  assets,
  primaryAssetId,
  onRemove,
  onSetPrimary,
  onReorder,
  disabled = false,
  className,
}: GalleryGridProps) {
  if (assets.length === 0) {
    return (
      <div className={cn('grid gap-4', className)}>
        <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
          <p className="font-medium">Nenhuma imagem na galeria</p>
          <p className="text-sm">Adicione imagens usando o seletor acima</p>
        </div>
      </div>
    );
  }

  const sortedAssets = [...assets].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={cn('grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5', className)}>
      {sortedAssets.map((asset) => (
        <Preview
          key={asset.id}
          asset={asset}
          purpose="gallery"
          isPrimary={asset.id === primaryAssetId}
          onRemove={onRemove}
          onSetPrimary={onSetPrimary}
          onReorder={onReorder}
          sortOrder={asset.sort_order}
          disabled={disabled}
        />
      ))}
    </div>
  );
}