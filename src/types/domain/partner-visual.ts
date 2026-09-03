import type { PublicCompanyByType } from '@/repositories/companies.repository';

/**
 * Visual shape used by the /parceiros vitrine.
 * Same defensive contract as ClientVisual but typed separately so
 * a future evolution of clientes does not silently change the partners UI.
 */
export interface PartnerVisual {
  id: string;
  name: string;
  logo: string | null;
  image: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  socials: {
    linkedin?: string;
    instagram?: string;
    [k: string]: string | undefined;
  } | null;
}

interface CompanyMetadata {
  hero_image_url?: string;
  description?: string;
  website?: string;
  [key: string]: unknown;
}

function pickString(...candidates: Array<unknown>): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return null;
}

/**
 * Map a row from the public view `public_companies_by_type` to PartnerVisual.
 * Only rows where relationship_type = 'partner' should be mapped.
 */
export function mapPublicCompanyByTypeToPartnerVisual(
  row: PublicCompanyByType,
): PartnerVisual {
  const meta = (row.relationship_metadata ?? {}) as CompanyMetadata;

  return {
    id: row.company_id,
    name: row.company_name,
    logo: row.logo_url,
    image: pickString(row.image_url, meta.hero_image_url),
    website: pickString(row.website, meta.website),
    description: pickString(row.description, meta.description),
    industry: row.industry,
    socials:
      row.socials && Object.keys(row.socials).length > 0 ? row.socials : null,
  };
}
