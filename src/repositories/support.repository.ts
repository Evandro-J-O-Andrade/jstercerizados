import { SupabaseRepository } from './supabase.repository';
import type {
  SupportTicket,
  SupportTicketCreateInput,
  SupportTicketMessage,
  SupportTicketMessageCreateInput,
  SupportFAQ,
  SupportFAQCreateInput,
} from '@/types/domain/support';

export class SupportRepository extends SupabaseRepository {
  async findTickets(tenantId: string): Promise<SupportTicket[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as SupportTicket[];
  }

  async findTicketById(
    id: string,
    tenantId: string,
  ): Promise<SupportTicket | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as SupportTicket | null;
  }

  async createTicket(input: SupportTicketCreateInput): Promise<SupportTicket> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('support_tickets')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as SupportTicket;
  }

  async updateTicket(
    id: string,
    input: Partial<SupportTicketCreateInput>,
    tenantId: string,
  ): Promise<SupportTicket> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('support_tickets')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data as SupportTicket;
  }

  async deleteTicket(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('support_tickets')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }

  async findMessages(
    ticketId: string,
    tenantId: string,
  ): Promise<SupportTicketMessage[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('support_ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as SupportTicketMessage[];
  }

  async createMessage(
    input: SupportTicketMessageCreateInput,
  ): Promise<SupportTicketMessage> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('support_ticket_messages')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as SupportTicketMessage;
  }

  async findFAQs(tenantId: string): Promise<SupportFAQ[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('support_faqs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []) as SupportFAQ[];
  }

  async createFAQ(input: SupportFAQCreateInput): Promise<SupportFAQ> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('support_faqs')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as SupportFAQ;
  }
}

export const supportRepository = new SupportRepository();
