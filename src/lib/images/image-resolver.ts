import { SERVICE_IMAGES } from '@/content/assets';
import { IMAGE_FALLBACKS } from '@/config/imageFallbacks';
import { SERVICE_IMAGE_MAP } from './service-image-map';

/**
 * Prioridades de resolução (não substitui SafeImage; apenas resolve src):
 * 1. URL/string válida (http(s) ou caminho /images/* proveniente de fonte confiável - ex.: media_assets)
 * 2. Mapeamento local explícito por slug/entity
 * 3. SERVICE_IMAGES legado (compatibilidade retroativa)
 * 4. fallback por categoria (IMAGE_FALLBACKS)
 * 5. fallback global (IMAGE_FALLBACKS.global)
 */

export const GALLERY_PLACEHOLDERS = [
  '/images/servicos/gallery-01.svg',
  '/images/servicos/gallery-02.svg',
  '/images/servicos/gallery-03.svg',
  '/images/servicos/gallery-04.svg',
] as const;

function isLocalImagePath(p: unknown): p is string {
  if (typeof p !== 'string') return false;
  const s = p.trim();
  if (s.length === 0) return false;
  if (s.startsWith('http://') || s.startsWith('https://')) return true;
  if (s.startsWith('/images/')) return true;
  return false;
}

export function resolveImagePath(
  input: unknown,
  opts?: {
    slug?: string;
    fallbackType?: keyof typeof IMAGE_FALLBACKS;
  },
): string {
  // 1. URL/caminho válido
  if (isLocalImagePath(input)) {
    return (input as string).trim();
  }

  // 2. Mapeamento local por slug
  if (opts?.slug) {
    const key = opts.slug;
    const mapped = SERVICE_IMAGE_MAP[key];
    if (mapped?.cover) {
      return mapped.cover;
    }
  }

  // 3. SERVICE_IMAGES legado
  if (opts?.slug) {
    const key = opts.slug as keyof typeof SERVICE_IMAGES;
    const legacy = SERVICE_IMAGES[key];
    if (typeof legacy === 'string' && legacy.trim().length > 0) {
      return legacy.trim();
    }
  }

  // 4. fallback por categoria
  if (opts?.fallbackType && IMAGE_FALLBACKS[opts.fallbackType]) {
    return IMAGE_FALLBACKS[opts.fallbackType];
  }

  // 5. fallback global
  return IMAGE_FALLBACKS.global;
}

export function resolveServiceCover(
  input: unknown,
  opts?: {
    slug?: string;
    fallbackType?: keyof typeof IMAGE_FALLBACKS;
  },
): string {
  if (opts?.slug) {
    const mapped = SERVICE_IMAGE_MAP[opts.slug];
    if (mapped?.cover) {
      return mapped.cover;
    }
  }
  return resolveImagePath(input, opts);
}

export function resolveServiceGallery(
  gallery: unknown,
  opts?: {
    slug?: string;
    fallbackType?: keyof typeof IMAGE_FALLBACKS;
  },
): string[] {
  // 1. Galeria válida vinda do banco (array de strings)
  if (Array.isArray(gallery)) {
    const valid = gallery
      .filter((g): g is string => typeof g === 'string')
      .map((g) => g.trim())
      .filter((g) => g.length > 0 && isLocalImagePath(g));
    if (valid.length > 0) {
      return valid;
    }
  }

  // 2. Mapeamento local confirmado
  if (opts?.slug) {
    const mapped = SERVICE_IMAGE_MAP[opts.slug];
    if (mapped?.gallery && mapped.gallery.length > 0) {
      return mapped.gallery;
    }
  }

  // 3. Fallbacks existentes (placeholders) - identificados como placeholders
  return [...GALLERY_PLACEHOLDERS];
}
