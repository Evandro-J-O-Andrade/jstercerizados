import { SupabaseRepository } from './supabase.repository';
import type {
  StockMovement,
  StockMovementCreateInput,
  Product,
  ProductCreateInput,
} from '@/types/domain/stock';

export class StockRepository extends SupabaseRepository {
  async findMovements(tenantId: string): Promise<StockMovement[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('stock_movements')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as StockMovement[];
  }

  async createMovement(input: StockMovementCreateInput): Promise<StockMovement> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('stock_movements')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as StockMovement;
  }

  async findProducts(tenantId: string): Promise<Product[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data || []) as Product[];
  }

  async createProduct(input: ProductCreateInput): Promise<Product> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('products')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Product;
  }
}

export const stockRepository = new StockRepository();
