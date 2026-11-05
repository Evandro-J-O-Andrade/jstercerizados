export interface MediaPickerProps {
  entityType:
    'company' | 'service' | 'partner' | 'supplier' | 'job' | 'candidate';
  entityId: string;
  purpose: 'logo' | 'hero' | 'card' | 'gallery' | 'cover' | 'avatar' | 'banner';
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  showExisting?: boolean;
  onAssetSelect?: (asset: import('./MediaUploader.types').MediaAsset) => void;
  onUploadComplete?: (
    asset: import('./MediaUploader.types').MediaAsset,
  ) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  tenantId?: string;
}

export type { MediaAsset, MediaUploaderProps } from './MediaUploader.types';
