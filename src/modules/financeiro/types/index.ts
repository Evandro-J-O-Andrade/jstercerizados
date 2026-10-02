export type {
  AccountReceivable,
  AccountPayable,
  FinancialTransaction,
} from '@/types/domain/finance';

export interface FinanceiroModuleMeta {
  id: 'financeiro';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const financeiroModuleMeta: FinanceiroModuleMeta = {
  id: 'financeiro',
  title: 'Financeiro',
  description: 'Contas a receber, contas a pagar, fluxo de caixa, faturamento',
  route: '/dashboard/financeiro',
  scope: 'tenant',
  requiredPermissions: ['finance.read'],
};
