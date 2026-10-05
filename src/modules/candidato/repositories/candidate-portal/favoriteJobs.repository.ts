import { SupabaseRepository } from '@/repositories/supabase.repository';

export interface FavoriteJobRow {
  id: string;
  tenant_id: string;
  person_id: string;
  job_id: string;
  created_at: string;
}

export interface FavoriteJobWithJob extends FavoriteJobRow {
  job: {
    id: string;
    title: string;
    slug: string;
    city: string | null;
    state: string | null;
    work_mode: string | null;
    contract_type: string | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_type: string | null;
    status: string;
  } | null;
}

export class FavoriteJobsRepository extends SupabaseRepository {
  async listForCurrentPerson(tenantId: string): Promise<FavoriteJobWithJob[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('favorite_jobs')
      .select(
        `
        id, tenant_id, person_id, job_id, created_at,
        job:jobs(id, title, slug, city, state, work_mode, contract_type, salary_min, salary_max, salary_type, status)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as FavoriteJobWithJob[];
  }

  async isFavorite(jobId: string): Promise<boolean> {
    if (!this.supabase) return false;
    const { data, error } = await this.supabase
      .from('favorite_jobs')
      .select('id')
      .eq('job_id', jobId)
      .maybeSingle();
    if (error) return false;
    return !!data;
  }

  async add(personId: string, jobId: string, tenantId: string): Promise<FavoriteJobRow> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('favorite_jobs')
      .insert({ person_id: personId, job_id: jobId, tenant_id: tenantId })
      .select('id, tenant_id, person_id, job_id, created_at')
      .single();
    if (error) throw error;
    return data as FavoriteJobRow;
  }

  async remove(jobId: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('favorite_jobs')
      .delete()
      .eq('job_id', jobId);
    if (error) throw error;
  }
}

export const favoriteJobsRepository = new FavoriteJobsRepository();
