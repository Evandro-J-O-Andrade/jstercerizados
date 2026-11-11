'use client';

import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { ServiceOrder, ServiceOrderCreateInput, ServiceOrderUpdateInput } from '@/types/domain/service';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  scheduled: 'Agendada',
  in_progress: 'Em Andamento',
  on_hold: 'Suspensa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const ORDER_STATUS_VARIANT: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
};

const ORDENS_COLUMNS: ColumnDef<ServiceOrder>[] = [
  { key: 'title', header: 'Título', sortable: true, width: 'w-[25%]' },
  { key: 'status', header: 'Status', sortable: true, width: 'w-[20%]', render: (item: ServiceOrder) => (
    <span className={`px-2 py-1 rounded text-[10px] font-medium ${ORDER_STATUS_VARIANT[item.status]}`}>
      {ORDER_STATUS_LABELS[item.status] ?? item.status}
    </span>
  )},
  { key: 'scheduled_at', header: 'Agendamento', sortable: true, width: 'w-[18%]', render: (item: ServiceOrder) => (
    <span className="text-muted-foreground text-[11px]">
      {item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString('pt-BR') : '-'}
    </span>
  )},
  { key: 'value', header: 'Valor', sortable: true, width: 'w-[12%]', render: (item: ServiceOrder) => (
    <span className="text-muted-foreground text-[11px] font-mono">
      {item.value ? item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
    </span>
  )},
  { key: 'created_at', header: 'Criado em', sortable: true, width: 'w-[15%]', render: (item: ServiceOrder) => (
    <span className="text-muted-foreground text-[11px]">
      {new Date(item.created_at).toLocaleDateString('pt-BR')}
    </span>
  )},
];

const ORDENS_FILTERS: FilterDef[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pendente' },
      { value: 'scheduled', label: 'Agendada' },
      { value: 'in_progress', label: 'Em Andamento' },
      { value: 'on_hold', label: 'Suspensa' },
      { value: 'completed', label: 'Concluída' },
      { value: 'cancelled', label: 'Cancelada' },
    ],
  },
];

const defaultForm: ServiceOrderCreateInput = {
  tenant_id: '',
  title: '',
  status: 'pending',
  quantity: 1,
  value: 0,
};

export default function ServicosOrdensPage() {
  const { hasAnyPermission } = useAuth();

  const canCreate = hasAnyPermission([SERVICOS_PERMISSIONS.serviceOrdersCreate]);
  const canUpdate = hasAnyPermission([SERVICOS_PERMISSIONS.serviceOrdersUpdate]);
  const canDelete = hasAnyPermission([SERVICOS_PERMISSIONS.serviceOrdersDelete]);

  return (
    <ModulePage
      title="Ordens de Serviço"
      description="Acompanhe ordens de serviço vinculadas a serviços contratados."
      columns={ORDENS_COLUMNS}
      filters={ORDENS_FILTERS}
      fetchData={(tenantId) => servicesRepository.findOrders(tenantId)}
      createItem={async (tenantId, input) => {
        const result = await servicesRepository.createOrder({
          ...input,
          tenant_id: tenantId,
        } as ServiceOrderCreateInput);
        return result;
      }}
      updateItem={async (tenantId, id, input) => {
        const result = await servicesRepository.updateOrder(
          tenantId,
          id,
          input as ServiceOrderUpdateInput,
        );
        return result;
      }}
      deleteItem={async (tenantId, id) => {
        await servicesRepository.deleteOrder(tenantId, id);
      }}
      getItemId={(item: ServiceOrder) => item.id}
      defaultForm={defaultForm}
      emptyMessage="Nenhuma ordem de serviço registrada."
      permissions={[
        {
          id: SERVICOS_PERMISSIONS.serviceOrdersRead,
          name: SERVICOS_PERMISSIONS.serviceOrdersRead,
          module: 'services',
          resource: 'service_orders',
          action: 'read',
          created_at: new Date().toISOString(),
        },
        canCreate
          ? {
              id: SERVICOS_PERMISSIONS.serviceOrdersCreate,
              name: SERVICOS_PERMISSIONS.serviceOrdersCreate,
              module: 'services',
              resource: 'service_orders',
              action: 'create',
              created_at: new Date().toISOString(),
            }
          : undefined,
        canUpdate
          ? {
              id: SERVICOS_PERMISSIONS.serviceOrdersUpdate,
              name: SERVICOS_PERMISSIONS.serviceOrdersUpdate,
              module: 'services',
              resource: 'service_orders',
              action: 'update',
              created_at: new Date().toISOString(),
            }
          : undefined,
        canDelete
          ? {
              id: SERVICOS_PERMISSIONS.serviceOrdersDelete,
              name: SERVICOS_PERMISSIONS.serviceOrdersDelete,
              module: 'services',
              resource: 'service_orders',
              action: 'delete',
              created_at: new Date().toISOString(),
            }
          : undefined,
      ].filter((p): p is NonNullable<typeof p> => p !== undefined)}
    />
  );
}
