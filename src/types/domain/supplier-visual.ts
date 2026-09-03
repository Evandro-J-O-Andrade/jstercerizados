import type { PublicCompanyByType } from '@/repositories/companies.repository';

/**
 * Visual shape used by the /fornecedores vitrine.
 * Same defensive contract as ClientVisual/PartnerVisual but typed separately
 * so the suppliers UI can evolve independently (e.g. catalog, products, etc).
 */
export interface SupplierVisual {
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
 * Map a row from the public view `public_companies_by_type` to SupplierVisual.
 * Only rows where relationship_type = 'supplier' should be mapped.
 */
export function mapPublicCompanyByTypeToSupplierVisual(
  row: PublicCompanyByType,
): SupplierVisual {
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
