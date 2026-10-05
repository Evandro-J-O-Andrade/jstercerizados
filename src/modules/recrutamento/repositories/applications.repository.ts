/**
 * Applications Repository
 * 
 * Handles all database operations for applications (candidaturas a vagas).
 * Core entity for recruitment pipeline management.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type {
  Application,
  ApplicationListItem,
  ApplicationFilters,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationStatus,
  RepositoryResult,
  RepositoryListResult,
} from '../types';

/**
 * Map database row to Application type
 */
function mapApplicationRow(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    job_id: row.job_id as string,
    candidate_id: row.candidate_id as string,
    person_id: row.person_id as string,
    process_id: row.process_id as string | null,
    current_stage_id: row.current_stage_id as string | null,
    status: row.status as ApplicationStatus,
    applied_at: row.applied_at as string,
    source: row.source as string | null,
    cover_letter: row.cover_letter as string | null,
    referral_source: row.referral_source as string | null,
    referred_by: row.referred_by as string | null,
    screening_score: row.screening_score as number | null,
    screening_notes: row.screening_notes as string | null,
    recruiter_notes: row.recruiter_notes as string | null,
    last_activity_at: row.last_activity_at as string,
    rejected_at: row.rejected_at as string | null,
    rejection_reason: row.rejection_reason as string | null,
    hired_at: row.hired_at as string | null,
    metadata: (row.metadata as Record<string, unknown>) || {},
    created_at: row.created_at as string,
    created_by: row.created_by as string | null,
    updated_at: row.updated_at as string,
    updated_by: row.updated_by as string | null,
  };
}

/**
 * Map database row to ApplicationListItem with related data
 */
function mapApplicationListItemRow(row: Record<string, unknown>): ApplicationListItem {
  const application = mapApplicationRow(row);
  return {
    ...application,
    job_title: row.job_title as string,
    job_slug: row.job_slug as string,
    candidate_name: row.candidate_name as string,
    candidate_email: row.candidate_email as string,
    candidate_avatar_url: row.candidate_avatar_url as string | null,
    process_name: row.process_name as string | null,
    stage_name: row.stage_name as string | null,
    days_in_current_stage: row.days_in_current_stage as number,
  };
}

