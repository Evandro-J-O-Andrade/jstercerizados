export interface AdminModuleMeta {
  id: 'admin';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const adminModuleMeta: AdminModuleMeta = {
  id: 'admin',
  title: 'Administração',
  description: 'Gestão de tenants, roles, permissões, auditoria e configurações do sistema',
  route: '/dashboard/admin',
  scope: 'tenant',
  requiredPermissions: ['admin.read'],
};
