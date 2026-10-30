import { getSupabaseClient } from '@/lib/supabase';
import type { Candidate } from '@/modules/candidato/types/candidate';

export const talentPoolRepository = {
  async findAll(tenantId: string): Promise<Candidate[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('talent_pool_memberships')
      .select(`
        *,
        person:people(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map((m) => m.person).filter(Boolean) || [];
  },

  async addCandidate(tenantId: string, _candidateId: string, personId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { error } = await supabase
      .from('talent_pool_memberships')
      .insert({
        tenant_id: tenantId,
        person_id: personId,
        status: 'active',
        source: 'manual',
      });

    if (error) throw error;
  },

  async removeCandidate(tenantId: string, personId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { error } = await supabase
      .from('talent_pool_memberships')
      .update({ status: 'removed' })
      .eq('tenant_id', tenantId)
      .eq('person_id', personId);

    if (error) throw error;
  },
};