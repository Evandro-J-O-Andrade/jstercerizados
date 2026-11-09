const MODULE_PERMISSION_ENTRIES = {
  dashboard: 'dashboard.read',
  analitico: 'domain_events.read',
  empresas: 'companies.read',
  candidatos: 'candidates.read',
  vagas: 'jobs.read',
  servicos: 'services.read',
  suporte: 'support_tickets.read',
  almoxarifado: 'stock.read',
  financeiro: 'finance.dashboard.read',
  relatorios: 'reports.read',
  rh: 'people.read',
  notificacoes: 'notifications.read',
  recrutamento: 'recruitment.read',
  contabilidade: 'accounting.dashboard.read',
  fiscal: 'fiscal.read',
  estoque: 'stock.read',
  operacoes: 'operations.read',
  pos: 'pos.read',
  media: 'media.read',
  ava: 'ava.read',
  tenants: 'tenants.read',
  onboarding: 'onboarding.manage',
  assinaturas: 'subscriptions.read',
  'gestao-saas': 'saas.manage',
  'roles-permissoes': 'roles.manage',
  usuarios: 'people.read',
  auditoria: 'audit.read',
  ia: 'ai.read',
  integracoes: 'integrations.read',
  'seguranca-conta': 'auth.manage',
  configuracoes: 'settings.read',
} as const;

export const MODULE_PERMISSION_MAP: Readonly<Record<string, string>> =
  MODULE_PERMISSION_ENTRIES;

export type ModulePermissionKey = keyof typeof MODULE_PERMISSION_ENTRIES;
export type ModulePermissionValue =
  (typeof MODULE_PERMISSION_ENTRIES)[ModulePermissionKey];
