import { SupabaseRepository } from './supabase.repository';
import type {
  Partner,
  PartnerCreateInput,
  PartnerUpdateInput,
} from '@/types/domain/recruitment';

export class PartnersRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: { status?: string; search?: string },
  ): Promise<Partner[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('partners')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Partner | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async create(input: PartnerCreateInput): Promise<Partner> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('partners')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    tenantId: string,
    input: PartnerUpdateInput,
  ): Promise<Partner> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('partners')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}

export const partnersRepository = new PartnersRepository();
