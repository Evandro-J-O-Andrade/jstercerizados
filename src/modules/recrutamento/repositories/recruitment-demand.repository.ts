import { getSupabaseClient } from '@/lib/supabase';

export const recruitmentDemandRepository = {
  async findAll(tenantId: string): Promise<any[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('recruitment_demands')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async findById(id: string): Promise<any | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('recruitment_demands')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: { tenant_id: string; title: string; description?: string; contact_name?: string; contact_email?: string; contact_phone?: string; urgency?: string; service_type?: string; responsible_person_id?: string }): Promise<any> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('recruitment_demands')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: Partial<any>): Promise<any> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('recruitment_demands')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { error } = await supabase
      .from('recruitment_demands')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};