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
  description: string | null;
  short_description: string | null;
  benefits: string[] | null;
  image_url: string | null;
  icon: string | null;
  category: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateInput {
  tenant_id: string;
  name: string;
  description?: string | null;
  short_description?: string | null;
  benefits?: string[] | null;
  image_url?: string | null;
  icon?: string | null;
  category: string;
  active?: boolean;
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
