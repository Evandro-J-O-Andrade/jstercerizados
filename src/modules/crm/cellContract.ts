import type { CellContract, CellRoute } from '@/core/types';
import { crmRoutes } from './routes';
import { CRM_PERMISSIONS } from './permissions';
const crmCellRoutes: CellRoute[] = crmRoutes.map((route) => ({ path: route.path, label: route.label, requiredPermissions: route.requiredPermissions, icon: route.icon, children: route.children, implementationStatus: route.implementationStatus }));
export const crmCellContract: CellContract = { id: 'crm', name: 'CRM', version: '1.0.0', description: 'CRM: empresas e relacionamentos.', category: 'crm', domain: 'tenant', scope: 'tenant', lifecycle: { status: 'active', health: 'healthy' }, homeRoute: '/dashboard/crm', routes: crmCellRoutes, layout: { skipLayout: false }, navigation: { sidebar: true, label: 'CRM', icon: 'Users' }, permissions: Object.values(CRM_PERMISSIONS), enabled: true };
