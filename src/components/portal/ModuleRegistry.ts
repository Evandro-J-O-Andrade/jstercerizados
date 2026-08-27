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
  features?: ModuleFeature[];
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
      {
        id: 'rbac-auditoria',
        title: 'RBAC',
        description: 'Auditoria de papéis e permissões',
        route: '/dashboard/rbac-auditoria',
        requiredPermissions: ['audit.read'],
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
    id: 'rh',
    title: 'Recursos Humanos',
    description: 'Gestão de pessoas, funcionários e processos internos',
    icon: 'users',
    route: '/dashboard/rh',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['people.read'],
    features: [
      {
        id: 'dashboard-rh',
        title: 'Dashboard RH',
        description: 'Visão geral do módulo de RH',
        route: '/dashboard/rh',
        requiredPermissions: ['people.read'],
      },
      {
        id: 'funcionarios',
        title: 'Funcionários',
        description: 'Gerencie funcionários ativos, admissões e afastamentos',
        route: '/dashboard/funcionarios',
        requiredPermissions: ['people.read'],
        features: [
          {
            id: 'funcionarios-lista',
            title: 'Funcionários',
            description: 'Lista de funcionários',
            route: '/dashboard/funcionarios',
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
            id: 'experiencias',
            title: 'Experiências',
            description: 'Experiências profissionais dos funcionários',
            route: '/dashboard/experiencias',
            requiredPermissions: ['people.read'],
          },
          {
            id: 'formacao',
            title: 'Formação',
            description: 'Formação acadêmica dos funcionários',
            route: '/dashboard/formacao',
            requiredPermissions: ['people.read'],
          },
          {
            id: 'cursos',
            title: 'Cursos',
            description: 'Cursos dos funcionários',
            route: '/dashboard/cursos',
            requiredPermissions: ['people.read'],
          },
          {
            id: 'idiomas',
            title: 'Idiomas',
            description: 'Idiomas dos funcionários',
            route: '/dashboard/idiomas',
            requiredPermissions: ['people.read'],
          },
          {
            id: 'habilidades',
            title: 'Habilidades',
            description: 'Habilidades dos funcionários',
            route: '/dashboard/habilidades',
            requiredPermissions: ['people.read'],
          },
          {
            id: 'documentos-rh',
            title: 'Documentos',
            description: 'Documentos de pessoas e funcionários',
            route: '/dashboard/documentos-rh',
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
        ],
      },
      {
        id: 'banco-de-talentos',
        title: 'Banco de Talentos',
        description: 'Consulta e inteligência sobre candidatos',
        route: '/dashboard/banco-de-talentos',
        requiredPermissions: ['candidates.read'],
      },
      {
        id: 'clientes',
        title: 'Clientes',
        description: 'Clientes e relacionamentos comerciais',
        route: '/dashboard/clientes',
        requiredPermissions: ['companies.read'],
        actions: [
          {
            id: 'criar',
            title: 'Criar',
            description: 'Novo cliente',
            permission: 'companies.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar cliente',
            permission: 'companies.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover cliente',
            permission: 'companies.delete',
          },
        ],
      },
      {
        id: 'relatorios-rh',
        title: 'Relatórios RH',
        description: 'Relatórios do módulo de RH',
        route: '/dashboard/relatorios/rh',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório RH',
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
        id: 'candidatos-habilidades',
        title: 'Habilidades',
        description: 'Gerencie habilidades dos candidatos',
        route: '/dashboard/candidatos/habilidades',
        requiredPermissions: ['candidates.read'],
      },
      {
        id: 'candidatos-formacao',
        title: 'Formação',
        description: 'Gerencie a formação acadêmica dos candidatos',
        route: '/dashboard/candidatos/formacao',
        requiredPermissions: ['candidates.read'],
      },
      {
        id: 'candidatos-experiencias',
        title: 'Experiências',
        description: 'Gerencie as experiências profissionais dos candidatos',
        route: '/dashboard/candidatos/experiencias',
        requiredPermissions: ['candidates.read'],
      },
      {
        id: 'candidatos-idiomas',
        title: 'Idiomas',
        description: 'Gerencie os idiomas dos candidatos',
        route: '/dashboard/candidatos/idiomas',
        requiredPermissions: ['candidates.read'],
      },
      {
        id: 'candidatos-documentos',
        title: 'Documentos',
        description: 'Gerencie os documentos dos candidatos',
        route: '/dashboard/candidatos/documentos',
        requiredPermissions: ['candidates.read'],
      },
      {
        id: 'candidatos-preferencias',
        title: 'Preferências',
        description: 'Gerencie as preferências de matching dos candidatos',
        route: '/dashboard/candidatos/preferencias',
        requiredPermissions: ['candidates.read'],
      },
      {
        id: 'candidatos-visualizacoes',
        title: 'Visualizações',
        description: 'Acompanhe as visualizações de perfil dos candidatos',
        route: '/dashboard/candidatos/visualizacoes',
        requiredPermissions: ['candidates.read'],
      },
      {
        id: 'matches',
        title: 'Matches',
        description: 'Gerencie os matches entre candidatos e vagas',
        route: '/dashboard/matches',
        requiredPermissions: ['jobs.read'],
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
      {
        id: 'etapas',
        title: 'Etapas de Recrutamento',
        description: 'Gerencie etapas dos processos seletivos',
        route: '/dashboard/etapas',
        requiredPermissions: ['recruitment.stage.manage'],
        actions: [
          {
            id: 'criar',
            title: 'Criar etapa',
            description: 'Nova etapa',
            permission: 'recruitment.stage.manage',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar etapa',
            permission: 'recruitment.stage.manage',
          },
        ],
      },
      {
        id: 'relatorios-recrutamento',
        title: 'Relatórios de Recrutamento',
        description: 'Relatórios do módulo de recrutamento',
        route: '/dashboard/relatorios/recrutamento',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório de recrutamento',
            permission: 'reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    description: 'Relacionamento, leads, prospects e pipeline',
    icon: 'users',
    route: '/dashboard/crm',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['companies.read'],
    features: [
      {
        id: 'dashboard-crm',
        title: 'Dashboard CRM',
        description: 'Visão geral do relacionamento com clientes',
        route: '/dashboard/crm',
        requiredPermissions: ['companies.read'],
      },
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
      {
        id: 'relacionamentos',
        title: 'Relacionamentos',
        description: 'Relacionamentos entre empresas',
        route: '/dashboard/relacionamentos',
        requiredPermissions: ['companies.read'],
      },
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
        id: 'servicos-gestao',
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
        id: 'relatorios-crm',
        title: 'Relatórios CRM',
        description: 'Relatórios do módulo de CRM',
        route: '/dashboard/relatorios/crm',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório CRM',
            permission: 'reports.export',
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
        id: 'bancos',
        title: 'Bancos',
        description: 'Contas bancárias e movimentações',
        route: '/dashboard/financeiro/bancos',
        requiredPermissions: ['finance.read'],
        actions: [
          {
            id: 'criar',
            title: 'Nova conta',
            description: 'Cadastrar conta bancária',
            permission: 'finance.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar conta bancária',
            permission: 'finance.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover conta bancária',
            permission: 'finance.delete',
          },
        ],
      },
      {
        id: 'centro-custos',
        title: 'Centro de custos',
        description: 'Gestão de centros de custo',
        route: '/dashboard/financeiro/centro-custos',
        requiredPermissions: ['finance.read'],
        actions: [
          {
            id: 'criar',
            title: 'Novo centro',
            description: 'Cadastrar centro de custo',
            permission: 'finance.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar centro de custo',
            permission: 'finance.update',
          },
          {
            id: 'excluir',
            title: 'Excluir',
            description: 'Remover centro de custo',
            permission: 'finance.delete',
          },
        ],
      },
      {
        id: 'relatorios-financeiro',
        title: 'Relatórios Financeiros',
        description: 'Demonstrativos e análises financeiras',
        route: '/dashboard/relatorios/financeiro',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório financeiro',
            permission: 'reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'faturamento',
    title: 'Faturamento',
    description: 'Faturas, vendas, orçamentos e notas fiscais',
    icon: 'file-text',
    route: '/dashboard/faturamento',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['finance.read'],
    features: [
      {
        id: 'dashboard-faturamento',
        title: 'Dashboard Faturamento',
        description: 'Visão geral do faturamento',
        route: '/dashboard/faturamento',
        requiredPermissions: ['finance.read'],
      },
      {
        id: 'faturas',
        title: 'Faturas',
        description: 'Faturas emitidas e recebidas',
        route: '/dashboard/faturamento/faturas',
        requiredPermissions: ['finance.read'],
        actions: [
          {
            id: 'criar',
            title: 'Nova fatura',
            description: 'Emitir fatura',
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
            description: 'Exportar fatura',
            permission: 'finance.reports.export',
          },
        ],
      },
      {
        id: 'vendas',
        title: 'Vendas',
        description: 'Vendas registradas',
        route: '/dashboard/faturamento/vendas',
        requiredPermissions: ['finance.read'],
        actions: [
          {
            id: 'criar',
            title: 'Nova venda',
            description: 'Registrar venda',
            permission: 'finance.billing.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar venda',
            permission: 'finance.billing.update',
          },
        ],
      },
      {
        id: 'orcamentos',
        title: 'Orçamentos',
        description: 'Orçamentos e propostas',
        route: '/dashboard/faturamento/orcamentos',
        requiredPermissions: ['finance.read'],
        actions: [
          {
            id: 'criar',
            title: 'Novo orçamento',
            description: 'Criar orçamento',
            permission: 'finance.billing.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar orçamento',
            permission: 'finance.billing.update',
          },
          {
            id: 'converter',
            title: 'Converter',
            description: 'Converter em venda',
            permission: 'finance.billing.convert',
          },
        ],
      },
      {
        id: 'relatorios-faturamento',
        title: 'Relatórios de Faturamento',
        description: 'Relatórios do módulo de faturamento',
        route: '/dashboard/relatorios/faturamento',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório de faturamento',
            permission: 'reports.export',
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
      {
        id: 'relatorios-fiscal',
        title: 'Relatórios Fiscais',
        description: 'Relatórios do módulo fiscal',
        route: '/dashboard/relatorios/fiscal',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório fiscal',
            permission: 'reports.export',
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
      {
        id: 'relatorios-contabilidade',
        title: 'Relatórios Contábeis',
        description: 'Relatórios do módulo de contabilidade',
        route: '/dashboard/relatorios/contabilidade',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório contábil',
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
      {
        id: 'relatorios-almoxarifado',
        title: 'Relatórios de Almoxarifado',
        description: 'Relatórios do módulo de almoxarifado',
        route: '/dashboard/relatorios/almoxarifado',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório de almoxarifado',
            permission: 'reports.export',
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
        id: 'relatorios-estoque',
        title: 'Relatórios de Estoque',
        description: 'Relatórios do módulo de estoque',
        route: '/dashboard/relatorios/estoque',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório de estoque',
            permission: 'reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'almoxarifado',
    title: 'Almoxarifado',
    description: 'Entradas, saídas, devoluções, custódia e EPI',
    icon: 'package',
    route: '/dashboard/almoxarifado',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['stock_movements.read'],
    features: [
      {
        id: 'dashboard-almoxarifado',
        title: 'Dashboard Almoxarifado',
        description: 'Visão geral do almoxarifado',
        route: '/dashboard/almoxarifado',
        requiredPermissions: ['stock_movements.read'],
      },
      {
        id: 'entradas',
        title: 'Entradas',
        description: 'Entradas de material e recebimentos',
        route: '/dashboard/almoxarifado/entradas',
        requiredPermissions: ['stock_movements.read'],
        actions: [
          {
            id: 'criar',
            title: 'Registrar entrada',
            description: 'Nova entrada',
            permission: 'stock_movements.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar entrada',
            permission: 'stock_movements.update',
          },
        ],
      },
      {
        id: 'saidas',
        title: 'Saídas',
        description: 'Saídas e expedição de materiais',
        route: '/dashboard/almoxarifado/saidas',
        requiredPermissions: ['stock_movements.read'],
        actions: [
          {
            id: 'criar',
            title: 'Registrar saída',
            description: 'Nova saída',
            permission: 'stock_movements.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar saída',
            permission: 'stock_movements.update',
          },
        ],
      },
      {
        id: 'devolucoes',
        title: 'Devoluções',
        description: 'Devoluções de materiais',
        route: '/dashboard/almoxarifado/devolucoes',
        requiredPermissions: ['stock_movements.read'],
        actions: [
          {
            id: 'criar',
            title: 'Registrar devolução',
            description: 'Nova devolução',
            permission: 'stock_movements.create',
          },
          {
            id: 'editar',
            title: 'Editar',
            description: 'Alterar devolução',
            permission: 'stock_movements.update',
          },
        ],
      },
      {
        id: 'custodia',
        title: 'Custódia',
        description: 'Materiais em custódia de terceiros',
        route: '/dashboard/almoxarifado/custodia',
        requiredPermissions: ['stock_movements.read'],
      },
      {
        id: 'epi',
        title: 'EPI',
        description: 'Entrega e devolução de EPIs',
        route: '/dashboard/almoxarifado/epi',
        requiredPermissions: ['stock_movements.read'],
        actions: [
          {
            id: 'entregar',
            title: 'Entregar',
            description: 'Registrar entrega de EPI',
            permission: 'stock_movements.create',
          },
          {
            id: 'devolver',
            title: 'Devolver',
            description: 'Registrar devolução de EPI',
            permission: 'stock_movements.create',
          },
        ],
      },
      {
        id: 'relatorios-servicos',
        title: 'Relatórios de Serviços',
        description: 'Relatórios do módulo de serviços',
        route: '/dashboard/relatorios/servicos',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório de serviços',
            permission: 'reports.export',
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
        requiredPermissions: ['support_tickets.read'        ],
      },
      {
        id: 'relatorios-suporte',
        title: 'Relatórios de Suporte',
        description: 'Relatórios do módulo de suporte',
        route: '/dashboard/relatorios/suporte',
        requiredPermissions: ['reports.read'],
        actions: [
          {
            id: 'exportar',
            title: 'Exportar',
            description: 'Exportar relatório de suporte',
            permission: 'reports.export',
          },
        ],
      },
    ],
  },
  {
    id: 'relatorios',
    title: 'Relatórios',
    description: 'Relatório geral e consolidado da operação',
    icon: 'bar-chart-3',
    route: '/dashboard/relatorios',
    category: 'negocio',
    scope: 'tenant',
    requiredPermissions: ['reports.read'],
    features: [
      {
        id: 'relatorio-geral',
        title: 'Relatório Geral',
        description: 'Visão consolidada de todos os módulos',
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
    features: [
      {
        id: 'notificacoes',
        title: 'Notificações',
        description: 'Preferências de notificação',
        route: '/dashboard/notificacoes',
        requiredPermissions: [],
      },
    ],
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
  onboarding: 'OnboardingPage',
  assinaturas: 'AssinaturasPage',
  'gestao-saas': 'GestaoSaaSPage',
  usuarios: 'UsuariosPage',
  'roles-permissoes': 'RolesPermissoesPage',
  auditoria: 'AuditoriaPage',
  rh: 'DashboardRh',
  recrutamento: 'VagasPage',
  crm: 'ClientesPage',
  financeiro: 'FinanceiroPage',
  faturamento: 'UnderConstruction',
  fiscal: 'FiscalPage',
  contabilidade: 'ContabilidadePage',
  servicos: 'ServicosPage',
  estoque: 'EstoquePage',
  almoxarifado: 'UnderConstruction',
  suporte: 'SuportePage',
  relatorios: 'RelatoriosPage',
  ia: 'IaPage',
  'configuracoes-saas': 'ConfiguracoesPage',
  integracoes: 'IntegracoesPage',
  preferencias: 'ConfiguracoesPage',
  'minha-conta': 'ConfiguracoesPage',
  'seguranca-conta': 'SegurancaPage',
  sessoes: 'SessoesPage',
};

export const MODULE_PERMISSION_MAP: Record<string, string> = {
  inicio: '',
  tenants: 'tenants.read',
  onboarding: 'tenants.read',
  assinaturas: 'finance.read',
  'gestao-saas': 'domain_events.read',
  usuarios: 'people.read',
  'roles-permissoes': 'roles.read',
  auditoria: 'audit.read',
  rh: 'people.read',
  recrutamento: 'jobs.read',
  crm: 'companies.read',
  financeiro: 'finance.dashboard.read',
  faturamento: 'finance.read',
  fiscal: 'fiscal.dashboard.read',
  contabilidade: 'accounting.dashboard.read',
  servicos: '',
  estoque: 'stock_movements.read',
  almoxarifado: 'stock_movements.read',
  suporte: 'support_tickets.read',
  relatorios: 'domain_events.read',
  ia: '',
  'configuracoes-saas': 'tenant.manage',
  integracoes: 'integrations.manage',
  preferencias: '',
  'minha-conta': '',
  'seguranca-conta': '',
  sessoes: 'sessions.read',
};
