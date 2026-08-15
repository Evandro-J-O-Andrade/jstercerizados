import type { Vaga } from '@/types/common';

export const mockVagas: Vaga[] = [
  {
    id: '1',
    slug: 'analista-rh-folha-de-pagamento',
    titulo: 'Analista de RH Folha de pagamento',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 5000,
    modalidade: 'PRESENCIAL',
    area: 'Recursos Humanos',
    workload: '40h',
    workSchedule: '8h às 17h, segunda a sexta-feira',
    beneficios: [
      'Vale refeição',
      'Vale transporte',
      'Convênio Médico',
      'Convênio Odontológico',
      'Seguro de Vida',
    ],
    responsibilities:
      'Processamento mensal da folha, cálculos de salários, férias, 13º salário, encargos sociais, cálculos e conferências de INSS e FGTS, conciliações bancárias, guias de recolhimento, envio de informações aos sistemas governamentais, organização de documentos, relatórios gerenciais e legais, cumprimento da legislação trabalhista e previdenciária, atendimento aos colaboradores, interface com fornecedores de benefícios e sistemas, atuação conjunta com Contabilidade, Financeiro e Jurídico, confidencialidade das informações.',
    requisitos:
      'Graduação concluída (obrigatório). Experiência com rotinas de folha. Conhecimento de salários, férias, 13º e rescisões. Conhecimento em legislação trabalhista e previdenciária.',
    descricao:
      'Responsável pelo processamento mensal da folha de pagamento, cálculos de salários, férias, 13º salário e encargos sociais.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-01T10:00:00Z',
  },
  {
    id: '2',
    slug: 'ajudante-geral',
    titulo: 'Ajudante geral',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 2112.28,
    modalidade: 'PRESENCIAL',
    area: 'Administração de Empresas',
    workload: '44h',
    workSchedule: 'Segunda a sexta, 7h40 às 17h28',
    beneficios: ['Vale Transporte'],
    responsibilities:
      'Suporte às atividades operacionais, carga e descarga, apoio à produção e logística, organização, normas de segurança.',
    requisitos: 'Ensino Médio concluído. Experiência mínima de 1 ano.',
    descricao:
      'Profissional para suporte às atividades operacionais, carga e descarga, apoio à produção e logística.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-02T09:00:00Z',
  },
  {
    id: '3',
    slug: 'pintor-i',
    titulo: 'Pintor I',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'JUNIOR',
    salarioMin: 15.56,
    modalidade: 'PRESENCIAL',
    area: 'Produção/Fabricação',
    workload: '44h',
    workSchedule: 'Segunda a sábado, 15h10 às 23h19, com 1h de refeição',
    beneficios: ['Almoço no local', 'Vale transporte', 'Fretado'],
    responsibilities:
      'Preparação e pintura de superfícies metálicas, remoção de sujeira, oxidação e incrustações, aplicação de tinta, preparação de tintas, solventes e catalisadores, manutenção de máquinas e ferramentas.',
    requisitos: 'Ensino Médio concluído. Experiência na área.',
    descricao:
      'Profissional para preparação e pintura de superfícies metálicas em linha de produção.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-03T08:00:00Z',
  },
  {
    id: '4',
    slug: 'auxiliar-de-limpeza',
    titulo: 'Auxiliar de Limpeza',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'JUNIOR',
    modalidade: 'PRESENCIAL',
    area: 'Industrial',
    workload: '44h',
    beneficios: [
      'Vale Transporte',
      'Restaurante na empresa',
      'Assistência Médica após efetivação (Intermédica)',
      'Assistência Odontológica após efetivação (Porto Seguro)',
      'Convênio Farmácia',
      'Convênio Facil Card',
      'Convênio SESI',
      'Convênio Faculdade',
    ],
    responsibilities:
      'Limpeza de áreas administrativas e produtivas, banheiros, vestiários, refeitório, escritórios, descarte de resíduos, abastecimento de materiais de higiene, limpeza de vidros, móveis e equipamentos, apoio em áreas de produção, conservação dos equipamentos, comunicação de irregularidades, cumprimento das normas de segurança e EPIs.',
    descricao:
      'Profissional para limpeza de áreas administrativas e produtivas, com benefícios após efetivação.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-04T07:00:00Z',
  },
  {
    id: '5',
    slug: 'auxiliar-de-marcenaria',
    titulo: 'Auxiliar de marcenaria',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'JUNIOR',
    salarioMin: 3000,
    modalidade: 'PRESENCIAL',
    area: 'Industrial',
    workload: '220h',
    beneficios: ['Alimentação', 'Vale Transporte', 'Pagamento de Horas Extras'],
    responsibilities:
      'Fabricação, montagem, acabamento, montagem e desmontagem de estandes, cenários, painéis, mobiliários, cortes, ajustes, lixamento, instalação, operação de máquinas, reparos, organização e transporte de materiais, cumprimento de cronogramas, normas de segurança.',
    requisitos:
      'Disponibilidade para viagens. Disponibilidade para período noturno. Disponibilidade para finais de semana e feriados quando necessário.',
    descricao:
      'Profissional para fabricação, montagem e acabamento de estandes, cenários e mobiliários.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-05T08:00:00Z',
  },
  {
    id: '6',
    slug: 'eletricista-de-instalacao',
    titulo: 'Eletricista de instalação',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 3500,
    modalidade: 'PRESENCIAL',
    area: 'Industrial',
    workload: '220h',
    beneficios: ['Alimentação', 'Vale Transporte', 'Pagamento de Horas Extras'],
    responsibilities:
      'Montagem, instalação, desmontagem de sistemas elétricos, iluminação, fitas e mangueiras de LED, refletores, luminárias, passagem de cabos, quadros, tomadas, circuitos temporários, inspeções, testes, manutenção corretiva, carga e descarga, organização de materiais, EPIs.',
    requisitos:
      'Experiência com fitas/mangueiras de LED é diferencial. Conhecimento em instalações elétricas residenciais básicas, circuitos, tomadas, interruptores, luminárias.',
    descricao:
      'Profissional para montagem, instalação e manutenção de sistemas elétricos, iluminação e circuitos.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-06T08:00:00Z',
  },
  {
    id: '7',
    slug: 'mecanico-industrial',
    titulo: 'Mecânico industrial',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 3600,
    modalidade: 'PRESENCIAL',
    area: 'Produção/Fabricação',
    workload: '44h',
    workSchedule: 'Segunda a sexta, horário comercial',
    beneficios: ['Vale Transporte', 'Participação de lucros'],
    responsibilities:
      'Manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.',
    requisitos:
      'Técnico em Mecânica Industrial concluído. Experiência comprovada mínima de 3 anos.',
    descricao:
      'Profissional para manutenção corretiva e preventiva em compressores e secadores de ar comprimido industrial.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-07T08:00:00Z',
  },
  {
    id: '8',
    slug: 'assistente-de-compras',
    titulo: 'Assistente de compras',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'JUNIOR',
    modalidade: 'PRESENCIAL',
    area: 'Administração Comercial/Vendas',
    workload: '44h',
    workSchedule: 'A combinar',
    beneficios: [
      'VT',
      'Café na empresa',
      'VR R$ 380,00',
      'Cesta Básica Física',
      'Seguro de Vida',
      'PLR',
    ],
    responsibilities:
      'Pesquisa de fornecedores, homologação, cotações, negociação, pedidos, notas fiscais, planilhas, controles, apoio ao superior.',
    requisitos:
      'Ensino Médio concluído. Excel intermediário. Curso profissionalizante em compras/suprimentos ou áreas correlatas.',
    descricao:
      'Profissional para pesquisa de fornecedores, cotações, negociação e apoio nas compras.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-08T08:00:00Z',
  },
  {
    id: '9',
    slug: 'lider-de-producao',
    titulo: 'Líder de produção',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'LIDERANCA',
    salarioMin: 3000,
    modalidade: 'PRESENCIAL',
    area: 'Industrial',
    workload: '44h',
    workSchedule: 'Segunda a sexta, 5h às 14h48',
    beneficios: [
      'Refeição no local',
      'Vale Alimentação',
      'Vale Transporte',
      'Plano de Saúde custeado 75% pela empresa',
      'Plano Odontológico',
    ],
    responsibilities:
      'Liderança de equipe, acompanhamento da produção, cronograma, desempenho, feedback, banco de horas, escalas, melhorias, comunicação entre áreas.',
    requisitos:
      'Ensino Médio concluído. Excel intermediário. Experiência em segmento alimentício é diferencial.',
    descricao:
      'Profissional para liderança de equipe, acompanhamento da produção e gestão de melhorias.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-09T08:00:00Z',
  },
  {
    id: '10',
    slug: 'auxiliar-administrativo',
    titulo: 'Auxiliar administrativo',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 2500,
    modalidade: 'PRESENCIAL',
    area: 'Administração de Empresas / Patrimônio - Gestão',
    workload: '44h',
    workSchedule:
      'Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.',
    beneficios: ['Vale-Transporte'],
    responsibilities:
      'Atendimento, relacionamento com inquilinos, proprietários e prestadores, suporte jurídico, cálculos de aluguéis, multas e juros, sistema de gestão imobiliária, dados cadastrais, certidões, rotinas administrativas.',
    requisitos:
      'Ensino Médio completo. Experiência administrativa. Excel intermediário. Sistema imobiliário é diferencial. Residir em Arujá.',
    descricao:
      'Profissional para atendimento, gestão imobiliária e rotinas administrativas.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-10T08:00:00Z',
  },
  {
    id: '11',
    slug: 'auxiliar-de-expedicao',
    titulo: 'Auxiliar de expedição',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 1777.62,
    modalidade: 'PRESENCIAL',
    area: 'Logística',
    workload: '44h',
    workSchedule: 'Segunda a sexta, 08h às 17h48',
    beneficios: [
      'Vale Transporte',
      'Refeição no local',
      'bônus de até R$ 500 por meta',
    ],
    responsibilities:
      'Separação, conferência, pedidos de e-commerce, embalagem, etiquetagem, estoque, recebimento, expedição, organização.',
    requisitos:
      'Experiência comprovada. Separação, conferência, embalagem, etiquetagem, estoque, recebimento. Residir em Arujá.',
    descricao:
      'Profissional para separação, conferência, embalagem e expedição de pedidos de e-commerce.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-11T08:00:00Z',
  },
  {
    id: '13',
    slug: 'auxiliar-de-producao-oportunidade-1',
    titulo: 'Auxiliar de Produção',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 2112.28,
    modalidade: 'PRESENCIAL',
    area: 'Produção/Fabricação',
    workload: '44h',
    workSchedule: 'Segunda a sexta, horário comercial',
    beneficios: ['Vale Transporte', 'Refeição no local'],
    responsibilities:
      'Operação de maquinários, tarefas manuais na linha de produção, organização do posto de trabalho e cumprimento das normas de segurança.',
    requisitos:
      'Ensino Fundamental completo. Disponibilidade para regime de plantões. Experiência anterior em linha de produção.',
    descricao:
      'Oportunidade para Auxiliar de Produção em indústria, com atividades de operação, apoio na linha e organização.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-13T08:00:00Z',
  },
  {
    id: '14',
    slug: 'auxiliar-de-producao-oportunidade-2',
    titulo: 'Auxiliar de Produção',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'JUNIOR',
    salarioMin: 1800,
    modalidade: 'PRESENCIAL',
    area: 'Produção/Fabricação',
    workload: '44h',
    workSchedule: 'Segunda a sábado, turno a combinar',
    beneficios: ['Vale Transporte', 'Refeição no local'],
    responsibilities:
      'Apoio à produção, movimentação de materiais, inspeção visual e abastecimento de linha.',
    requisitos:
      'Ensino Fundamental completo. Experiência mínima de 6 meses em produção ou indústria.',
    descricao:
      'Oportunidade temporária para Auxiliar de Produção, com foco em apoio operacional e movimentação de materiais.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-14T08:00:00Z',
  },
  {
    id: '15',
    slug: 'auxiliar-de-producao-oportunidade-3',
    titulo: 'Auxiliar de Produção',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 1950,
    modalidade: 'PRESENCIAL',
    area: 'Produção/Fabricação',
    workload: '44h',
    workSchedule: 'Segunda a sexta, 07h às 17h',
    beneficios: ['Vale Transporte', 'Alimentação no local'],
    responsibilities:
      'Montagem básica, separação de materiais, acabamento simples e limpeza do setor.',
    requisitos:
      'Ensino Fundamental completo. Disponibilidade de horário. Proatividade e capacidade de seguir procedimentos.',
    descricao:
      'Oportunidade CLT para Auxiliar de Produção, com foco em montagem básica, separação e organização do setor.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-15T08:00:00Z',
  },
  {
    id: '16',
    slug: 'analista-de-sistemas-sr',
    titulo: 'Analista de Sistemas Sênior',
    empresa: 'J&S Empregos LTDA',
    cidade: 'São Paulo',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'SENIOR',
    salarioMin: 8000,
    salarioMax: 12000,
    modalidade: 'REMOTO',
    area: 'Tecnologia da Informação',
    workload: '44h',
    workSchedule: '8h às 17h, segunda a sexta-feira',
    beneficios: [
      'Vale refeição',
      'Vale transporte',
      'Convênio Médico',
      'Convênio Odontológico',
      'Seguro de Vida',
      'Plano de Saúde',
      'Bônus por meta',
      'Apoio a cursos e certificações',
    ],
    responsibilities:
      'Desenvolver, manter e otimizar sistemas web e mobile. Realizar análise de requisitos, codificação, testes, depuração e documentação de software. Participar de reuniões de planejamento e sprint, colaborar com designers eproduct managers. Garantir a qualidade, segurança e performance das aplicações. Mentoria de desenvolvedores juniores.',
    requisitos:
      'Graduação em Ciência da Computação, Engenharia ou áreas afins. Experiência mínima de 5 anos em desenvolvimento full-stack. Sólidos conhecimentos em JavaScript, React, Node.js, SQL e arquitetura de software. Experiência com ambientes cloud (AWS ou Azure). Ingla intermediário.',
    descricao:
      'Vaga para Analista de Sistemas Sênior em regime de trabalho de casa (100% remoto). Óportunidade para atuar em projetos de alta complexidade e liderar o desenvolvimento de soluções escaláveis.',
    vagas: 2,
    status: 'ATIVA',
    dataPublicacao: '2026-08-13T10:00:00Z',
  },
  {
    id: '17',
    slug: 'assistente-administrativo-remoto',
    titulo: 'Assistente Administrativo',
    empresa: 'J&S Empregos LTDA',
    cidade: 'São Paulo',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 3500,
    salarioMax: 4500,
    modalidade: 'REMOTO',
    area: 'Administração',
    workload: '44h',
    workSchedule: 'Segunda a sexta, 8h às 17h, com 1h de almoço',
    beneficios: [
      'Vale refeição',
      'Vale transporte',
      'Convênio Médico',
      'Convênio Odontológico',
      'Seguro de Vida',
      'Bônus por meta',
    ],
    responsibilities:
      'Apoiar as atividades administrativas do dia a dia. Gerenciar e-mails, agendar reuniões, organizar arquivos, elaborar planilhas e relatórios. Atuar no atendimento a clientes e fornecedores. Controlar pagamentos e recebimentos, além de apoiar a rotina financeira. Tramitar correspondências e documentos.',
    requisitos:
      'Ensino Médio completo. Experiência mínima de 2 anos em atividades administrativas. Pacote Office avançado (Excel, Word e PowerPoint). Conhecimento em sistemas de gestão. Boa comunicação escrita e verbal.',
    descricao:
      'Vaga para Assistente Administrativo em regime de trabalho de casa (100% remoto). Oportunidade de atuar em empresa sólida com tecnologia e aprendizado contínuo.',
    vagas: 3,
    status: 'ATIVA',
    dataPublicacao: '2026-08-14T09:00:00Z',
  },
  {
    id: '18',
    slug: 'consultor-de-vendas-hibrido',
    titulo: 'Consultor de Vendas',
    empresa: 'J&S Empregos LTDA',
    cidade: 'São Paulo',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 4000,
    salarioMax: 7000,
    modalidade: 'HIBRIDO',
    area: 'Vendas',
    workload: '44h',
    workSchedule: 'Segunda a sexta, 8h às 17h, com 1h de almoço',
    beneficios: [
      'Vale refeição',
      'Vale transporte',
      'Convênio Médico',
      'Participação dos lucros',
      'Comissões sobre vendas',
      'Bônus por meta',
    ],
    responsibilities:
      'Prospectar, negociar e fidelizar clientes. Executar visitas presenciais e ligações de inside sales. Apresentar soluções e produtos, elaborar propostas comerciais, acompanhar o ciclo de vendas e registrar atividades no CRM. Atingir as metas estabelecidas pela diretoria.',
    requisitos:
      'Ensino Médio completo. Experiência mínima de 1 ano em vendas. Conhecimento em CRM. Boa comunicação e persuasão. Disponibilidade para viajar dentro do SP.',
    descricao:
      'Vaga para Consultor de Vendas em regime híbrido (trabalho de casa 3x por semana + presencial 2x por semana).',
    vagas: 2,
    status: 'ATIVA',
    dataPublicacao: '2026-08-15T07:00:00Z',
  },
];

