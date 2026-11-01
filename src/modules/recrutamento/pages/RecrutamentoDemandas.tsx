import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Search, FileText } from 'lucide-react';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import { useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberta',
  in_progress: 'Em andamento',
  fulfilled: 'Atendida',
  cancelled: 'Cancelada',
  on_hold: 'Pausada',
};

function statusVariant(status: string) {
  if (status === 'fulfilled') return 'success' as const;
  if (status === 'cancelled') return 'danger' as const;
  if (status === 'in_progress') return 'default' as const;
  return 'secondary' as const;
}

export default function RecrutamentoDemandas() {
  const { demands, isLoading, error, refetchDemands } = useRecrutamento();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDemands = demands.filter((demand) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      demand.position.toLowerCase().includes(term) ||
      (demand.description ?? '').toLowerCase().includes(term) ||
      (demand.contact_name ?? '').toLowerCase().includes(term) ||
      (demand.contact_email ?? '').toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === 'all' || demand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ModuleWorkspace
      title="Demandas de Recrutamento"
      description="Gerencie demandas de recrutamento"
      icon={FileText}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Demandas' }]}
    >
      {isLoading ? (
        <div
          className="flex h-64 items-center justify-center"
          role="status"
          aria-busy="true"
        >
          <LoadingSpinner size="sm" />
          <span className="sr-only">Carregando demandas…</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => void refetchDemands()}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por vaga ou contato..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="border-input bg-background focus-visible:ring-ring flex h-9 w-full max-w-xs items-center rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Filtrar demandas por status"
            >
              <option value="all">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filteredDemands.length === 0 ? (
            <Card className="py-12 text-center">
              <FileText className="text-muted-foreground/50 mx-auto h-12 w-12" />
              <h2 className="mt-4 text-lg font-medium">
                Nenhuma demanda encontrada
              </h2>
              <p className="text-muted-foreground mt-2">
                {search || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros.'
                  : 'Não há demandas de recrutamento neste tenant.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredDemands.map((demand) => (
                <Card key={demand.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium">{demand.position}</h2>
                      {demand.description && (
                        <p className="text-muted-foreground mt-1 text-sm">
                          {demand.description}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-2 text-sm">
                        {demand.quantity} vaga{demand.quantity === 1 ? '' : 's'}
                        {demand.contact_name
                          ? ` · Contato: ${demand.contact_name}`
                          : ''}
                        {demand.urgency ? ` · Urgência: ${demand.urgency}` : ''}
                      </p>
                    </div>
                    <Badge variant={statusVariant(demand.status)}>
                      {STATUS_LABELS[demand.status] ?? demand.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </ModuleWorkspace>
  );
}
