export interface OperacoesModuleMeta {
  id: 'operacoes';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const operacoesModuleMeta: OperacoesModuleMeta = {
  id: 'operacoes',
  title: 'Operações',
  description: 'Ordens de trabalho, checklists e materiais',
  route: '/dashboard/operacoes',
  scope: 'tenant',
  requiredPermissions: ['work_orders.read'],
};
