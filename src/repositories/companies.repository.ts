import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

type Company = Database['public']['Tables']['companies']['Row'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export class CompaniesRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Company[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('companies')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    return data || [];
  }

  async findById(id: string): Promise<Company | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch company: ${error.message}`);
    }

    return data;
  }

  async create(tenantId: string, company: CompanyInsert): Promise<Company> {
    const client = this.getClient();
    const { data, error } = await client
      .from('companies')
      .insert({ ...company, tenant_id: tenantId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create company: ${error.message}`);
    }

    return data;
  }

  async update(id: string, company: CompanyUpdate): Promise<Company> {
    const client = this.getClient();
    const { data, error } = await client
      .from('companies')
      .update(company)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update company: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('companies').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete company: ${error.message}`);
    }
  }
}

export const companiesRepository = new CompaniesRepository();
