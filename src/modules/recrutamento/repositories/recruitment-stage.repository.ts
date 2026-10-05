import { getSupabaseClient } from '@/lib/supabase';
import type { RecruitmentStage } from '@/types/domain/recruitment-stage';

export const recruitmentStageRepository = {
  async findAll(tenantId: string): Promise<RecruitmentStage[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('recruitment_stages')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async findByProcess(processId: string): Promise<RecruitmentStage[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('recruitment_stages')
      .select('*')
      .eq('recruitment_process_id', processId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async findById(id: string): Promise<RecruitmentStage | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('recruitment_stages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: { tenant_id: string; recruitment_process_id: string; name: string; description?: string; order: number; status?: string }): Promise<RecruitmentStage> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('recruitment_stages')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: Partial<RecruitmentStage>): Promise<RecruitmentStage> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('recruitment_stages')
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
      .from('recruitment_stages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};