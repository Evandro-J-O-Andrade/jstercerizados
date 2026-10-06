export interface ServiceOrder {
  id: string;
  tenant_id: string;
  company_service_id: string;
  status: string;
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
  company_service_id: string;
  status?: string;
  scheduled_at?: string | null;
  completed_at?: string | null;
  quantity?: number | null;
  value?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  description: string | null;
  card_image_url: string | null;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  benefits: string[] | null;
  icon: string | null;
  process_steps: unknown;
  cta_title: string | null;
  cta_description: string | null;
  cta_button_text: string | null;
  cta_button_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  display_order: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateInput {
  tenant_id: string;
  name: string;
  slug?: string;
  category: string;
  short_description?: string | null;
  description?: string | null;
  card_image_url?: string | null;
  hero_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  benefits?: string[] | null;
  icon?: string | null;
  process_steps?: unknown;
  cta_title?: string | null;
  cta_description?: string | null;
  cta_button_text?: string | null;
  cta_button_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string | null;
  display_order?: number | null;
  created_by?: string | null;
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
