export interface NavLink {
  label: string;
  href: string;
  auth?: boolean;
}

export const NAVIGATION_LINKS: NavLink[] = [
  { label: 'Início', href: '/' },
  { label: 'Vagas', href: '/vagas' },
  { label: 'Empresas', href: '/empresas' },
  { label: 'Candidatos', href: '/candidatos' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Sobre Nós', href: '/sobre' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contato', href: '/contato' },
  { label: 'Entrar', href: '/login' },
];

export interface DashboardLink {
  label: string;
  href: string;
  icon: string;
  requireAuth?: boolean;
}

export const DASHBOARD_LINKS: DashboardLink[] = [
  { label: 'Visão Geral', href: '/dashboard', icon: 'layout-dashboard' },
  {
    label: 'Empresas',
    href: '/dashboard/empresas',
    icon: 'building',
    requireAuth: true,
  },
  {
    label: 'Vagas',
    href: '/dashboard/vagas',
    icon: 'briefcase',
    requireAuth: true,
  },
  {
    label: 'Candidatos',
    href: '/dashboard/candidatos',
    icon: 'users',
    requireAuth: true,
  },
  {
    label: 'Currículos',
    href: '/dashboard/curriculos',
    icon: 'file-text',
    requireAuth: true,
  },
  {
    label: 'Processos',
    href: '/dashboard/processos',
    icon: 'git-pull-request',
    requireAuth: true,
  },
  { label: 'Blog', href: '/dashboard/blog', icon: 'pen', requireAuth: true },
  {
    label: 'FAQ',
    href: '/dashboard/faq',
    icon: 'help-circle',
    requireAuth: true,
  },
  {
    label: 'Usuários',
    href: '/dashboard/usuarios',
    icon: 'user-cog',
    requireAuth: true,
  },
  {
    label: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: 'settings',
    requireAuth: true,
  },
];
