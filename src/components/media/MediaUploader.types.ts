export interface MediaAsset {
  id: string;
  bucket_id: string;
  storage_path: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  is_primary: boolean;
  sort_order: number;
  alt_text: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface MediaUploaderProps {
  entityType: 'company' | 'service' | 'partner' | 'supplier';
  entityId: string;
  purpose: 'logo' | 'hero' | 'card' | 'gallery';
  onUploadComplete?: (asset: MediaAsset) => void;
  onError?: (error: Error) => void;
  onDelete?: (assetId: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  showPreview?: boolean;
  className?: string;
  existingAssets?: MediaAsset[];
}