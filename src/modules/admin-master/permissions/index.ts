/**
 * Permissões da célula admin-master — ROOT global.
 *
 * Essas permissões são consultadas no banco via AuthContext e RLS.
 * O frontend nunca contorna a verificação de permissão.
 */

export const ADMIN_MASTER_PERMISSIONS = {
  tenants: 'tenants.read',
  companies: 'companies.read',
  people: 'people.read',
  users: 'users.read',
  roles: 'roles.read',
  permissions: 'permissions.read',
  sessions: 'sessions.read',
  candidates: 'candidates.read',
  jobs: 'jobs.read',
  applications: 'applications.read',
  serviceOrders: 'service_orders.read',
  supportTickets: 'support_tickets.read',
  audit: 'audit.read',
  modules: 'modules.read',
  contracts: 'contracts.read',
} as const;

export type AdminMasterPermission =
  (typeof ADMIN_MASTER_PERMISSIONS)[keyof typeof ADMIN_MASTER_PERMISSIONS];
