import { COMPANY } from './company';

export const SEO_CONFIG = {
  title: `${COMPANY.name} — Assessoria em RH, Recrutamento, Mão de Obra, Terceirização e Facilities`,
  description:
    'J&S Empregos LTDA: 15+ anos de excelência em assessoria em RH, recrutamento e seleção, mão de obra temporária e efetiva, terceirização de serviços e facilities. Atendemos empresas, condomínios, indústrias, hospitais, escolas e comércio em 50 cidades.',
  keywords: [
    'J&S Empregos',
    'J&S Terceirizados',
    'assessoria em RH',
    'recrutamento e seleção',
    'mão de obra temporária',
    'mão de obra efetiva',
    'terceirização de mão de obra',
    'terceirização de serviços',
    'facilities',
    'limpeza profissional',
    'portaria e recepção',
    'jardinagem e paisagismo',
    'zeladoria',
    'segurança patrimonial',
    'empresa de RH',
    'agência de empregos',
    'vagas de emprego',
    'contratação de profissionais',
    'departamento pessoal',
    'treinamento corporativo',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://jsempregos.com.br',
    siteName: COMPANY.name,
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
