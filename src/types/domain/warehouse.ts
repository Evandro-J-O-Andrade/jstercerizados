export interface Warehouse {
  id: string;
  tenant_id: string;
  name: string;
  location: string;
  manager: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface WarehouseCreateInput {
  tenant_id: string;
  name: string;
  location: string;
  manager?: string | null;
  status?: 'active' | 'inactive';
}

export interface WarehouseEntry {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  product_id: string | null;
  quantity: number;
  supplier: string | null;
  receipt_number: string | null;
  received_by: string | null;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface WarehouseEntryCreateInput {
  tenant_id: string;
  warehouse_id: string;
  product_id?: string | null;
  quantity: number;
  supplier?: string | null;
  receipt_number?: string | null;
  received_by?: string | null;
  received_at: string;
}

export interface WarehouseIssue {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  product_id: string | null;
  quantity: number;
  requester: string | null;
  department: string | null;
  issued_by: string | null;
  issued_at: string;
  created_at: string;
  updated_at: string;
}

export interface WarehouseIssueCreateInput {
  tenant_id: string;
  warehouse_id: string;
  product_id?: string | null;
  quantity: number;
  requester?: string | null;
  department?: string | null;
  issued_by?: string | null;
  issued_at: string;
}

export interface WarehouseReturn {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  product_id: string | null;
  quantity: number;
  reason: string;
  returned_by: string | null;
  returned_at: string;
  created_at: string;
  updated_at: string;
}

export interface WarehouseReturnCreateInput {
  tenant_id: string;
  warehouse_id: string;
  product_id?: string | null;
  quantity: number;
  reason: string;
  returned_by?: string | null;
  returned_at: string;
}

export interface WarehouseCustody {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  employee_id: string | null;
  product_id: string | null;
  quantity: number;
  assigned_at: string;
  returned_at: string | null;
  status: 'active' | 'returned';
  created_at: string;
  updated_at: string;
}

export interface WarehouseCustodyCreateInput {
  tenant_id: string;
  warehouse_id: string;
  employee_id?: string | null;
  product_id?: string | null;
  quantity: number;
  assigned_at: string;
  status?: 'active' | 'returned';
}

export interface EPI {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  employee_id: string | null;
  product_id: string | null;
  quantity: number;
  issued_at: string;
  returned_at: string | null;
  status: 'active' | 'returned';
  created_at: string;
  updated_at: string;
}

export interface EPICreateInput {
  tenant_id: string;
  warehouse_id: string;
  employee_id?: string | null;
  product_id?: string | null;
  quantity: number;
  issued_at: string;
  status?: 'active' | 'returned';
}
