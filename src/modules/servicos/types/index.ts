export type {
  Service,
  ServiceCreateInput,
  ServiceOrder,
  ServiceOrderCreateInput,
  ServiceExecution,
} from '@/types/domain/service';

export interface ServicosModuleMeta {
  id: 'servicos';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const servicosModuleMeta: ServicosModuleMeta = {
  id: 'servicos',
  title: 'Serviços',
  description: 'Catálogo e ordens de serviço',
  route: '/dashboard/servicos',
  scope: 'tenant',
  requiredPermissions: ['service_orders.read'],
};
