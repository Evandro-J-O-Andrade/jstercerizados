import { SupabaseRepository } from './supabase.repository';
import type {
  Service,
  ServiceCreateInput,
  ServiceOrder,
  ServiceOrderCreateInput,
} from '@/types/domain/service';

export class ServicesRepository extends SupabaseRepository {
  async findServices(tenantId: string): Promise<Service[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data || []) as Service[];
  }

  async createService(input: ServiceCreateInput): Promise<Service> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('services')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Service;
  }

  async findOrders(tenantId: string): Promise<ServiceOrder[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ServiceOrder[];
  }

  async createOrder(input: ServiceOrderCreateInput): Promise<ServiceOrder> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('service_orders')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as ServiceOrder;
  }
}

export const servicesRepository = new ServicesRepository();
