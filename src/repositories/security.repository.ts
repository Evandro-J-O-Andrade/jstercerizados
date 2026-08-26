import { SupabaseRepository } from './supabase.repository';
import type { SecurityEvent } from '@/types/domain/security';

export class SecurityEventRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<SecurityEvent[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('security_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<SecurityEvent | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('security_events')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async create(
    input: {
      event_type: string;
      person_id?: string | null;
      ip?: string | null;
      user_agent?: string | null;
      metadata?: Record<string, unknown>;
    },
    tenantId: string,
  ): Promise<SecurityEvent> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('security_events')
      .insert({
        event_type: input.event_type,
        person_id: input.person_id ?? null,
        tenant_id: tenantId,
        ip: input.ip ?? null,
        user_agent: input.user_agent ?? null,
        metadata: input.metadata ?? {},
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}

export const securityEventRepository = new SecurityEventRepository();
