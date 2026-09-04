'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/fallback';
import { costCenterRepository } from '@/repositories/cost-center.repository';
import type { CostCenter } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

export default function CentroCustosPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [centers, setCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    costCenterRepository.findAll(currentTenantId)
      .then(setCenters)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar centros de custo'))
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filtered = centers.filter((center) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return center.name.toLowerCase().includes(term) ||
      (center.code?.toLowerCase().includes(term) ?? false);
  });

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando centros de custo...</p>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <Button onClick={() => addToast({ type: 'info', message: 'Formulário de novo centro de custo' })}>
          <Plus className="mr-2 h-4 w-4" />
          Novo centro
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum centro de custo cadastrado"
          description="Quando houver centros cadastrados, eles aparecerão aqui."
          actionLabel="Novo centro"
          onAction={() => addToast({ type: 'info', message: 'Formulário de novo centro de custo' })}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Código</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((center) => (
                <tr key={center.id} className="hover:bg-muted">
                  <td className="px-4 py-3 text-foreground">{center.code || '—'}</td>
                  <td className="px-4 py-3 text-foreground">{center.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      center.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {center.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

