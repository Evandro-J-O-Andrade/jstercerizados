import { SupabaseRepository } from './supabase.repository';
import type {
  JobMatch,
  JobMatchCreateInput,
  JobMatchUpdateInput,
} from '@/types/domain/candidate';

export class JobMatchesRepository extends SupabaseRepository {
  async findByTenant(tenantId: string): Promise<JobMatch[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('job_matches')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('score', { ascending: false });

    if (error) throw error;
    return (data || []) as JobMatch[];
  }

  async findByCandidate(
    candidateId: string,
    tenantId: string,
  ): Promise<JobMatch[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('job_matches')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('tenant_id', tenantId)
      .order('score', { ascending: false });

    if (error) throw error;
    return (data || []) as JobMatch[];
  }

  async findById(id: string, tenantId: string): Promise<JobMatch | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('job_matches')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as JobMatch | null;
  }

  async create(input: JobMatchCreateInput): Promise<JobMatch> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      job_id: input.job_id,
      tenant_id: input.tenant_id,
      score: input.score,
    };

    if (input.reasons !== undefined) payload.reasons = input.reasons;
    if (input.algorithm_version !== undefined)
      payload.algorithm_version = input.algorithm_version;
    if (input.is_eligible !== undefined)
      payload.is_eligible = input.is_eligible;
    if (input.sent_notification !== undefined)
      payload.sent_notification = input.sent_notification;

    const { data, error } = await this.supabase
      .from('job_matches')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as JobMatch;
  }

  async update(
    id: string,
    tenantId: string,
    input: JobMatchUpdateInput,
  ): Promise<JobMatch> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.score !== undefined) payload.score = input.score;
    if (input.reasons !== undefined) payload.reasons = input.reasons;
    if (input.algorithm_version !== undefined)
      payload.algorithm_version = input.algorithm_version;
    if (input.is_eligible !== undefined)
      payload.is_eligible = input.is_eligible;
    if (input.sent_notification !== undefined)
      payload.sent_notification = input.sent_notification;
    if (input.invalidated_at !== undefined)
      payload.invalidated_at = input.invalidated_at;
    if (input.invalidated_reason !== undefined)
      payload.invalidated_reason = input.invalidated_reason;

    const { data, error } = await this.supabase
      .from('job_matches')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data as JobMatch;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('job_matches')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const jobMatchesRepository = new JobMatchesRepository();
