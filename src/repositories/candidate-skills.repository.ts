import { SupabaseRepository } from './supabase.repository';
import type {
  CandidateSkill,
  CandidateSkillCreateInput,
  CandidateSkillUpdateInput,
} from '@/types/domain/candidate';

export interface CandidateSkillRow {
  id: string;
  candidate_id: string;
  name: string;
  level: string | null;
  created_at: string;
  updated_at: string;
}

export class CandidateSkillsRepository extends SupabaseRepository {
  async findByCandidate(candidateId: string): Promise<CandidateSkill[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('candidate_skills')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CandidateSkill[];
  }

  async findById(
    id: string,
    candidateId: string,
  ): Promise<CandidateSkill | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidate_skills')
      .select('*')
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data as CandidateSkill | null;
  }

  async create(input: CandidateSkillCreateInput): Promise<CandidateSkill> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      name: input.name,
      level: input.level ?? null,
    };

    const { data, error } = await this.supabase
      .from('candidate_skills')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateSkill;
  }

  async update(
    id: string,
    candidateId: string,
    input: CandidateSkillUpdateInput,
  ): Promise<CandidateSkill> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name;
    if (input.level !== undefined) payload.level = input.level;

    const { data, error } = await this.supabase
      .from('candidate_skills')
      .update(payload)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateSkill;
  }

  async delete(id: string, candidateId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('candidate_skills')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);

    if (error) throw error;
  }
}

export const candidateSkillsRepository = new CandidateSkillsRepository();
