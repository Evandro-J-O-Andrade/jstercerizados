import type { MediaAsset } from '@/components/media/MediaUploader.types';
import { mediaAssetsRepository } from '@/repositories/media-assets.repository';

export type AvaEntityType = 'ava';

const AVA_ENTITY_TYPE: AvaEntityType = 'ava';

export async function findVideoAssetForTutorial(
  tenantId: string | null,
  tutorialId: string,
): Promise<MediaAsset | null> {
  if (!tenantId) return null;
  try {
    const assets = await mediaAssetsRepository.findAllByEntity(
      tenantId,
      AVA_ENTITY_TYPE,
      tutorialId,
    );
    return assets.find((a) => a.mime_type?.startsWith('video/')) ?? null;
  } catch {
    return null;
  }
}

export async function listVideoAssets(
  tenantId: string | null,
): Promise<MediaAsset[]> {
  if (!tenantId) return [];
  try {
    const assets = await mediaAssetsRepository.findAllByEntity(
      tenantId,
      AVA_ENTITY_TYPE,
      'video',
    );
    return assets;
  } catch {
    return [];
  }
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
