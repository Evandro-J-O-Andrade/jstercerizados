import { SupabaseRepository } from './supabase.repository';
import type {
  Job,
  JobRow,
  JobCreateInput,
  JobUpdateInput,
  JobStatus,
} from '@/types/domain/job';
import { mapJob } from '@/types/domain/mappers';

function toDbInsert(input: JobCreateInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    tenant_id: input.tenant_id,
    company_relationship_id: input.company_id,
    title: input.title,
    description: input.description,
    responsibilities: input.responsibilities ?? null,
    requirements: input.requirements ?? null,
    benefits: input.benefits ?? null,
    contract_type: input.employment_type ?? null,
    city: input.location?.split(',')[0]?.trim() || null,
    state: input.location?.split(',')[1]?.trim() || null,
    location_detail: input.location || null,
    salary_type: 'negotiate',
    salary_min: null,
    salary_max: null,
    work_mode: input.work_mode ?? 'onsite',
    status: input.status ?? 'draft',
    published_at: input.published_at ?? null,
    expires_at: input.closed_at ?? null,
    metadata: {},
  };
  return payload;
}

function toDbUpdate(input: JobUpdateInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.tenant_id !== undefined) payload.tenant_id = input.tenant_id;
  if (input.company_id !== undefined)
    payload.company_relationship_id = input.company_id;
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.responsibilities !== undefined)
    payload.responsibilities = input.responsibilities;
  if (input.requirements !== undefined)
    payload.requirements = input.requirements;
  if (input.benefits !== undefined) payload.benefits = input.benefits;
  if (input.employment_type !== undefined)
    payload.contract_type = input.employment_type;
  if (input.location !== undefined) {
    payload.city = input.location?.split(',')[0]?.trim() || null;
    payload.state = input.location?.split(',')[1]?.trim() || null;
    payload.location_detail = input.location || null;
  }
  if (input.salary !== undefined) {
    payload.salary_type = 'negotiate';
    payload.salary_min = null;
    payload.salary_max = null;
  }
  if (input.work_mode !== undefined) payload.work_mode = input.work_mode;
  if (input.status !== undefined) payload.status = input.status;
  if (input.published_at !== undefined)
    payload.published_at = input.published_at;
  if (input.closed_at !== undefined) payload.expires_at = input.closed_at;
  return payload;
}

export class JobsRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: { status?: JobStatus; companyId?: string; search?: string },
  ): Promise<Job[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('jobs')
      .select('*')
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

  async findPublished(filters?: {
    status?: JobStatus;
    search?: string;
  }): Promise<Job[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('jobs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapJob);
  }

  async findById(id: string, tenantId: string): Promise<Job | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapJob(data as JobRow) : null;
  }

  async findBySlug(slug: string, tenantId: string): Promise<Job | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
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
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return data ? mapJob(data as JobRow) : null;
  }

  async create(input: JobCreateInput): Promise<Job> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const payload = toDbInsert(input);
    const { data, error } = await this.supabase
      .from('jobs')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return mapJob(data as JobRow);
  }

  async update(
    id: string,
    tenantId: string,
    input: JobUpdateInput,
  ): Promise<Job> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const payload = toDbUpdate(input);
    const { data, error } = await this.supabase
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
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
}

export const jobsRepository = new JobsRepository();
