import { useRecrutamentoAuthorization } from '@/modules/recrutamento/authorization';

export interface RecrutamentoNavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
  visible: boolean;
  children?: RecrutamentoNavItem[];
}

export function useRecrutamentoNavigation(): RecrutamentoNavItem[] {
  const access = useRecrutamentoAuthorization();

  const items: RecrutamentoNavItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard/recrutamento',
      icon: 'LayoutDashboard',
      visible: true,
    },
    {
      key: 'vagas',
      label: 'Vagas',
      href: '/dashboard/recrutamento/vagas',
      icon: 'Briefcase',
      visible: access.vagas.read,
      children: [
        { key: 'vagas-criar', label: 'Nova Vaga', href: '/dashboard/recrutamento/vagas/nova', icon: 'Plus', visible: access.vagas.create },
      ],
    },
    {
      key: 'candidatos',
      label: 'Candidatos',
      href: '/dashboard/recrutamento/candidatos',
      icon: 'Users',
      visible: access.candidatos.read,
      children: [
        { key: 'candidatos-criar', label: 'Adicionar Candidato', href: '/dashboard/recrutamento/candidatos/novo', icon: 'Plus', visible: access.candidatos.create },
      ],
    },
    {
      key: 'candidaturas',
      label: 'Candidaturas',
      href: '/dashboard/recrutamento/candidaturas',
      icon: 'FileCheck',
      visible: access.candidaturas.read,
    },
    {
      key: 'processos',
      label: 'Processos Seletivos',
      href: '/dashboard/recrutamento/processos',
      icon: 'GitBranch',
      visible: access.processos.read,
      children: [
        { key: 'processos-criar', label: 'Novo Processo', href: '/dashboard/recrutamento/processos/novo', icon: 'Plus', visible: access.processos.create },
      ],
    },
    {
      key: 'etapas',
      label: 'Etapas',
      href: '/dashboard/recrutamento/etapas',
      icon: 'FileText',
      visible: access.processos.stageManage,
    },
    {
      key: 'talent-pool',
      label: 'Banco de Talentos',
      href: '/dashboard/recrutamento/talent-pool',
      icon: 'Database',
      visible: access.talentPool.read,
    },
    {
      key: 'demandas',
      label: 'Demandas',
      href: '/dashboard/recrutamento/demandas',
      icon: 'FileText',
      visible: access.demandas.read,
      children: [
        { key: 'demandas-criar', label: 'Nova Demanda', href: '/dashboard/recrutamento/demandas/nova', icon: 'Plus', visible: access.demandas.create },
      ],
    },
    {
      key: 'relatorios',
      label: 'Relatórios',
      href: '/dashboard/recrutamento/relatorios',
      icon: 'BarChart2',
      visible: true,
    },
  ];

  return items.filter((item) => item.visible);
}

export function useRecrutamentoVisibleRoutes(): string[] {
  const nav = useRecrutamentoNavigation();
  const routes: string[] = [];

  function collectRoutes(items: RecrutamentoNavItem[]) {
    for (const item of items) {
      if (item.visible) {
        routes.push(item.href);
        if (item.children) {
          collectRoutes(item.children);
        }
      }
    }
  }

  collectRoutes(nav);
  return routes;
}