import { COMPANY } from './company';
export const SEO_CONFIG = {
    title: `${COMPANY.name} — Assessoria em RH, Recrutamento, Mão de Obra e Facilities`,
    description: COMPANY.description,
    keywords: [
        'recrutamento',
        'seleção de pessoas',
        'mão de obra temporária',
        'mão de obra efetiva',
        'terceirização',
        'facilities',
        'limpeza',
        'jardinagem',
        'portaria',
        'assessoria em RH',
        'RH',
        'vagas de emprego',
        'segurança patrimonial',
    ],
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: 'https://jsterceirizados.com.br',
        siteName: COMPANY.name,
    },
    twitter: {
        card: 'summary_large_image',
        site: '@jsterceirizados',
    },
    robots: {
        index: true,
        follow: true,
    },
};
export function getSeoMeta(meta) {
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
