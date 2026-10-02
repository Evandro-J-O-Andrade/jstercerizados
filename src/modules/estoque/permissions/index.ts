export const ESTOQUE_PERMISSIONS = {
  dashboardRead: 'stock.read',
  productCreate: 'products.create',
  productUpdate: 'products.update',
  productDelete: 'products.delete',
  movementCreate: 'stock_movements.create',
  purchaseOrderCreate: 'purchase_orders.create',
  supplierManage: 'suppliers.manage',
} as const;
