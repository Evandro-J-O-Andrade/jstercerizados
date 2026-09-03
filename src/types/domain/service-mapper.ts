import type { Service, ProcessStep, ServiceCta } from '@/types/common';
import type {
  PublicServiceV1,
  PublicServiceCategory,
  PublicServiceGalleryItem,
} from '@/repositories/services.repository';

const VALID_CATEGORIES: PublicServiceCategory[] = [
  'rh',
  'facilities',
  'terceirizacao',
];

/**
 * Convert a row from the public view `public_services_v1` into the legacy
 * `Service` shape consumed by /servicos and /servicos/:slug pages.
 *
 * This preserves the exact UI approved by the client — only the data source
 * changes from MOCK to DB. Mapping rules (Bloco 3 + Bloco 5B/5C enrichment):
 *   - name            -> title
 *   - short_description -> shortDescription
 *   - description     -> description
 *   - card_image_url  -> image (with hero_image_url as fallback)
 *   - benefits (jsonb) -> string[]
 *   - icon            -> icon
 *   - category        -> category
 *   - process_steps   -> processSteps (jsonb to ProcessStep[])
 *   - cta_*           -> cta (ServiceCta)
 *   - gallery (jsonb) -> gallery (string[])
 *
 * The candidate category is intentionally not part of the public catalog.
 */
export function mapPublicServiceV1ToService(
  row: PublicServiceV1,
): Service | null {
  if (!row.slug || !row.name) return null;

  const category = normalizeCategory(row.category);
  if (!category) return null;

  const image = pickString(row.card_image_url, row.hero_image_url) ?? '';

  return {
    id: row.id,
    slug: row.slug,
    title: row.name,
    description: row.description ?? '',
    shortDescription: row.short_description ?? '',
    benefits: parseBenefitList(row.benefits),
    image,
    gallery: parseGallery(row.gallery),
    icon: row.icon ?? 'shield',
    category,
    processSteps: parseProcessSteps(row.process_steps),
    cta: parseCta(row),
  };
}

function normalizeCategory(value: string | null): Service['category'] | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if ((VALID_CATEGORIES as string[]).includes(lower)) {
    return lower as PublicServiceCategory;
  }
  return null;
}

function pickString(...candidates: Array<unknown>): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return null;
}

function parseBenefitList(benefits: unknown): string[] {
  if (!benefits) return [];
  if (Array.isArray(benefits)) {
    return benefits
      .filter((b): b is string => typeof b === 'string')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
  }
  if (typeof benefits === 'string') {
    // Supabase PostgREST returns jsonb columns as JSON-encoded strings when
    // the value was originally an array. Try to parse first; fall back to
    // a free-text split (legacy text format).
    const trimmed = benefits.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((b): b is string => typeof b === 'string')
            .map((b) => b.trim())
            .filter((b) => b.length > 0);
        }
      } catch {
        // fall through to comma split
      }
    }
    return benefits
      .split(/[,;\n•]/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
  }
  if (typeof benefits === 'object' && benefits !== null) {
    const list = (benefits as { items?: unknown }).items;
    if (Array.isArray(list)) {
      return list
        .filter((b): b is string => typeof b === 'string')
        .map((b) => b.trim())
        .filter((b) => b.length > 0);
    }
  }
  return [];
}

function parseProcessSteps(value: unknown): ProcessStep[] | undefined {
  if (!value) return undefined;
  let list: unknown[] = [];
  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === 'object' && value !== null) {
    const maybe = (value as { items?: unknown }).items;
    if (Array.isArray(maybe)) list = maybe;
  } else if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      return undefined;
    }
  }
  if (list.length === 0) return undefined;

  const normalized: ProcessStep[] = [];
  list.forEach((item, index) => {
    if (item == null) return;
    if (typeof item === 'object') {
      const o = item as Record<string, unknown>;
      const title = pickString(o.title, o.name);
      const description = pickString(o.description, o.text);
      if (title && description) {
        normalized.push({
          step:
            pickString(o.step, o.number) ?? String(index + 1).padStart(2, '0'),
          title,
          description,
        });
      }
    } else if (typeof item === 'string') {
      const parts = item.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        normalized.push({
          step: String(index + 1).padStart(2, '0'),
          title: parts[0],
          description: parts.slice(1).join(' '),
        });
      }
    }
  });

  return normalized.length > 0 ? normalized : undefined;
}

function parseCta(row: PublicServiceV1): ServiceCta | undefined {
  const title = pickString(row.cta_title);
  if (!title) return undefined;
  return {
    title,
    description: pickString(row.cta_description) ?? undefined,
    buttonText: pickString(row.cta_button_text) ?? undefined,
    buttonUrl: pickString(row.cta_button_url) ?? undefined,
  };
}

function parseGallery(value: PublicServiceGalleryItem[] | null): string[] {
  if (!value || !Array.isArray(value)) return [];
  return value
    .filter(
      (g): g is PublicServiceGalleryItem =>
        g != null && typeof g === 'object' && typeof g.url === 'string',
    )
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((g) => g.url)
    .filter((u) => u.length > 0);
}
