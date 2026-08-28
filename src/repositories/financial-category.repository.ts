import type {
  FinancialCategory,
  FinancialCategoryCreateInput,
  FinancialCategoryUpdateInput,
} from '@/types/domain/finance';

export interface FinancialCategoryRepository {
  findAll(tenantId: string): Promise<FinancialCategory[]>;
  findById(id: string, tenantId: string): Promise<FinancialCategory | null>;
  create(input: FinancialCategoryCreateInput): Promise<FinancialCategory>;
  update(
    id: string,
    input: FinancialCategoryUpdateInput,
    tenantId: string,
  ): Promise<FinancialCategory>;
  remove(id: string, tenantId: string): Promise<void>;
}

export const financialCategoryRepository: FinancialCategoryRepository = {
  async findAll(tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('financial_categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');
    if (error) throw error;
    return (data || []) as FinancialCategory[];
  },

  async findById(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('financial_categories')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as FinancialCategory | null;
  },

  async create(input: FinancialCategoryCreateInput) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('financial_categories')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as FinancialCategory;
  },

  async update(
    id: string,
    input: FinancialCategoryUpdateInput,
    tenantId: string,
  ) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('financial_categories')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as FinancialCategory;
  },

  async remove(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from('financial_categories')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  },
};
