export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface JobPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'JobPosting';
  title: string;
  description: string;
  datePosted?: string;
  hiringOrganization: {
    '@type': 'Organization';
    name: string;
    url?: string;
    logo?: string;
  };
  jobLocation?: {
    '@type': 'Place';
    address: {
      '@type': 'PostalAddress';
      addressLocality?: string;
      addressRegion?: string;
      addressCountry: 'BR';
    };
  } | {
    '@type': 'Place';
    address: {
      '@type': 'PostalAddress';
      addressCountry: 'BR';
    };
  };
  employmentType?: string;
  baseSalary?: {
    '@type': 'MonetaryAmount';
    currency: 'BRL';
    value?: number;
    valueMax?: number;
    unit?: string;
  };
  validThrough?: string;
  jobLocationType?: 'TELECOMMUTE';
  applicantLocationRequirements?: unknown;
  jobBenefits?: string[];
  qualifications?: string;
  responsibilities?: string;
  url: string;
  identifier?: { '@type': 'PropertyValue'; name: string; value: string };
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  inLanguage?: string;
  alternateName?: string[];
  publisher?: {
    '@type': 'Organization';
    name: string;
  };
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description?: string;
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    availableLanguage: string;
  };
  sameAs?: string[];
}