export function mockGetVagas(filtro?: {
  cidade?: string;
  estado?: string;
  tipoContrato?: string;
  search?: string;
  salarioMin?: number;
  dataDias?: number;
  modalidade?: string;
}): Vaga[] {
  let result = mockVagas.filter((v) => v.status === 'ATIVA');

  if (filtro?.cidade) {
    result = result.filter((v) =>
      v.cidade?.toLowerCase().includes(filtro.cidade!.toLowerCase()),
    );
  }
  if (filtro?.estado) {
    result = result.filter((v) => v.estado === filtro.estado);
  }
  if (filtro?.tipoContrato) {
    result = result.filter((v) => v.tipoContrato === filtro.tipoContrato);
  }
  if (filtro?.modalidade) {
    result = result.filter((v) => v.modalidade === filtro.modalidade);
  }
  if (filtro?.salarioMin) {
    result = result.filter(
      (v) => v.salarioMin && v.salarioMin >= filtro.salarioMin!,
    );
  }
  if (filtro?.dataDias) {
    const cutoff = Date.now() - filtro.dataDias * 24 * 60 * 60 * 1000;
    result = result.filter(
      (v) => new Date(v.dataPublicacao).getTime() >= cutoff,
    );
  }
  if (filtro?.search) {
    const term = filtro.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.titulo.toLowerCase().includes(term) ||
        v.empresa?.toLowerCase().includes(term) ||
        v.descricao?.toLowerCase().includes(term) ||
        v.area?.toLowerCase().includes(term),
    );
  }

  return result.sort(
    (a, b) =>
      new Date(b.dataPublicacao).getTime() -
      new Date(a.dataPublicacao).getTime(),
  );
}

export function mockGetVagaBySlug(slug: string): Vaga | undefined {
  return mockVagas.find((v) => v.slug === slug);
}
