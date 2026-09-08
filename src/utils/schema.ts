import { COMPANY, SOCIAL_LINKS } from '@/config';
import type {
  BreadcrumbItem,
  BreadcrumbListSchema,
  JobPostingSchema,
  WebSiteSchema,
} from '@/types/seo';

const SITE_URL = 'https://www.jsempregos.com.br';

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export function buildWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: COMPANY.name,
    url: SITE_URL,
    description: COMPANY.description,
    inLanguage: 'pt-BR',
    publisher: {
      '@type': 'Organization',
      name: COMPANY.name,
    },
  };
}

export function buildJobPostingSchema(params: {
  title: string;
  description: string;
  datePosted?: string;
  validThrough?: string;
  hiringOrgName: string;
  hiringOrgUrl?: string;
  hiringOrgLogo?: string;
  city?: string;
  state?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryUnit?: string;
  benefits?: string[];
  requirements?: string;
  responsibilities?: string;
  slug: string;
}): JobPostingSchema {
  const schema: JobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: params.title,
    description: params.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: params.hiringOrgName,
      url: params.hiringOrgUrl ?? SITE_URL,
      logo: params.hiringOrgLogo,
    },
    url: `${SITE_URL}/vagas/${params.slug}`,
  };

  if (params.datePosted) schema.datePosted = params.datePosted;
  if (params.validThrough) schema.validThrough = params.validThrough;
  if (params.city || params.state) {
    schema.jobLocation = {
      '@type': 'PostalAddress',
      addressLocality: params.city,
      addressRegion: params.state,
      addressCountry: 'BR',
    };
  }
  if (params.employmentType) schema.employmentType = params.employmentType;
  if (params.salaryMin != null) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: params.salaryMin,
      valueMax: params.salaryMax,
      unit: params.salaryUnit ?? 'MONTH',
    };
  }
  if (params.benefits && params.benefits.length > 0) {
    schema.jobBenefits = params.benefits;
  }
  if (params.requirements) schema.requirements = params.requirements;
  if (params.responsibilities)
    schema.responsibilities = params.responsibilities;

  return schema;
}

export function getOrganizationSchema(): {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint: {
    '@type': string;
    telephone: string;
    contactType: string;
    availableLanguage: string;
  };
  sameAs: string[];
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY.name,
    url: SITE_URL,
    logo: `${SITE_URL}/images/global/brand/logo-js-empregos.png`,
    description: COMPANY.description,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+55${COMPANY.whatsapp}`,
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    },
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.linkedin,
    ],
  };
}
