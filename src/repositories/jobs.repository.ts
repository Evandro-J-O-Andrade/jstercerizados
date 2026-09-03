import { SupabaseRepository } from './supabase.repository';
import type { Job, JobRow } from '@/types/domain/job';
import { mapJob } from '@/types/domain/mappers';

export interface PublicJobV1 {
  job_id: string;
  title: string;
  slug: string;
  status: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  contract_type: string | null;
  work_mode: string | null;
  location: string | null;
  location_raw: string | null;
  city: string | null;
  state: string | null;
  salary_text: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  seniority: string | null;
  work_hours: string | null;
  area: string | null;
  work_schedule: string | null;
  company_id: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  published_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  views_count: number;
  applications_count: number;
  tenant_id: string;
}

export class JobsRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: { status?: string; companyId?: string; search?: string },
  ): Promise<Job[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('jobs')
      .select(
        `
        *,
        company_relationship:company_relationships(*)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.companyId)
      query = query.eq('company_relationship_id', filters.companyId);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapJob);
  }

  async findById(id: string, tenantId: string): Promise<Job | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('jobs')
      .select(
        `
        *,
        company_relationship:company_relationships(*)
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapJob(data as JobRow) : null;
  }

  async create(input: {
    tenant_id: string;
    title: string;
    slug: string;
    description?: string | null;
    responsibilities?: string | null;
    requirements?: string | null;
    benefits?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_type?: string | null;
    contract_type?: string | null;
    seniority?: string | null;
    work_hours?: string | null;
    work_mode?: string | null;
    city?: string | null;
    state?: string | null;
    location_detail?: string | null;
    status?: string | null;
    published_at?: string | null;
    expires_at?: string | null;
    metadata?: Record<string, unknown>;
    created_by?: string | null;
    company_relationship_id?: string | null;
  }): Promise<Job> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      tenant_id: input.tenant_id,
      title: input.title,
      slug: input.slug,
      status: input.status ?? 'draft',
      metadata: input.metadata ?? {},
    };

    if (input.company_relationship_id !== undefined)
      payload.company_relationship_id = input.company_relationship_id;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.responsibilities !== undefined)
      payload.responsibilities = input.responsibilities;
    if (input.requirements !== undefined)
      payload.requirements = input.requirements;
    if (input.benefits !== undefined) payload.benefits = input.benefits;
    if (input.salary_min !== undefined) payload.salary_min = input.salary_min;
    if (input.salary_max !== undefined) payload.salary_max = input.salary_max;
    if (input.salary_type !== undefined)
      payload.salary_type = input.salary_type;
    if (input.contract_type !== undefined)
      payload.contract_type = input.contract_type;
    if (input.seniority !== undefined) payload.seniority = input.seniority;
    if (input.work_hours !== undefined) payload.work_hours = input.work_hours;
    if (input.work_mode !== undefined) payload.work_mode = input.work_mode;
    if (input.city !== undefined) payload.city = input.city;
    if (input.state !== undefined) payload.state = input.state;
    if (input.location_detail !== undefined)
      payload.location_detail = input.location_detail;
    if (input.published_at !== undefined)
      payload.published_at = input.published_at;
    if (input.expires_at !== undefined) payload.expires_at = input.expires_at;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('jobs')
      .insert(payload)
      .select(
        `
        *,
        company_relationship:company_relationships(*)
      `,
      )
      .single();

    if (error) throw error;
    return mapJob(data as JobRow);
  }

  async update(
    id: string,
    tenantId: string,
    input: Partial<{
      company_relationship_id: string | null;
      title: string;
      slug: string;
      description: string | null;
      responsibilities: string | null;
      requirements: string | null;
      benefits: string | null;
      salary_min: number | null;
      salary_max: number | null;
      salary_type: string | null;
      contract_type: string | null;
      seniority: string | null;
      work_hours: string | null;
      work_mode: string | null;
      city: string | null;
      state: string | null;
      location_detail: string | null;
      status: string | null;
      published_at: string | null;
      expires_at: string | null;
      metadata: Record<string, unknown>;
      created_by: string | null;
    }>,
  ): Promise<Job> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.company_relationship_id !== undefined)
      payload.company_relationship_id = input.company_relationship_id;
    if (input.title !== undefined) payload.title = input.title;
    if (input.slug !== undefined) payload.slug = input.slug;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.responsibilities !== undefined)
      payload.responsibilities = input.responsibilities;
    if (input.requirements !== undefined)
      payload.requirements = input.requirements;
    if (input.benefits !== undefined) payload.benefits = input.benefits;
    if (input.salary_min !== undefined) payload.salary_min = input.salary_min;
    if (input.salary_max !== undefined) payload.salary_max = input.salary_max;
    if (input.salary_type !== undefined)
      payload.salary_type = input.salary_type;
    if (input.contract_type !== undefined)
      payload.contract_type = input.contract_type;
    if (input.seniority !== undefined) payload.seniority = input.seniority;
    if (input.work_hours !== undefined) payload.work_hours = input.work_hours;
    if (input.work_mode !== undefined) payload.work_mode = input.work_mode;
    if (input.city !== undefined) payload.city = input.city;
    if (input.state !== undefined) payload.state = input.state;
    if (input.location_detail !== undefined)
      payload.location_detail = input.location_detail;
    if (input.status !== undefined) payload.status = input.status;
    if (input.published_at !== undefined)
      payload.published_at = input.published_at;
    if (input.expires_at !== undefined) payload.expires_at = input.expires_at;
    if (input.metadata !== undefined) payload.metadata = input.metadata;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(
        `
        *,
        company_relationship:company_relationships(*)
      `,
      )
      .single();

    if (error) throw error;
    return mapJob(data as JobRow);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  async findPublished(filters?: {
    status?: string;
    search?: string;
  }): Promise<Job[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('jobs')
      .select(
        `
        *,
        company_relationship:company_relationships(*)
      `,
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapJob);
  }

  async findBySlug(slug: string, tenantId: string): Promise<Job | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('jobs')
      .select(
        `
        *,
        company_relationship:company_relationships(*)
      `,
      )
      .eq('slug', slug)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapJob(data as JobRow) : null;
  }

  async findPublishedBySlug(slug: string): Promise<Job | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('jobs')
      .select(
        `
        *,
        company_relationship:company_relationships(*)
      `,
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return data ? mapJob(data as JobRow) : null;
  }

  /**
   * Public list of published jobs via the read-only view `public_jobs_v1`.
   * Includes legacy fallback for employment_type, location, salary.
   */
  async findPublicJobs(opts?: {
    search?: string;
    limit?: number;
  }): Promise<PublicJobV1[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('public_jobs_v1')
      .select('*')
      .order('published_at', { ascending: false });

    if (opts?.search && opts.search.trim().length > 0) {
      query = query.ilike('title', `%${opts.search.trim()}%`);
    }
    if (typeof opts?.limit === 'number') {
      query = query.limit(opts.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PublicJobV1[];
  }

  async findPublicJobBySlug(slug: string): Promise<PublicJobV1 | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('public_jobs_v1')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return (data as PublicJobV1 | null) ?? null;
  }
}

export const jobsRepository = new JobsRepository();
