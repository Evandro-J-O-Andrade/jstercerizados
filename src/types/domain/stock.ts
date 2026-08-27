export interface StockMovement {
  id: string;
  tenant_id: string;
  product_id: string | null;
  type: 'entry' | 'exit' | 'transfer' | 'adjustment';
  quantity: number;
  unit_cost: number;
  total_cost: number;
  reason: string;
  reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovementCreateInput {
  tenant_id: string;
  product_id?: string | null;
  type: 'entry' | 'exit' | 'transfer' | 'adjustment';
  quantity: number;
  unit_cost: number;
  total_cost: number;
  reason: string;
  reference?: string | null;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  unit: string;
  current_stock: number;
  min_stock: number;
  unit_cost: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ProductCreateInput {
  tenant_id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  unit: string;
  current_stock?: number;
  min_stock?: number;
  unit_cost: number;
  status?: 'active' | 'inactive';
}
