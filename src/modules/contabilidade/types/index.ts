export interface ContabilidadeModuleMeta {
  id: 'contabilidade';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const contabilidadeModuleMeta: ContabilidadeModuleMeta = {
  id: 'contabilidade',
  title: 'Contabilidade',
  description: 'Plano de contas, lançamentos e fechamento contábil',
  route: '/dashboard/contabilidade',
  scope: 'tenant',
  requiredPermissions: ['accounting.dashboard.read'],
};
