import { SupabaseRepository } from './supabase.repository';
import type {
  CandidateExperience,
  CandidateExperienceCreateInput,
  CandidateExperienceUpdateInput,
} from '@/types/domain/candidate';

export class CandidateExperiencesRepository extends SupabaseRepository {
  async findByCandidate(candidateId: string): Promise<CandidateExperience[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('candidate_experiences')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data || []) as CandidateExperience[];
  }

  async findById(
    id: string,
    candidateId: string,
  ): Promise<CandidateExperience | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidate_experiences')
      .select('*')
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data as CandidateExperience | null;
  }

  async create(
    input: CandidateExperienceCreateInput,
  ): Promise<CandidateExperience> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      company: input.company,
      position: input.position,
    };

    if (input.start_date !== undefined) payload.start_date = input.start_date;
    if (input.end_date !== undefined) payload.end_date = input.end_date;
    if (input.description !== undefined)
      payload.description = input.description;

    const { data, error } = await this.supabase
      .from('candidate_experiences')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateExperience;
  }

  async update(
    id: string,
    candidateId: string,
    input: CandidateExperienceUpdateInput,
  ): Promise<CandidateExperience> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.company !== undefined) payload.company = input.company;
    if (input.position !== undefined) payload.position = input.position;
    if (input.start_date !== undefined) payload.start_date = input.start_date;
    if (input.end_date !== undefined) payload.end_date = input.end_date;
    if (input.description !== undefined)
      payload.description = input.description;

    const { data, error } = await this.supabase
      .from('candidate_experiences')
      .update(payload)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateExperience;
  }

  async delete(id: string, candidateId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('candidate_experiences')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);

    if (error) throw error;
  }
}

export const candidateExperiencesRepository =
  new CandidateExperiencesRepository();
