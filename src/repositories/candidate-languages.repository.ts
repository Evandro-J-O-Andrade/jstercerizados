import { SupabaseRepository } from './supabase.repository';
import type {
  CandidateLanguage,
  CandidateLanguageCreateInput,
  CandidateLanguageUpdateInput,
} from '@/types/domain/candidate';

export class CandidateLanguagesRepository extends SupabaseRepository {
  async findByCandidate(candidateId: string): Promise<CandidateLanguage[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('candidate_languages')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('language', { ascending: true });

    if (error) throw error;
    return (data || []) as CandidateLanguage[];
  }

  async findById(
    id: string,
    candidateId: string,
  ): Promise<CandidateLanguage | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidate_languages')
      .select('*')
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data as CandidateLanguage | null;
  }

  async create(
    input: CandidateLanguageCreateInput,
  ): Promise<CandidateLanguage> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      language: input.language,
      level: input.level,
    };

    const { data, error } = await this.supabase
      .from('candidate_languages')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateLanguage;
  }

  async update(
    id: string,
    candidateId: string,
    input: CandidateLanguageUpdateInput,
  ): Promise<CandidateLanguage> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.language !== undefined) payload.language = input.language;
    if (input.level !== undefined) payload.level = input.level;

    const { data, error } = await this.supabase
      .from('candidate_languages')
      .update(payload)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateLanguage;
  }

  async delete(id: string, candidateId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('candidate_languages')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);

    if (error) throw error;
  }
}

export const candidateLanguagesRepository = new CandidateLanguagesRepository();
