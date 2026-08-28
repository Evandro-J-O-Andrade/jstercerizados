import type {
  Invoice,
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoiceItem,
  InvoiceItemCreateInput,
  InvoiceItemUpdateInput,
} from '@/types/domain/finance';

export interface InvoiceRepository {
  findAll(tenantId: string): Promise<Invoice[]>;
  findById(id: string, tenantId: string): Promise<Invoice | null>;
  create(input: InvoiceCreateInput): Promise<Invoice>;
  update(
    id: string,
    input: InvoiceUpdateInput,
    tenantId: string,
  ): Promise<Invoice>;
  remove(id: string, tenantId: string): Promise<void>;
  listItems(invoiceId: string, tenantId: string): Promise<InvoiceItem[]>;
  createItem(input: InvoiceItemCreateInput): Promise<InvoiceItem>;
  updateItem(
    id: string,
    input: InvoiceItemUpdateInput,
    tenantId: string,
  ): Promise<InvoiceItem>;
  removeItem(id: string, tenantId: string): Promise<void>;
}

export const invoiceRepository: InvoiceRepository = {
  async findAll(tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('issue_date', { ascending: false });
    if (error) throw error;
    return (data || []) as Invoice[];
  },

  async findById(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as Invoice | null;
  },

  async create(input: InvoiceCreateInput) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('invoices')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async update(id: string, input: InvoiceUpdateInput, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('invoices')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async remove(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  },

  async listItems(invoiceId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('id');
    if (error) throw error;
    return (data || []) as InvoiceItem[];
  },

  async createItem(input: InvoiceItemCreateInput) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('invoice_items')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as InvoiceItem;
  },

  async updateItem(
    id: string,
    input: InvoiceItemUpdateInput,
    tenantId: string,
  ) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('invoice_items')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as InvoiceItem;
  },

  async removeItem(id: string, tenantId: string) {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  },
};
