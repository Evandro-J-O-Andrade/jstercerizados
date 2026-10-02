export interface PosModuleMeta {
  id: 'pos';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const posModuleMeta: PosModuleMeta = {
  id: 'pos',
  title: 'POS',
  description: 'Ponto de venda, caixas e terminais',
  route: '/dashboard/pos',
  scope: 'tenant',
  requiredPermissions: ['pos_sales.read'],
};
