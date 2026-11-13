import { COMPANY } from './company';
import { getStaticSeo } from '@/seo/registry';

const home = getStaticSeo('/');

export const SEO_CONFIG = {
  title: home?.title || `${COMPANY.name} — Assessoria em RH, Recrutamento, Mão de Obra e Facilities`,
  description:
    home?.description ||
    'Assessoria em RH, recrutamento e seleção, mão de obra temporária e efetiva, terceirização e facilities. Mais eficiência para sua empresa.',
  keywords: [
    'J&S Empregos',
    'JS Empregos',
    'JSEmpregos',
    'assessoria em RH',
    'recrutamento e seleção',
    'mão de obra temporária',
    'mão de obra efetiva',
    'terceirização de serviços',
    'facilities',
    'vagas de emprego',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://jsempregos.com.br',
    siteName: COMPANY.brand || COMPANY.name,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jsempregos',
  },
  robots: {
    index: true,
    follow: true,
  },
} as const;

export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
}

export function getSeoMeta(meta: SeoMeta): Record<string, string> {
  const base = SEO_CONFIG;
  return {
    title: meta.title ?? base.title,
    description: meta.description ?? base.description,
    keywords: (meta.keywords ?? base.keywords).join(', '),
    'og:title': meta.title ?? base.title,
    'og:description': meta.description ?? base.description,
    'og:type': base.openGraph.type,
    'og:locale': base.openGraph.locale,
    'og:url': base.openGraph.url,
    'og:site_name': base.openGraph.siteName,
    'twitter:card': base.twitter.card,
    'twitter:site': base.twitter.site,
  };
}
