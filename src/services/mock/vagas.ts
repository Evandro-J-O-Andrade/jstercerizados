import type { Vaga } from '@/types/common';

export const mockVagas: Vaga[] = [
  {
    id: '1',
    slug: 'auxiliar-de-producao',
    titulo: 'Auxiliar de Produção',
    empresa: 'Industria ABC Ltda',
    cidade: 'São Paulo',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'JUNIOR',
    salarioMin: 1800,
    salarioMax: 2200,
    modalidade: 'PRESENCIAL',
    beneficios: ['Vale-alimentação', 'Vale-transporte', 'Uniforme'],
    requisitos:
      'Ensino fundamental completo. Disponibilidade para trabalhar em regime de plantões.',
    descricao:
      'Procura-se auxiliar de produção para operar maquinários e realizar tarefas manuais na linha de produção.',
    vagas: 8,
    status: 'ATIVA',
    dataPublicacao: '2026-07-25T10:00:00Z',
  },
  {
    id: '2',
    slug: 'operador-de-empilhadeira',
    titulo: 'Operador de Empilhadeira',
    empresa: 'LogTech Distribuição',
    cidade: 'Arujá',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 2800,
    salarioMax: 3500,
    modalidade: 'PRESENCIAL',
    beneficios: ['Vale-alimentação', 'Vale-combustível', 'Seguro de vida'],
    requisitos: 'Curso NR-12 e NR-10. Experiência mínima de 6 meses.',
    descricao:
      'Operar empilhadeira para carregamento e descarregamento de mercadorias em armazém.',
    vagas: 5,
    status: 'ATIVA',
    dataPublicacao: '2026-07-28T09:00:00Z',
  },
  {
    id: '3',
    slug: 'conferente-balcão',
    titulo: 'Conferente',
    empresa: 'Comercial Itaqua Ltda',
    cidade: 'Itaquaquecetuba',
    estado: 'SP',
    tipoContrato: 'TEMPORARIO',
    nivel: 'PLENO',
    salarioMin: 2200,
    salarioMax: 2600,
    modalidade: 'PRESENCIAL',
    beneficios: ['Vale-alimentação', 'Gratificação'],
    requisitos: 'Ensino médio completo. Excelente capacidade de organização.',
    descricao:
      'Conferir produtos recebidos e liberados, conferindo quantidades e qualidade.',
    vagas: 12,
    status: 'ATIVA',
    dataPublicacao: '2026-08-01T14:00:00Z',
  },
  {
    id: '4',
    slug: 'analista-administrativo-pleno',
    titulo: 'Analista Administrativo Pleno',
    empresa: 'Group Soluções Ltda',
    cidade: 'Guarulhos',
    estado: 'SP',
    tipoContrato: 'CLT',
    nivel: 'PLENO',
    salarioMin: 3500,
    salarioMax: 4500,
    modalidade: 'HIBRIDO',
    beneficios: ['Plano de saúde', 'Vale-alimentação', 'Home office', 'VR/VT'],
    requisitos: 'Superior em Administração ou afins. Experiência de 1-3 anos.',
    descricao:
      'Atuar na área administrativa, gerenciando processos, documentos e atendimento ao público.',
    vagas: 3,
    status: 'ATIVA',
    dataPublicacao: '2026-07-30T11:00:00Z',
  },
  {
    id: '5',
    slug: 'auxiliar-limpeza-comercial',
    titulo: 'Auxiliar de Limpeza',
    empresa: 'J&S Empregos LTDA',
    cidade: 'São Paulo',
    estado: 'SP',
    tipoContrato: 'TERCEIRIZADO',
    nivel: 'JUNIOR',
    salarioMin: 1600,
    salarioMax: 1800,
    modalidade: 'PRESENCIAL',
    beneficios: ['Vale-transporte', 'Uniforme', 'EPIs fornecidos'],
    requisitos: 'Nenhuma formação específica. Condições físicas adequadas.',
    descricao:
      'Realizar limpeza de escritórios em horário noturno e nos finais de semana.',
    vagas: 15,
    status: 'ATIVA',
    dataPublicacao: '2026-07-20T08:00:00Z',
  },
  {
    id: '6',
    slug: 'porteiro-recepcao-residencial',
    titulo: 'Porteiro / Recepção',
    empresa: 'Edifício Central',
    cidade: 'São Paulo',
    estado: 'SP',
    tipoContrato: 'TERCEIRIZADO',
    nivel: 'PLENO',
    salarioMin: 2400,
    salarioMax: 2800,
    modalidade: 'PRESENCIAL',
    beneficios: ['Alimentação', 'Vale-transporte', 'Uniforme'],
    requisitos: 'Ensino médio completo. Experiência em portaria.',
    descricao:
      'Controlar acesso de visitantes, gerenciar encomendas e prestar informações.',
    vagas: 6,
    status: 'ARQUIVADA',
    dataPublicacao: '2026-07-15T10:00:00Z',
  },
];

export function mockGetVagas(filtro?: {
  cidade?: string;
  estado?: string;
  tipoContrato?: string;
  search?: string;
}): Vaga[] {
  let result = mockVagas.filter((v) => v.status === 'ATIVA');

  if (filtro?.cidade) {
    result = result.filter((v) =>
      v.cidade.toLowerCase().includes(filtro.cidade!.toLowerCase()),
    );
  }
  if (filtro?.estado) {
    result = result.filter((v) => v.estado === filtro.estado);
  }
  if (filtro?.tipoContrato) {
    result = result.filter((v) => v.tipoContrato === filtro.tipoContrato);
  }
  if (filtro?.search) {
    const term = filtro.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.titulo.toLowerCase().includes(term) ||
        v.empresa.toLowerCase().includes(term) ||
        v.descricao.toLowerCase().includes(term),
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
