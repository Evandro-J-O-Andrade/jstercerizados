import { SupabaseRepository } from './supabase.repository';
import type {
  Service,
  ServiceCreateInput,
  ServiceOrder,
  ServiceOrderCreateInput,
  ServiceExecution,
  ServiceExecutionCreateInput,
} from '@/types/domain/service';

export type PublicServiceCategory = 'rh' | 'facilities' | 'terceirizacao';

export interface PublicServiceGalleryItem {
  url: string;
  alt: string | null;
  sort_order: number;
}

export interface PublicServiceV1 {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  description: string | null;
  card_image_url: string | null;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  icon: string | null;
  benefits: unknown;
  process_steps: unknown;
  cta_title: string | null;
  cta_description: string | null;
  cta_button_text: string | null;
  cta_button_url: string | null;
  gallery: PublicServiceGalleryItem[] | null;
  status: string;
  published_at: string | null;
  display_order: number | null;
  metadata: Record<string, unknown>;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
}

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

  async updateService(
    tenantId: string,
    id: string,
    input: Partial<ServiceCreateInput>,
  ): Promise<Service> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('services')
      .update(input)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Service;
  }

  async deleteService(tenantId: string, id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('services')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;
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

  async updateOrder(
    tenantId: string,
    id: string,
    input: Partial<ServiceOrderCreateInput>,
  ): Promise<ServiceOrder> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('service_orders')
      .update(input)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as ServiceOrder;
  }

  async deleteOrder(tenantId: string, id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('service_orders')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;
  }

  async findExecutions(tenantId: string): Promise<ServiceExecution[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_executions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('started_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ServiceExecution[];
  }

  async createExecution(
    input: ServiceExecutionCreateInput,
  ): Promise<ServiceExecution> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('service_executions')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as ServiceExecution;
  }

  async updateExecution(
    tenantId: string,
    id: string,
    input: Partial<ServiceExecutionCreateInput>,
  ): Promise<ServiceExecution> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('service_executions')
      .update(input)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as ServiceExecution;
  }

  async deleteExecution(tenantId: string, id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('service_executions')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;
  }

  /**
   * Public list of published services via the read-only view `public_services_v1`.
   * Used by /servicos. The view itself filters by tenant slug = 'js-empregos'
   * and status = 'published' — tenant_id is intentionally not exposed.
   */
  async findPublicServices(opts?: {
    category?: PublicServiceCategory;
  }): Promise<PublicServiceV1[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('public_services_v1')
      .select('*')
      .order('display_order', { ascending: true });

    if (opts?.category) {
      query = query.eq('category', opts.category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PublicServiceV1[];
  }

  /**
   * Public single-service lookup by slug via the read-only view.
   * Used by /servicos/:slug.
   */
  async findPublicServiceBySlug(slug: string): Promise<PublicServiceV1 | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('public_services_v1')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return (data as PublicServiceV1 | null) ?? null;
  }
}

export const servicesRepository = new ServicesRepository();
