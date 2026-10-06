'use client';

import { useState } from 'react';
import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Service,
  ServiceOrder,
  ServiceExecution,
  ServiceCreateInput,
  ServiceOrderCreateInput,
  ServiceExecutionCreateInput,
} from '@/types/domain/service';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import { getModuleById } from '@/components/portal/ModuleRegistry';
import { ServiceForm } from '@/modules/servicos/components/ServiceForm';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';

type Tab = 'services' | 'orders' | 'executions';

const SERVICES_COLUMNS: ColumnDef<Service>[] = [
  { key: 'name', header: 'Nome', sortable: true },
  { key: 'category', header: 'Categoria', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  {
    key: 'published_at',
    header: 'Publicado em',
    render: (item) =>
      item.published_at
        ? new Date(item.published_at).toLocaleDateString('pt-BR')
        : '-',
    sortable: true,
  },
  {
    key: 'display_order',
    header: 'Ordem',
    render: (item) => item.display_order ?? '-',
    sortable: true,
  },
  {
    key: 'created_at',
    header: 'Criado em',
    render: (item) => new Date(item.created_at).toLocaleDateString('pt-BR'),
    sortable: true,
  },
];

const SERVICES_FILTERS: FilterDef[] = [
  { key: 'category', label: 'Categoria', type: 'text' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Rascunho' },
      { value: 'published', label: 'Publicado' },
      { value: 'archived', label: 'Arquivado' },
    ],
  },
];

