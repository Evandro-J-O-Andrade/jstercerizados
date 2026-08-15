export type Intent =
  | 'how_to_register'
  | 'how_selection_works'
  | 'where_to_see_jobs'
  | 'how_to_hire'
  | 'rh_services'
  | 'request_quote'
  | 'human_support'
  | 'candidate'
  | 'company'
  | 'job_info'
  | 'hire'
  | 'unknown';

export type Department =
  'central' | 'rh' | 'financeiro' | 'comercial' | 'suporte';

const INTENT_PATTERNS: Array<{ intent: Intent; patterns: RegExp[] }> = [
  {
    intent: 'how_to_register',
    patterns: [
      /como\s+(?:faço\s+para\s+)?(?:me\s+)?cadastr(?:ar|o)\s+(?:meu\s+)?curr[ií]culo/i,
      /como\s+(?:faço\s+)?(?:me\s+)?cadastr(?:ar|o)/i,
      /cadastr(?:ar|o)\s+(?:meu\s+)?curr[ií]culo/i,
      /curr[ií]culo/i,
      /candidat(?:ar|o)/i,
      /me\s+cadastr(?:ar|o)/i,
      /how_to_register/i,
    ],
  },
  {
    intent: 'how_selection_works',
    patterns: [
      /como\s+funciona\s+o\s+processo\s+seletivo/i,
      /processo\s+seletivo/i,
      /etapas?\s+do\s+processo/i,
      /sele[cç][aã]o/i,
      /how_selection_works/i,
    ],
  },
  {
    intent: 'where_to_see_jobs',
    patterns: [
      /onde\s+(?:vejo|posso\s+ver|encont(?:ro|ar))\s+(?:as\s+)?vagas/i,
      /vagas?\s+dispon[íi]veis/i,
      /oportunidades?\s+de\s+trabalho/i,
      /where_to_see_jobs/i,
    ],
  },
  {
    intent: 'how_to_hire',
    patterns: [
      /como\s+(?:minha\s+empresa\s+)?pode\s+contratar/i,
      /contratar\s+profissionais/i,
      /como\s+contratar/i,
      /how_to_hire/i,
    ],
  },
  {
    intent: 'rh_services',
    patterns: [
      /servi[çc]os?\s+de\s+rh/i,
      /recrutamento\s+e\s+sele[cç][aã]o/i,
      /assessoria\s+em\s+rh/i,
      /processo\s+de\s+rh/i,
      /rh_services/i,
    ],
  },
  {
    intent: 'request_quote',
    patterns: [
      /solicitar\s+or[çc]amento/i,
      /or[çc]amento/i,
      /proposta\s+comercial/i,
      /request_quote/i,
    ],
  },
  {
    intent: 'job_info',
    patterns: [
      /informa[çc][õo]es?\s+sobre\s+(?:uma\s+)?vaga/i,
      /detalhes?\s+da\s+vaga/i,
      /vaga\s+de/i,
      /job_info/i,
    ],
  },
  {
    intent: 'human_support',
    patterns: [
      /human_support/i,
      /atendimento\s+humano/i,
      /falar\s+com\s+atendente/i,
      /atendente\s+humano/i,
    ],
  },
];

const DEPARTMENT_PATTERNS: Array<{
  department: Department;
  patterns: RegExp[];
}> = [
  {
    department: 'rh',
    patterns: [
      /rh\b/i,
      /recursos?\s+humanos/i,
      /curr[ií]culo/i,
      /candidato/i,
      /vaga/i,
      /sele[cç][aã]o/i,
    ],
  },
  {
    department: 'financeiro',
    patterns: [
      /financeiro/i,
      /financeira/i,
      /boleto/i,
      /pagamento/i,
      /fatura/i,
      /nota\s+fiscal/i,
    ],
  },
  {
    department: 'comercial',
    patterns: [
      /comercial/i,
      /or[çc]amento/i,
      /proposta/i,
      /contratar/i,
      /servi[çc]o/i,
    ],
  },
  {
    department: 'suporte',
    patterns: [
      /suporte/i,
      /ajuda/i,
      /problema/i,
      /erro/i,
      /d[úu]vida/i,
      /assist[êe]ncia/i,
    ],
  },
  {
    department: 'central',
    patterns: [
      /central\s+de\s+atendimento/i,
      /atendimento\s+geral/i,
      /falar\s+com\s+algu[eé]m/i,
      /atendente/i,
      /humano/i,
    ],
  },
];

