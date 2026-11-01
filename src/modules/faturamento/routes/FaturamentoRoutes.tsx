import type { ModuleRoute } from '@/platform/router/types';
const FaturamentoHome = () => <div>Em construção</div>;
export const faturamentoRoutes: ModuleRoute[] = [{ path: '', label: 'Faturamento', element: FaturamentoHome, requiredPermissions: ['finance.billing.read'] }];