const ORDERS_COLUMNS: ColumnDef<ServiceOrder>[] = [
  { key: 'company_service_id', header: 'Serviço', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  {
    key: 'scheduled_at',
    header: 'Agendamento',
    render: (item) =>
      item.scheduled_at
        ? new Date(item.scheduled_at).toLocaleDateString('pt-BR')
        : '-',
    sortable: true,
  },
  {
    key: 'value',
    header: 'Valor',
    render: (item) =>
      item.value
        ? item.value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '-',
    sortable: true,
  },
  {
    key: 'created_at',
    header: 'Criado em',
    render: (item) => new Date(item.created_at).toLocaleDateString('pt-BR'),
    sortable: true,
  },
];

const ORDERS_FILTERS: FilterDef[] = [
  { key: 'status', label: 'Status', type: 'text' },
];

const EXECUTIONS_COLUMNS: ColumnDef<ServiceExecution>[] = [
  { key: 'service_order_id', header: 'Ordem', sortable: true },
  {
    key: 'started_at',
    header: 'Início',
    render: (item) =>
      item.started_at ? new Date(item.started_at).toLocaleString('pt-BR') : '-',
    sortable: true,
  },
  {
    key: 'finished_at',
    header: 'Fim',
    render: (item) =>
      item.finished_at
        ? new Date(item.finished_at).toLocaleString('pt-BR')
        : '-',
    sortable: true,
  },
  {
    key: 'created_at',
    header: 'Criado em',
    render: (item) => new Date(item.created_at).toLocaleDateString('pt-BR'),
    sortable: true,
  },
];

const EXECUTIONS_FILTERS: FilterDef[] = [];

function OrderForm({
  form,
  setForm,
}: {
  form: ServiceOrderCreateInput;
  setForm: (form: ServiceOrderCreateInput) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-foreground text-sm font-medium">Serviço</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.company_service_id}
          onChange={(e) =>
            setForm({ ...form, company_service_id: e.target.value })
          }
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Status</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.status ?? ''}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">
          Agendamento
        </label>
        <input
          type="datetime-local"
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.scheduled_at ?? ''}
          onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Valor</label>
        <input
          type="number"
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.value ?? ''}
          onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">
          Período início
        </label>
        <input
          type="date"
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.period_start ?? ''}
          onChange={(e) => setForm({ ...form, period_start: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">
          Período fim
        </label>
        <input
          type="date"
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.period_end ?? ''}
          onChange={(e) => setForm({ ...form, period_end: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Local</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.location ?? ''}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">
          Observações
        </label>
        <textarea
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.notes ?? ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </div>
  );
}

function ExecutionForm({
  form,
  setForm,
}: {
  form: ServiceExecutionCreateInput;
  setForm: (form: ServiceExecutionCreateInput) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-foreground text-sm font-medium">
          Ordem de serviço
        </label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.service_order_id}
          onChange={(e) =>
            setForm({ ...form, service_order_id: e.target.value })
          }
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">
          Executado por
        </label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.executed_by ?? ''}
          onChange={(e) => setForm({ ...form, executed_by: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Início</label>
        <input
          type="datetime-local"
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.started_at}
          onChange={(e) => setForm({ ...form, started_at: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Fim</label>
        <input
          type="datetime-local"
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.finished_at ?? ''}
          onChange={(e) => setForm({ ...form, finished_at: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Notas</label>
        <textarea
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.notes ?? ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function Servicos() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [tab, setTab] = useState<Tab>('services');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [servicesRefreshKey, setServicesRefreshKey] = useState(0);

  const moduleDef: ModuleDefinition | undefined = getModuleById('servicos');

  const canCreateService = hasAnyPermission([
    SERVICOS_PERMISSIONS.servicesCreate,
  ]);
  const canUpdateService = hasAnyPermission([
    SERVICOS_PERMISSIONS.servicesUpdate,
  ]);
  const canDeleteService = hasAnyPermission([
    SERVICOS_PERMISSIONS.servicesDelete,
  ]);

  const canCreateOrder = hasAnyPermission([
    SERVICOS_PERMISSIONS.serviceOrdersCreate,
  ]);
  const canUpdateOrder = hasAnyPermission([
    SERVICOS_PERMISSIONS.serviceOrdersUpdate,
  ]);
  const canDeleteOrder = hasAnyPermission([
    SERVICOS_PERMISSIONS.serviceOrdersDelete,
  ]);

  const canCreateExecution = hasAnyPermission([
    SERVICOS_PERMISSIONS.serviceExecutionsCreate,
  ]);
  const canUpdateExecution = hasAnyPermission([
    SERVICOS_PERMISSIONS.serviceExecutionsUpdate,
  ]);
  const canDeleteExecution = hasAnyPermission([
    SERVICOS_PERMISSIONS.serviceExecutionsDelete,
  ]);

  const serviceDefaultForm: ServiceCreateInput = {
    tenant_id: currentTenantId || '',
    name: '',
    category: '',
    active: true,
  };

  const orderDefaultForm: ServiceOrderCreateInput = {
    tenant_id: currentTenantId || '',
    company_service_id: '',
    status: 'open',
    quantity: 1,
    value: 0,
    location: '',
    notes: '',
  };

  const executionDefaultForm: ServiceExecutionCreateInput = {
    tenant_id: currentTenantId || '',
    service_order_id: '',
    executed_by: '',
    notes: '',
    started_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Serviços</h1>
          <p className="text-muted-foreground text-sm">
            Catálogo, ordens e execuções.
          </p>
        </div>
      </div>

      <div className="border-border flex gap-2 overflow-x-auto border-b">
        {[
          { key: 'services', label: 'Serviços' },
          { key: 'orders', label: 'Ordens' },
          { key: 'executions', label: 'Execuções' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'services' && (
        <ModulePage
          title="Serviços"
          description="Catálogo de serviços."
          module={moduleDef}
          permissions={
            [
              {
                id: SERVICOS_PERMISSIONS.servicesRead,
                name: SERVICOS_PERMISSIONS.servicesRead,
                module: 'services',
                resource: 'services',
                action: 'read',
                created_at: new Date().toISOString(),
              },
              canCreateService
                ? {
                    id: SERVICOS_PERMISSIONS.servicesCreate,
                    name: SERVICOS_PERMISSIONS.servicesCreate,
                    module: 'services',
                    resource: 'services',
                    action: 'create',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
              canUpdateService
                ? {
                    id: SERVICOS_PERMISSIONS.servicesUpdate,
                    name: SERVICOS_PERMISSIONS.servicesUpdate,
                    module: 'services',
                    resource: 'services',
                    action: 'update',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
              canDeleteService
                ? {
                    id: SERVICOS_PERMISSIONS.servicesDelete,
                    name: SERVICOS_PERMISSIONS.servicesDelete,
                    module: 'services',
                    resource: 'services',
                    action: 'delete',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
            ].filter(Boolean) as any
          }
          columns={SERVICES_COLUMNS}
          filters={SERVICES_FILTERS}
          fetchData={async (tenantId) =>
            servicesRepository.findServices(tenantId)
          }
          createItem={async (tenantId, input) =>
            servicesRepository.createService({ ...input, tenant_id: tenantId })
          }
          updateItem={async (tenantId, id, input) =>
            servicesRepository.updateService(tenantId, id, input)
          }
          deleteItem={async (tenantId, id) =>
            servicesRepository.deleteService(tenantId, id)
          }
          getItemId={(item) => item.id}
          emptyMessage="Nenhum serviço cadastrado."
          onEditStart={(item) => setEditingService(item as Service)}
          onModalClose={() => setEditingService(null)}
          modalOpen={serviceModalOpen}
          onModalOpenChange={setServiceModalOpen}
          refreshKey={servicesRefreshKey}
          renderForm={(_form, _setForm, isEditing) => (
            <ServiceForm
              open={serviceModalOpen}
              tenantId={currentTenantId || ''}
              editingService={isEditing ? editingService : null}
              serviceId={isEditing ? (editingService?.id ?? null) : null}
              onSubmit={async (data) => {
                if (isEditing && editingService) {
                  await servicesRepository.updateService(
                    editingService.tenant_id,
                    editingService.id,
                    data,
                  );
                } else {
                  await servicesRepository.createService({
                    ...data,
                    tenant_id: currentTenantId || '',
                  });
                }
                setServiceModalOpen(false);
                setServicesRefreshKey((key) => key + 1);
              }}
              onCancel={() => {
                setEditingService(null);
                setServiceModalOpen(false);
              }}
            />
          )}
          defaultForm={serviceDefaultForm}
        />
      )}

      {tab === 'orders' && (
        <ModulePage
          title="Ordens de Serviço"
          description="Ordens e acompanhamento."
          module={moduleDef}
          permissions={
            [
              {
                id: SERVICOS_PERMISSIONS.serviceOrdersRead,
                name: SERVICOS_PERMISSIONS.serviceOrdersRead,
                module: 'services',
                resource: 'service_orders',
                action: 'read',
                created_at: new Date().toISOString(),
              },
              canCreateOrder
                ? {
                    id: SERVICOS_PERMISSIONS.serviceOrdersCreate,
                    name: SERVICOS_PERMISSIONS.serviceOrdersCreate,
                    module: 'services',
                    resource: 'service_orders',
                    action: 'create',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
              canUpdateOrder
                ? {
                    id: SERVICOS_PERMISSIONS.serviceOrdersUpdate,
                    name: SERVICOS_PERMISSIONS.serviceOrdersUpdate,
                    module: 'services',
                    resource: 'service_orders',
                    action: 'update',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
              canDeleteOrder
                ? {
                    id: SERVICOS_PERMISSIONS.serviceOrdersDelete,
                    name: SERVICOS_PERMISSIONS.serviceOrdersDelete,
                    module: 'services',
                    resource: 'service_orders',
                    action: 'delete',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
            ].filter(Boolean) as any
          }
          columns={ORDERS_COLUMNS}
          filters={ORDERS_FILTERS}
          fetchData={async (tenantId) =>
            servicesRepository.findOrders(tenantId)
          }
          createItem={async (tenantId, input) =>
            servicesRepository.createOrder({ ...input, tenant_id: tenantId })
          }
          updateItem={async (tenantId, id, input) =>
            servicesRepository.updateOrder(tenantId, id, input)
          }
          deleteItem={async (tenantId, id) =>
            servicesRepository.deleteOrder(tenantId, id)
          }
          getItemId={(item) => item.id}
          emptyMessage="Nenhuma ordem registrada."
          renderForm={(form, setForm) => (
            <OrderForm
              form={form as ServiceOrderCreateInput}
              setForm={setForm as (form: ServiceOrderCreateInput) => void}
            />
          )}
          defaultForm={orderDefaultForm}
        />
      )}

      {tab === 'executions' && (
        <ModulePage
          title="Execuções"
          description="Execuções de serviço."
          module={moduleDef}
          permissions={
            [
              {
                id: SERVICOS_PERMISSIONS.serviceExecutionsRead,
                name: SERVICOS_PERMISSIONS.serviceExecutionsRead,
                module: 'services',
                resource: 'service_executions',
                action: 'read',
                created_at: new Date().toISOString(),
              },
              canCreateExecution
                ? {
                    id: SERVICOS_PERMISSIONS.serviceExecutionsCreate,
                    name: SERVICOS_PERMISSIONS.serviceExecutionsCreate,
                    module: 'services',
                    resource: 'service_executions',
                    action: 'create',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
              canUpdateExecution
                ? {
                    id: SERVICOS_PERMISSIONS.serviceExecutionsUpdate,
                    name: SERVICOS_PERMISSIONS.serviceExecutionsUpdate,
                    module: 'services',
                    resource: 'service_executions',
                    action: 'update',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
              canDeleteExecution
                ? {
                    id: SERVICOS_PERMISSIONS.serviceExecutionsDelete,
                    name: SERVICOS_PERMISSIONS.serviceExecutionsDelete,
                    module: 'services',
                    resource: 'service_executions',
                    action: 'delete',
                    created_at: new Date().toISOString(),
                  }
                : undefined,
            ].filter(Boolean) as any
          }
          columns={EXECUTIONS_COLUMNS}
          filters={EXECUTIONS_FILTERS}
          fetchData={async (tenantId) =>
            servicesRepository.findExecutions(tenantId)
          }
          createItem={async (tenantId, input) =>
            servicesRepository.createExecution({
              ...input,
              tenant_id: tenantId,
            })
          }
          updateItem={async (tenantId, id, input) =>
            servicesRepository.updateExecution(tenantId, id, input)
          }
          deleteItem={async (tenantId, id) =>
            servicesRepository.deleteExecution(tenantId, id)
          }
          getItemId={(item) => item.id}
          emptyMessage="Nenhuma execução registrada."
          renderForm={(form, setForm) => (
            <ExecutionForm
              form={form as ServiceExecutionCreateInput}
              setForm={setForm as (form: ServiceExecutionCreateInput) => void}
            />
          )}
          defaultForm={executionDefaultForm}
        />
      )}
    </div>
  );
}
