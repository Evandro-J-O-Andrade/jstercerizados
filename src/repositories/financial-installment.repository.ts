import type {
  FinancialInstallment,
  FinancialInstallmentCreateInput,
  FinancialInstallmentUpdateInput,
} from '@/types/domain/finance';

export interface FinancialInstallmentRepository {
  findAll(tenantId: string): Promise<FinancialInstallment[]>;
  findById(id: string, tenantId: string): Promise<FinancialInstallment | null>;
  create(input: FinancialInstallmentCreateInput): Promise<FinancialInstallment>;
  update(
    id: string,
    input: FinancialInstallmentUpdateInput,
    tenantId: string,
  ): Promise<FinancialInstallment>;
  remove(id: string, tenantId: string): Promise<void>;
}

export const financialInstallmentRepository: FinancialInstallmentRepository = {
  async findAll(tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('financial_installments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return (data || []) as FinancialInstallment[];
  },

  async findById(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('financial_installments')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as FinancialInstallment | null;
  },

  async create(input: FinancialInstallmentCreateInput) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('financial_installments')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as FinancialInstallment;
  },

  async update(
    id: string,
    input: FinancialInstallmentUpdateInput,
    tenantId: string,
  ) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('financial_installments')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as FinancialInstallment;
  },

  async remove(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from('financial_installments')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  },
};
