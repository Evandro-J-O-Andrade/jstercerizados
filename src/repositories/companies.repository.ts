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

    const { data: relationships, error: relError } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('tenant_id', tenantId);

    if (relError) throw relError;
    if (!relationships || relationships.length === 0) return [];

    const companyIds = relationships.map((r) => r.company_id);

    let query = this.supabase
      .from('companies')
      .select('*')
      .in('id', companyIds)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search)
      query = query.or(
        `name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%,document.ilike.%${filters.search}%`,
      );

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Company | null> {
    if (!this.supabase) return null;

    const { data: relationship, error: relError } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('company_id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (relError) throw relError;
    if (!relationship) return null;

    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async create(input: CompanyCreateInput, tenantId: string): Promise<Company> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data: company, error: companyError } = await this.supabase
      .from('companies')
      .insert({
        name: input.name,
        legal_name: input.legal_name ?? null,
        document: input.document ?? null,
        status: input.status ?? 'active',
      })
      .select('*')
      .single();

    if (companyError) throw companyError;

    const { error: relError } = await this.supabase
      .from('company_relationships')
      .insert({
        company_id: company.id,
        tenant_id: tenantId,
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

    const { data: relationship, error: relError } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('company_id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (relError) throw relError;
    if (!relationship) return null as any;

    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.legal_name !== undefined) payload.legal_name = input.legal_name;
    if (input.document !== undefined) payload.document = input.document;
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

    const { error } = await this.supabase
      .from('company_relationships')
      .delete()
      .eq('company_id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }
}

export const companiesRepository = new CompaniesRepository();
