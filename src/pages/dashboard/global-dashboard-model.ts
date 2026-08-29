export interface GlobalDashboardStats {
  tenants: number;
  companies: number;
  people: number;
  candidates: number;
  jobs: number;
  applications: number;
  serviceOrders: number;
  supportTickets: number;
}

export interface GlobalDashboardKpi {
  id: keyof GlobalDashboardStats | 'service-orders' | 'support-tickets';
  label: string;
  value: number;
  description: string;
}

export function buildGlobalDashboardKpis(
  stats: GlobalDashboardStats,
): GlobalDashboardKpi[] {
  return [
    {
      id: 'tenants',
      label: 'Tenants',
      value: stats.tenants,
      description: 'Ambientes ativos na plataforma',
    },
    {
      id: 'companies',
      label: 'Empresas',
      value: stats.companies,
      description: 'Empresas cadastradas',
    },
    {
      id: 'people',
      label: 'Usuários',
      value: stats.people,
      description: 'Pessoas com identidade na plataforma',
    },
    {
      id: 'candidates',
      label: 'Candidatos',
      value: stats.candidates,
      description: 'Candidatos no banco de talentos',
    },
    {
      id: 'jobs',
      label: 'Vagas',
      value: stats.jobs,
      description: 'Vagas cadastradas',
    },
    {
      id: 'applications',
      label: 'Candidaturas',
      value: stats.applications,
      description: 'Candidaturas registradas',
    },
    {
      id: 'service-orders',
      label: 'Ordens de serviço',
      value: stats.serviceOrders,
      description: 'Ordens operacionais registradas',
    },
    {
      id: 'support-tickets',
      label: 'Chamados',
      value: stats.supportTickets,
      description: 'Chamados de suporte registrados',
    },
  ];
}
