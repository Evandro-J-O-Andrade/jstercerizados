/**
 * MediaStorageContract — Contrato de armazenamento
 *
 * Define bucket, estrutura de caminhos e regras de armazenamento.
 * Documentos privados nunca recebem URLs públicas.
 */

export type MediaBucketId = 'public-media' | 'avatars' | 'private-documents' | 'bunker';

export interface MediaBucketConfig {
  id: MediaBucketId;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
  description: string;
}

export const MEDIA_BUCKETS: Record<MediaBucketId, MediaBucketConfig> = {
  'public-media': {
    id: 'public-media',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    description: 'Imagens públicas: logos, heroes, cards, galerias',
  },
  'avatars': {
    id: 'avatars',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    description: 'Avatares de usuários',
  },
  'private-documents': {
    id: 'private-documents',
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    description: 'Documentos privados: currículos, contratos, certificados',
  },
  'bunker': {
    id: 'bunker',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    description: 'Bucket único consolidado (futuro)',
  },
};

export function getBucketForPurpose(purpose: string): MediaBucketId {
  if (purpose === 'avatar') return 'avatars';
  if (purpose === 'cv' || purpose === 'document') return 'private-documents';
  return 'public-media';
}

export function buildStoragePath(
  entityType: string,
  entityId: string,
  purpose: string,
  fileExt: string,
): string {
  const uuid = crypto.randomUUID();
  return `${entityType}/${entityId}/${purpose}/${uuid}.${fileExt}`;
}

export function isPublicBucket(bucketId: MediaBucketId): boolean {
  return MEDIA_BUCKETS[bucketId]?.public ?? false;
}

export function validateStoragePath(path: string): boolean {
  if (!path || path.length === 0) return false;
  if (path.startsWith('/')) return false;
  if (path.includes('..')) return false;
  return true;
}