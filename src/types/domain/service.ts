export interface ServiceOrder {
  id: string;
  tenant_id: string;
  company_id: string | null;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderCreateInput {
  tenant_id: string;
  company_id?: string | null;
  description: string;
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  start_date?: string | null;
  end_date?: string | null;
  amount: number;
}

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateInput {
  tenant_id: string;
  name: string;
  description?: string | null;
  unit: string;
  price: number;
  status?: 'active' | 'inactive';
}

export interface ServiceExecution {
  id: string;
  tenant_id: string;
  service_order_id: string;
  performed_by: string | null;
  notes: string | null;
  executed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceExecutionCreateInput {
  tenant_id: string;
  service_order_id: string;
  performed_by?: string | null;
  notes?: string | null;
  executed_at: string;
}
