import { SupabaseRepository } from './supabase.repository';

export interface RecruitmentDemandOption {
  id: string;
  position: string;
  status: string;
  company_id: string | null;
}

export class RecruitmentDemandsRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<RecruitmentDemandOption[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('recruitment_demands')
      .select('id, position, status, company_id')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as RecruitmentDemandOption[];
  }
}

export const recruitmentDemandsRepository = new RecruitmentDemandsRepository();
