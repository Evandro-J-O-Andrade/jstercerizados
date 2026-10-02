export type { SupportTicket } from '@/types/domain/support';

export interface SuporteModuleMeta {
  id: 'suporte';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const suporteModuleMeta: SuporteModuleMeta = {
  id: 'suporte',
  title: 'Suporte',
  description: 'Tickets e tarefas de atendimento',
  route: '/dashboard/suporte',
  scope: 'tenant',
  requiredPermissions: ['support_tickets.read'],
};
