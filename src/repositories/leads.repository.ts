import { SupabaseRepository } from './supabase.repository';
import type {
  Lead,
  LeadCreateInput,
  LeadUpdateInput,
  LeadStatus,
} from '@/types/domain/recruitment';

export class LeadsRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: { status?: LeadStatus; search?: string },
  ): Promise<Lead[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Lead | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async create(input: LeadCreateInput): Promise<Lead> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('leads')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    tenantId: string,
    input: LeadUpdateInput,
  ): Promise<Lead> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('leads')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}

export const leadsRepository = new LeadsRepository();
