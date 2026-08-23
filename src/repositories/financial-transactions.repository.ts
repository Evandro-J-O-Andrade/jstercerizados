import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

export type FinancialTransaction =
  Database['public']['Tables']['financial_transactions']['Row'];

export class FinancialTransactionsRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<FinancialTransaction[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('financial_transactions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<FinancialTransaction | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const financialTransactionsRepository =
  new FinancialTransactionsRepository();
