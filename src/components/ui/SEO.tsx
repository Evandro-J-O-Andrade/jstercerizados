import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SEO_CONFIG } from '@/config';
import { APP_CONFIG } from '@/config';
import {
  buildBreadcrumbSchema,
  buildJobPostingSchema,
  getOrganizationSchema,
  buildWebSiteSchema,
  buildWebPageSchema,
  SITE_URL,
} from '@/utils/schema';
import type { BreadcrumbItem } from '@/types/seo';

export interface ServiceSchemaInput {
  name: string;
  description: string;
  slug?: string;
  image?: string;
  providerName?: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  type?: 'WebSite' | 'Organization' | 'FAQPage' | 'Service' | 'Article' | 'WebPage';
  breadcrumbs?: BreadcrumbItem[];
  service?: ServiceSchemaInput;
  // Compat: se true e type Service, evita emitir LD-JSON aqui (página pode ter contrato próprio)
  suppressJsonLd?: boolean;
  jobPosting?: {
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
  };
}

function toAbsoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  const base = APP_CONFIG.url.replace(/\/$/, '');
  const path = value.startsWith('/') ? value : `/${value}`;
  return `${base}${path}`;
}

export function SEO({
  title,
  description,
  keywords,
  image,
  noindex = false,
  type = 'WebPage',
  breadcrumbs,
  jobPosting,
  service,
  suppressJsonLd = false,
}: SEOProps) {
  const location = useLocation();
  const baseUrl = APP_CONFIG.url.replace(/\/$/, '');
  const pathname = location.pathname || '/';
  const canonicalPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const url = `${baseUrl}${canonicalPath}`;
  const pageTitle = title ?? SEO_CONFIG.title;
  const pageDesc = description ?? SEO_CONFIG.description;
  const pageKeywords = keywords ?? SEO_CONFIG.keywords;
  const pageImage = toAbsoluteUrl(image ?? '/images/brand/og-image.svg');
  const ogType = type === 'Article' || jobPosting ? 'article' : (type === 'Service' ? 'website' : 'website');

  useEffect(() => {
    document.title = pageTitle;

    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const updateProperty = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', pageDesc);
    updateMeta('keywords', pageKeywords.join(', '));
    updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    updateProperty('og:title', pageTitle);
    updateProperty('og:description', pageDesc);
    updateProperty('og:url', url);
    updateProperty('og:image', pageImage);
    updateProperty('og:type', ogType);
    updateProperty('og:site_name', SEO_CONFIG.openGraph.siteName);
    updateProperty('og:locale', SEO_CONFIG.openGraph.locale);
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', pageTitle);
    updateMeta('twitter:description', pageDesc);
    updateMeta('twitter:image', pageImage);
    if (SEO_CONFIG.twitter?.site) updateMeta('twitter:site', SEO_CONFIG.twitter.site);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [pageTitle, pageDesc, pageKeywords, pageImage, noindex, ogType, url]);

  const graph: unknown[] = [];

  const org = getOrganizationSchema();
  delete (org as Record<string, unknown>)['@context'];
  (org as Record<string, unknown>)['@id'] = SITE_URL + '/#organization';
  graph.push(org);

  const site = buildWebSiteSchema() as unknown as Record<string, unknown>;
  delete site['@context'];
  site['@id'] = SITE_URL + '/#website';
  site['publisher'] = { '@id': SITE_URL + '/#organization' };
  graph.push(site);

  const pageNode = buildWebPageSchema({ url, name: pageTitle, description: pageDesc, type: type === 'FAQPage' ? 'FAQPage' : 'WebPage' }) as Record<string, unknown>;
  graph.push(pageNode);

  if (breadcrumbs && breadcrumbs.length > 0) {
    const bc = buildBreadcrumbSchema(breadcrumbs) as unknown as Record<string, unknown>;
    delete bc['@context'];
    graph.push(bc);
  }

  if (type === 'Service' && service) {
    const svc: Record<string, unknown> = {
      '@type': 'Service',
      name: service.name,
      description: service.description,
      url: url,
      provider: { '@id': SITE_URL + '/#organization' },
    };
    if (service.image) svc.image = service.image;
    graph.push(svc);
  }

  if (jobPosting) {
    const jp = buildJobPostingSchema(jobPosting) as unknown as Record<string, unknown> | null;
    if (jp) {
      delete jp['@context'];
      graph.push(jp);
    }
  }

  if (type === 'FAQPage') {
    // FAQPage como tipo do WebPage já sinalizado; mainEntity pode ser preenchido por página específica no futuro
  }

  if (suppressJsonLd) return null;

  const schemaOrg = { '@context': 'https://schema.org', '@graph': graph };

  return (
    <script
      type="application/ld+json"
      data-seo-runtime="1"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg).replace(/</g, '\\u003c') }}
    />
  );
}
