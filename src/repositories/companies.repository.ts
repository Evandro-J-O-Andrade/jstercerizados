import { SupabaseRepository } from './supabase.repository';
import type {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
} from '@/types/domain/company';

export class CompaniesRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: { status?: string; search?: string },
  ): Promise<Company[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('companies')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search)
      query = query.or(
        `name.ilike.%${filters.search}%,trading_name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`,
      );

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Company | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: relationship, error: relError } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('company_id', id)
      .eq('relationship_type', 'customer')
      .eq('status', 'active')
      .maybeSingle();

    if (relError) throw relError;
    if (!relationship) return null;

    return data;
  }

  async create(input: CompanyCreateInput, tenantId: string): Promise<Company> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data: company, error: companyError } = await this.supabase
      .from('companies')
      .insert({
        tenant_id: tenantId,
        name: input.name,
        trading_name: input.trading_name ?? null,
        cnpj: input.cnpj ?? null,
        status: input.status ?? 'active',
      })
      .select('*')
      .single();

    if (companyError) throw companyError;

    const { error: relError } = await this.supabase
      .from('company_relationships')
      .insert({
        company_id: company.id,
        relationship_type: 'customer',
        status: 'active',
      });

    if (relError) throw relError;

    return company;
  }

  async update(
    id: string,
    tenantId: string,
    input: CompanyUpdateInput,
  ): Promise<Company> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data: existing, error: findError } = await this.supabase
      .from('companies')
      .select('id, tenant_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return null as any;

    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.trading_name !== undefined)
      payload.trading_name = input.trading_name;
    if (input.cnpj !== undefined) payload.cnpj = input.cnpj;
    if (input.status !== undefined) payload.status = input.status;

    const { data, error } = await this.supabase
      .from('companies')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data: existing, error: findError } = await this.supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return;

    const { error } = await this.supabase
      .from('company_relationships')
      .delete()
      .eq('company_id', id)
      .eq('relationship_type', 'customer');
    if (error) throw error;
  }
}

export const companiesRepository = new CompaniesRepository();
