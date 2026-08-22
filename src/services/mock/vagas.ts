import type { Vaga } from '@/types/common';

export const mockVagas: Vaga[] = [
  {
    id: '1',
    slug: 'analista-rh-folha-de-pagamento',
    titulo: 'Analista de RH (Folha de Pagamento)',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 5000,
    salarioTipo: 'mensal',
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
    data_publicacao: '2026-08-01T10:00:00Z',
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
    salarioTipo: 'mensal',
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
    data_publicacao: '2026-08-02T09:00:00Z',
  },
  {
    id: '3',
    slug: 'manutencao-industrial-vaga-1',
    titulo: 'Manutenção Industrial — Vaga 1',
    empresa: 'J&S Empregos LTDA',
    tipoContrato: 'TEMPORARIO',
    salarioMin: 10.56,
    salarioTipo: 'hora',
    status: 'ATIVA',
    data_publicacao: '2026-08-12T08:00:00Z',
  },
  {
    id: '4',
    slug: 'manutencao-industrial-vaga-2',
    titulo: 'Manutenção Industrial — Vaga 2',
    empresa: 'J&S Empregos LTDA',
    tipoContrato: 'TEMPORARIO',
    salarioMin: 10.56,
    salarioTipo: 'hora',
    status: 'ATIVA',
    data_publicacao: '2026-08-13T08:00:00Z',
  },
  {
    id: '5',
    slug: 'manutencao-industrial-vaga-3',
    titulo: 'Manutenção Industrial — Vaga 3',
    empresa: 'J&S Empregos LTDA',
    tipoContrato: 'TEMPORARIO',
    salarioMin: 10.56,
    salarioTipo: 'hora',
    status: 'ATIVA',
    data_publicacao: '2026-08-14T08:00:00Z',
  },
  {
    id: '6',
    slug: 'pintor-i',
    titulo: 'Pintor I',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'JUNIOR',
    salarioMin: 15.56,
    salarioTipo: 'hora',
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
    data_publicacao: '2026-08-03T08:00:00Z',
  },
  {
    id: '7',
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
    responsibilities:
      'Limpeza e conservação de áreas administrativas, produtivas e comuns, higienização de banheiros, vestiários e descarte de resíduos.',
    descricao:
      'Profissional para limpeza e conservação de áreas administrativas, produtivas e comuns.',
    vagas: 1,
    status: 'ATIVA',
    data_publicacao: '2026-08-04T07:00:00Z',
  },
  {
    id: '8',
    slug: 'marceneiro-montador',
    titulo: 'Marceneiro Montador',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'JUNIOR',
    salarioMin: 3000,
    salarioTipo: 'mensal',
    modalidade: 'PRESENCIAL',
    area: 'Industrial',
    workload: '220h',
    responsibilities:
      'Fabricação, montagem, acabamento, montagem e desmontagem de estandes, cenários, painéis, mobiliários, cortes, ajustes, lixamento, instalação, operação de máquinas, reparos, organização e transporte de materiais, cumprimento de cronogramas, normas de segurança.',
    requisitos:
      'Disponibilidade para viagens. Disponibilidade para período noturno. Disponibilidade para finais de semana e feriados quando necessário.',
    descricao:
      'Profissional para fabricação, montagem e acabamento de estandes, cenários e mobiliários.',
    vagas: 1,
    status: 'ATIVA',
    data_publicacao: '2026-08-05T08:00:00Z',
  },
  {
    id: '9',
    slug: 'eletricista-de-instalacao',
    titulo: 'Eletricista de instalação',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 3500,
    salarioTipo: 'mensal',
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
    data_publicacao: '2026-08-06T08:00:00Z',
  },
  {
    id: '10',
    slug: 'mecanico-industrial',
    titulo: 'Mecânico industrial',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 3600,
    salarioTipo: 'mensal',
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
    data_publicacao: '2026-08-07T08:00:00Z',
  },
  {
    id: '11',
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
    data_publicacao: '2026-08-08T08:00:00Z',
  },
  {
    id: '12',
    slug: 'lider-de-producao',
    titulo: 'Líder de produção',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'LIDERANCA',
    salarioMin: 3000,
    salarioTipo: 'mensal',
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
    data_publicacao: '2026-08-09T08:00:00Z',
  },
  {
    id: '13',
    slug: 'auxiliar-administrativo',
    titulo: 'Auxiliar administrativo',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 2500,
    salarioTipo: 'mensal',
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
    data_publicacao: '2026-08-10T08:00:00Z',
  },
  {
    id: '14',
    slug: 'auxiliar-de-expedicao',
    titulo: 'Auxiliar de expedição',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 1777.62,
    salarioTipo: 'mensal',
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
    data_publicacao: '2026-08-11T08:00:00Z',
  },
  {
    id: '15',
    slug: 'analista-logistico',
    titulo: 'Analista Logístico',
    empresa: 'J&S Empregos LTDA',
    tipoContrato: 'CLT',
    salarioMin: 4000,
    salarioTipo: 'mensal',
    status: 'ATIVA',
    data_publicacao: '2026-08-15T08:00:00Z',
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
      (v) => new Date(v.data_publicacao).getTime() >= cutoff,
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
      new Date(b.data_publicacao).getTime() -
      new Date(a.data_publicacao).getTime(),
  );
}

export function mockGetVagaBySlug(slug: string): Vaga | undefined {
  return mockVagas.find((v) => v.slug === slug);
}
