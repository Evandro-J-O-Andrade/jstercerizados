import { SupabaseRepository } from './supabase.repository';
import type {
  RecruitmentProcess,
  RecruitmentProcessCreateInput,
  RecruitmentProcessUpdateInput,
} from '@/types/domain/recruitment-process';
import type { Database } from '@/types/database';
import { mapRecruitmentProcess } from '@/types/domain/mappers';

type RecruitmentProcessRow =
  Database['public']['Tables']['recruitment_processes']['Row'];

export class RecruitmentProcessesRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: {
      status?: string;
      jobId?: string;
      search?: string;
    },
  ): Promise<RecruitmentProcess[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('recruitment_processes')
      .select(
        `
        *,
        job:jobs(*)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.jobId) query = query.eq('job_id', filters.jobId);
    if (filters?.search)
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) =>
      mapRecruitmentProcess(row as RecruitmentProcessRow),
    );
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<RecruitmentProcess | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('recruitment_processes')
      .select(
        `
        *,
        job:jobs(*)
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapRecruitmentProcess(data as RecruitmentProcessRow);
  }

  async create(
    input: RecruitmentProcessCreateInput,
  ): Promise<RecruitmentProcess | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('recruitment_processes')
      .insert({
        tenant_id: input.tenant_id,
        job_id: input.job_id ?? null,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? 'draft',
      })
      .select(
        `
        *,
        job:jobs(*)
      `,
      )
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapRecruitmentProcess(data as RecruitmentProcessRow);
  }

  async update(
    id: string,
    tenantId: string,
    input: RecruitmentProcessUpdateInput,
  ): Promise<RecruitmentProcess | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.job_id !== undefined) payload.job_id = input.job_id;
    if (input.title !== undefined) payload.title = input.title;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.status !== undefined) payload.status = input.status;

    const { data, error } = await this.supabase
      .from('recruitment_processes')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(
        `
        *,
        job:jobs(*)
      `,
      )
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapRecruitmentProcess(data as RecruitmentProcessRow);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('recruitment_processes')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const recruitmentProcessesRepository =
  new RecruitmentProcessesRepository();
