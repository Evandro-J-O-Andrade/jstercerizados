import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

export type RecruitmentProcess =
  Database['public']['Tables']['recruitment_processes']['Row'];

export class RecruitmentProcessesRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<RecruitmentProcess[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('recruitment_processes')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<RecruitmentProcess | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('recruitment_processes')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const recruitmentProcessesRepository =
  new RecruitmentProcessesRepository();
