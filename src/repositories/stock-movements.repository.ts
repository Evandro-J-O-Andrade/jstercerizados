import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

export type StockMovement =
  Database['public']['Tables']['stock_movements']['Row'];

export class StockMovementsRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<StockMovement[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('stock_movements')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<StockMovement | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('stock_movements')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const stockMovementsRepository = new StockMovementsRepository();
