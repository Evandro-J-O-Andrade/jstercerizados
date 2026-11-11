'use client';

import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { servicesRepository } from '@/repositories/services.repository';
import type { ServiceOccurrence } from '@/types/domain/service';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';

const OCORRENCIAS_COLUMNS: ColumnDef<ServiceOccurrence>[] = [
  { key: 'title', header: 'Título', sortable: true, width: 'w-[25%]' },
  { key: 'type', header: 'Tipo', sortable: true, width: 'w-[20%]' },
  { key: 'severity', header: 'Severidade', sortable: true, width: 'w-[15%]', render: (item: ServiceOccurrence) => (
    <span className={`px-2 py-1 rounded text-[10px] font-medium ${
      item.severity === 'critica' ? 'bg-rose-100 text-rose-800' :
      item.severity === 'alta' ? 'bg-amber-100 text-amber-800' :
      item.severity === 'media' ? 'bg-blue-100 text-blue-800' :
      'bg-emerald-100 text-emerald-800'
    }`}>{item.severity}</span>
  )},
  { key: 'reported_by', header: 'Reportado por', sortable: true, width: 'w-[20%]' },
  { key: 'reported_at', header: 'Reportado em', sortable: true, width: 'w-[20%]', render: (item: ServiceOccurrence) => (
    <span className="text-muted-foreground text-[11px]">{new Date(item.reported_at).toLocaleString('pt-BR')}</span>
  )},
];

const OCORRENCIAS_FILTERS: FilterDef[] = [];

export default function ServicosOcorrenciasPage() {

  return (
    <ModulePage
      title="Ocorrências de Serviço"
      description="Registre e acompanhe ocorrências e intercorrências nas ordens de serviço."
      columns={OCORRENCIAS_COLUMNS}
      filters={OCORRENCIAS_FILTERS}
      fetchData={(tenantId) => servicesRepository.findOccurrences(tenantId)}
      createItem={async () => { throw new Error('Ocorrências devem ser criadas a partir de uma ordem de serviço.'); }}
      updateItem={async () => { throw new Error('Ocorrências não podem ser atualizadas diretamente.'); }}
      deleteItem={async () => { throw new Error('Ocorrências não podem ser excluídas diretamente.'); }}
      getItemId={(item: ServiceOccurrence) => item.id}
      defaultForm={{} as any}
      emptyMessage="Nenhuma ocorrência registrada."
      permissions={[
        {
          id: SERVICOS_PERMISSIONS.serviceOccurrencesRead,
          name: SERVICOS_PERMISSIONS.serviceOccurrencesRead,
          module: 'services',
          resource: 'service_occurrences',
          action: 'read',
          created_at: new Date().toISOString(),
        },
      ].filter((p): p is NonNullable<typeof p> => p !== undefined)}
    />
  );
}
