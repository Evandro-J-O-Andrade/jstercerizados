import type {
  FinancialTransaction,
  FinancialTransactionCreateInput,
  FinancialTransactionUpdateInput,
} from '@/types/domain/finance';

export interface FinancialTransactionRepository {
  findAll(tenantId: string): Promise<FinancialTransaction[]>;
  findById(id: string, tenantId: string): Promise<FinancialTransaction | null>;
  create(input: FinancialTransactionCreateInput): Promise<FinancialTransaction>;
  update(
    id: string,
    input: FinancialTransactionUpdateInput,
    tenantId: string,
  ): Promise<FinancialTransaction>;
  remove(id: string, tenantId: string): Promise<void>;
}

export const financialTransactionRepository: FinancialTransactionRepository = {
  async findAll(tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('competence_date', { ascending: false });
    if (error) throw error;
    return (data || []) as FinancialTransaction[];
  },

  async findById(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as FinancialTransaction | null;
  },

  async create(input: FinancialTransactionCreateInput) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as FinancialTransaction;
  },

  async update(
    id: string,
    input: FinancialTransactionUpdateInput,
    tenantId: string,
  ) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('financial_transactions')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as FinancialTransaction;
  },

  async remove(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  },
};
