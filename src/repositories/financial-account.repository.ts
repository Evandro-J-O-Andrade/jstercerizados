import type {
  FinancialAccount,
  FinancialAccountCreateInput,
  FinancialAccountUpdateInput,
} from '@/types/domain/finance';

export interface FinancialAccountRepository {
  findAll(tenantId: string): Promise<FinancialAccount[]>;
  findById(id: string, tenantId: string): Promise<FinancialAccount | null>;
  create(input: FinancialAccountCreateInput): Promise<FinancialAccount>;
  update(
    id: string,
    input: FinancialAccountUpdateInput,
    tenantId: string,
  ): Promise<FinancialAccount>;
  remove(id: string, tenantId: string): Promise<void>;
}

export const financialAccountRepository: FinancialAccountRepository = {
  async findAll(tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');
    if (error) throw error;
    return (data || []) as FinancialAccount[];
  },

  async findById(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as FinancialAccount | null;
  },

  async create(input: FinancialAccountCreateInput) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('financial_accounts')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as FinancialAccount;
  },

  async update(
    id: string,
    input: FinancialAccountUpdateInput,
    tenantId: string,
  ) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('financial_accounts')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as FinancialAccount;
  },

  async remove(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from('financial_accounts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  },
};
