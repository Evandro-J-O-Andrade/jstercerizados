import { SupabaseRepository } from './supabase.repository';
import type { Partner } from '@/types/domain/recruitment';

export class PartnersRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Partner[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('company_relationships')
      .select(
        `
        id,
        company_id,
        tenant_id,
        status,
        started_at,
        ended_at,
        created_at,
        companies (
          id,
          trading_name,
          cnpj,
          industry,
          status
        )
      `,
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    const relationshipType = await this.getRelationshipTypeId('partner');
    if (!relationshipType) return [];

    const filtered = data.filter(
      (item: any) => item.relationship_type_id === relationshipType,
    );

    return filtered.map((item: any) => {
      const company = item.companies as any;
      return {
        id: item.id,
        tenant_id: item.tenant_id,
        name: company?.trading_name || 'Sem nome',
        trading_name: company?.trading_name,
        cnpj: company?.cnpj,
        industry: company?.industry,
        status: item.status,
        started_at: item.started_at,
        ended_at: item.ended_at,
        created_at: item.created_at,
      } as unknown as Partner;
    });
  }

  async findById(id: string, tenantId: string): Promise<Partner | null> {
    if (!this.supabase) return null;

    const relationshipType = await this.getRelationshipTypeId('partner');
    if (!relationshipType) return null;

    const { data, error } = await this.supabase
      .from('company_relationships')
      .select(
        `
        id,
        company_id,
        tenant_id,
        status,
        started_at,
        ended_at,
        created_at,
        companies (
          id,
          trading_name,
          cnpj,
          industry,
          status
        )
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .eq('relationship_type_id', relationshipType)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const company = (data as any).companies as any;
    return {
      id: data.id,
      tenant_id: data.tenant_id,
      name: company?.trading_name || 'Sem nome',
      trading_name: company?.trading_name,
      cnpj: company?.cnpj,
      industry: company?.industry,
      status: data.status,
      started_at: data.started_at,
      ended_at: data.ended_at,
      created_at: data.created_at,
    } as unknown as Partner;
  }

  private async getRelationshipTypeId(code: string): Promise<string | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('company_relationship_types')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (error || !data) return null;
    return data.id;
  }
}

export const partnersRepository = new PartnersRepository();
