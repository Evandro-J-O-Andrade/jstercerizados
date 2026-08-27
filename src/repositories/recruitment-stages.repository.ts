import { SupabaseRepository } from './supabase.repository';
import type {
  RecruitmentStage,
  RecruitmentStageCreateInput,
  RecruitmentStageUpdateInput,
} from '@/types/domain/recruitment-stage';
import type { Database } from '@/types/database';
import { mapRecruitmentStage } from '@/types/domain/mappers';

type RecruitmentStageRow =
  Database['public']['Tables']['recruitment_stages']['Row'];

export class RecruitmentStagesRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: {
      processId?: string;
      status?: string;
      search?: string;
    },
  ): Promise<RecruitmentStage[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('recruitment_stages')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('order', { ascending: true });

    if (filters?.processId)
      query = query.eq('recruitment_process_id', filters.processId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search)
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) =>
      mapRecruitmentStage(row as RecruitmentStageRow),
    );
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<RecruitmentStage | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('recruitment_stages')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapRecruitmentStage(data as RecruitmentStageRow);
  }

  async create(
    input: RecruitmentStageCreateInput,
  ): Promise<RecruitmentStage | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('recruitment_stages')
      .insert({
        tenant_id: input.tenant_id,
        recruitment_process_id: input.recruitment_process_id,
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? 'active',
        order: input.order ?? 0,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapRecruitmentStage(data as RecruitmentStageRow);
  }

  async update(
    id: string,
    tenantId: string,
    input: RecruitmentStageUpdateInput,
  ): Promise<RecruitmentStage | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.recruitment_process_id !== undefined)
      payload.recruitment_process_id = input.recruitment_process_id;
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.status !== undefined) payload.status = input.status;
    if (input.order !== undefined) payload.order = input.order;

    const { data, error } = await this.supabase
      .from('recruitment_stages')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapRecruitmentStage(data as RecruitmentStageRow);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('recruitment_stages')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const recruitmentStagesRepository = new RecruitmentStagesRepository();
