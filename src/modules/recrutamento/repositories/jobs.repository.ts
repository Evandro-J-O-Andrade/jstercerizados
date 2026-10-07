/**
 * Jobs Repository
 * 
 * Handles all database operations for jobs (vagas de emprego).
 * Uses Supabase client with RLS policies for tenant isolation.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type {
  Job,
  JobListItem,
  JobFilters,
  CreateJobInput,
  UpdateJobInput,
  RepositoryResult,
  RepositoryListResult,
} from '../types';

/**
 * Map database row to Job type
 */
function mapJobRow(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    company_relationship_id: row.company_relationship_id as string | null,
    title: row.title as string,
    slug: row.slug as string,
    description: row.description as string | null,
    responsibilities: row.responsibilities as string | null,
    requirements: row.requirements as string | null,
    benefits: row.benefits as string | null,
    salary_min: row.salary_min as number | null,
    salary_max: row.salary_max as number | null,
    salary_type: row.salary_type as Job['salary_type'],
    contract_type: row.contract_type as Job['contract_type'],
    seniority: row.seniority as Job['seniority'],
    work_hours: row.work_hours as string | null,
    work_mode: row.work_mode as Job['work_mode'],
    city: row.city as string | null,
    state: row.state as string | null,
    location_detail: row.location_detail as string | null,
    status: row.status as Job['status'],
    published_at: row.published_at as string | null,
    closed_at: row.closed_at as string | null,
    filled_at: row.filled_at as string | null,
    views_count: row.views_count as number,
    applications_count: row.applications_count as number,
    metadata: (row.metadata as Record<string, unknown>) || {},
    created_at: row.created_at as string,
    created_by: row.created_by as string | null,
    updated_at: row.updated_at as string,
    updated_by: row.updated_by as string | null,
  };
}

function mapJobListItemRow(row: Record<string, unknown>): JobListItem {
  const job = mapJobRow(row);
  const companies = row.companies as
    | { name?: string; trading_name?: string; logo_url?: string }
    | null
    | undefined;
  return {
    ...job,
    company_name: companies?.name ?? companies?.trading_name ?? undefined,
    company_logo_url: companies?.logo_url ?? undefined,
  };
}

