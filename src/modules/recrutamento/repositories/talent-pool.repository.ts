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
        candidate:candidates(
          *,
          person:people(*)
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data?.map((m) => m.candidate).filter(Boolean) || [];
  },

  async addCandidate(tenantId: string, candidateId: string, personId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { error } = await supabase
      .from('talent_pool_memberships')
      .insert({
        tenant_id: tenantId,
        candidate_id: candidateId,
        person_id: personId,
        status: 'active',
        source: 'manual',
        consent_status: 'pending',
      });

    if (error) throw error;
  },

  async removeCandidate(tenantId: string, candidateId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { error } = await supabase
      .from('talent_pool_memberships')
      .update({ status: 'removed', removed_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('candidate_id', candidateId);

    if (error) throw error;
  },
};