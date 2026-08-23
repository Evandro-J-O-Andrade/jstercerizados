import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

export type ServiceOrder =
  Database['public']['Tables']['service_orders']['Row'];

export class ServicesRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<ServiceOrder[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<ServiceOrder | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const servicesRepository = new ServicesRepository();
