import { SupabaseRepository } from './supabase.repository';
import type { Partner, PartnerCreateInput, PartnerUpdateInput } from '@/types/domain/recruitment';

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
        slug: company?.trading_name?.toLowerCase().replace(/\s+/g, '-') || '',
        document: company?.cnpj || null,
        area: company?.industry || null,
        city: null,
        state: null,
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
      slug: company?.trading_name?.toLowerCase().replace(/\s+/g, '-') || '',
      document: company?.cnpj || null,
      area: company?.industry || null,
      city: null,
      state: null,
      status: data.status,
      started_at: data.started_at,
      ended_at: data.ended_at,
      created_at: data.created_at,
    } as unknown as Partner;
  }

  async create(input: PartnerCreateInput, tenantId: string): Promise<Partner> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    // First create the company
    const { data: company, error: companyError } = await this.supabase
      .from('companies')
      .insert({
        tenant_id: tenantId,
        trading_name: input.name,
        cnpj: input.document ?? null,
        industry: input.area ?? null,
        status: 'active',
      })
      .select('*')
      .single();

    if (companyError) throw companyError;

    // Then create the relationship
    const relationshipType = await this.getRelationshipTypeId('partner');
    if (!relationshipType) throw new Error('Tipo de relacionamento parceiro não encontrado');

    const { data: relationship, error: relError } = await this.supabase
      .from('company_relationships')
      .insert({
        company_id: company.id,
        tenant_id: tenantId,
        relationship_type_id: relationshipType,
        status: input.status ?? 'pending',
        started_at: input.started_at ?? new Date().toISOString(),
      })
      .select('*')
      .single();

    if (relError) throw relError;

    return this.findById(relationship.id, tenantId) as Promise<Partner>;
  }

  async update(
    id: string,
    tenantId: string,
    input: PartnerUpdateInput,
  ): Promise<Partner> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    // Get the relationship to find company_id
    const { data: relationship, error: relError } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (relError) throw relError;
    if (!relationship) return null as any;

    // Update company
    const companyUpdates: Record<string, unknown> = {};
    if (input.name !== undefined) companyUpdates.trading_name = input.name;
    if (input.document !== undefined) companyUpdates.cnpj = input.document;
    if (input.area !== undefined) companyUpdates.industry = input.area;

    if (Object.keys(companyUpdates).length > 0) {
      const { error: companyError } = await this.supabase
        .from('companies')
        .update(companyUpdates)
        .eq('id', relationship.company_id);
      if (companyError) throw companyError;
    }

    // Update relationship
    const relUpdates: Record<string, unknown> = {};
    if (input.status !== undefined) relUpdates.status = input.status;
    if (input.started_at !== undefined) relUpdates.started_at = input.started_at;
    if (input.ended_at !== undefined) relUpdates.ended_at = input.ended_at;

    if (Object.keys(relUpdates).length > 0) {
      const { error: updateRelError } = await this.supabase
        .from('company_relationships')
        .update(relUpdates)
        .eq('id', id)
        .eq('tenant_id', tenantId);
      if (updateRelError) throw updateRelError;
    }

    return this.findById(id, tenantId) as Promise<Partner>;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    // Get the relationship to find company_id
    const { data: relationship, error: relError } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (relError) throw relError;
    if (!relationship) return;

    // Delete relationship
    const { error: deleteRelError } = await this.supabase
      .from('company_relationships')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (deleteRelError) throw deleteRelError;
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
