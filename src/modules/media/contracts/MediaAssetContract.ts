/**
 * MediaAssetContract — Contrato do ativo
 *
 * Define a representação lógica de um ativo de mídia, independente do local
 * onde é consumido. A classificação de acesso é validada no backend.
 */

export type MediaVisibility = 'public' | 'private' | 'internal';
export type MediaEntityType =
  | 'company'
  | 'service'
  | 'partner'
  | 'supplier'
  | 'job'
  | 'blog_post'
  | 'page'
  | 'avatar'
  | 'document'
  | 'candidate'
  | 'person';

export type MediaPurpose =
  | 'logo'
  | 'hero'
  | 'card'
  | 'gallery'
  | 'cover'
  | 'avatar'
  | 'cv'
  | 'workplace'
  | 'banner';

export interface MediaAssetContract {
  id: string;
  tenantId: string;
  entityType: MediaEntityType;
  entityId: string;
  purpose: MediaPurpose;
  bucketId: string;
  storagePath: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
  fileHash: string | null;
  width: number | null;
  height: number | null;
  visibility: MediaVisibility;
  isPrimary: boolean;
  sortOrder: number;
  altText: string | null;
  title: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string | null;
}

export function validateMediaAsset(asset: Partial<MediaAssetContract>): string[] {
  const errors: string[] = [];
  if (!asset.id) errors.push('id é obrigatório');
  if (!asset.tenantId) errors.push('tenantId é obrigatório');
  if (!asset.entityType) errors.push('entityType é obrigatório');
  if (!asset.entityId) errors.push('entityId é obrigatório');
  if (!asset.bucketId) errors.push('bucketId é obrigatório');
  if (!asset.storagePath) errors.push('storagePath é obrigatório');
  if (!asset.fileName) errors.push('fileName é obrigatório');
  if (!asset.mimeType) errors.push('mimeType é obrigatório');
  return errors;
}

export function isPrivateAsset(asset: MediaAssetContract): boolean {
  return asset.visibility === 'private';
}

export function requiresSignedUrl(asset: MediaAssetContract): boolean {
  return isPrivateAsset(asset) || asset.bucketId === 'private-documents';
}