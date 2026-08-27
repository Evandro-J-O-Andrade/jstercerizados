import { SupabaseRepository } from './supabase.repository';
import type {
  CandidateEducation,
  CandidateEducationCreateInput,
  CandidateEducationUpdateInput,
} from '@/types/domain/candidate';

export class CandidateEducationRepository extends SupabaseRepository {
  async findByCandidate(candidateId: string): Promise<CandidateEducation[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('candidate_education')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data || []) as CandidateEducation[];
  }

  async findById(
    id: string,
    candidateId: string,
  ): Promise<CandidateEducation | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidate_education')
      .select('*')
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data as CandidateEducation | null;
  }

  async create(
    input: CandidateEducationCreateInput,
  ): Promise<CandidateEducation> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      institution: input.institution,
      course: input.course,
    };

    if (input.degree !== undefined) payload.degree = input.degree;
    if (input.start_date !== undefined) payload.start_date = input.start_date;
    if (input.end_date !== undefined) payload.end_date = input.end_date;

    const { data, error } = await this.supabase
      .from('candidate_education')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateEducation;
  }

  async update(
    id: string,
    candidateId: string,
    input: CandidateEducationUpdateInput,
  ): Promise<CandidateEducation> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.institution !== undefined)
      payload.institution = input.institution;
    if (input.course !== undefined) payload.course = input.course;
    if (input.degree !== undefined) payload.degree = input.degree;
    if (input.start_date !== undefined) payload.start_date = input.start_date;
    if (input.end_date !== undefined) payload.end_date = input.end_date;

    const { data, error } = await this.supabase
      .from('candidate_education')
      .update(payload)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateEducation;
  }

  async delete(id: string, candidateId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('candidate_education')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);

    if (error) throw error;
  }
}

export const candidateEducationRepository = new CandidateEducationRepository();
