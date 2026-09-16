import { SupabaseRepository } from './supabase.repository';
import type { JobMatchGenerateResult } from '@/types/domain/candidate';

export class JobMatchesRepository extends SupabaseRepository {
  async generateByDemand(demandId: string): Promise<JobMatchGenerateResult[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase.rpc(
      'match_candidates_to_demand',
      {
        p_demand_id: demandId,
      },
    );

    if (error) throw error;
    return (data || []) as JobMatchGenerateResult[];
  }
}

export const jobMatchesRepository = new JobMatchesRepository();
