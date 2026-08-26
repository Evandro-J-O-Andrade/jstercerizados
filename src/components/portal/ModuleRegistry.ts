import type { Permission } from '@/types/auth';

export type ModuleCategory =
  | 'inicio'
  | 'plataforma'
  | 'negocio'
  | 'ia'
  | 'seguranca'
  | 'documentos'
  | 'conta';

export interface ModuleFeature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  route: string;
  requiredPermissions?: string[];
  actions?: ModuleAction[];
}

export interface ModuleAction {
  id: string;
  title: string;
  description: string;
  permission: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  category: ModuleCategory;
  requiredPermissions?: string[];
  features?: ModuleFeature[];
  scope: 'platform' | 'tenant';
}

export const PORTAL_MODULES: ModuleDefinition[] = [
  {
    id: 'inicio',
    title: 'Início',
    description: 'Resumo da sua operação',
    icon: 'home',
    route: '/dashboard',
    category: 'inicio',
    scope: 'tenant',
    requiredPermissions: [],
  },
  {
    id: 'tenants',
    title: 'Tenants',
    description: 'Empresas e tenants da plataforma',
    icon: 'building2',
    route: '/dashboard/tenants',
    category: 'plataforma',
    scope: 'platform',
    requiredPermissions: ['tenants.read'],
    features: [
      {
        id: 'listar',
        title: 'Listar',
        description: 'Visualizar tenants cadastrados',
        route: '/dashboard/tenants',
        requiredPermissions: ['tenants.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar tenant',
            description: 'Provisionar novo tenant',
            permission: 'tenants.create',
          },
          {
            id: 'editar',
            title: 'Editar tenant',
            description: 'Alterar dados do tenant',
            permission: 'tenants.update',
          },
          {
            id: 'suspender',
            title: 'Suspender / Reativar',
            description: 'Alterar status do tenant',
            permission: 'tenants.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover tenant',
            permission: 'tenants.delete',
          },
        ],
      },
      {
        id: 'configuracoes',
        title: 'Configurações',
        description: 'Configurações de tenant',
        route: '/dashboard/tenants/configuracoes',
        requiredPermissions: ['tenants.update'],
      },
    ],
  },
  {
    id: 'clientes',
    title: 'Clientes',
    description: 'Leads, prospects e carteira de clientes',
    icon: 'users',
    route: '/dashboard/clientes',
    category: 'plataforma',
    scope: 'platform',
    requiredPermissions: ['companies.read'],
    features: [
      {
        id: 'leads',
        title: 'Leads',
        description: 'Contatos iniciais e interessados',
        route: '/dashboard/clientes/leads',
        requiredPermissions: ['companies.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar lead',
            description: 'Novo lead',
            permission: 'companies.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar lead',
            permission: 'companies.update',
          },
          {
            id: 'converter',
            title: 'Converter',
            description: 'Converter em cliente',
            permission: 'companies.convert',
          },
        ],
      },
      {
        id: 'prospects',
        title: 'Prospects',
        description: 'Oportunidades comerciais',
        route: '/dashboard/clientes/prospects',
        requiredPermissions: ['companies.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar prospect',
            description: 'Nova oportunidade',
            permission: 'companies.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar prospect',
            permission: 'companies.update',
          },
        ],
      },
      {
        id: 'empresas',
        title: 'Empresas',
        description: 'Cadastro e relacionamento',
        route: '/dashboard/empresas',
        requiredPermissions: ['companies.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Nova empresa',
            permission: 'companies.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar empresa',
            permission: 'companies.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover empresa',
            permission: 'companies.delete',
          },
        ],
      },
      {
        id: 'pipeline',
        title: 'Pipeline',
        description: 'Funil comercial',
        route: '/dashboard/clientes/pipeline',
        requiredPermissions: ['companies.read'],
      },
      {
        id: 'clientes-ativos',
        title: 'Clientes ativos',
        description: 'Clientes com tenant ativo',
        route: '/dashboard/clientes/ativos',
        requiredPermissions: ['companies.read'],
      },
    ],
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    description: 'Provisionamento e ativação de clientes',
    icon: 'rocket',
    route: '/dashboard/onboarding',
    category: 'plataforma',
    scope: 'platform',
    requiredPermissions: ['tenants.read'],
    features: [
      {
        id: 'provisionar',
        title: 'Provisionar',
        description: 'Novo tenant',
        route: '/dashboard/onboarding',
        requiredPermissions: ['tenants.create'],
        actions: [
          {
            id: 'criar',
            title: 'Criar tenant',
            description: 'Provisionar novo tenant',
            permission: 'tenants.create',
          },
          {
            id: 'ativar',
            title: 'Ativar',
            description: 'Ativar tenant',
            permission: 'tenants.activate',
          },
        ],
      },
      {
        id: 'configuracao',
        title: 'Configuração',
        description: 'Configurar módulos do tenant',
        route: '/dashboard/onboarding/configuracao',
        requiredPermissions: ['tenant.manage'],
      },
    ],
  },
  {
    id: 'assinaturas',
    title: 'Assinaturas',
    description: 'Planos, assinaturas e renovações',
    icon: 'credit-card',
    route: '/dashboard/assinaturas',
    category: 'plataforma',
    scope: 'platform',
    requiredPermissions: ['finance.read'],
    features: [
      {
        id: 'planos',
        title: 'Planos',
        description: 'Planos disponíveis',
        route: '/dashboard/assinaturas',
        requiredPermissions: ['finance.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar plano',
            description: 'Novo plano',
            permission: 'finance.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar plano',
            permission: 'finance.update',
          },
        ],
      },
      {
        id: 'renovacoes',
        title: 'Renovações',
        description: 'Renovações de assinatura',
        route: '/dashboard/assinaturas/renovacoes',
        requiredPermissions: ['finance.read'],
        actions: [
          {
            id: 'aprovar',
            title: 'Aprovar',
            description: 'Aprovar renovação',
            permission: 'finance.approve',
          },
          {
            id: 'rejeitar',
            title: 'Rejeitar',
            description: 'Rejeitar renovação',
            permission: 'finance.reject',
          },
        ],
      },
    ],
  },
  {
    id: 'gestao-saas',
    title: 'Gestão SaaS',
    description: 'Métricas, crescimento e saúde da plataforma',
    icon: 'bar-chart',
    route: '/dashboard/gestao-saas',
    category: 'plataforma',
    scope: 'platform',
    requiredPermissions: ['domain_events.read'],
    features: [
      {
        id: 'dashboard-saas',
        title: 'Dashboard',
        description: 'Visão executiva do SaaS',
        route: '/dashboard/gestao-saas',
        requiredPermissions: ['domain_events.read'],
      },
      {
        id: 'mrr-receita',
        title: 'MRR / Receita',
        description: 'Receita recorrente e financeiro',
        route: '/dashboard/gestao-saas/mrr',
        requiredPermissions: ['finance.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar MRR',
            permission: 'finance.export',
          },
        ],
      },
      {
        id: 'uso-plataforma',
        title: 'Uso da plataforma',
        description: 'Adoção e utilização por tenant',
        route: '/dashboard/gestao-saas/uso',
        requiredPermissions: ['domain_events.read'],
      },
      {
        id: 'crescimento',
        title: 'Crescimento',
        description: 'Aquisição e expansão',
        route: '/dashboard/gestao-saas/crescimento',
        requiredPermissions: ['domain_events.read'],
      },
    ],
  },
  {
    id: 'usuarios',
    title: 'Usuários',
    description: 'Pessoas e acessos',
    icon: 'users',
    route: '/dashboard/usuarios',
    category: 'seguranca',
    scope: 'platform',
    requiredPermissions: ['people.read'],
    features: [
      {
        id: 'listar',
        title: 'Listar',
        description: 'Visualizar usuários',
        route: '/dashboard/usuarios',
        requiredPermissions: ['people.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar usuário',
            description: 'Cadastrar nova pessoa',
            permission: 'people.create',
          },
          {
            id: 'editar',
            title: 'Editar usuário',
            description: 'Alterar dados do usuário',
            permission: 'people.update',
          },
          {
            id: 'desativar',
            title: 'Desativar usuário',
            description: 'Remover acesso do usuário',
            permission: 'people.disable',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar usuários',
            permission: 'people.export',
          },
        ],
      },
      {
        id: 'convidar',
        title: 'Convidar',
        description: 'Convidar novo usuário',
        route: '/dashboard/usuarios',
        requiredPermissions: ['people.create'],
      },
    ],
  },
  {
    id: 'roles-permissoes',
    title: 'Roles & Permissões',
    description: 'Papéis e permissões do sistema',
    icon: 'shield',
    route: '/dashboard/roles-permissoes',
    category: 'seguranca',
    scope: 'platform',
    requiredPermissions: ['roles.read'],
    features: [
      {
        id: 'listar',
        title: 'Listar roles',
        description: 'Visualizar roles cadastradas',
        route: '/dashboard/roles-permissoes',
        requiredPermissions: ['roles.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar role',
            description: 'Cadastrar nova role',
            permission: 'roles.create',
          },
          {
            id: 'editar',
            title: 'Editar role',
            description: 'Alterar permissões da role',
            permission: 'roles.update',
          },
          {
            id: 'excluir',
            title: 'Excluir role',
            description: 'Remover role',
            permission: 'roles.delete',
          },
        ],
      },
      {
        id: 'permissoes',
        title: 'Permissões',
        description: 'Matriz de permissões',
        route: '/dashboard/roles-permissoes',
        requiredPermissions: ['permissions.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar permissão',
            description: 'Nova permissão',
            permission: 'permissions.create',
          },
          {
            id: 'editar',
            title: 'Editar permissão',
            description: 'Alterar permissão',
            permission: 'permissions.update',
          },
          {
            id: 'excluir',
            title: 'Excluir permissão',
            description: 'Remover permissão',
            permission: 'permissions.delete',
          },
        ],
      },
    ],
  },
  {
    id: 'auditoria',
    title: 'Auditoria',
    description: 'Logs e eventos do sistema',
    icon: 'file-text',
    route: '/dashboard/auditoria',
    category: 'seguranca',
    scope: 'platform',
    requiredPermissions: ['audit.read'],
    features: [
      {
        id: 'logs',
        title: 'Logs',
        description: 'Eventos de auditoria',
        route: '/dashboard/auditoria',
        requiredPermissions: ['audit.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar logs',
            permission: 'audit.export',
          },
          {
            id: 'filtrar',
            title: 'Filtrar',
            description: 'Filtrar logs',
            permission: 'audit.filter',
          },
        ],
      },
      {
        id: 'eventos',
        title: 'Eventos de segurança',
        description: 'Eventos de segurança',
        route: '/dashboard/auditoria/eventos',
        requiredPermissions: ['security_events.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar eventos',
            permission: 'security_events.export',
          },
        ],
      },
    ],
  },
  {
    id: 'documentos',
    title: 'Documentos',
    description: 'Documentos e arquivos da plataforma',
    icon: 'folder',
    route: '/dashboard/documentos',
    category: 'documentos',
    scope: 'tenant',
    requiredPermissions: ['files.read'],
    features: [
      {
        id: 'listar',
        title: 'Listar',
        description: 'Visualizar documentos',
        route: '/dashboard/documentos',
        requiredPermissions: ['files.read'],
        actions: [
          {
            id: 'upload',
            title: 'Upload',
            description: 'Enviar documento',
            permission: 'files.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Atualizar documento',
            permission: 'files.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover documento',
            permission: 'files.delete',
          },
          {
            id: 'download',
            title: 'Download',
            description: 'Baixar documento',
            permission: 'files.read',
          },
        ],
      },
      {
        id: 'pastas',
        title: 'Pastas',
        description: 'Organização de pastas',
        route: '/dashboard/documentos/pastas',
        requiredPermissions: ['files.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar pasta',
            description: 'Nova pasta',
            permission: 'files.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar pasta',
            permission: 'files.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover pasta',
            permission: 'files.delete',
          },
        ],
      },
      {
        id: 'compartilhados',
        title: 'Compartilhados',
        description: 'Documentos compartilhados',
        route: '/dashboard/documentos/compartilhados',
        requiredPermissions: ['files.read'],
      },
    ],
  },
  {
    id: 'contratos',
    title: 'Contratos',
    description: 'Contratos e termos comerciais',
    icon: 'file-signature',
    route: '/dashboard/contratos',
    category: 'documentos',
    scope: 'tenant',
    requiredPermissions: ['contracts.read'],
    features: [
      {
        id: 'listar',
        title: 'Listar',
        description: 'Visualizar contratos',
        route: '/dashboard/contratos',
        requiredPermissions: ['contracts.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Novo contrato',
            permission: 'contracts.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar contrato',
            permission: 'contracts.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover contrato',
            permission: 'contracts.delete',
          },
          {
            id: 'renovar',
            title: 'Renovar',
            description: 'Renovar contrato',
            permission: 'contracts.renew',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar contrato',
            permission: 'contracts.export',
          },
        ],
      },
      {
        id: 'modelos',
        title: 'Modelos',
        description: 'Modelos de contrato',
        route: '/dashboard/contratos/modelos',
        requiredPermissions: ['contracts.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Novo modelo',
            permission: 'contracts.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar modelo',
            permission: 'contracts.update',
          },
        ],
      },
    ],
  },
  {
    id: 'termos',
    title: 'Termos',
    description: 'Termos de uso e políticas',
    icon: 'book-open',
    route: '/dashboard/termos',
    category: 'documentos',
    scope: 'tenant',
    requiredPermissions: ['documents.read'],
    features: [
      {
        id: 'termos-uso',
        title: 'Termos de uso',
        description: 'Visualizar e editar termos',
        route: '/dashboard/termos',
        requiredPermissions: ['documents.read'],
        actions: [
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar termos',
            permission: 'documents.update',
          },
          {
            id: 'publicar',
            title: 'Publicar',
            description: 'Publicar nova versão',
            permission: 'documents.publish',
          },
        ],
      },
      {
        id: 'privacidade',
        title: 'Privacidade',
        description: 'Política de privacidade',
        route: '/dashboard/termos/privacidade',
        requiredPermissions: ['documents.read'],
        actions: [
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar política',
            permission: 'documents.update',
          },
          {
            id: 'publicar',
            title: 'Publicar',
            description: 'Publicar nova versão',
            permission: 'documents.publish',
          },
        ],
      },
    ],
  },
  {
    id: 'rh',
    title: 'RH',
    description: 'Gestão de pessoas, funcionários e processos internos',
    icon: 'users',
    route: '/dashboard/rh',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['people.read'],
    features: [
      {
        id: 'funcionarios',
        title: 'Funcionários',
        description: 'Gerencie funcionários ativos, admissões e afastamentos',
        route: '/dashboard/rh/funcionarios',
        requiredPermissions: ['people.read'],
        actions: [
          {
            id: 'criar',
            title: 'Admitir',
            description: 'Registrar admissão',
            permission: 'people.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar dados do funcionário',
            permission: 'people.update',
          },
          {
            id: 'desativar',
            title: 'Desativar',
            description: 'Registrar desligamento',
            permission: 'people.disable',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar funcionários',
            permission: 'people.export',
          },
        ],
      },
      {
        id: 'documentos-rh',
        title: 'Documentos',
        description: 'Documentos de pessoas e funcionários',
        route: '/dashboard/rh/documentos',
        requiredPermissions: ['people.read'],
        actions: [
          {
            id: 'upload',
            title: 'Upload',
            description: 'Enviar documento',
            permission: 'files.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Atualizar documento',
            permission: 'files.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover documento',
            permission: 'files.delete',
          },
        ],
      },
      {
        id: 'relatorios-rh',
        title: 'Relatórios',
        description: 'Relatórios de RH e people',
        route: '/dashboard/relatorios',
        requiredPermissions: ['domain_events.read'],
        actions: [
          {
            id: 'gerar',
            title: 'Gerar',
            description: 'Gerar relatório',
            permission: 'reports.generate',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório',
            permission: 'reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'recrutamento',
    title: 'Recrutamento',
    description: 'Vagas, candidatos e processos seletivos',
    icon: 'briefcase',
    route: '/dashboard/recrutamento',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['jobs.read', 'candidates.read'],
    features: [
      {
        id: 'vagas',
        title: 'Vagas',
        description: 'Gerencie vagas abertas e publicadas',
        route: '/dashboard/vagas',
        requiredPermissions: ['jobs.read'],
        actions: [
          {
            id: 'criar',
            title: 'Nova vaga',
            description: 'Publicar nova vaga',
            permission: 'jobs.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar vaga',
            permission: 'jobs.update',
          },
          {
            id: 'arquivar',
            title: 'Arquivar',
            description: 'Arquivar vaga',
            permission: 'jobs.archive',
          },
          {
            id: 'publicar',
            title: 'Publicar',
            description: 'Publicar vaga',
            permission: 'jobs.publish',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar vagas',
            permission: 'jobs.export',
          },
        ],
      },
      {
        id: 'candidatos',
        title: 'Candidatos',
        description: 'Banco de talentos e currículos',
        route: '/dashboard/candidatos',
        requiredPermissions: ['candidates.read'],
        actions: [
          {
            id: 'criar',
            title: 'Adicionar',
            description: 'Adicionar candidato',
            permission: 'candidates.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar candidato',
            permission: 'candidates.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover candidato',
            permission: 'candidates.delete',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar candidatos',
            permission: 'candidates.export',
          },
        ],
      },
      {
        id: 'candidaturas',
        title: 'Candidaturas',
        description: 'Acompanhe candidaturas e status',
        route: '/dashboard/candidaturas',
        requiredPermissions: ['applications.read'],
        actions: [
          {
            id: 'aprovar',
            title: 'Aprovar',
            description: 'Aprovar candidatura',
            permission: 'applications.approve',
          },
          {
            id: 'rejeitar',
            title: 'Rejeitar',
            description: 'Rejeitar candidatura',
            permission: 'applications.reject',
          },
          {
            id: 'entrevistar',
            title: 'Entrevistar',
            description: 'Agendar entrevista',
            permission: 'applications.interview',
          },
        ],
      },
      {
        id: 'processos-seletivos',
        title: 'Processos seletivos',
        description: 'Acompanhe processos e etapas',
        route: '/dashboard/processos-seletivos',
        requiredPermissions: ['jobs.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar processo',
            description: 'Novo processo seletivo',
            permission: 'recruitment.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar processo',
            permission: 'recruitment.update',
          },
          {
            id: 'fechar',
            title: 'Fechar',
            description: 'Fechar processo',
            permission: 'recruitment.close',
          },
        ],
      },
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    description: 'Contas a pagar, receber, fluxo de caixa e gestão financeira',
    icon: 'dollar-sign',
    route: '/dashboard/financeiro',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['finance.dashboard.read'],
    features: [
      {
        id: 'contas-pagar',
        title: 'Contas a pagar',
        description: 'Obrigações e vencimentos',
        route: '/dashboard/financeiro/contas-pagar',
        requiredPermissions: ['finance.accounts_payable.read'],
        actions: [
          {
            id: 'criar',
            title: 'Nova conta',
            description: 'Registrar conta a pagar',
            permission: 'finance.accounts_payable.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar conta a pagar',
            permission: 'finance.accounts_payable.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover conta a pagar',
            permission: 'finance.accounts_payable.delete',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar contas a pagar',
            permission: 'finance.reports.export',
          },
        ],
      },
      {
        id: 'contas-receber',
        title: 'Contas a receber',
        description: 'Recebimentos e cobranças',
        route: '/dashboard/financeiro/contas-receber',
        requiredPermissions: ['finance.accounts_receivable.read'],
        actions: [
          {
            id: 'criar',
            title: 'Nova conta',
            description: 'Registrar conta a receber',
            permission: 'finance.accounts_receivable.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar conta a receber',
            permission: 'finance.accounts_receivable.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover conta a receber',
            permission: 'finance.accounts_receivable.delete',
          },
          {
            id: 'cobrar',
            title: 'Cobrar',
            description: 'Registrar cobrança',
            permission: 'finance.collections.manage',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar contas a receber',
            permission: 'finance.reports.export',
          },
        ],
      },
      {
        id: 'fluxo-caixa',
        title: 'Fluxo de caixa',
        description: 'Visão financeira do período',
        route: '/dashboard/financeiro/fluxo-caixa',
        requiredPermissions: ['finance.cashflow.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar fluxo de caixa',
            permission: 'finance.reports.export',
          },
        ],
      },
      {
        id: 'faturamento',
        title: 'Faturamento',
        description: 'Notas e faturamento',
        route: '/dashboard/financeiro/faturamento',
        requiredPermissions: ['finance.billing.read'],
        actions: [
          {
            id: 'criar',
            title: 'Nova nota',
            description: 'Emitir nota fiscal',
            permission: 'finance.billing.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar fatura',
            permission: 'finance.billing.update',
          },
          {
            id: 'cancelar',
            title: 'Cancelar',
            description: 'Cancelar fatura',
            permission: 'finance.billing.cancel',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar faturamento',
            permission: 'finance.reports.export',
          },
        ],
      },
      {
        id: 'conciliacao',
        title: 'Conciliação',
        description: 'Conciliação bancária e confirmações',
        route: '/dashboard/financeiro/conciliacao',
        requiredPermissions: ['finance.read'],
      },
      {
        id: 'bancos',
        title: 'Bancos',
        description: 'Contas bancárias e movimentações',
        route: '/dashboard/financeiro/bancos',
        requiredPermissions: ['finance.read'],
      },
      {
        id: 'centro-custos',
        title: 'Centro de custos',
        description: 'Gestão de centros de custo',
        route: '/dashboard/financeiro/centro-custos',
        requiredPermissions: ['finance.read'],
      },
      {
        id: 'fornecedores',
        title: 'Fornecedores',
        description: 'Fornecedores e condições comerciais',
        route: '/dashboard/fornecedores',
        requiredPermissions: ['finance.suppliers.read'],
      },
      {
        id: 'relatorios-financeiros',
        title: 'Relatórios',
        description: 'Relatórios financeiros',
        route: '/dashboard/relatorios',
        requiredPermissions: ['finance.reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatórios',
            permission: 'finance.reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'fiscal',
    title: 'Fiscal',
    description: 'Notas fiscais, emissão e conformidade tributária',
    icon: 'file-text',
    route: '/dashboard/fiscal',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['fiscal.dashboard.read'],
    features: [
      {
        id: 'notas-fiscais',
        title: 'Notas fiscais',
        description: 'Emissão, cancelamento e correção',
        route: '/dashboard/fiscal/notas-fiscais',
        requiredPermissions: ['fiscal.invoices.read'],
        actions: [
          {
            id: 'emitir',
            title: 'Emitir',
            description: 'Emitir nota fiscal',
            permission: 'fiscal.invoices.issue',
          },
          {
            id: 'cancelar',
            title: 'Cancelar',
            description: 'Cancelar nota fiscal',
            permission: 'fiscal.invoices.cancel',
          },
          {
            id: 'inutilizar',
            title: 'Inutilizar',
            description: 'Inutilizar nota fiscal',
            permission: 'fiscal.invoices.void',
          },
        ],
      },
      {
        id: 'notas-recebidas',
        title: 'Notas recebidas',
        description: 'Entradas e importação',
        route: '/dashboard/fiscal/notas-recebidas',
        requiredPermissions: ['fiscal.invoices.read'],
      },
      {
        id: 'retencoes',
        title: 'Retenções',
        description: 'Controle de retenções tributárias',
        route: '/dashboard/fiscal/retencoes',
        requiredPermissions: ['fiscal.taxes.read'],
      },
      {
        id: 'relatorios-fiscais',
        title: 'Relatórios fiscais',
        description: 'Obrigações e relatórios tributários',
        route: '/dashboard/fiscal/relatorios',
        requiredPermissions: ['fiscal.reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatórios fiscais',
            permission: 'fiscal.reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'contabilidade',
    title: 'Contabilidade',
    description: 'Plano de contas, lançamentos e fechamento contábil',
    icon: 'book-open',
    route: '/dashboard/contabilidade',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['accounting.dashboard.read'],
    features: [
      {
        id: 'plano-contas',
        title: 'Plano de contas',
        description: 'Estrutura contábil',
        route: '/dashboard/contabilidade/plano-contas',
        requiredPermissions: ['accounting.chart_of_accounts.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Nova conta',
            permission: 'accounting.chart_of_accounts.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar conta',
            permission: 'accounting.chart_of_accounts.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover conta',
            permission: 'accounting.chart_of_accounts.delete',
          },
        ],
      },
      {
        id: 'lancamentos',
        title: 'Lançamentos',
        description: 'Partidas e diário',
        route: '/dashboard/contabilidade/lancamentos',
        requiredPermissions: ['accounting.entries.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Novo lançamento',
            permission: 'accounting.entries.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar lançamento',
            permission: 'accounting.entries.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover lançamento',
            permission: 'accounting.entries.delete',
          },
        ],
      },
      {
        id: 'balancetes',
        title: 'Balancetes',
        description: 'Balancete e balanço',
        route: '/dashboard/contabilidade/balancetes',
        requiredPermissions: ['accounting.trial_balance.read'],
      },
      {
        id: 'fechamento',
        title: 'Fechamento',
        description: 'Fechamento mensal e exercício',
        route: '/dashboard/contabilidade/fechamento',
        requiredPermissions: ['accounting.reconciliation.read'],
      },
      {
        id: 'relatorios-contabeis',
        title: 'Relatórios contábeis',
        description: 'DRE, SPED e obrigações',
        route: '/dashboard/contabilidade/relatorios',
        requiredPermissions: ['accounting.reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatórios contábeis',
            permission: 'accounting.reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'gestao',
    title: 'Gestão',
    description: 'Indicadores, empresas, contratos e equipes',
    icon: 'bar-chart-2',
    route: '/dashboard/gestao',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['companies.read'],
    features: [
      {
        id: 'indicadores',
        title: 'Indicadores',
        description: 'Visão executiva da operação',
        route: '/dashboard/gestao/indicadores',
        requiredPermissions: ['domain_events.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar indicadores',
            permission: 'reports.export',
          },
        ],
      },
      {
        id: 'empresas',
        title: 'Empresas',
        description: 'Empresas e relacionamentos',
        route: '/dashboard/empresas',
        requiredPermissions: ['companies.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Nova empresa',
            permission: 'companies.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar empresa',
            permission: 'companies.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover empresa',
            permission: 'companies.delete',
          },
        ],
      },
      {
        id: 'contratos-gestao',
        title: 'Contratos',
        description: 'Contratos e documentos comerciais',
        route: '/dashboard/gestao/contratos',
        requiredPermissions: ['companies.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Novo contrato',
            permission: 'contracts.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar contrato',
            permission: 'contracts.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover contrato',
            permission: 'contracts.delete',
          },
          {
            id: 'renovar',
            title: 'Renovar',
            description: 'Renovar contrato',
            permission: 'contracts.renew',
          },
        ],
      },
      {
        id: 'servicos',
        title: 'Serviços',
        description: 'Catálogo e ordens de serviço',
        route: '/dashboard/servicos',
        requiredPermissions: [],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Nova ordem de serviço',
            permission: 'service_orders.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar ordem de serviço',
            permission: 'service_orders.update',
          },
          {
            id: 'concluir',
            title: 'Concluir',
            description: 'Concluir ordem de serviço',
            permission: 'service_orders.complete',
          },
        ],
      },
      {
        id: 'equipes',
        title: 'Equipes',
        description: 'Equipes e estrutura organizacional',
        route: '/dashboard/gestao/equipes',
        requiredPermissions: ['people.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Nova equipe',
            permission: 'people.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar equipe',
            permission: 'people.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover equipe',
            permission: 'people.delete',
          },
        ],
      },
      {
        id: 'relatorios-gestao',
        title: 'Relatórios',
        description: 'Relatórios gerenciais',
        route: '/dashboard/relatorios',
        requiredPermissions: ['domain_events.read'],
        actions: [
          {
            id: 'gerar',
            title: 'Gerar',
            description: 'Gerar relatório',
            permission: 'reports.generate',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório',
            permission: 'reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'estoque',
    title: 'Estoque',
    description: 'Produtos, materiais e movimentações',
    icon: 'package',
    route: '/dashboard/estoque',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['stock_movements.read'],
    features: [
      {
        id: 'produtos',
        title: 'Produtos',
        description: 'Produtos e materiais',
        route: '/dashboard/estoque/produtos',
        requiredPermissions: ['products.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Novo produto',
            permission: 'products.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar produto',
            permission: 'products.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover produto',
            permission: 'products.delete',
          },
        ],
      },
      {
        id: 'movimentacoes',
        title: 'Movimentações',
        description: 'Histórico de movimentações',
        route: '/dashboard/estoque/movimentacoes',
        requiredPermissions: ['stock_movements.read'],
        actions: [
          {
            id: 'entrada',
            title: 'Entrada',
            description: 'Registrar entrada',
            permission: 'stock_movements.create',
          },
          {
            id: 'saida',
            title: 'Saída',
            description: 'Registrar saída',
            permission: 'stock_movements.create',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar movimentações',
            permission: 'stock_movements.export',
          },
        ],
      },
    ],
  },
  {
    id: 'servicos',
    title: 'Serviços',
    description: 'Catálogo e ordens de serviço',
    icon: 'wrench',
    route: '/dashboard/servicos',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['service_orders.read'],
    features: [
      {
        id: 'catalogo',
        title: 'Catálogo',
        description: 'Serviços disponíveis',
        route: '/dashboard/servicos',
        requiredPermissions: ['service_orders.read'],
      },
      {
        id: 'ordens',
        title: 'Ordens de serviço',
        description: 'Ordens abertas e encerradas',
        route: '/dashboard/servicos/ordens',
        requiredPermissions: ['service_orders.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Nova ordem',
            permission: 'service_orders.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar ordem',
            permission: 'service_orders.update',
          },
          {
            id: 'concluir',
            title: 'Concluir',
            description: 'Concluir ordem',
            permission: 'service_orders.complete',
          },
          {
            id: 'cancelar',
            title: 'Cancelar',
            description: 'Cancelar ordem',
            permission: 'service_orders.cancel',
          },
        ],
      },
      {
        id: 'chamados',
        title: 'Chamados',
        description: 'Chamados de serviço',
        route: '/dashboard/servicos/chamados',
        requiredPermissions: ['support_tickets.read'],
        actions: [
          {
            id: 'criar',
            title: 'Abrir',
            description: 'Abrir chamado',
            permission: 'support_tickets.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar chamado',
            permission: 'support_tickets.update',
          },
          {
            id: 'resolver',
            title: 'Resolver',
            description: 'Resolver chamado',
            permission: 'support_tickets.resolve',
          },
        ],
      },
    ],
  },
  {
    id: 'suporte',
    title: 'Suporte',
    description: 'Chamados, FAQ e atendimento',
    icon: 'headphones',
    route: '/dashboard/suporte',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['support_tickets.read'],
    features: [
      {
        id: 'chamados',
        title: 'Chamados',
        description: 'Abrir e acompanhar chamados',
        route: '/dashboard/suporte/chamados',
        requiredPermissions: ['support_tickets.read'],
        actions: [
          {
            id: 'criar',
            title: 'Abrir',
            description: 'Abrir chamado',
            permission: 'support_tickets.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar chamado',
            permission: 'support_tickets.update',
          },
          {
            id: 'resolver',
            title: 'Resolver',
            description: 'Resolver chamado',
            permission: 'support_tickets.resolve',
          },
          {
            id: 'fechar',
            title: 'Fechar',
            description: 'Fechar chamado',
            permission: 'support_tickets.close',
          },
        ],
      },
      {
        id: 'faq',
        title: 'FAQ',
        description: 'Perguntas frequentes',
        route: '/dashboard/suporte/faq',
        requiredPermissions: ['support_tickets.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Nova pergunta',
            permission: 'support_tickets.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar FAQ',
            permission: 'support_tickets.update',
          },
        ],
      },
      {
        id: 'feedback',
        title: 'Feedback',
        description: 'Envie sugestões e feedback',
        route: '/dashboard/suporte/feedback',
        requiredPermissions: ['support_tickets.read'],
      },
      {
        id: 'solicitacoes',
        title: 'Solicitações',
        description: 'Solicitações e chamados internos',
        route: '/dashboard/suporte/solicitacoes',
        requiredPermissions: ['support_tickets.read'],
      },
    ],
  },
  {
    id: 'relatorios',
    title: 'Relatórios',
    description: 'Relatórios gerais da operação',
    icon: 'bar-chart-3',
    route: '/dashboard/relatorios',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['reports.read'],
    features: [
      {
        id: 'relatorios-rh',
        title: 'RH',
        description: 'Relatórios de RH',
        route: '/dashboard/relatorios',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'gerar',
            title: 'Gerar',
            description: 'Gerar relatório',
            permission: 'reports.generate',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório',
            permission: 'reports.export',
          },
        ],
      },
      {
        id: 'relatorios-financeiros',
        title: 'Financeiro',
        description: 'Relatórios financeiros',
        route: '/dashboard/relatorios',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'gerar',
            title: 'Gerar',
            description: 'Gerar relatório',
            permission: 'reports.generate',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório',
            permission: 'reports.export',
          },
        ],
      },
      {
        id: 'relatorios-gestao',
        title: 'Gestão',
        description: 'Relatórios gerenciais',
        route: '/dashboard/relatorios',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'gerar',
            title: 'Gerar',
            description: 'Gerar relatório',
            permission: 'reports.generate',
          },
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório',
            permission: 'reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'ia',
    title: 'IA & Automação',
    description: 'Assistente IA, automações e integrações',
    icon: 'cpu',
    route: '/dashboard/ia',
    category: 'ia',
    scope: 'tenant',
    requiredPermissions: [],
    features: [
      {
        id: 'assistente',
        title: 'Assistente IA',
        description: 'Configure e utilize o assistente',
        route: '/dashboard/ia/assistente',
        requiredPermissions: [],
        actions: [
          {
            id: 'configurar',
            title: 'Configurar',
            description: 'Configurar assistente',
            permission: 'ai.configure',
          },
          {
            id: 'testar',
            title: 'Testar',
            description: 'Testar assistente',
            permission: 'ai.test',
          },
        ],
      },
      {
        id: 'automacoes',
        title: 'Automações',
        description: 'Workflows e automações',
        route: '/dashboard/ia/automacoes',
        requiredPermissions: [],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Nova automação',
            permission: 'automations.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar automação',
            permission: 'automations.update',
          },
          {
            id: 'ativar',
            title: 'Ativar/Desativar',
            description: 'Ativar ou desativar automação',
            permission: 'automations.toggle',
          },
        ],
      },
      {
        id: 'conversas',
        title: 'Conversas IA',
        description: 'Histórico de conversas',
        route: '/dashboard/ia/conversas',
        requiredPermissions: [],
      },
      {
        id: 'integracoes-ia',
        title: 'Integrações',
        description: 'Webhooks e integrações',
        route: '/dashboard/ia/integracoes',
        requiredPermissions: ['integrations.manage'],
        actions: [
          {
            id: 'conectar',
            title: 'Conectar',
            description: 'Conectar integração',
            permission: 'integrations.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar integração',
            permission: 'integrations.update',
          },
          {
            id: 'desconectar',
            title: 'Desconectar',
            description: 'Remover integração',
            permission: 'integrations.delete',
          },
        ],
      },
    ],
  },
  {
    id: 'integracoes',
    title: 'Integrações',
    description: 'Supabase, n8n, WhatsApp, e-mail',
    icon: 'plug',
    route: '/dashboard/integracoes',
    category: 'plataforma',
    scope: 'platform',
    requiredPermissions: ['integrations.manage'],
    features: [
      {
        id: 'supabase',
        title: 'Supabase',
        description: 'Configuração do Supabase',
        route: '/dashboard/integracoes/supabase',
        requiredPermissions: ['integrations.manage'],
        actions: [
          {
            id: 'configurar',
            title: 'Configurar',
            description: 'Alterar configuração',
            permission: 'integrations.update',
          },
          {
            id: 'testar',
            title: 'Testar',
            description: 'Testar conexão',
            permission: 'integrations.test',
          },
        ],
      },
      {
        id: 'n8n',
        title: 'n8n',
        description: 'Automações e webhooks',
        route: '/dashboard/integracoes/n8n',
        requiredPermissions: ['integrations.manage'],
        actions: [
          {
            id: 'configurar',
            title: 'Configurar',
            description: 'Alterar configuração',
            permission: 'integrations.update',
          },
          {
            id: 'testar',
            title: 'Testar',
            description: 'Testar webhook',
            permission: 'integrations.test',
          },
        ],
      },
      {
        id: 'whatsapp',
        title: 'WhatsApp',
        description: 'Integração WhatsApp',
        route: '/dashboard/integracoes/whatsapp',
        requiredPermissions: ['integrations.manage'],
        actions: [
          {
            id: 'configurar',
            title: 'Configurar',
            description: 'Alterar configuração',
            permission: 'integrations.update',
          },
          {
            id: 'testar',
            title: 'Testar',
            description: 'Testar envio',
            permission: 'integrations.test',
          },
        ],
      },
      {
        id: 'email',
        title: 'E-mail',
        description: 'SMTP e e-mails',
        route: '/dashboard/integracoes/email',
        requiredPermissions: ['integrations.manage'],
        actions: [
          {
            id: 'configurar',
            title: 'Configurar',
            description: 'Alterar configuração',
            permission: 'integrations.update',
          },
          {
            id: 'testar',
            title: 'Testar',
            description: 'Testar envio',
            permission: 'integrations.test',
          },
        ],
      },
    ],
  },
  {
    id: 'configuracoes-saas',
    title: 'Configurações SaaS',
    description: 'Configurações globais da plataforma',
    icon: 'settings',
    route: '/dashboard/configuracoes',
    category: 'plataforma',
    scope: 'platform',
    requiredPermissions: ['tenant.manage'],
    features: [
      {
        id: 'geral',
        title: 'Geral',
        description: 'Configurações gerais',
        route: '/dashboard/configuracoes',
        requiredPermissions: ['tenant.manage'],
        actions: [
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar configurações',
            permission: 'tenant.update',
          },
        ],
      },
      {
        id: 'modulos',
        title: 'Módulos',
        description: 'Habilitar/desabilitar módulos',
        route: '/dashboard/configuracoes/modulos',
        requiredPermissions: ['tenant.manage'],
        actions: [
          {
            id: 'habilitar',
            title: 'Habilitar',
            description: 'Habilitar módulo',
            permission: 'tenant.update',
          },
          {
            id: 'desabilitar',
            title: 'Desabilitar',
            description: 'Desabilitar módulo',
            permission: 'tenant.update',
          },
        ],
      },
    ],
  },
  {
    id: 'preferencias',
    title: 'Preferências',
    description: 'Tema, idioma e preferências da conta',
    icon: 'sliders-horizontal',
    route: '/dashboard/configuracoes/preferencias',
    category: 'conta',
    scope: 'tenant',
    requiredPermissions: [],
  },
  {
    id: 'minha-conta',
    title: 'Minha conta',
    description: 'Dados pessoais e preferências',
    icon: 'user',
    route: '/dashboard/configuracoes/conta',
    category: 'conta',
    scope: 'tenant',
    requiredPermissions: [],
    features: [
      {
        id: 'perfil',
        title: 'Perfil',
        description: 'Dados pessoais',
        route: '/dashboard/configuracoes/conta',
        requiredPermissions: [],
        actions: [
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar perfil',
            permission: 'people.update',
          },
        ],
      },
      {
        id: 'notificacoes',
        title: 'Notificações',
        description: 'Preferências de notificação',
        route: '/dashboard/configuracoes/conta/notificacoes',
        requiredPermissions: [],
      },
    ],
  },
  {
    id: 'seguranca-conta',
    title: 'Segurança',
    description: 'Senha, sessões e acesso',
    icon: 'lock',
    route: '/dashboard/configuracoes/seguranca',
    category: 'conta',
    scope: 'tenant',
    requiredPermissions: [],
    features: [
      {
        id: 'senha',
        title: 'Senha',
        description: 'Alterar senha',
        route: '/dashboard/configuracoes/seguranca',
        requiredPermissions: [],
        actions: [
          {
            id: 'alterar',
            title: 'Alterar',
            description: 'Alterar senha',
            permission: 'auth.change_password',
          },
        ],
      },
      {
        id: 'sessoes',
        title: 'Sessões',
        description: 'Sessões ativas',
        route: '/dashboard/configuracoes/seguranca/sessoes',
        requiredPermissions: [],
        actions: [
          {
            id: 'encerrar',
            title: 'Encerrar',
            description: 'Encerrar sessão',
            permission: 'auth.revoke_session',
          },
        ],
      },
    ],
  },
];

