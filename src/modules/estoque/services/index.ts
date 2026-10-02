import { estoqueRepositories } from '../repositories';
import type { ProductCreateInput } from '@/types/domain/stock';

class EstoqueService {
  async getProdutos(tenantId: string) {
    return estoqueRepositories.stock.findProducts(tenantId);
  }

  async createProduto(input: ProductCreateInput & { tenant_id: string }) {
    return estoqueRepositories.stock.createProduct(input);
  }

  async getMovimentos(tenantId: string) {
    return estoqueRepositories.stock.findMovements(tenantId);
  }
}

export const estoqueService = new EstoqueService();
