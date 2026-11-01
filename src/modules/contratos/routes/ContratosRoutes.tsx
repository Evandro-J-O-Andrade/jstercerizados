import type { ModuleRoute } from '@/platform/router/types';
const ContratosHome = () => <div>Em construção</div>;
export const contratosRoutes: ModuleRoute[] = [{ path: '', label: 'Contratos', element: ContratosHome, requiredPermissions: ['contracts.read'] }];