const CATEGORY_META: Record<ModuleCategory, { label: string; order: number }> =
  {
    inicio: { label: 'INÍCIO', order: 0 },
    plataforma: { label: 'PLATAFORMA', order: 1 },
    negocio: { label: 'OPERAÇÃO', order: 2 },
    ia: { label: 'IA & AUTOMAÇÃO', order: 3 },
    seguranca: { label: 'SEGURANÇA', order: 4 },
    documentos: { label: 'DOCUMENTOS', order: 5 },
    conta: { label: 'CONTA', order: 6 },
  };

export function hasModulePermission(
  permissions: Permission[],
  requiredPermissions: string[] = [],
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.some((perm) =>
    permissions.some((p) => `${p.resource}.${p.action}` === perm),
  );
}

export function getAvailableModules(
  permissions: Permission[],
  scope: 'platform' | 'tenant' | ('platform' | 'tenant')[] = 'tenant',
): ModuleDefinition[] {
  const scopes = Array.isArray(scope) ? scope : [scope];
  return PORTAL_MODULES.filter((module) => {
    if (!scopes.includes(module.scope)) return false;
    return hasModulePermission(permissions, module.requiredPermissions);
  });
}

export function getAvailableFeatures(
  permissions: Permission[],
  module: ModuleDefinition,
  scope: 'platform' | 'tenant' | ('platform' | 'tenant')[] = 'tenant',
): ModuleFeature[] {
  const scopes = Array.isArray(scope) ? scope : [scope];
  if (!module.features) return [];
  if (!scopes.includes(module.scope)) return [];
  return module.features.filter((feature) =>
    hasModulePermission(permissions, feature.requiredPermissions),
  );
}

