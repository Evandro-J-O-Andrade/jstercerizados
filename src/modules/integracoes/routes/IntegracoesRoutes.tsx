import type { ModuleRoute } from '@/platform/router/types';

const IntegracoesHome = () => <div>Em construção</div>;

export const integracoesRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Integrações',
    element: IntegracoesHome,
    requiredPermissions: ['integrations.manage'],
  },
];
