import type { MediaAsset } from '@/components/media/MediaUploader.types';
import { mediaAssetsRepository } from '@/repositories/media-assets.repository';

export type AvaEntityType = 'ava';

const AVA_ENTITY_TYPE: AvaEntityType = 'ava';

export async function findVideoAssetForTutorial(
  tenantId: string | null,
  tutorialId: string,
): Promise<MediaAsset | null> {
  if (!tenantId) return null;
  // entity_id em media_assets é UUID no schema real; tutorialId deve ser UUID válido.
  const assets = await mediaAssetsRepository.findAllByEntity(
    tenantId,
    AVA_ENTITY_TYPE,
    tutorialId,
  );
  return assets.find((a) => a.mime_type?.startsWith('video/')) ?? null;
}

export async function listVideoAssets(
  tenantId: string | null,
): Promise<MediaAsset[]> {
  if (!tenantId) return [];
  // Não usar entity_id textual ('video'): coluna é UUID no banco real e causa HTTP 400.
  // AVA associa mídia por tenant + entity_type; classificação de vídeo por MIME type.
  const assets = await mediaAssetsRepository.findAllByEntityType(
    tenantId,
    AVA_ENTITY_TYPE,
  );
  return assets.filter((a) => a.mime_type?.startsWith('video/'));
}

export async function findVideoAsset(
  tenantId: string | null,
  tutorialId: string,
): Promise<MediaAsset | null> {
  return findVideoAssetForTutorial(tenantId, tutorialId);
}

export const tutorialsRepository = {
  findVideoAssetForTutorial,
  listVideoAssets,
  findVideoAsset,
};

export type { MediaAsset };
