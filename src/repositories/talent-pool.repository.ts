import { SupabaseRepository } from './supabase.repository';
import type {
  TalentPoolMembership,
  TalentPoolMembershipCreateInput,
  TalentPoolMembershipUpdateInput,
} from '@/types/domain/candidate';

export class TalentPoolRepository extends SupabaseRepository {
  async findByTenant(tenantId: string): Promise<TalentPoolMembership[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('talent_pool_memberships')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return (data || []) as TalentPoolMembership[];
  }

  async findByCandidate(
    candidateId: string,
    tenantId: string,
  ): Promise<TalentPoolMembership | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('talent_pool_memberships')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as TalentPoolMembership | null;
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<TalentPoolMembership | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('talent_pool_memberships')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as TalentPoolMembership | null;
  }

  async create(
    input: TalentPoolMembershipCreateInput,
  ): Promise<TalentPoolMembership> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      tenant_id: input.tenant_id,
      source: input.source,
    };

    if (input.status !== undefined) payload.status = input.status;
    if (input.consent_status !== undefined)
      payload.consent_status = input.consent_status;
    if (input.consent_source !== undefined)
      payload.consent_source = input.consent_source;
    if (input.consent_version !== undefined)
      payload.consent_version = input.consent_version;
    if (input.metadata !== undefined) payload.metadata = input.metadata;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('talent_pool_memberships')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as TalentPoolMembership;
  }

  async update(
    id: string,
    tenantId: string,
    input: TalentPoolMembershipUpdateInput,
  ): Promise<TalentPoolMembership> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.status !== undefined) payload.status = input.status;
    if (input.source !== undefined) payload.source = input.source;
    if (input.consent_status !== undefined)
      payload.consent_status = input.consent_status;
    if (input.consent_source !== undefined)
      payload.consent_source = input.consent_source;
    if (input.consent_version !== undefined)
      payload.consent_version = input.consent_version;
    if (input.removed_at !== undefined) payload.removed_at = input.removed_at;
    if (input.removal_reason !== undefined)
      payload.removal_reason = input.removal_reason;
    if (input.metadata !== undefined) payload.metadata = input.metadata;

    const { data, error } = await this.supabase
      .from('talent_pool_memberships')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data as TalentPoolMembership;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('talent_pool_memberships')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const talentPoolRepository = new TalentPoolRepository();
