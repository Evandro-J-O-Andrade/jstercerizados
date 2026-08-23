import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export class JobsRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Job[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('jobs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    return data || [];
  }

  async findById(id: string): Promise<Job | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    return data;
  }

  async create(tenantId: string, job: JobInsert): Promise<Job> {
    const client = this.getClient();
    const { data, error } = await client
      .from('jobs')
      .insert({ ...job, tenant_id: tenantId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return data;
  }

  async update(id: string, job: JobUpdate): Promise<Job> {
    const client = this.getClient();
    const { data, error } = await client
      .from('jobs')
      .update(job)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('jobs').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }
}

export const jobsRepository = new JobsRepository();