export function getModuleActions(
  permissions: Permission[],
  module: ModuleDefinition,
): ModuleAction[] {
  if (!module.features) return [];
  const actions: ModuleAction[] = [];
  for (const feature of module.features) {
    if (feature.actions) {
      for (const action of feature.actions) {
        if (hasModulePermission(permissions, [action.permission])) {
          actions.push(action);
        }
      }
    }
  }
  return actions;
}

export function groupModulesByCategory(
  modules: ModuleDefinition[],
): Record<ModuleCategory, ModuleDefinition[]> {
  const grouped = modules.reduce<Record<string, ModuleDefinition[]>>(
    (acc, module) => {
      const key = module.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(module);
      return acc;
    },
    {},
  );

  const ordered: Record<ModuleCategory, ModuleDefinition[]> = {
    inicio: [],
    plataforma: [],
    negocio: [],
    ia: [],
    seguranca: [],
    documentos: [],
    conta: [],
  };

  (Object.keys(CATEGORY_META) as ModuleCategory[]).forEach((category) => {
    if (grouped[category]) {
      ordered[category] = grouped[category];
    }
  });

  return ordered;
}

export { CATEGORY_META };

export const MODULE_PAGE_MAP: Record<string, string> = {
  inicio: 'DashboardHome',
  tenants: 'TenantsPage',
  clientes: 'ClientesPage',
  onboarding: 'OnboardingPage',
  assinaturas: 'AssinaturasPage',
  'gestao-saas': 'GestaoSaaSPage',
  usuarios: 'UsuariosPage',
  'roles-permissoes': 'RolesPermissoesPage',
  auditoria: 'AuditoriaPage',
  documentos: 'DocumentosPage',
  contratos: 'ContratosPage',
  termos: 'TermosPage',
  rh: 'RhPage',
  recrutamento: 'VagasPage',
  financeiro: 'FinanceiroPage',
  fiscal: 'FiscalPage',
  contabilidade: 'ContabilidadePage',
  gestao: 'GestaoPage',
  estoque: 'EstoquePage',
  servicos: 'ServicosPage',
  suporte: 'SuportePage',
  relatorios: 'RelatoriosPage',
  ia: 'IaPage',
  'configuracoes-saas': 'ConfiguracoesPage',
  integracoes: 'IntegracoesPage',
  preferencias: 'ConfiguracoesPage',
  'minha-conta': 'ConfiguracoesPage',
  'seguranca-conta': 'SegurancaPage',
};

export const MODULE_PERMISSION_MAP: Record<string, string> = {
  inicio: '',
  tenants: 'tenants.read',
  clientes: 'companies.read',
  onboarding: 'tenants.read',
  assinaturas: 'finance.read',
  'gestao-saas': 'domain_events.read',
  usuarios: 'people.read',
  'roles-permissoes': 'roles.read',
  auditoria: 'audit.read',
  documentos: 'files.read',
  contratos: 'contracts.read',
  termos: 'documents.read',
  rh: 'people.read',
  recrutamento: 'jobs.read',
  financeiro: 'finance.dashboard.read',
  fiscal: 'fiscal.dashboard.read',
  contabilidade: 'accounting.dashboard.read',
  gestao: 'companies.read',
  estoque: 'stock_movements.read',
  servicos: '',
  suporte: 'support_tickets.read',
  relatorios: 'domain_events.read',
  ia: '',
  'configuracoes-saas': 'tenant.manage',
  integracoes: 'integrations.manage',
  preferencias: '',
  'minha-conta': '',
  'seguranca-conta': '',
};
