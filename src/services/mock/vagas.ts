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
    modalidade: 'PRESENCIAL',
    area: 'Recursos Humanos',
    workload: '40h',
    workSchedule: '8h às 17h, segunda a sexta-feira',
    responsibilities:
      'Processamento de folha, cálculos trabalhistas/previdenciários, conciliações e suporte.',
    descricao:
      'Responsável pelo processamento de folha de pagamento, cálculos trabalhistas e previdenciários, conciliações e suporte às rotinas de RH.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-01T10:00:00Z',
  },
  {
    id: '2',
    slug: 'ajudante-geral',
    titulo: 'Ajudante Geral',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 2112.28,
    modalidade: 'PRESENCIAL',
    area: 'Operações',
    workload: '44h',
    workSchedule: 'Segunda a sexta, 7h40 às 17h28',
    responsibilities:
      'Suporte operacional, carga e descarga, apoio à produção e logística, organização.',
    descricao:
      'Profissional para suporte operacional, carga e descarga, apoio à produção e logística.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-02T09:00:00Z',
  },
  {
    id: '3',
    slug: 'manutencao-industrial-vaga-1',
    titulo: 'Manutenção Industrial — Vaga 1',
    empresa: 'J&S Empregos LTDA',
    tipoContrato: 'TEMPORARIO',
    salarioMin: 10.56,
    responsibilities:
      'Abastecimento, transporte de caixas, seleção, retrabalho e operação.',
    descricao:
      'Profissional para abastecimento, transporte de caixas, seleção, retrabalho e operação.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-03T08:00:00Z',
  },
  {
    id: '4',
    slug: 'manutencao-industrial-vaga-2',
    titulo: 'Manutenção Industrial — Vaga 2',
    empresa: 'J&S Empregos LTDA',
    tipoContrato: 'TEMPORARIO',
    salarioMin: 10.56,
    responsibilities:
      'Abastecimento, transporte de caixas, seleção, retrabalho e operação.',
    descricao:
      'Profissional para abastecimento, transporte de caixas, seleção, retrabalho e operação.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-04T08:00:00Z',
  },
  {
    id: '5',
    slug: 'manutencao-industrial-vaga-3',
    titulo: 'Manutenção Industrial — Vaga 3',
    empresa: 'J&S Empregos LTDA',
    tipoContrato: 'TEMPORARIO',
    salarioMin: 10.56,
    responsibilities:
      'Abastecimento, transporte de caixas, seleção, retrabalho e operação.',
    descricao:
      'Profissional para abastecimento, transporte de caixas, seleção, retrabalho e operação.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-05T08:00:00Z',
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
    modalidade: 'PRESENCIAL',
    area: 'Produção',
    workload: '44h',
    workSchedule: 'Segunda a sábado, 15h10 às 23h19, com 1h de refeição',
    responsibilities:
      'Preparação e pintura de superfícies metálicas, remoção de sujeira, oxidação e incrustações, aplicação de tinta, preparação de tintas, solventes e catalisadores, manutenção de máquinas e ferramentas.',
    descricao:
      'Profissional para preparação e pintura de superfícies metálicas.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-06T08:00:00Z',
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
      'Limpeza, conservação, higienização de banheiros, vestiários e descarte de resíduos.',
    descricao:
      'Profissional para limpeza, conservação, higienização de banheiros, vestiários e descarte de resíduos.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-07T07:00:00Z',
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
    modalidade: 'PRESENCIAL',
    area: 'Industrial',
    workload: '220h',
    responsibilities:
      'Fabricação e montagem de estandes, cenários e estruturas de madeira.',
    descricao:
      'Profissional para fabricação e montagem de estandes, cenários e estruturas de madeira.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-08T08:00:00Z',
  },
  {
    id: '9',
    slug: 'eletricista-de-instalacao',
    titulo: 'Eletricista de Instalações',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 3500,
    modalidade: 'PRESENCIAL',
    area: 'Industrial',
    workload: '220h',
    responsibilities: 'Instalação elétrica, iluminação, cabos e quadros.',
    descricao:
      'Profissional para instalação elétrica, iluminação, cabos e quadros.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-09T08:00:00Z',
  },
  {
    id: '10',
    slug: 'mecanico-industrial',
    titulo: 'Mecânico Industrial',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 3600,
    modalidade: 'PRESENCIAL',
    area: 'Produção',
    workload: '44h',
    workSchedule: 'Segunda a sexta, horário comercial',
    responsibilities:
      'Manutenção preventiva e corretiva em compressores e secadores.',
    descricao:
      'Profissional para manutenção preventiva e corretiva em compressores e secadores.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-10T08:00:00Z',
  },
  {
    id: '11',
    slug: 'assistente-de-compras',
    titulo: 'Assistente de Compras',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'JUNIOR',
    modalidade: 'PRESENCIAL',
    area: 'Administração',
    workload: '44h',
    workSchedule: 'A combinar',
    responsibilities: 'Fornecedores, cotações, negociação, pedidos e notas.',
    descricao:
      'Profissional para rotinas de fornecedores, cotações, negociação, pedidos e notas.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-11T08:00:00Z',
  },
  {
    id: '12',
    slug: 'lider-de-producao',
    titulo: 'Líder de Produção',
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
    responsibilities:
      'Gestão de equipe, cronograma, banco de horas e melhorias.',
    descricao:
      'Profissional para gestão de equipe, cronograma, banco de horas e melhorias.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-12T08:00:00Z',
  },
  {
    id: '13',
    slug: 'auxiliar-administrativo',
    titulo: 'Auxiliar Administrativo',
    empresa: 'J&S Empregos LTDA',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 2500,
    modalidade: 'PRESENCIAL',
    area: 'Administração',
    workload: '44h',
    workSchedule:
      'Segunda a quinta 08h às 18h. Sexta 08h às 17h. 1h de refeição.',
    responsibilities: 'Atendimento, jurídico, cálculos e gestão imobiliária.',
    descricao:
      'Profissional para atendimento, jurídico, cálculos e gestão imobiliária.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-13T08:00:00Z',
  },
  {
    id: '14',
    slug: 'auxiliar-de-expedicao',
    titulo: 'Auxiliar de Expedição',
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
    responsibilities: 'Separação, conferência, embalagem, etiquetas e estoque.',
    descricao:
      'Profissional para separação, conferência, embalagem, etiquetas e estoque.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-14T08:00:00Z',
  },
  {
    id: '15',
    slug: 'analista-logistico',
    titulo: 'Analista Logístico',
    empresa: 'J&S Empregos LTDA',
    tipoContrato: 'CLT',
    salarioMin: 4000,
    responsibilities: 'Fretes, parceiros, custos, rotas e prazos.',
    descricao:
      'Profissional para gestão de fretes, parceiros, custos, rotas e prazos.',
    vagas: 1,
    status: 'ATIVA',
    dataPublicacao: '2026-08-15T08:00:00Z',
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
