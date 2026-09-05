import { SupabaseRepository } from './supabase.repository';
import type {
  CandidateCourse,
  CandidateCourseCreateInput,
  CandidateCourseUpdateInput,
} from '@/types/domain/candidate';

export class CandidateCoursesRepository extends SupabaseRepository {
  async findByCandidate(candidateId: string): Promise<CandidateCourse[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('candidate_courses')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CandidateCourse[];
  }

  async findById(
    id: string,
    candidateId: string,
  ): Promise<CandidateCourse | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidate_courses')
      .select('*')
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data as CandidateCourse | null;
  }

  async create(input: CandidateCourseCreateInput): Promise<CandidateCourse> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      name: input.name,
    };

    if (input.institution !== undefined) payload.institution = input.institution;
    if (input.hours !== undefined) payload.hours = input.hours;
    if (input.completed_at !== undefined) payload.completed_at = input.completed_at;

    const { data, error } = await this.supabase
      .from('candidate_courses')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateCourse;
  }

  async update(
    id: string,
    candidateId: string,
    input: CandidateCourseUpdateInput,
  ): Promise<CandidateCourse> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name;
    if (input.institution !== undefined) payload.institution = input.institution;
    if (input.hours !== undefined) payload.hours = input.hours;
    if (input.completed_at !== undefined) payload.completed_at = input.completed_at;

    const { data, error } = await this.supabase
      .from('candidate_courses')
      .update(payload)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateCourse;
  }

  async delete(id: string, candidateId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('candidate_courses')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);

    if (error) throw error;
  }
}

export const candidateCoursesRepository = new CandidateCoursesRepository();
