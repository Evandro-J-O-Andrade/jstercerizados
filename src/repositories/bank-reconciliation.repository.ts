import type {
  BankReconciliation,
  BankReconciliationCreateInput,
  BankReconciliationUpdateInput,
} from '@/types/domain/finance';

export interface BankReconciliationRepository {
  findAll(tenantId: string): Promise<BankReconciliation[]>;
  findById(id: string, tenantId: string): Promise<BankReconciliation | null>;
  create(input: BankReconciliationCreateInput): Promise<BankReconciliation>;
  update(
    id: string,
    input: BankReconciliationUpdateInput,
    tenantId: string,
  ): Promise<BankReconciliation>;
  remove(id: string, tenantId: string): Promise<void>;
}

export const bankReconciliationRepository: BankReconciliationRepository = {
  async findAll(tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('bank_reconciliations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('statement_date', { ascending: false });
    if (error) throw error;
    return (data || []) as BankReconciliation[];
  },

  async findById(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('bank_reconciliations')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as BankReconciliation | null;
  },

  async create(input: BankReconciliationCreateInput) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('bank_reconciliations')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as BankReconciliation;
  },

  async update(
    id: string,
    input: BankReconciliationUpdateInput,
    tenantId: string,
  ) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('bank_reconciliations')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as BankReconciliation;
  },

  async remove(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from('bank_reconciliations')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  },
};
