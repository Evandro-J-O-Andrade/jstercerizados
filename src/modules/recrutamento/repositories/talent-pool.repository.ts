import { getSupabaseClient } from '@/lib/supabase';
import type { TalentPoolPerson } from '../types';

export const talentPoolRepository = {
  async findAll(tenantId: string): Promise<TalentPoolPerson[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data: memberships, error: membershipsError } = await supabase
      .from('talent_pool_memberships')
      .select('person_id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (membershipsError) throw membershipsError;

    const personIds = [
      ...new Set((memberships ?? []).map((membership) => membership.person_id)),
    ];
    if (personIds.length === 0) return [];

    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id, full_name, email, phone, status, created_at, updated_at')
      .in('id', personIds);

    if (peopleError) throw peopleError;

    const peopleById = new Map((people ?? []).map((person) => [person.id, person]));
    return personIds.flatMap((personId) => {
      const person = peopleById.get(personId);
      return person ? [person] : [];
    });
  },

  async addCandidate(tenantId: string, personId: string): Promise<void> {
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