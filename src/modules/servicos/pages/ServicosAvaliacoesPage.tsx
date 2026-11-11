'use client';

import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { servicesRepository } from '@/repositories/services.repository';
import type { CustomerRating } from '@/types/domain/service';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';

const AVALIACOES_COLUMNS: ColumnDef<CustomerRating>[] = [
  { key: 'service_order_id', header: 'Ordem de Serviço', sortable: true, width: 'w-[30%]' },
  { key: 'rating', header: 'Nota', sortable: true, width: 'w-[10%]', render: (item: CustomerRating) => (
    <span className="text-muted-foreground text-[11px] font-mono">{item.rating} / 5</span>
  )},
  { key: 'comment', header: 'Comentário', sortable: false, width: 'w-[30%]', render: (item: CustomerRating) => (
    <span className="text-muted-foreground text-[11px]">{item.comment || '-'}</span>
  )},
  { key: 'rated_by', header: 'Avaliado por', sortable: true, width: 'w-[20%]' },
  { key: 'rated_at', header: 'Data da Avaliação', sortable: true, width: 'w-[20%]', render: (item: CustomerRating) => (
    <span className="text-muted-foreground text-[11px]">{new Date(item.rated_at).toLocaleString('pt-BR')}</span>
  )},
];

const AVALIACOES_FILTERS: FilterDef[] = [];

export default function ServicosAvaliacoesPage() {

  return (
    <ModulePage
      title="Avaliações de Clientes"
      description="Acompanhe as avaliações e feedback dos clientes sobre os serviços prestados."
      columns={AVALIACOES_COLUMNS}
      filters={AVALIACOES_FILTERS}
      fetchData={(tenantId) => servicesRepository.findRatings(tenantId)}
      createItem={async () => { throw new Error('Avaliações devem ser criadas a partir de uma ordem de serviço.'); }}
      updateItem={async () => { throw new Error('Avaliações não podem ser atualizadas diretamente.'); }}
      deleteItem={async () => { throw new Error('Avaliações não podem ser excluídas diretamente.'); }}
      getItemId={(item: CustomerRating) => item.id}
      defaultForm={{} as any}
      emptyMessage="Nenhuma avaliação registrada."
      permissions={[
        {
          id: SERVICOS_PERMISSIONS.customerRatingsRead,
          name: SERVICOS_PERMISSIONS.customerRatingsRead,
          module: 'services',
          resource: 'customer_ratings',
          action: 'read',
          created_at: new Date().toISOString(),
        },
      ].filter((p): p is NonNullable<typeof p> => p !== undefined)}
    />
  );
}
