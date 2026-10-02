export const OPERACOES_PERMISSIONS = {
  dashboardRead: 'work_orders.read',
  orderCreate: 'work_orders.create',
  orderUpdate: 'work_orders.update',
  orderAssign: 'work_order_assignments.manage',
  checklistManage: 'work_order_checklists.manage',
  materialTrack: 'work_order_materials.read',
} as const;
