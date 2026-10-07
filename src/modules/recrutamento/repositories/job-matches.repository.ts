/**
 * Job Matches Repository
 * 
 * Handles all database operations for job_matches (compatibilidade candidato ↔ vaga).
 * Used for matching engine results and notifications.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type {
  JobMatch,
  MatchFilters,
  RepositoryResult,
  RepositoryListResult,
} from '../types';

/**
 * Map database row to JobMatch type
 */
function mapJobMatchRow(row: Record<string, unknown>): JobMatch {
  return {
    id: row.id as string,
    candidate_id: row.candidate_id as string,
    job_id: row.job_id as string,
    tenant_id: row.tenant_id as string,
    score: row.score as number,
    reasons: (row.reasons as Record<string, unknown>) || {},
    algorithm_version: row.algorithm_version as JobMatch['algorithm_version'],
    is_eligible: row.is_eligible as boolean,
    sent_notification: row.sent_notification as boolean,
    invalidated_at: row.invalidated_at as string | null,
    invalidated_reason: row.invalidated_reason as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const jobMatchesRepository = {
  /**
   * List job matches with filters and pagination
   */
  async list(filters: MatchFilters = {}): Promise<RepositoryListResult<JobMatch>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      let query = supabase
        .from('job_matches')
        .select('*', { count: 'exact' });

      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      if (filters.job_id) {
        query = query.eq('job_id', filters.job_id);
      }
      if (filters.candidate_id) {
        query = query.eq('candidate_id', filters.candidate_id);
      }
      if (filters.min_score !== undefined) {
        query = query.gte('score', filters.min_score);
      }
      if (filters.max_score !== undefined) {
        query = query.lte('score', filters.max_score);
      }
      if (filters.is_eligible !== undefined) {
        query = query.eq('is_eligible', filters.is_eligible);
      }
      if (filters.sent_notification !== undefined) {
        query = query.eq('sent_notification', filters.sent_notification);
      }

      const sortBy = filters.sort_by || 'score';
      const sortOrder = filters.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const page = filters.limit ? Math.floor((filters.offset || 0) / filters.limit) + 1 : 1;
      const pageSize = filters.limit || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return { data: [], error, count: count || 0 };
      }

      return { data: (data || []).map(mapJobMatchRow), error: null, count: count || 0 };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },

  /**
   * Get a single job match by ID
   */
  async getById(id: string): Promise<RepositoryResult<JobMatch>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobMatchRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get match by candidate and job (unique constraint)
   */
  async getByCandidateAndJob(candidateId: string, jobId: string): Promise<RepositoryResult<JobMatch>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobMatchRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Create or update a job match (upsert)
   */
  async upsert(match: Omit<JobMatch, 'id' | 'created_at' | 'updated_at'>): Promise<RepositoryResult<JobMatch>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .upsert({
          candidate_id: match.candidate_id,
          job_id: match.job_id,
          tenant_id: match.tenant_id,
          score: match.score,
          reasons: match.reasons,
          algorithm_version: match.algorithm_version || '1.0',
          is_eligible: match.is_eligible,
          sent_notification: match.sent_notification,
          invalidated_at: match.invalidated_at,
          invalidated_reason: match.invalidated_reason,
        }, {
          onConflict: 'candidate_id,job_id',
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobMatchRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Create a new job match
   */
  async create(match: Omit<JobMatch, 'id' | 'created_at' | 'updated_at'>): Promise<RepositoryResult<JobMatch>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .insert({
          candidate_id: match.candidate_id,
          job_id: match.job_id,
          tenant_id: match.tenant_id,
          score: match.score,
          reasons: match.reasons,
          algorithm_version: match.algorithm_version || '1.0',
          is_eligible: match.is_eligible,
          sent_notification: match.sent_notification,
          invalidated_at: match.invalidated_at,
          invalidated_reason: match.invalidated_reason,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobMatchRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update a job match
   */
  async update(id: string, updates: Partial<Omit<JobMatch, 'id' | 'created_at'>>): Promise<RepositoryResult<JobMatch>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobMatchRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Mark match as notified
   */
  async markNotified(id: string): Promise<RepositoryResult<JobMatch>> {
    return this.update(id, { sent_notification: true });
  },

  /**
   * Invalidate a match (force recalculation)
   */
  async invalidate(id: string, reason: string): Promise<RepositoryResult<JobMatch>> {
    return this.update(id, {
      invalidated_at: new Date().toISOString(),
      invalidated_reason: reason,
      is_eligible: false,
    });
  },

  /**
   * Get top matches for a job (for recruiter view)
   */
  async getTopMatchesForJob(jobId: string, limit = 50, minScore = 0): Promise<RepositoryListResult<JobMatch & {
    candidate_name: string;
    candidate_email: string;
    candidate_avatar_url: string | null;
    candidate_headline: string | null;
  }>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .select(`
          *,
          candidates!inner (
            headline,
            people!inner (
              full_name,
              email,
              avatar_url
            )
          )
        `)
        .eq('job_id', jobId)
        .eq('is_eligible', true)
        .gte('score', minScore)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: [], error, count: 0 };
      }

      const mappedData = (data || []).map((row: any) => ({
        ...mapJobMatchRow(row),
        candidate_name: row.candidates?.people?.full_name,
        candidate_email: row.candidates?.people?.email,
        candidate_avatar_url: row.candidates?.people?.avatar_url,
        candidate_headline: row.candidates?.headline,
      }));

      return { data: mappedData, error: null, count: mappedData.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },

  /**
   * Get top matches for a candidate (for candidate portal)
   */
  async getTopMatchesForCandidate(candidateId: string, limit = 20, minScore = 0): Promise<RepositoryListResult<JobMatch & {
    job_title: string;
    job_slug: string;
    job_city: string | null;
    job_state: string | null;
    job_work_mode: string;
    company_name: string | null;
    company_logo_url: string | null;
  }>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .select(`
          *,
          jobs!inner (
            title,
            slug,
            city,
            state,
            work_mode,
            companies (
              name,
               trading_name,
              logo_url
            )
          )
        `)
        .eq('candidate_id', candidateId)
        .eq('is_eligible', true)
        .eq('jobs.status', 'published')
        .gte('score', minScore)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: [], error, count: 0 };
      }

      const mappedData = (data || []).map((row: any) => ({
        ...mapJobMatchRow(row),
        job_title: row.jobs?.title,
        job_slug: row.jobs?.slug,
        job_city: row.jobs?.city,
        job_state: row.jobs?.state,
        job_work_mode: row.jobs?.work_mode,
        company_name: row.jobs?.companies?.trading_name || row.jobs?.companies?.name,
        company_logo_url: row.jobs?.companies?.logo_url,
      }));

      return { data: mappedData, error: null, count: mappedData.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },

  /**
   * Get eligible matches that haven't been notified (for notification job)
   */
  async getEligibleNotNotified(tenantId: string, minScore = 80): Promise<RepositoryListResult<JobMatch>> {
    return this.list({
      tenant_id: tenantId,
      is_eligible: true,
      sent_notification: false,
      min_score: minScore,
      sort_by: 'score',
      sort_order: 'desc',
      limit: 100,
    });
  },

  /**
   * Delete matches for a job (when job is deleted/closed)
   */
  async deleteByJobId(jobId: string): Promise<RepositoryResult<number>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .delete()
        .eq('job_id', jobId)
        .select('id');

      if (error) {
        return { data: 0, error };
      }

      return { data: data?.length || 0, error: null };
    } catch (error) {
      return { data: 0, error: error as Error };
    }
  },

  /**
   * Delete matches for a candidate (when candidate leaves pool)
   */
  async deleteByCandidateId(candidateId: string): Promise<RepositoryResult<number>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .delete()
        .eq('candidate_id', candidateId)
        .select('id');

      if (error) {
        return { data: 0, error };
      }

      return { data: data?.length || 0, error: null };
    } catch (error) {
      return { data: 0, error: error as Error };
    }
  },

  /**
   * Bulk create matches (for matching engine batch processing)
   */
  async bulkCreate(matches: Array<Omit<JobMatch, 'id' | 'created_at' | 'updated_at'>>): Promise<RepositoryResult<number>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .upsert(matches, {
          onConflict: 'candidate_id,job_id',
        })
        .select('id');

      if (error) {
        return { data: 0, error };
      }

      return { data: data?.length || 0, error: null };
    } catch (error) {
      return { data: 0, error: error as Error };
    }
  },

  /**
   * Get match statistics for dashboard
   */
  async getStats(tenantId: string): Promise<RepositoryResult<{
    total: number;
    high_score: number;
    eligible_not_notified: number;
    avg_score: number;
  }>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('job_matches')
        .select('score, is_eligible, sent_notification')
        .eq('tenant_id', tenantId);

      if (error) {
        return { data: null, error };
      }

      const scores = data.map((m: any) => m.score);
      const avgScore = scores.length > 0
        ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        : 0;

      const stats = {
        total: data.length,
        high_score: data.filter((m: any) => m.score >= 80).length,
        eligible_not_notified: data.filter((m: any) => m.is_eligible && !m.sent_notification).length,
        avg_score: Math.round(avgScore * 10) / 10,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get matches for talent pool matching (used by get_active_candidates_for_matching)
   */
  async getForTalentPoolMatching(_jobId: string, tenantId: string, limit = 50): Promise<RepositoryListResult<{
    candidate_id: string;
    membership_id: string;
    match_score: number | null;
    person_id: string;
    desired_roles: string[];
    skills: Array<{ id: string; name: string }>;
  }>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('talent_pool_memberships')
        .select(`
          candidate_id,
          id,
          candidates!inner (
            person_id,
            headline,
            candidate_skills (
              skill_id,
              skills!inner (id, name)
            )
          ),
          job_matches!left (
            score,
            is_eligible
          ),
          candidate_preferences!left (
            desired_roles
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .eq('consent_status', 'granted')
        .limit(limit);

      if (error) {
        return { data: [], error, count: 0 };
      }

      const mappedData = (data || [])
        .filter((row: any) => {
          const match = row.job_matches?.[0];
          return match === undefined || (match.is_eligible !== false);
        })
        .map((row: any) => {
          const match = row.job_matches?.[0];
          return {
            candidate_id: row.candidate_id as string,
            membership_id: row.id as string,
            match_score: match?.score || null,
            person_id: row.candidates?.person_id as string,
            desired_roles: row.candidate_preferences?.[0]?.desired_roles || [],
            skills: row.candidates?.candidate_skills?.map((cs: any) => ({
              id: cs.skills?.id,
              name: cs.skills?.name,
            })) || [],
          };
        })
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      return { data: mappedData, error: null, count: mappedData.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },
};