export const applicationsRepository = {
  /**
   * List applications with filters and pagination
   */
  async list(filters: ApplicationFilters = {}): Promise<RepositoryListResult<ApplicationListItem>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      let query = supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            id,
            title,
            slug
          ),
          candidates!inner (
            id,
            person_id,
            people!inner (
              full_name,
              email,
              avatar_url
            )
          ),
          recruitment_processes!left (
            id,
            name
          ),
          recruitment_stages!left (
            id,
            name
          )
        `, { count: 'exact' });

      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      if (filters.job_id) {
        query = query.eq('job_id', filters.job_id);
      }
      if (filters.candidate_id) {
        query = query.eq('candidate_id', filters.candidate_id);
      }
      if (filters.process_id) {
        query = query.eq('process_id', filters.process_id);
      }
      if (filters.stage_id) {
        query = query.eq('current_stage_id', filters.stage_id);
      }
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.date_from) {
        query = query.gte('applied_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('applied_at', filters.date_to);
      }

      const sortBy = filters.sort_by || 'applied_at';
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

      const mappedData = (data || []).map((row: any) => mapApplicationListItemRow({
        ...row,
        job_title: row.jobs?.title,
        job_slug: row.jobs?.slug,
        candidate_name: row.candidates?.people?.full_name,
        candidate_email: row.candidates?.people?.email,
        candidate_avatar_url: row.candidates?.people?.avatar_url,
        process_name: row.recruitment_processes?.name,
        stage_name: row.recruitment_stages?.name,
        days_in_current_stage: row.current_stage_id
          ? Math.floor((Date.now() - new Date(row.last_activity_at as string).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      }));

      return { data: mappedData, error: null, count: count || 0 };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },

  /**
   * Get a single application by ID
   */
  async getById(id: string): Promise<RepositoryResult<Application>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapApplicationRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get application with full details (for detail view)
   */
  async getWithDetails(id: string): Promise<RepositoryResult<ApplicationListItem & {
    job: Record<string, unknown> | null;
    candidate: Record<string, unknown> | null;
    process: Record<string, unknown> | null;
    stage: Record<string, unknown> | null;
    stage_history: Array<Record<string, unknown>>;
  }>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            *,
            company_relationships!inner (
              company_id,
              companies!inner (
                name,
                trade_name,
                logo_url
              )
            )
          ),
          candidates!inner (
            *,
            people!inner (
              full_name,
              email,
              phone,
              avatar_url,
              birth_date,
              gender
            ),
            candidate_skills (
              *,
              skills!inner (id, name, category)
            )
          ),
          recruitment_processes!left (
            *,
            recruitment_stages!inner (
              id,
              name,
              type,
              sort_order
            )
          ),
          recruitment_stages!left (
            id,
            name,
            type,
            description,
            sort_order
          ),
          application_stage_history (
            id,
            stage_id,
            moved_at,
            moved_by,
            notes,
            recruitment_stages!inner (id, name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      const application = mapApplicationListItemRow({
        ...data,
        job_title: data.jobs?.title,
        job_slug: data.jobs?.slug,
        candidate_name: data.candidates?.people?.full_name,
        candidate_email: data.candidates?.people?.email,
        candidate_avatar_url: data.candidates?.people?.avatar_url,
        process_name: data.recruitment_processes?.name,
        stage_name: data.recruitment_stages?.name,
        days_in_current_stage: data.current_stage_id
          ? Math.floor((Date.now() - new Date(data.last_activity_at as string).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      });

      return {
        data: {
          ...application,
          job: data.jobs || null,
          candidate: data.candidates || null,
          process: data.recruitment_processes || null,
          stage: data.recruitment_stages || null,
          stage_history: data.application_stage_history || [],
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Create a new application
   */
  async create(input: CreateApplicationInput): Promise<RepositoryResult<Application>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('applications')
        .insert({
          tenant_id: input.tenant_id,
          job_id: input.job_id,
          candidate_id: input.candidate_id,
          person_id: input.person_id,
          process_id: input.process_id,
          source: input.source || 'direct',
          cover_letter: input.cover_letter,
          referral_source: input.referral_source,
          referred_by: input.referred_by,
          status: 'applied',
          last_activity_at: new Date().toISOString(),
          metadata: input.metadata || {},
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Increment job applications count
      await supabase.rpc('increment_job_applications', { job_id: input.job_id });

      return { data: mapApplicationRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update an existing application
   */
  async update(input: UpdateApplicationInput): Promise<RepositoryResult<Application>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('applications')
        .update({
          ...updates,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapApplicationRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Move application to a new stage
   */
  async moveToStage(
    applicationId: string,
    stageId: string,
    movedBy: string,
    notes?: string
  ): Promise<RepositoryResult<Application>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('applications')
        .update({
          current_stage_id: stageId,
          status: 'interview_scheduled',
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Record stage history
      await supabase
        .from('application_stage_history')
        .insert({
          application_id: applicationId,
          stage_id: stageId,
          moved_by: movedBy,
          notes: notes,
        });

      return { data: mapApplicationRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update application status
   */
  async updateStatus(
    id: string,
    status: ApplicationStatus,
    additionalData: Partial<Pick<Application, 'rejection_reason' | 'screening_score' | 'screening_notes' | 'recruiter_notes'>> = {}
  ): Promise<RepositoryResult<Application>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const updates: Partial<Application> = {
        status,
        last_activity_at: new Date().toISOString(),
        ...additionalData,
      };

      if (status === 'rejected') {
        updates.rejected_at = new Date().toISOString();
      }
      if (status === 'hired') {
        updates.hired_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapApplicationRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Add stage history entry
   */
  async addStageHistory(
    applicationId: string,
    stageId: string,
    movedBy: string,
    notes?: string
  ): Promise<RepositoryResult<void>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { error } = await supabase
        .from('application_stage_history')
        .insert({
          application_id: applicationId,
          stage_id: stageId,
          moved_by: movedBy,
          notes: notes,
        });

      if (error) {
        return { data: null, error };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get stage history for an application
   */
  async getStageHistory(applicationId: string): Promise<RepositoryListResult<Record<string, unknown>>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('application_stage_history')
        .select(`
          *,
          recruitment_stages!inner (
            id,
            name,
            type
          )
        `)
        .eq('application_id', applicationId)
        .order('moved_at', { ascending: true });

      if (error) {
        return { data: [], error, count: 0 };
      }

      return { data: data || [], error: null, count: data?.length || 0 };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },

  /**
   * Get applications for a specific job
   */
  async getByJobId(jobId: string): Promise<RepositoryListResult<ApplicationListItem>> {
    return this.list({ job_id: jobId });
  },

  /**
   * Get applications for a specific candidate
   */
  async getByCandidateId(candidateId: string): Promise<RepositoryListResult<ApplicationListItem>> {
    return this.list({ candidate_id: candidateId });
  },

  /**
   * Get applications for a specific process
   */
  async getByProcessId(processId: string): Promise<RepositoryListResult<ApplicationListItem>> {
    return this.list({ process_id: processId });
  },

  /**
   * Get applications for a specific stage
   */
  async getByStageId(stageId: string): Promise<RepositoryListResult<ApplicationListItem>> {
    return this.list({ stage_id: stageId });
  },

  /**
   * Get applications by person (for candidate portal)
   */
  async getByPersonId(personId: string): Promise<RepositoryListResult<ApplicationListItem>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            id,
            title,
            slug,
            city,
            state,
            work_mode,
            contract_type,
            salary_min,
            salary_max,
            salary_type,
            company_relationships!inner (
              company_id,
              companies!inner (
                name,
                trade_name,
                logo_url
              )
            )
          ),
          recruitment_processes!left (
            id,
            name
          ),
          recruitment_stages!left (
            id,
            name
          )
        `)
        .eq('person_id', personId)
        .order('applied_at', { ascending: false });

      if (error) {
        return { data: [], error, count: 0 };
      }

      const mappedData = (data || []).map((row: any) => mapApplicationListItemRow({
        ...row,
        job_title: row.jobs?.title,
        job_slug: row.jobs?.slug,
        candidate_name: '',
        candidate_email: '',
        candidate_avatar_url: null,
        process_name: row.recruitment_processes?.name,
        stage_name: row.recruitment_stages?.name,
        days_in_current_stage: row.current_stage_id
          ? Math.floor((Date.now() - new Date(row.last_activity_at as string).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      }));

      return { data: mappedData, error: null, count: mappedData.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },

  /**
   * Delete an application
   */
  async delete(id: string): Promise<RepositoryResult<void>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      // Get job_id first for decrementing count
      const { data: app } = await supabase
        .from('applications')
        .select('job_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) {
        return { data: null, error };
      }

      // Decrement job applications count
      if (app?.job_id) {
        await supabase.rpc('decrement_job_applications', { job_id: app.job_id });
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get application stats for dashboard
   */
  async getStats(tenantId: string): Promise<RepositoryResult<{
    total: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
    new_today: number;
  }>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('applications')
        .select('status, applied_at')
        .eq('tenant_id', tenantId);

      if (error) {
        return { data: null, error };
      }

      const today = new Date().toISOString().split('T')[0];

      const stats = {
        total: data.length,
        applied: data.filter((a: any) => a.status === 'applied').length,
        screening: data.filter((a: any) => a.status === 'screening').length,
        interview: data.filter((a: any) => 
          a.status === 'interview_scheduled' || a.status === 'interviewed'
        ).length,
        offer: data.filter((a: any) => a.status === 'offer_sent').length,
        hired: data.filter((a: any) => a.status === 'hired').length,
        rejected: data.filter((a: any) => a.status === 'rejected').length,
        new_today: data.filter((a: any) => a.applied_at.startsWith(today)).length,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get pipeline metrics (conversion rates between stages)
   */
  async getPipelineMetrics(processId: string): Promise<RepositoryResult<Array<{
    stage_id: string;
    stage_name: string;
    stage_type: string;
    applications_count: number;
    avg_days_in_stage: number;
    conversion_rate: number;
  }>>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: stages, error: stagesError } = await supabase
        .from('recruitment_stages')
        .select('id, name, type, sort_order')
        .eq('process_id', processId)
        .order('sort_order');

      if (stagesError) {
        return { data: null, error: stagesError };
      }

      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('current_stage_id, applied_at, last_activity_at, status')
        .eq('process_id', processId);

      if (appsError) {
        return { data: null, error: appsError };
      }

      const metrics = stages.map((stage: Record<string, unknown>, index: number) => {
        const stageApps = applications.filter((a: any) => a.current_stage_id === stage.id);
        const nextStage = stages[index + 1];
        const nextStageApps = nextStage 
          ? applications.filter((a: any) => a.current_stage_id === nextStage.id)
          : applications.filter((a: any) => a.status === 'hired');

        const totalInStage = stageApps.length;
        const totalInNextStage = nextStageApps.length;
        const conversionRate = totalInStage > 0 
          ? (totalInNextStage / totalInStage) * 100 
          : 0;

        const daysInStage = stageApps.map((a: any) => 
          Math.floor((Date.now() - new Date(a.last_activity_at).getTime()) / (1000 * 60 * 60 * 24))
        );
        const avgDays = daysInStage.length > 0
          ? daysInStage.reduce((a: number, b: number) => a + b, 0) / daysInStage.length
          : 0;

        return {
          stage_id: stage.id as string,
          stage_name: stage.name as string,
          stage_type: stage.type as string,
          applications_count: totalInStage,
          avg_days_in_stage: Math.round(avgDays * 10) / 10,
          conversion_rate: Math.round(conversionRate * 10) / 10,
        };
      });

      return { data: metrics, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Bulk update status for multiple applications
   */
  async bulkUpdateStatus(
    ids: string[],
    status: ApplicationStatus,
    additionalData: Partial<Pick<Application, 'rejection_reason' | 'screening_notes' | 'recruiter_notes'>> = {}
  ): Promise<RepositoryResult<number>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const updates: Partial<Application> = {
        status,
        last_activity_at: new Date().toISOString(),
        ...additionalData,
      };

      if (status === 'rejected') {
        updates.rejected_at = new Date().toISOString();
      }
      if (status === 'hired') {
        updates.hired_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .in('id', ids)
        .select('id');

      if (error) {
        return { data: 0, error };
      }

      return { data: data?.length || 0, error: null };
    } catch (error) {
      return { data: 0, error: error as Error };
    }
  },
};