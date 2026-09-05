import { SupabaseRepository } from '@/repositories/supabase.repository';

export type JobAlertFrequency = 'instant' | 'daily' | 'weekly';

export interface CandidateJobAlertRow {
  id: string;
  tenant_id: string;
  person_id: string;
  name: string;
  keywords: string | null;
  city: string | null;
  state: string | null;
  contract_type: string | null;
  work_mode: string | null;
  salary_min: number | null;
  salary_max: number | null;
  frequency: JobAlertFrequency;
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateJobAlertInput {
  tenant_id: string;
  person_id: string;
  name: string;
  keywords?: string | null;
  city?: string | null;
  state?: string | null;
  contract_type?: string | null;
  work_mode?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  frequency?: JobAlertFrequency;
  is_active?: boolean;
}

export class CandidateJobAlertsRepository extends SupabaseRepository {
  async listForCurrentPerson(tenantId: string): Promise<CandidateJobAlertRow[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('candidate_job_alerts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as CandidateJobAlertRow[];
  }

  async create(input: CandidateJobAlertInput): Promise<CandidateJobAlertRow> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_job_alerts')
      .insert({
        tenant_id: input.tenant_id,
        person_id: input.person_id,
        name: input.name,
        keywords: input.keywords ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        contract_type: input.contract_type ?? null,
        work_mode: input.work_mode ?? null,
        salary_min: input.salary_min ?? null,
        salary_max: input.salary_max ?? null,
        frequency: input.frequency ?? 'daily',
        is_active: input.is_active ?? true,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateJobAlertRow;
  }

  async update(
    id: string,
    input: Partial<CandidateJobAlertInput>,
  ): Promise<CandidateJobAlertRow> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_job_alerts')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.keywords !== undefined && { keywords: input.keywords }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.state !== undefined && { state: input.state }),
        ...(input.contract_type !== undefined && {
          contract_type: input.contract_type,
        }),
        ...(input.work_mode !== undefined && { work_mode: input.work_mode }),
        ...(input.salary_min !== undefined && { salary_min: input.salary_min }),
        ...(input.salary_max !== undefined && { salary_max: input.salary_max }),
        ...(input.frequency !== undefined && { frequency: input.frequency }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateJobAlertRow;
  }

  async remove(id: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('candidate_job_alerts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

export const candidateJobAlertsRepository = new CandidateJobAlertsRepository();