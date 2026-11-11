import { SupabaseRepository } from './supabase.repository';
import type {
  Service,
  ServiceCreateInput,
  ServiceUpdateInput,
  ServiceOrder,
  ServiceOrderCreateInput,
  ServiceOrderUpdateInput,
  ServiceExecution,
  ServiceExecutionCreateInput,
  CompanyService,
  Contract,
  ServiceOrderItem,
  ServiceOrderStatusHistory,
  WorkOrder,
  WorkOrderAssignment,
  ServiceAcceptance,
  ServiceOccurrence,
  ServiceAttachment,
  CustomerRating,
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
  display_order: number;
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
    input: ServiceUpdateInput,
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

  async updateServiceStatus(
    tenantId: string,
    id: string,
    status: Service['status'],
  ): Promise<Service> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('services')
      .update({ status })
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
    input: ServiceOrderUpdateInput,
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

  async findCompanyServices(tenantId: string): Promise<CompanyService[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('company_services')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as CompanyService[];
  }

  async findContracts(tenantId: string): Promise<Contract[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('contracts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Contract[];
  }

  async findOrderItems(
    tenantId: string,
    serviceOrderId: string,
  ): Promise<ServiceOrderItem[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_order_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('service_order_id', serviceOrderId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as ServiceOrderItem[];
  }

  async findOrderStatusHistory(
    tenantId: string,
    serviceOrderId: string,
  ): Promise<ServiceOrderStatusHistory[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_order_status_history')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('service_order_id', serviceOrderId)
      .order('changed_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ServiceOrderStatusHistory[];
  }

  async findWorkOrders(tenantId: string): Promise<WorkOrder[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('work_orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as WorkOrder[];
  }

  async findWorkOrderAssignments(
    tenantId: string,
    workOrderId: string,
  ): Promise<WorkOrderAssignment[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('work_order_assignments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('work_order_id', workOrderId)
      .order('assigned_at', { ascending: true });
    if (error) throw error;
    return (data || []) as WorkOrderAssignment[];
  }

  async findAcceptances(tenantId: string): Promise<ServiceAcceptance[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_acceptances')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ServiceAcceptance[];
  }

  async findOccurrences(tenantId: string): Promise<ServiceOccurrence[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_occurrences')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('reported_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ServiceOccurrence[];
  }

  async findOccurrencesByOrder(
    tenantId: string,
    serviceOrderId: string,
  ): Promise<ServiceOccurrence[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_occurrences')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('service_order_id', serviceOrderId)
      .order('reported_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ServiceOccurrence[];
  }

  async findAttachments(
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<ServiceAttachment[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('service_attachments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ServiceAttachment[];
  }

  async findRatings(tenantId: string): Promise<CustomerRating[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('customer_ratings')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('rated_at', { ascending: false });
    if (error) throw error;
    return (data || []) as CustomerRating[];
  }

  async findRatingsByOrder(
    tenantId: string,
    serviceOrderId: string,
  ): Promise<CustomerRating[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('customer_ratings')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('service_order_id', serviceOrderId)
      .order('rated_at', { ascending: false });
    if (error) throw error;
    return (data || []) as CustomerRating[];
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
