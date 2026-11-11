import { SupabaseRepository } from '@/repositories/supabase.repository';
import type { Database } from '@/types/database';

type LeadRow = Database['public']['Tables']['leads']['Row'];

export interface Lead {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string | null;
  service_id: string | null;
  status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadCreateInput {
  tenant_id: string;
  name: string;
  email: string;
  phone?: string | null;
  service_id?: string | null;
  status?: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
  message?: string | null;
}

export interface LeadUpdateInput {
  name?: string;
  email?: string;
  phone?: string | null;
  service_id?: string | null;
  status?: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
  message?: string | null;
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service_id: row.service_id,
    status: row.status as Lead['status'],
    message: row.message,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export class CrmRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Lead[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapLead);
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
    if (!data) return null;
    return mapLead(data);
  }

  async create(input: LeadCreateInput): Promise<Lead | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('leads')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) return null;
    return mapLead(data);
  }

  async update(id: string, tenantId: string, input: LeadUpdateInput): Promise<Lead | null> {
    if (!this.supabase) return null;
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.email !== undefined) payload.email = input.email;
    if (input.phone !== undefined) payload.phone = input.phone;
    if (input.service_id !== undefined) payload.service_id = input.service_id;
    if (input.status !== undefined) payload.status = input.status;
    if (input.message !== undefined) payload.message = input.message;

    const { data, error } = await this.supabase
      .from('leads')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) return null;
    return mapLead(data);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }
}

export const crmRepository = new CrmRepository();
