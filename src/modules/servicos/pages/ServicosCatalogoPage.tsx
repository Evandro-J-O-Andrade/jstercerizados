'use client';

import { useState } from 'react';
import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Service, ServiceCreateInput, ServiceUpdateInput } from '@/types/domain/service';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';
import { ServiceForm } from '@/modules/servicos/components/ServiceForm';
import { Badge } from '@/components/ui/Badge';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

const STATUS_VARIANT: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
  archived: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
};

const CATALOGO_COLUMNS: ColumnDef<Service>[] = [
  { key: 'name', header: 'Nome', sortable: true, width: 'w-[30%]' },
  { key: 'slug', header: 'Slug', sortable: true, width: 'w-[20%]' },
  { key: 'category', header: 'Categoria', sortable: true, width: 'w-[15%]' },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: 'w-[15%]',
    render: (item: Service) => (
      <Badge className={STATUS_VARIANT[item.status]}>
        {STATUS_LABELS[item.status] ?? item.status}
      </Badge>
    ),
  },
  {
    key: 'created_at',
    header: 'Criado em',
    sortable: true,
    width: 'w-[20%]',
    render: (item: Service) => (
      <span className="text-muted-foreground text-[11px]">
        {new Date(item.created_at).toLocaleDateString('pt-BR')}
      </span>
    ),
  },
];

const CATALOGO_FILTERS: FilterDef[] = [
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

const defaultForm: ServiceCreateInput = {
  tenant_id: '',
  name: '',
  slug: '',
  category: '',
  status: 'draft',
  display_order: 0,
};

export default function ServicosCatalogoPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [servicesRefreshKey, setServicesRefreshKey] = useState(0);

  const canCreate = hasAnyPermission([SERVICOS_PERMISSIONS.servicesCreate]);
  const canUpdate = hasAnyPermission([SERVICOS_PERMISSIONS.servicesUpdate]);
  const canDelete = hasAnyPermission([SERVICOS_PERMISSIONS.servicesDelete]);

  const handleToggleStatus = async (item: Service) => {
    if (item.status === 'archived') return;
    const next = item.status === 'published' ? 'draft' : 'published';
    await servicesRepository.updateServiceStatus(currentTenantId || '', item.id, next);
    setServicesRefreshKey((k) => k + 1);
  };

  return (
    <ModulePage
      title="Catálogo de Serviços"
      description="Gerencie o catálogo de serviços oferecidos pela empresa."
      columns={CATALOGO_COLUMNS}
      filters={CATALOGO_FILTERS}
      fetchData={(tenantId) => servicesRepository.findServices(tenantId)}
      createItem={async (tenantId, input) => {
        const result = await servicesRepository.createService({
          ...input,
          tenant_id: tenantId,
        } as ServiceCreateInput);
        return result;
      }}
      updateItem={async (tenantId, id, input) => {
        const result = await servicesRepository.updateService(
          tenantId,
          id,
          input as ServiceUpdateInput,
        );
        return result;
      }}
      deleteItem={async (tenantId, id) => {
        await servicesRepository.deleteService(tenantId, id);
      }}
      getItemId={(item: Service) => item.id}
      defaultForm={defaultForm}
      emptyMessage="Nenhum serviço cadastrado no catálogo."
      onEditStart={(item) => setEditingService(item as Service)}
      onModalClose={() => setEditingService(null)}
      modalOpen={serviceModalOpen}
      onModalOpenChange={setServiceModalOpen}
      refreshKey={servicesRefreshKey}
      onToggleStatus={handleToggleStatus}
      getToggleState={(item) => item.status === 'published'}
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
              } as ServiceCreateInput);
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
      permissions={[
        {
          id: SERVICOS_PERMISSIONS.servicesRead,
          name: SERVICOS_PERMISSIONS.servicesRead,
          module: 'services',
          resource: 'services',
          action: 'read',
          created_at: new Date().toISOString(),
        },
        canCreate
          ? {
              id: SERVICOS_PERMISSIONS.servicesCreate,
              name: SERVICOS_PERMISSIONS.servicesCreate,
              module: 'services',
              resource: 'services',
              action: 'create',
              created_at: new Date().toISOString(),
            }
          : undefined,
        canUpdate
          ? {
              id: SERVICOS_PERMISSIONS.servicesUpdate,
              name: SERVICOS_PERMISSIONS.servicesUpdate,
              module: 'services',
              resource: 'services',
              action: 'update',
              created_at: new Date().toISOString(),
            }
          : undefined,
        canDelete
          ? {
              id: SERVICOS_PERMISSIONS.servicesDelete,
              name: SERVICOS_PERMISSIONS.servicesDelete,
              module: 'services',
              resource: 'services',
              action: 'delete',
              created_at: new Date().toISOString(),
            }
          : undefined,
      ].filter((p): p is NonNullable<typeof p> => p !== undefined)}
    />
  );
}
