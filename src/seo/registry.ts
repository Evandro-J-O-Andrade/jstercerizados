import registry from './public-seo-registry.json';

export interface StaticSeoPage {
  id: string;
  path: string;
  type: string;
  indexable: boolean;
  sitemap: string;
  changefreq: string;
  priority: string;
  h1: string;
  title: string;
  description: string;
}

export const SEO_REGISTRY = registry as {
  siteUrl: string;
  tenantSlug: string;
  brand: { name: string; shortName: string; alternateNames: string[] };
  staticPages: StaticSeoPage[];
};

export const STATIC_SEO_PAGES = SEO_REGISTRY.staticPages;
export const STATIC_SEO_BY_PATH = new Map(STATIC_SEO_PAGES.map((p) => [p.path, p]));

export function getStaticSeo(pathname: string): StaticSeoPage | undefined {
  const key = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/';
  return STATIC_SEO_BY_PATH.get(key);
}

export const SITE_URL = SEO_REGISTRY.siteUrl;
export const TENANT_SLUG = SEO_REGISTRY.tenantSlug;
export const BRAND = SEO_REGISTRY.brand;
