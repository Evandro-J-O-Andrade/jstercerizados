'use client';

import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { ServiceExecution, ServiceExecutionCreateInput } from '@/types/domain/service';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';

const EXECUCOES_COLUMNS: ColumnDef<ServiceExecution>[] = [
  { key: 'service_order_id', header: 'Ordem de Serviço', sortable: true, width: 'w-[30%]' },
  { key: 'executed_by', header: 'Executado por', sortable: true, width: 'w-[25%]' },
  { key: 'started_at', header: 'Início', sortable: true, width: 'w-[20%]', render: (item: ServiceExecution) => (
    <span className="text-muted-foreground text-[11px]">{new Date(item.started_at).toLocaleString('pt-BR')}</span>
  )},
  { key: 'finished_at', header: 'Término', sortable: true, width: 'w-[20%]', render: (item: ServiceExecution) => (
    <span className="text-muted-foreground text-[11px]">{item.finished_at ? new Date(item.finished_at).toLocaleString('pt-BR') : '-'}</span>
  )},
];

const EXECUCOES_FILTERS: FilterDef[] = [];

const defaultForm: ServiceExecutionCreateInput = {
  tenant_id: '',
  service_order_id: '',
  started_at: new Date().toISOString(),
};

export default function ServicosExecucoesPage() {
  const { hasAnyPermission } = useAuth();

  const canCreate = hasAnyPermission([SERVICOS_PERMISSIONS.serviceExecutionsCreate]);
  const canUpdate = hasAnyPermission([SERVICOS_PERMISSIONS.serviceExecutionsUpdate]);
  const canDelete = hasAnyPermission([SERVICOS_PERMISSIONS.serviceExecutionsDelete]);

  return (
    <ModulePage
      title="Execuções de Serviço"
      description="Registre e acompanhe as execuções de ordens de serviço."
      columns={EXECUCOES_COLUMNS}
      filters={EXECUCOES_FILTERS}
      fetchData={(tenantId) => servicesRepository.findExecutions(tenantId)}
      createItem={async (tenantId, input) => {
        const result = await servicesRepository.createExecution({
          ...input,
          tenant_id: tenantId,
        } as ServiceExecutionCreateInput);
        return result;
      }}
      updateItem={async (tenantId, id, input) => {
        const result = await servicesRepository.updateExecution(tenantId, id, input as Partial<ServiceExecutionCreateInput>);
        return result;
      }}
      deleteItem={async (tenantId, id) => {
        await servicesRepository.deleteExecution(tenantId, id);
      }}
      getItemId={(item: ServiceExecution) => item.id}
      defaultForm={defaultForm}
      emptyMessage="Nenhuma execução registrada."
      permissions={[
        {
          id: SERVICOS_PERMISSIONS.serviceExecutionsRead,
          name: SERVICOS_PERMISSIONS.serviceExecutionsRead,
          module: 'services',
          resource: 'service_executions',
          action: 'read',
          created_at: new Date().toISOString(),
        },
        canCreate
          ? {
              id: SERVICOS_PERMISSIONS.serviceExecutionsCreate,
              name: SERVICOS_PERMISSIONS.serviceExecutionsCreate,
              module: 'services',
              resource: 'service_executions',
              action: 'create',
              created_at: new Date().toISOString(),
            }
          : undefined,
        canUpdate
          ? {
              id: SERVICOS_PERMISSIONS.serviceExecutionsUpdate,
              name: SERVICOS_PERMISSIONS.serviceExecutionsUpdate,
              module: 'services',
              resource: 'service_executions',
              action: 'update',
              created_at: new Date().toISOString(),
            }
          : undefined,
        canDelete
          ? {
              id: SERVICOS_PERMISSIONS.serviceExecutionsDelete,
              name: SERVICOS_PERMISSIONS.serviceExecutionsDelete,
              module: 'services',
              resource: 'service_executions',
              action: 'delete',
              created_at: new Date().toISOString(),
            }
          : undefined,
      ].filter((p): p is NonNullable<typeof p> => p !== undefined)}
    />
  );
}
