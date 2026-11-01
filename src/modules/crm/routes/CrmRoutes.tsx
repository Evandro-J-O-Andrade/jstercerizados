import type { ModuleRoute } from '@/platform/router/types';
const CrmHome = () => <div>Em construção</div>;
export const crmRoutes: ModuleRoute[] = [{ path: '', label: 'CRM', element: CrmHome, requiredPermissions: ['companies.read'] }];
