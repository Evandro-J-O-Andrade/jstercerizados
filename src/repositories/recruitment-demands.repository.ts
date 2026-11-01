import { SupabaseRepository } from './supabase.repository';
import type { RecruitmentDemand } from '@/modules/recrutamento/types';

export type RecruitmentDemandOption = RecruitmentDemand;

export class RecruitmentDemandsRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<RecruitmentDemandOption[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('recruitment_demands')
      .select(
        'id, tenant_id, company_id, position, quantity, status, created_at, updated_at, contact_name, contact_email, contact_phone, description, urgency, service_type, responsible_person_id, service_id',
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const recruitmentDemandsRepository = new RecruitmentDemandsRepository();