const INTERNAL_KEYS = [
  'how_to_register',
  'how_selection_works',
  'where_to_see_jobs',
  'how_to_hire',
  'rh_services',
  'request_quote',
  'human_support',
  'candidate',
  'company',
  'job_info',
  'hire',
  'unknown_intent',
  'human_handoff',
  'request_human',
  'internal_error',
  'tool_error',
  'supabase_error',
  'zod_error',
  'fallback',
  'intent',
  'action',
  'tool',
  'route',
];

const INTENT_REPLIES: Record<Intent, string> = {
  how_to_register:
    'Para cadastrar seu currículo, acesse a área de candidatos e preencha seus dados. Depois, você poderá acompanhar suas candidaturas e oportunidades disponíveis.',
  how_selection_works:
    'Nosso processo seletivo é simples: cadastre seu currículo, escolha as áreas de interesse e nossa equipe entrará em contato caso haja compatibilidade com as vagas.',
  where_to_see_jobs:
    'Você pode ver todas as vagas disponíveis na página de Vagas do nosso site. Lá também é possível se candidatar diretamente.',
  how_to_hire:
    'Para contratar profissionais, você pode solicitar um orçamento pelo WhatsApp ou pelo formulário de divulgar vaga. Nossa equipe comercial entrará em contato em até 24 horas.',
  rh_services:
    'Oferecemos recrutamento e seleção, mão de obra temporária e efetiva, assessoria em RH e terceirização. Quer detalhes de algum serviço específico?',
  request_quote:
    'Você pode solicitar um orçamento pelo WhatsApp ou pelo formulário de contato. Informe qual serviço precisa e nossa equipe comercial enviará uma proposta.',
  human_support:
    'Claro! Vou encaminhar você para o atendimento humano. Aguarde um instante.',
  candidate:
    'Se você é candidato, pode cadastrar seu currículo na área de candidatos e acompanhar as vagas disponíveis.',
  company:
    'Se você é empresa, pode publicar vagas ou solicitar serviços de RH. Nossa equipe comercial está pronta para atender.',
  job_info:
    'Você pode ver todas as vagas disponíveis na página de Vagas do nosso site. Lá também é possível se candidatar.',
  hire: 'Para contratar profissionais, solicite um orçamento pelo WhatsApp ou pelo formulário de divulgar vaga. Nossa equipe entrará em contato em até 24 horas.',
  unknown:
    'Obrigado pela sua mensagem! Em breve um atendente irá te responder. Enquanto isso, você pode escolher uma das opções abaixo:',
};

const DEPARTMENT_REPLIES: Record<Department, string> = {
  central:
    'Vou encaminhar você para a Central de Atendimento. Um atendente irá te atender em instantes.',
  rh: 'Vou encaminhar você para o atendimento de RH. Nossa equipe de Recursos Humanos irá te atender.',
  financeiro:
    'Vou encaminhar você para o atendimento financeiro. Nossa equipe financeira irá te atender.',
  comercial:
    'Vou encaminhar você para o atendimento comercial. Nossa equipe comercial irá te atender.',
  suporte:
    'Vou encaminhar você para o atendimento de suporte. Nossa equipe de suporte irá te atender.',
};

function detectIntent(input: string): Intent {
  const normalized = input.toLowerCase().trim();

  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return intent;
      }
    }
  }

  return 'unknown';
}

function detectDepartment(input: string): Department {
  const normalized = input.toLowerCase().trim();

  for (const { department, patterns } of DEPARTMENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return department;
      }
    }
  }

  return 'central';
}

function containsInternalKey(input: string): boolean {
  const normalized = input.toLowerCase();
  return INTERNAL_KEYS.some((key) => normalized.includes(key.toLowerCase()));
}

export function normalizeChatResponse(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return 'Obrigado pela sua mensagem! Em breve um atendente irá te responder.';
  }

  if (containsInternalKey(trimmed)) {
    const intent = detectIntent(trimmed);
    return INTENT_REPLIES[intent];
  }

  return trimmed;
}

export function detectChatIntent(input: string): Intent {
  return detectIntent(input);
}

export function detectChatDepartment(input: string): Department {
  return detectDepartment(input);
}

export function getHumanHandoffMessage(department: Department): string {
  return DEPARTMENT_REPLIES[department];
}

export function getIntentReply(intent: Intent): string {
  return INTENT_REPLIES[intent];
}
