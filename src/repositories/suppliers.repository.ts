import { SupabaseRepository } from './supabase.repository';
import type {
  Supplier,
  SupplierCreateInput,
  SupplierUpdateInput,
} from '@/types/domain/recruitment';

export class SuppliersRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: { status?: string; search?: string },
  ): Promise<Supplier[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('suppliers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Supplier | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async create(input: SupplierCreateInput): Promise<Supplier> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('suppliers')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    tenantId: string,
    input: SupplierUpdateInput,
  ): Promise<Supplier> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('suppliers')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}

export const suppliersRepository = new SuppliersRepository();
