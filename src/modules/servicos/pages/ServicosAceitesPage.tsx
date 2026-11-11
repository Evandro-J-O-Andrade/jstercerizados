'use client';

import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { servicesRepository } from '@/repositories/services.repository';
import type { ServiceAcceptance } from '@/types/domain/service';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';

const ACEITES_COLUMNS: ColumnDef<ServiceAcceptance>[] = [
  { key: 'service_order_id', header: 'Ordem de Serviço', sortable: true, width: 'w-[30%]' },
  { key: 'accepted_by', header: 'Aceite por', sortable: true, width: 'w-[25%]' },
  { key: 'accepted_at', header: 'Data do Aceite', sortable: true, width: 'w-[25%]', render: (item: ServiceAcceptance) => (
    <span className="text-muted-foreground text-[11px]">{item.accepted_at ? new Date(item.accepted_at).toLocaleString('pt-BR') : '-'}</span>
  )},
  { key: 'signature_url', header: 'Assinatura', sortable: false, width: 'w-[20%]', render: (item: ServiceAcceptance) => (
    <span className="text-muted-foreground text-[11px]">{item.signature_url ? <a href={item.signature_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver</a> : '-'}</span>
  )},
];

const ACEITES_FILTERS: FilterDef[] = [];

export default function ServicosAceitesPage() {

  return (
    <ModulePage
      title="Aceites de Serviço"
      description="Acompanhe os aceites de serviços concluídos pelos clientes."
      columns={ACEITES_COLUMNS}
      filters={ACEITES_FILTERS}
      fetchData={(tenantId) => servicesRepository.findAcceptances(tenantId)}
      createItem={async () => { throw new Error('Aceites não podem ser criados diretamente.'); }}
      updateItem={async () => { throw new Error('Aceites não podem ser atualizados diretamente.'); }}
      deleteItem={async () => { throw new Error('Aceites não podem ser excluídos diretamente.'); }}
      getItemId={(item: ServiceAcceptance) => item.id}
      defaultForm={{} as any}
      emptyMessage="Nenhum aceite registrado."
      permissions={[
        {
          id: SERVICOS_PERMISSIONS.serviceAcceptancesRead,
          name: SERVICOS_PERMISSIONS.serviceAcceptancesRead,
          module: 'services',
          resource: 'service_acceptances',
          action: 'read',
          created_at: new Date().toISOString(),
        },
      ].filter((p): p is NonNullable<typeof p> => p !== undefined)}
    />
  );
}
