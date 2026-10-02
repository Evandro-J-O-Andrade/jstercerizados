export interface EmpresasModuleMeta {
  id: 'empresas';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const empresasModuleMeta: EmpresasModuleMeta = {
  id: 'empresas',
  title: 'Empresas',
  description: 'Clientes, leads, contratos e relacionamentos comerciais',
  route: '/dashboard/empresas',
  scope: 'tenant',
  requiredPermissions: ['companies.read'],
};
