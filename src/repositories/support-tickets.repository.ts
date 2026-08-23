import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

export type SupportTicket =
  Database['public']['Tables']['support_tickets']['Row'];

export class SupportTicketsRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<SupportTicket[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<SupportTicket | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const supportTicketsRepository = new SupportTicketsRepository();
