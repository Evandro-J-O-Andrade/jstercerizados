import type { ModuleRoute } from '@/platform/router/types';
const RelatoriosHome = () => <div>Em construção</div>;
export const relatoriosRoutes: ModuleRoute[] = [{ path: '', label: 'Relatórios', element: RelatoriosHome, requiredPermissions: ['reports.read'] }];
