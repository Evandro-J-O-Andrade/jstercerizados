import { SupabaseRepository } from './supabase.repository';
import type { Job, JobCreateInput, JobUpdateInput } from '@/types/domain/job';

export class JobRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Job[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('jobs')
      .select(
        `
        *,
        company_relationship:company_relationships(*),
        skills:job_skills(*)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Job[];
  }

  async findById(id: string, tenantId: string): Promise<Job | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('jobs')
      .select(
        `
        *,
        company_relationship:company_relationships(*),
        skills:job_skills(*)
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as Job | null;
  }

  async create(input: JobCreateInput, tenantId: string): Promise<Job> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      tenant_id: tenantId || input.tenant_id,
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
        company_relationship:company_relationships(*),
        skills:job_skills(*)
      `,
      )
      .single();

    if (error) throw error;
    return data as Job;
  }

  async update(
    id: string,
    tenantId: string,
    input: JobUpdateInput,
  ): Promise<Job> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.tenant_id !== undefined) payload.tenant_id = input.tenant_id;
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
        company_relationship:company_relationships(*),
        skills:job_skills(*)
      `,
      )
      .single();

    if (error) throw error;
    return data as Job;
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

export const jobRepository = new JobRepository();
