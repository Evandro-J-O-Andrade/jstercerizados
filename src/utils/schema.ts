import { COMPANY } from '@/config';
import type {
  BreadcrumbItem,
  BreadcrumbListSchema,
  JobPostingSchema,
  WebSiteSchema,
} from '@/types/seo';

const SITE_URL = 'https://jsempregos.com.br';
const BRAND_ALIASES = ['J&S Empregos', 'JS Empregos', 'JSEmpregos'];
// Perfis sociais oficiais confirmados (não inventar). Vazio até confirmação explícita por fonte autorizada.
const CONFIRMED_SAME_AS: string[] = [];

function toAbsUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  return `${SITE_URL}${href.startsWith('/') ? href : `/${href}`}`;
}

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
      item: toAbsUrl(item.href),
    })),
  };
}

export function buildWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: COMPANY.brand || 'J&S Empregos',
    alternateName: BRAND_ALIASES,
    url: SITE_URL + '/',
    description: COMPANY.description,
    inLanguage: 'pt-BR',
    publisher: {
      '@type': 'Organization',
      name: COMPANY.name,
    },
  };
}

export function buildServiceSchema(params: {
  name: string;
  description: string;
  slug: string;
  image?: string;
  providerName?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    url: `${SITE_URL}/servicos/${params.slug}`,
    provider: {
      '@type': 'Organization',
      name: params.providerName ?? COMPANY.name,
      url: SITE_URL + '/',
    },
  };
  if (params.image) schema.image = params.image;
  return schema;
}

export function buildJobPostingSchema(params: {
  title: string;
  description: string;
  datePosted?: string;
  validThrough?: string;
  hiringOrgName?: string;
  hiringOrgUrl?: string;
  hiringOrgLogo?: string;
  city?: string;
  state?: string;
  employmentType?: string;
  workLocationType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryUnit?: string;
  benefits?: string[];
  requirements?: string;
  responsibilities?: string;
  slug: string;
}): JobPostingSchema | null {
  const desc = (params.description || '').trim();
  const posted = params.datePosted;
  if (!params.title || !desc || !posted) return null; // requisitos mínimos: não emitir JobPosting inválido

  const orgName = (params.hiringOrgName || '').trim();
  // Empregador deve ser real/autorizado; se não houver dado confiável, sinaliza confidencial (evita inventar empresa)
  const hiringName = orgName && orgName.toLowerCase() !== COMPANY.name.toLowerCase() ? orgName : 'Confidencial';

  const schema: JobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: params.title,
    description: desc,
    datePosted: posted,
    hiringOrganization: {
      '@type': 'Organization',
      name: hiringName,
      ...(hiringName === COMPANY.name || hiringName === 'J&S Empregos' ? { url: SITE_URL + '/' } : (params.hiringOrgUrl ? { url: params.hiringOrgUrl } : {})),
      ...(params.hiringOrgLogo ? { logo: params.hiringOrgLogo } : {}),
    },
    url: `${SITE_URL}/vagas/${params.slug}`,
  };

  if (params.validThrough) schema.validThrough = params.validThrough;
  if (params.employmentType) schema.employmentType = params.employmentType;
  if (params.city || params.state) {
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(params.city ? { addressLocality: params.city } : {}),
        ...(params.state ? { addressRegion: params.state } : {}),
        addressCountry: 'BR',
      },
    };
  }
  if (params.workLocationType === 'TELECOMMUTE') schema.jobLocationType = 'TELECOMMUTE';
  if (params.salaryMin != null) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: params.salaryMin,
      ...(params.salaryMax != null ? { valueMax: params.salaryMax } : {}),
      unit: params.salaryUnit ?? 'MONTH',
    };
  }
  if (params.benefits && params.benefits.length > 0) schema.jobBenefits = params.benefits;
  if (params.requirements) schema.qualifications = params.requirements;
  if (params.responsibilities) schema.responsibilities = params.responsibilities;

  return schema;
}

export function getOrganizationSchema(): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'EmploymentAgency'],
    name: COMPANY.name,
    alternateName: BRAND_ALIASES,
    url: SITE_URL + '/',
    logo: `${SITE_URL}/images/global/brand/logo-js-empregos.png`,
    description: COMPANY.description,
    foundingDate: '2011',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${COMPANY.address.street}, ${COMPANY.address.number} ${COMPANY.address.complement}`.trim(),
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.state,
      ...(COMPANY.address.zip ? { postalCode: COMPANY.address.zip } : {}),
      addressCountry: 'BR',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: `+55${COMPANY.whatsapp}`,
        contactType: 'customer service',
        availableLanguage: 'Portuguese',
      },
      {
        '@type': 'ContactPoint',
        telephone: COMPANY.phone,
        contactType: 'sales',
        availableLanguage: 'Portuguese',
      },
    ],
    knowsAbout: [
      'Recrutamento e Seleção',
      'Mão de Obra Temporária',
      'Mão de Obra Efetiva',
      'Terceirização de Serviços',
      'Assessoria em RH',
      'Limpeza Profissional',
      'Segurança Patrimonial',
      'Portaria e Recepção',
      'Jardinagem e Paisagismo',
      'Zeladoria',
      'Facilities',
      'Departamento Pessoal',
      'Treinamento Corporativo',
    ],
    areaServed: [
      { '@type': 'City', name: 'São Paulo' },
      { '@type': 'City', name: 'Poá' },
      { '@type': 'State', name: 'São Paulo' },
      { '@type': 'Country', name: 'Brasil' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços J&S Empregos',
      itemListElement: COMPANY.businessAreas.map((area) => ({
        '@type': 'Offer',
        name: area,
        description: `Serviço de ${area} pela J&S Empregos LTDA`,
      })),
    },
  };
  if (CONFIRMED_SAME_AS.length) schema.sameAs = CONFIRMED_SAME_AS;
  return schema;
}

export function buildWebPageSchema(params: {
  url: string;
  name: string;
  description?: string;
  type?: string;
}) {
  return {
    '@type': params.type || 'WebPage',
    '@id': `${params.url}#webpage`,
    url: params.url,
    name: params.name,
    ...(params.description ? { description: params.description } : {}),
    inLanguage: 'pt-BR',
    isPartOf: { '@id': SITE_URL + '/#website' },
  };
}

export { SITE_URL, BRAND_ALIASES, CONFIRMED_SAME_AS };
