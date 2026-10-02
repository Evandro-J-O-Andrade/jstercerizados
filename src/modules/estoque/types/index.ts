export type {
  Product,
  ProductCreateInput,
  StockMovement,
  StockMovementCreateInput,
} from '@/types/domain/stock';

export interface EstoqueModuleMeta {
  id: 'estoque';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const estoqueModuleMeta: EstoqueModuleMeta = {
  id: 'estoque',
  title: 'Estoque',
  description: 'Produtos, movimentações, fornecedores e compras',
  route: '/dashboard/estoque',
  scope: 'tenant',
  requiredPermissions: ['stock.read'],
};