function buildJobQuery(supabase: any, filters: JobFilters) {
  let query = supabase
    .from('jobs')
    .select(
      `
      *,
      companies (
        name,
        trading_name,
        logo_url
      )
    `,
      { count: 'exact' },
    );

  if (filters.tenant_id) {
    query = query.eq('tenant_id', filters.tenant_id);
  }
  if (filters.company_relationship_id) {
    query = query.eq('company_relationship_id', filters.company_relationship_id);
  }
  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    query = query.in('status', statuses);
  }
  if (filters.contract_type) {
    const types = Array.isArray(filters.contract_type) ? filters.contract_type : [filters.contract_type];
    query = query.in('contract_type', types);
  }
  if (filters.work_mode) {
    const modes = Array.isArray(filters.work_mode) ? filters.work_mode : [filters.work_mode];
    query = query.in('work_mode', modes);
  }
  if (filters.seniority) {
    const seniorities = Array.isArray(filters.seniority) ? filters.seniority : [filters.seniority];
    query = query.in('seniority', seniorities);
  }
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters.state) {
    query = query.eq('state', filters.state);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,requirements.ilike.%${filters.search}%`);
  }
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  const sortBy = filters.sort_by || 'created_at';
  const sortOrder = filters.sort_order || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const page = filters.limit ? Math.floor((filters.offset || 0) / filters.limit) + 1 : 1;
  const pageSize = filters.limit || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  return query;
}

export const jobsRepository = {
  /**
   * List jobs with filters and pagination
   */
  async list(filters: JobFilters = {}): Promise<RepositoryListResult<JobListItem>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const query = buildJobQuery(supabase, filters);
      const { data, error, count } = await query;

      if (error) {
        return { data: [], error, count: count || 0 };
      }

      const mappedData = (data || []).map(mapJobListItemRow);
      return { data: mappedData, error: null, count: count || 0 };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },

  /**
   * Get a single job by ID
   */
  async getById(id: string): Promise<RepositoryResult<Job>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get a job by slug (within tenant)
   *
   * When tenantId is empty/null, the query runs WITHOUT a tenant_id filter.
   * This preserves the public-slug lookup behavior used by /vagas/:slug.
   */
  async getBySlug(tenantId: string | null, slug: string): Promise<RepositoryResult<Job>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      let query = supabase
        .from('jobs')
        .select('*')
        .eq('slug', slug);

      if (tenantId && tenantId.trim() !== '') {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query.single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Create a new job
   */
  async create(input: CreateJobInput): Promise<RepositoryResult<Job>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          tenant_id: input.tenant_id,
          company_relationship_id: input.company_relationship_id,
          title: input.title,
          slug: input.slug,
          description: input.description,
          responsibilities: input.responsibilities,
          requirements: input.requirements,
          benefits: input.benefits,
          salary_min: input.salary_min,
          salary_max: input.salary_max,
          salary_type: input.salary_type || 'negotiate',
          contract_type: input.contract_type || 'clt',
          seniority: input.seniority,
          work_hours: input.work_hours,
          work_mode: input.work_mode || 'onsite',
          city: input.city,
          state: input.state,
          location_detail: input.location_detail,
          status: input.status || 'draft',
          metadata: input.metadata || {},
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update an existing job
   */
  async update(input: UpdateJobInput): Promise<RepositoryResult<Job>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update job status
   */
  async updateStatus(id: string, status: Job['status']): Promise<RepositoryResult<Job>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const updates: Partial<Job> = { status };
      if (status === 'published') updates.published_at = new Date().toISOString();
      if (status === 'closed') updates.closed_at = new Date().toISOString();
      if (status === 'filled') updates.filled_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Increment views count
   */
  async incrementViews(id: string): Promise<RepositoryResult<Job>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase.rpc('increment_job_views', { job_id: id });

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Increment applications count
   */
  async incrementApplications(id: string): Promise<RepositoryResult<Job>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase.rpc('increment_job_applications', { job_id: id });

      if (error) {
        return { data: null, error };
      }

      return { data: mapJobRow(data), error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Delete a job (soft delete via status)
   */
  async delete(id: string): Promise<RepositoryResult<void>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { error } = await supabase
        .from('jobs')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        return { data: null, error };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get jobs for a specific process
   *
   * Uses the real FK: jobs.company_id → companies.id.
   * company_relationship_id is NOT a FK to company_relationships in the
   * current production schema, so the old company_relationships!inner
   * join produced HTTP 400 from PostgREST.
   */
  async getByProcessId(processId: string): Promise<RepositoryListResult<JobListItem>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            trading_name,
            logo_url
          )
        `)
        .eq('recruitment_processes.id', processId);

      if (error) {
        return { data: [], error, count: 0 };
      }

      return { data: (data || []).map(mapJobListItemRow), error: null, count: data?.length || 0 };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  },

  /**
   * Get published jobs for public listing (candidate portal)
   */
  async getPublished(tenantId: string, filters: Omit<JobFilters, 'tenant_id' | 'status'> = {}): Promise<RepositoryListResult<JobListItem>> {
    return this.list({
      ...filters,
      tenant_id: tenantId,
      status: 'published',
    });
  },

  /**
   * Get job stats for dashboard
   */
  async getStats(tenantId: string): Promise<RepositoryResult<{
    total: number;
    draft: number;
    published: number;
    paused: number;
    closed: number;
    filled: number;
  }>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data, error } = await supabase
        .from('jobs')
        .select('status')
        .eq('tenant_id', tenantId);

      if (error) {
        return { data: null, error };
      }

      const stats = {
        total: data.length,
        draft: data.filter((j: any) => j.status === 'draft').length,
        published: data.filter((j: any) => j.status === 'published').length,
        paused: data.filter((j: any) => j.status === 'paused').length,
        closed: data.filter((j: any) => j.status === 'closed').length,
        filled: data.filter((j: any) => j.status === 'filled').length,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};