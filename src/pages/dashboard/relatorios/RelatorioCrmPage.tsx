'use client';

import { useEffect, useState, useMemo } from 'react';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback';
import { companiesRepository } from '@/repositories/companies.repository';
import type { Company } from '@/types/domain/company';
import { useAuth } from '@/contexts/AuthContext';

export default function RelatorioCrmPage() {
  const { currentTenantId } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    companiesRepository
      .findAll(currentTenantId)
      .then(setCompanies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filtered = useMemo(() => {
    let data = companies;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.trading_name?.toLowerCase().includes(term) ||
          item.name?.toLowerCase().includes(term) ||
          item.cnpj?.includes(term),
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((item) => item.status === statusFilter);
    }
    return data;
  }, [companies, search, statusFilter]);

  const kpis = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.status === 'active').length;
    const inactive = companies.filter((c) => c.status === 'inactive').length;
    const suspended = companies.filter((c) => c.status === 'suspended').length;
    return { total, active, inactive, suspended };
  }, [companies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">
          Carregando relatórios...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Relatórios CRM
          </h1>
          <p className="text-muted-foreground text-sm">
            Demonstrativos e análises do módulo de CRM.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => alert('Exportando relatório CRM...')}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total</p>
          <p className="text-foreground text-lg font-semibold">{kpis.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Ativas</p>
          <p className="text-lg font-semibold text-green-700">{kpis.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Inativas</p>
          <p className="text-muted-foreground text-lg font-semibold">
            {kpis.inactive}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Suspensas</p>
          <p className="text-lg font-semibold text-orange-700">
            {kpis.suspended}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="text-muted-foreground h-4 w-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-border bg-background rounded-lg border px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativa</option>
          <option value="inactive">Inativa</option>
          <option value="suspended">Suspensa</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum registro"
          description="Não há dados para exibir no relatório."
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Razão Social
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Nome Fantasia
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  CNPJ
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="text-foreground px-4 py-3">
                    {item.trading_name || item.name || '—'}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.name || '—'}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.cnpj || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        item.status === 'active'
                          ? 'default'
                          : item.status === 'inactive'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {item.status === 'active'
                        ? 'Ativa'
                        : item.status === 'inactive'
                          ? 'Inativa'
                          : 'Suspensa'}
                    </Badge>
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
