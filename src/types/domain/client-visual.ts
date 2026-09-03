import type { Company } from '@/types/domain/company';
import type { PublicCompanyByType } from '@/repositories/companies.repository';

export interface ClientVisual {
  id: string;
  name: string;
  logo: string | null;
  image: string | null;
  website: string | null;
  description: string | null;
  socials: {
    linkedin?: string;
    instagram?: string;
    [k: string]: string | undefined;
  } | null;
}

interface CompanyMetadata {
  hero_image_url?: string;
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

export function mapCompanyToClientVisual(company: Company): ClientVisual {
  const metadata = (company.metadata ?? {}) as CompanyMetadata;
  const heroImageUrl =
    typeof metadata.hero_image_url === 'string'
      ? metadata.hero_image_url
      : null;

  return {
    id: company.id,
    name: company.name,
    logo: company.logo_url,
    image: heroImageUrl,
    website: company.website,
    description: company.description ?? company.short_description,
    socials: company.socials
      ? {
          linkedin: company.socials.linkedin,
          instagram: company.socials.instagram,
        }
      : null,
  };
}

/**
 * Map a row from the public view `public_companies_by_type` to ClientVisual.
 * Fallback chain follows the decisions approved for Bloco 1 + Bloco 8:
 *   - logo:         media_assets (primary logo) -> companies.logo_url
 *   - image/hero:   media_assets (hero tag) -> row.image_url ->
 *                   relationship.metadata.hero_image_url
 *   - description:  row.description (relationship metadata desc -> companies.desc)
 *   - website:      row.website
 *   - socials:      row.socials (jsonb aggregated from company_social_links)
 */
export function mapPublicCompanyByTypeToClientVisual(
  row: PublicCompanyByType,
): ClientVisual {
  const meta = (row.relationship_metadata ?? {}) as CompanyMetadata;

  return {
    id: row.company_id,
    name: row.company_name,
    logo: row.logo_url,
    image: pickString(row.image_url, meta.hero_image_url),
    website: pickString(row.website, meta.website),
    description: pickString(row.description, meta.description),
    socials:
      row.socials && Object.keys(row.socials).length > 0 ? row.socials : null,
  };
}
