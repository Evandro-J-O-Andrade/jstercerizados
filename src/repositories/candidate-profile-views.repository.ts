import { SupabaseRepository } from './supabase.repository';
import type { CandidateProfileView } from '@/types/domain/candidate';

export class CandidateProfileViewsRepository extends SupabaseRepository {
  async findByCandidate(candidateId: string): Promise<CandidateProfileView[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('candidate_profile_views')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('viewed_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CandidateProfileView[];
  }

  async create(input: {
    candidate_id: string;
    tenant_id: string;
    viewer_person_id?: string | null;
  }): Promise<CandidateProfileView> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      tenant_id: input.tenant_id,
    };

    if (input.viewer_person_id !== undefined)
      payload.viewer_person_id = input.viewer_person_id;

    const { data, error } = await this.supabase
      .from('candidate_profile_views')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateProfileView;
  }
}

export const candidateProfileViewsRepository =
  new CandidateProfileViewsRepository();
