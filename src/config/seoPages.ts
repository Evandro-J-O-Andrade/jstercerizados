import { COMPANY } from './company';
import { STATIC_SEO_PAGES } from '@/seo/registry';

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  h1?: string;
}

const base: Record<string, PageSEO> = {
  '/': {
    title: `${COMPANY.name} — Assessoria em RH, Recrutamento, Mão de Obra e Facilities`,
    description:
      'Assessoria em RH, recrutamento e seleção, mão de obra temporária e efetiva, terceirização e facilities. Mais eficiência para sua empresa.',
    keywords: ['assessoria em RH', 'recrutamento', 'seleção de pessoas', 'mão de obra', 'facilities', 'terceirização', 'vagas de emprego'],
    path: '/',
  },
  '/vagas': {
    title: `Vagas de Emprego | ${COMPANY.name}`,
    description: 'Confira vagas de emprego publicadas pela J&S Empregos e candidate-se às oportunidades disponíveis.',
    keywords: ['vagas de emprego', 'empregos', 'trabalho', 'oportunidades'],
    path: '/vagas',
  },
  '/servicos': {
    title: `Serviços de RH e Terceirização | ${COMPANY.name}`,
    description: 'Conheça os serviços de recrutamento, mão de obra temporária e efetiva, terceirização e facilities da J&S Empregos.',
    keywords: ['serviços de RH', 'recrutamento', 'terceirização', 'facilities'],
    path: '/servicos',
  },
};

for (const p of STATIC_SEO_PAGES) {
  if (!base[p.path]) {
    base[p.path] = { title: p.title, description: p.description, path: p.path, h1: p.h1 };
  } else {
    base[p.path] = { ...base[p.path], title: p.title, description: p.description, h1: p.h1 };
  }
}

export const SEO_PAGES: Record<string, PageSEO> = base;
