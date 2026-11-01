import type { ModuleRoute } from '@/platform/router/types';
const ConfiguracoesSaasHome = () => <div>Em construção</div>;
export const configuracoesSaasRoutes: ModuleRoute[] = [{ path: '', label: 'Configurações SaaS', element: ConfiguracoesSaasHome, requiredPermissions: ['tenant.manage'] }];
