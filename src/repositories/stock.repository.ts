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

  async updateProduct(tenantId: string, id: string, input: Partial<ProductCreateInput>): Promise<Product> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('products')
      .update(input)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Product;
  }

  async deleteProduct(tenantId: string, id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;
  }

  async updateMovement(tenantId: string, id: string, input: Partial<StockMovementCreateInput>): Promise<StockMovement> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('stock_movements')
      .update(input)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as StockMovement;
  }

  async deleteMovement(tenantId: string, id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('stock_movements')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;
  }
}

export const stockRepository = new StockRepository();
