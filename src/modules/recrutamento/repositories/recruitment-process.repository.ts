import { getSupabaseClient } from '@/lib/supabase';
import type { RecruitmentProcess, RecruitmentProcessCreateInput, RecruitmentProcessUpdateInput } from '@/types/domain/recruitment-process';

export const recruitmentProcessRepository = {
  async findAll(tenantId: string): Promise<RecruitmentProcess[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('recruitment_processes')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async findById(id: string): Promise<RecruitmentProcess | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('recruitment_processes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: RecruitmentProcessCreateInput): Promise<RecruitmentProcess> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('recruitment_processes')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: RecruitmentProcessUpdateInput): Promise<RecruitmentProcess> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('recruitment_processes')
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
      .from('recruitment_processes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};