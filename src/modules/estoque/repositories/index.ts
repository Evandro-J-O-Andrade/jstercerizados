import { stockRepository } from '@/repositories/stock.repository';
import { suppliersRepository } from '@/repositories/suppliers.repository';

export const estoqueRepositories = {
  stock: stockRepository,
  suppliers: suppliersRepository,
};

export type { StockRepository } from '@/repositories/stock.repository';
export type { SuppliersRepository } from '@/repositories/suppliers.repository';
