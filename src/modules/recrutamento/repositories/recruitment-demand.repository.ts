import { getSupabaseClient } from '@/lib/supabase';
import { recruitmentDemandsRepository } from '@/repositories/recruitment-demands.repository';
import type {
  CreateDemandInput,
  RecruitmentDemand,
  UpdateDemandInput,
} from '../types';

export const recruitmentDemandRepository = {
  findAll(tenantId: string): Promise<RecruitmentDemand[]> {
    return recruitmentDemandsRepository.findAll(tenantId);
  },

  async findById(
    id: string,
    tenantId: string,
  ): Promise<RecruitmentDemand | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('recruitment_demands')
      .select(
        'id, tenant_id, company_id, position, quantity, status, created_at, updated_at, contact_name, contact_email, contact_phone, description, urgency, service_type, responsible_person_id, service_id',
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(input: CreateDemandInput): Promise<RecruitmentDemand> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('recruitment_demands')
      .insert(input)
      .select(
        'id, tenant_id, company_id, position, quantity, status, created_at, updated_at, contact_name, contact_email, contact_phone, description, urgency, service_type, responsible_person_id, service_id',
      )
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    tenantId: string,
    input: UpdateDemandInput,
  ): Promise<RecruitmentDemand | null> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');
    const { id: _inputId, ...updates } = input;

    const { data, error } = await supabase
      .from('recruitment_demands')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(
        'id, tenant_id, company_id, position, quantity, status, created_at, updated_at, contact_name, contact_email, contact_phone, description, urgency, service_type, responsible_person_id, service_id',
      )
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};