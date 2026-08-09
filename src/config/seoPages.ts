import { COMPANY } from './company';

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
}

export const SEO_PAGES: Record<string, PageSEO> = {
  '/': {
    title: `${COMPANY.name} — Assessoria em RH, Facilities e Terceirização`,
    description:
      'Assessoria em RH, recrutamento, mão de obra temporária e efetiva, terceirização e facilities. Mais eficiência para sua empresa.',
    keywords: [
      'assessoria em RH',
      'recrutamento',
      'seleção de pessoas',
      'mão de obra',
      'temporária',
      'efetiva',
      'vagas de emprego',
      'RH',
      'banco de talentos',
      'facilities',
      'terceirização',
    ],
    path: '/',
  },
  '/vagas': {
    title: `Vagas de Emprego — Encontre sua próxima oportunidade | ${COMPANY.name}`,
    description:
      'Confira centenas de vagas de emprego atualizadas diariamente. Encontre a oportunidade certa para seu perfil e candidate-se agora.',
    keywords: [
      'vagas de emprego',
      'empregos',
      'trabalho',
      'CLT',
      'temporário',
      'freelance',
      'vagas SP',
    ],
    path: '/vagas',
  },
  '/empresas': {
    title: `Recrutamento e Seleção para Empresas | Contratar Funcionários | ${COMPANY.name}`,
    description:
      'Encontramos os profissionais certos para sua empresa. Mão de obra temporária e efetiva, recrutamento seletivo e banco de talentos.',
    keywords: [
      'recrutamento para empresas',
      'contratar funcionários',
      'mão de obra temporária',
      'assessoria em rh',
      'seleção de pessoas',
      'banco de talentos',
    ],
    path: '/empresas',
  },
  '/candidatos': {
    title: `Encontre seu Emprego — Cadastre seu Currículo | ${COMPANY.name}`,
    description:
      'Cadastre seu currículo no Banco de Talentos e encontre as oportunidades compatíveis com seu perfil.',
    keywords: [
      'empregos',
      'currículo',
      'banco de talentos',
      'candidatura',
      'vagas de emprego',
    ],
    path: '/candidatos',
  },
  '/servicos': {
    title: `Serviços de RH e Recrutamento — Mão de Obra Temporária e Efetiva | ${COMPANY.name}`,
    description:
      'Soluções completas em RH: Recrutamento, seleção, mão de obra temporária e efetiva, assessoria em RH e facilities. Tudo para sua empresa.',
    keywords: [
      'serviços de RH',
      'recrutamento',
      'mão de obra temporária',
      'mão de obra efetiva',
      'hunting',
      'facilities',
      'terceirização',
    ],
    path: '/servicos',
  },
  '/trabalhe-conosco': {
    title: `Envie seu Currículo — Cadastre-se | ${COMPANY.name}`,
    description:
      'Cadastre seu currículo e candidate-se às vagas que combinam com seu perfil. Sua nova oportunidade começa aqui.',
    keywords: [
      'enviar currículo',
      'candidatura',
      'trabalhe conosco',
      'vagas de emprego',
      'cadastro',
    ],
    path: '/trabalhe-conosco',
  },
  '/processo-seletivo': {
    title: `Como Funciona o Processo Seletivo | ${COMPANY.name}`,
    description:
      'Entenda as etapas do nosso processo seletivo: cadastro, candidatura, avaliação e contratação.',
    keywords: ['processo seletivo', 'etapas', 'como funciona', 'recrutamento'],
    path: '/processo-seletivo',
  },
  '/sobre': {
    title: `Sobre Nós — ${COMPANY.name} | Assessoria em RH e Terceirização`,
    description: `Conheça a ${COMPANY.name}: assessoria em RH, recrutamento, mão de obra temporária e efetiva, terceirização e facilities.`,
    keywords: [
      'sobre nós',
      'história',
      'missão',
      'assessoria em RH',
      'terceirização',
      'facilities',
    ],
    path: '/sobre',
  },
  '/clientes': {
    title: `Clientes e Depoimentos | ${COMPANY.name}`,
    description:
      'Veja as empresas que já confiam na nossa agência e depoimentos de clientes satisfeitos.',
    keywords: ['clientes', 'depoimentos', 'empresas parceiras'],
    path: '/clientes',
  },
  '/contato': {
    title: `Fale Conosco | Contato | ${COMPANY.name}`,
    description:
      'Entre em contato com a nossa equipe. WhatsApp, e-mail e telefone para dúvidas sobre vagas, recrutamento e serviços.',
    keywords: ['contato', 'fale conosco', 'whatsapp', 'atendimento', 'suporte'],
    path: '/contato',
  },
  '/suporte': {
    title: `Suporte e Atendimento | ${COMPANY.name}`,
    description:
      'Tire suas dúvidas sobre nossos serviços, processos e oportunidades. Atendimento rápido via WhatsApp.',
    keywords: ['suporte', 'atendimento', 'dúvidas', 'ajuda', 'whatsapp'],
    path: '/suporte',
  },
  '/faq': {
    title: `Perguntas Frequentes | FAQ | ${COMPANY.name}`,
    description:
      'Tire suas dúvidas sobre nossos serviços, processos de recrutamento e oportunidades de emprego.',
    keywords: [
      'perguntas frequentes',
      'FAQ',
      'dúvidas',
      'recrutamento',
      'vagas',
    ],
    path: '/faq',
  },
  '/login': {
    title: `Login | Acesse sua Conta | ${COMPANY.name}`,
    description:
      'Acesse sua conta de candidato, empresa ou RH para acompanhar processos e vagas.',
    keywords: [
      'login',
      'entrar',
      'acessar conta',
      'dashboard',
      'candidato',
      'empresa',
    ],
    path: '/login',
  },
  '/blog': {
    title: `Blog | Dicas de Emprego e RH | ${COMPANY.name}`,
    description:
      'Artigos sobre recrutamento, carreira, dicas de emprego e tendências do RH.',
    keywords: ['blog', 'dicas de emprego', 'carreira', 'RH', 'recrutamento'],
    path: '/blog',
  },
};
