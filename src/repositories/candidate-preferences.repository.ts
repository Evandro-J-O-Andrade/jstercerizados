import { SupabaseRepository } from './supabase.repository';
import type {
  CandidatePreference,
  CandidatePreferenceCreateInput,
  CandidatePreferenceUpdateInput,
} from '@/types/domain/candidate';

export class CandidatePreferencesRepository extends SupabaseRepository {
  async findByCandidate(
    candidateId: string,
  ): Promise<CandidatePreference | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidate_preferences')
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data as CandidatePreference | null;
  }

  async findById(id: string): Promise<CandidatePreference | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidate_preferences')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as CandidatePreference | null;
  }

  async create(
    input: CandidatePreferenceCreateInput,
  ): Promise<CandidatePreference> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
    };

    if (input.desired_roles !== undefined)
      payload.desired_roles = input.desired_roles;
    if (input.desired_locations !== undefined)
      payload.desired_locations = input.desired_locations;
    if (input.salary_min !== undefined) payload.salary_min = input.salary_min;
    if (input.salary_max !== undefined) payload.salary_max = input.salary_max;
    if (input.contract_types !== undefined)
      payload.contract_types = input.contract_types;
    if (input.shifts !== undefined) payload.shifts = input.shifts;
    if (input.work_modes !== undefined) payload.work_modes = input.work_modes;
    if (input.max_distance_km !== undefined)
      payload.max_distance_km = input.max_distance_km;
    if (input.available_from !== undefined)
      payload.available_from = input.available_from;
    if (input.matching_enabled !== undefined)
      payload.matching_enabled = input.matching_enabled;
    if (input.receive_match_alerts !== undefined)
      payload.receive_match_alerts = input.receive_match_alerts;

    const { data, error } = await this.supabase
      .from('candidate_preferences')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidatePreference;
  }

  async update(
    id: string,
    input: CandidatePreferenceUpdateInput,
  ): Promise<CandidatePreference> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.desired_roles !== undefined)
      payload.desired_roles = input.desired_roles;
    if (input.desired_locations !== undefined)
      payload.desired_locations = input.desired_locations;
    if (input.salary_min !== undefined) payload.salary_min = input.salary_min;
    if (input.salary_max !== undefined) payload.salary_max = input.salary_max;
    if (input.contract_types !== undefined)
      payload.contract_types = input.contract_types;
    if (input.shifts !== undefined) payload.shifts = input.shifts;
    if (input.work_modes !== undefined) payload.work_modes = input.work_modes;
    if (input.max_distance_km !== undefined)
      payload.max_distance_km = input.max_distance_km;
    if (input.available_from !== undefined)
      payload.available_from = input.available_from;
    if (input.matching_enabled !== undefined)
      payload.matching_enabled = input.matching_enabled;
    if (input.receive_match_alerts !== undefined)
      payload.receive_match_alerts = input.receive_match_alerts;

    const { data, error } = await this.supabase
      .from('candidate_preferences')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidatePreference;
  }

  async delete(id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('candidate_preferences')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const candidatePreferencesRepository =
  new CandidatePreferencesRepository();
