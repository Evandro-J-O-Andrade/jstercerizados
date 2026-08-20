export const JS_AI_KNOWLEDGE = {
  company: {
    name: 'J&S Empregos LTDA',
    positioning: 'Agência de Empregos e Assessoria em RH',
    site: 'https://jstercerizados.com.br',
    whatsapp: '5511968380592',
  },
  priorities: [
    'Mão de obra temporária',
    'Mão de obra efetiva',
    'Processo de RH',
    'Recrutamento e seleção',
  ],
  services: [
    'Mão de obra temporária',
    'Mão de obra efetiva',
    'Recrutamento e seleção',
    'Assessoria em RH',
    'Terceirização',
    'Facilities',
    'Limpeza',
    'Segurança patrimonial',
    'Portaria',
    'Controlador de acesso',
    'Jardinagem',
    'Zeladoria',
  ],
  candidates: {
    routes: [
      '/vagas',
      '/candidatos',
      '/trabalhe-conosco',
      '/processo-seletivo',
    ],
    guidance: [
      'Consultar vagas disponíveis em /vagas.',
      'Entender o processo seletivo em /processo-seletivo.',
      'Cadastrar currículo em /trabalhe-conosco.',
    ],
  },
  companies: {
    routes: ['/empresas', '/servicos', '/contato'],
    guidance: [
      'Explicar soluções de recrutamento, RH, mão de obra e facilities.',
      'Para orçamento, contratação ou disponibilidade, encaminhar para atendimento humano/comercial.',
    ],
  },
  faq: {
    route: '/faq',
    guidance:
      'Para perguntas frequentes, consultar /faq quando a resposta não estiver no contexto fornecido.',
  },
} as const;

export const JS_AI_KNOWLEDGE_TEXT = JSON.stringify(JS_AI_KNOWLEDGE, null, 2);
