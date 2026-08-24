import { SupabaseRepository } from './supabase.repository';
import type {
  Job,
  JobCreateInput,
  JobUpdateInput,
  JobStatus,
} from '@/types/domain/job';

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
    if (filters?.companyId) query = query.eq('company_id', filters.companyId);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findPublished(filters?: {
    status?: JobStatus;
    search?: string;
  }): Promise<Job[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
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
    return data || null;
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
    return data || null;
  }

  async create(input: JobCreateInput): Promise<Job> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('jobs')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    tenantId: string,
    input: JobUpdateInput,
  ): Promise<Job> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('jobs')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
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
