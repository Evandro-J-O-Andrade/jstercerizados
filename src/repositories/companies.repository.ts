import { SupabaseRepository } from './supabase.repository';
import type {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
} from '@/types/domain/company';

interface CompanyRelationship {
  company_id: string;
  tenant_id: string;
}

export class CompaniesRepository extends SupabaseRepository {
  private async findCompanyIdsForTenant(tenantId: string): Promise<string[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    if (error) throw error;
    return ((data || []) as Pick<CompanyRelationship, 'company_id'>[]).map(
      (relationship) => relationship.company_id,
    );
  }

  async findAll(
    tenantId: string,
    filters?: { status?: string; search?: string },
  ): Promise<Company[]> {
    if (!this.supabase) return [];

    const companyIds = await this.findCompanyIdsForTenant(tenantId);
    if (companyIds.length === 0) return [];

    let query = this.supabase
      .from('companies')
      .select('*')
      .in('id', companyIds)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) {
      query = query.or(
        `legal_name.ilike.%${filters.search}%,trading_name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Company[];
  }

  async findById(id: string, tenantId: string): Promise<Company | null> {
    if (!this.supabase) return null;

    const { data: relationship, error: relationshipError } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('company_id', id)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle();

    if (relationshipError) throw relationshipError;
    if (!relationship) return null;

    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return (data || null) as Company | null;
  }

  async create(input: CompanyCreateInput): Promise<Company> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { tenant_id, relationship_type_id, ...companyPayload } = input;
    const { data: company, error: companyError } = await this.supabase
      .from('companies')
      .insert(companyPayload)
      .select('*')
      .single();

    if (companyError) throw companyError;
    if (!company) throw new Error('Empresa não criada');

    const relationshipTypeId =
      relationship_type_id || (await this.getDefaultRelationshipTypeId());

    const { error: relationshipError } = await this.supabase
      .from('company_relationships')
      .insert({
        company_id: company.id,
        tenant_id,
        relationship_type_id: relationshipTypeId,
        status: 'active',
      });

    if (relationshipError) throw relationshipError;
    return company as Company;
  }

  async update(
    id: string,
    tenantId: string,
    input: CompanyUpdateInput,
  ): Promise<Company | null> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    const { tenant_id: _tenantId, relationship_type_id: _relationshipTypeId, ...payload } = input;
    const { data, error } = await this.supabase
      .from('companies')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return (data || null) as Company | null;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('company_relationships')
      .update({ status: 'inactive', ended_at: new Date().toISOString() })
      .eq('company_id', id)
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    if (error) throw error;
  }

  private async getDefaultRelationshipTypeId(): Promise<string> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('company_relationship_types')
      .select('id')
      .eq('code', 'client')
      .single();

    if (error) throw error;
    if (!data?.id) throw new Error('Tipo de relacionamento padrão não encontrado');
    return data.id;
  }
}

export const companiesRepository = new CompaniesRepository();
