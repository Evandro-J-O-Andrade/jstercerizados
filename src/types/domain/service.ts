export type ServiceStatus = 'draft' | 'published' | 'archived';

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  description: string | null;
  card_image_url: string | null;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  icon: string | null;
  benefits: string[] | null;
  process_steps: unknown;
  cta_title: string | null;
  cta_description: string | null;
  cta_button_text: string | null;
  cta_button_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  status: ServiceStatus;
  published_at: string | null;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateInput {
  tenant_id: string;
  name: string;
  slug: string;
  category?: string | null;
  short_description?: string | null;
  description?: string | null;
  card_image_url?: string | null;
  hero_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  icon?: string | null;
  benefits?: string[] | null;
  process_steps?: unknown;
  cta_title?: string | null;
  cta_description?: string | null;
  cta_button_text?: string | null;
  cta_button_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  status?: ServiceStatus;
  published_at?: string | null;
  display_order?: number;
  created_by?: string | null;
}

export interface ServiceUpdateInput {
  name?: string;
  slug?: string;
  category?: string | null;
  short_description?: string | null;
  description?: string | null;
  card_image_url?: string | null;
  hero_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  icon?: string | null;
  benefits?: string[] | null;
  process_steps?: unknown;
  cta_title?: string | null;
  cta_description?: string | null;
  cta_button_text?: string | null;
  cta_button_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  status?: ServiceStatus;
  published_at?: string | null;
  display_order?: number;
}

export type ServiceOrderStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export interface ServiceOrder {
  id: string;
  tenant_id: string;
  company_relationship_id: string | null;
  title: string;
  description: string | null;
  status: ServiceOrderStatus;
  scheduled_at: string | null;
  completed_at: string | null;
  quantity: number | null;
  value: number | null;
  period_start: string | null;
  period_end: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderCreateInput {
  tenant_id: string;
  company_relationship_id?: string | null;
  title: string;
  description?: string | null;
  status?: ServiceOrderStatus;
  scheduled_at?: string | null;
  completed_at?: string | null;
  quantity?: number | null;
  value?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface ServiceOrderUpdateInput {
  company_relationship_id?: string | null;
  title?: string;
  description?: string | null;
  status?: ServiceOrderStatus;
  scheduled_at?: string | null;
  completed_at?: string | null;
  quantity?: number | null;
  value?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface CompanyService {
  id: string;
  tenant_id: string;
  company_id: string;
  service_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  tenant_id: string;
  company_id: string;
  title: string;
  description: string | null;
  value: number | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderItem {
  id: string;
  tenant_id: string;
  service_order_id: string;
  description: string;
  quantity: number | null;
  unit_value: number | null;
  total_value: number | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderStatusHistory {
  id: string;
  tenant_id: string;
  service_order_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  tenant_id: string;
  service_order_id: string | null;
  title: string;
  description: string | null;
  status: ServiceOrderStatus;
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderAssignment {
  id: string;
  tenant_id: string;
  work_order_id: string;
  person_id: string;
  role: string | null;
  assigned_at: string;
  created_at: string;
}

export interface ServiceExecution {
  id: string;
  tenant_id: string;
  service_order_id: string;
  executed_by: string | null;
  notes: string | null;
  started_at: string;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceExecutionCreateInput {
  tenant_id: string;
  service_order_id: string;
  executed_by?: string | null;
  notes?: string | null;
  started_at: string;
  finished_at?: string | null;
}

export interface ServiceAcceptance {
  id: string;
  tenant_id: string;
  service_order_id: string;
  accepted_by: string | null;
  accepted_at: string | null;
  signature_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOccurrence {
  id: string;
  tenant_id: string;
  service_order_id: string;
  title: string;
  description: string | null;
  type: string | null;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  reported_by: string | null;
  reported_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceAttachment {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  purpose: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface CustomerRating {
  id: string;
  tenant_id: string;
  service_order_id: string;
  rating: number;
  comment: string | null;
  rated_by: string | null;
  rated_at: string;
  created_at: string;
}
