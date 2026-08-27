export interface StockMovement {
  id: string;
  tenant_id: string;
  product_id: string;
  quantity: number;
  movement_type: string;
  notes: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface StockMovementCreateInput {
  tenant_id: string;
  product_id: string;
  quantity: number;
  movement_type: string;
  notes?: string | null;
  reference_id?: string | null;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  unit: string | null;
  category: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCreateInput {
  tenant_id: string;
  name: string;
  unit?: string | null;
  category?: string | null;
  status?: string;
}
