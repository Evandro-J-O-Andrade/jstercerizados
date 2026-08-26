import { SupabaseRepository } from './supabase.repository';
import type { Notification } from '@/types/domain/notification';

export class NotificationRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Notification[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Notification | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async create(
    input: {
      channel: string;
      subject?: string | null;
      body?: string | null;
      metadata?: Record<string, unknown>;
      recipient_person_id?: string | null;
    },
    tenantId: string,
  ): Promise<Notification> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        channel: input.channel,
        subject: input.subject ?? null,
        body: input.body ?? null,
        metadata: input.metadata ?? {},
        recipient_person_id: input.recipient_person_id ?? null,
        tenant_id: tenantId,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}

export const notificationRepository = new NotificationRepository();
