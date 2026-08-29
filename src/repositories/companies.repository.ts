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
        `legal_name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`,
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
    return data || null;
  }

  async create(input: CompanyCreateInput): Promise<Company> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const payload = {
      ...input,
      tenant_id: input.tenant_id ?? null,
    };
    const { data, error } = await this.supabase
      .from('companies')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    tenantId: string,
    input: CompanyUpdateInput,
  ): Promise<Company> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const payload = {
      ...input,
      tenant_id: input.tenant_id ?? tenantId,
    };
    const { data, error } = await this.supabase
      .from('companies')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }
}

export const companiesRepository = new CompaniesRepository();
