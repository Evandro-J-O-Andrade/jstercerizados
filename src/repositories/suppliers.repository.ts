import { SupabaseRepository } from './supabase.repository';
import type { Supplier, SupplierCreateInput, SupplierUpdateInput } from '@/types/domain/recruitment';

export class SuppliersRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Supplier[]> {
    if (!this.supabase) return [];

    const relationshipType = await this.getRelationshipTypeId('supplier');
    if (!relationshipType) return [];

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
      .eq('relationship_type_id', relationshipType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((item: any) => {
      const company = item.companies as any;
      return {
        id: item.id,
        tenant_id: item.tenant_id,
        name: company?.trading_name || 'Sem nome',
        slug: company?.trading_name?.toLowerCase().replace(/\s+/g, '-') || '',
        document: company?.cnpj || null,
        products: company?.industry || null,
        representative: null,
        phone: null,
        email: null,
        catalog: null,
        documents: null,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
      } as unknown as Supplier;
    });
  }

  async findById(id: string, tenantId: string): Promise<Supplier | null> {
    if (!this.supabase) return null;

    const relationshipType = await this.getRelationshipTypeId('supplier');
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
        updated_at,
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
      products: company?.industry || null,
      representative: null,
      phone: null,
      email: null,
      catalog: null,
      documents: null,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as unknown as Supplier;
  }

  async create(input: SupplierCreateInput, tenantId: string): Promise<Supplier> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    // First create the company
    const { data: company, error: companyError } = await this.supabase
      .from('companies')
      .insert({
        tenant_id: tenantId,
        trading_name: input.name,
        cnpj: input.document ?? null,
        industry: input.products ?? null,
        status: 'active',
      })
      .select('*')
      .single();

    if (companyError) throw companyError;

    // Then create the relationship
    const relationshipType = await this.getRelationshipTypeId('supplier');
    if (!relationshipType) throw new Error('Tipo de relacionamento fornecedor não encontrado');

    const { data: relationship, error: relError } = await this.supabase
      .from('company_relationships')
      .insert({
        company_id: company.id,
        tenant_id: tenantId,
        relationship_type_id: relationshipType,
        status: input.status ?? 'active',
        started_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (relError) throw relError;

    return this.findById(relationship.id, tenantId) as Promise<Supplier>;
  }

  async update(
    id: string,
    tenantId: string,
    input: SupplierUpdateInput,
  ): Promise<Supplier> {
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
    if (input.products !== undefined) companyUpdates.industry = input.products;

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

    if (Object.keys(relUpdates).length > 0) {
      const { error: updateRelError } = await this.supabase
        .from('company_relationships')
        .update(relUpdates)
        .eq('id', id)
        .eq('tenant_id', tenantId);
      if (updateRelError) throw updateRelError;
    }

    return this.findById(id, tenantId) as Promise<Supplier>;
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

export const suppliersRepository = new SuppliersRepository();
