'use client';

import { useEffect, useState, useMemo } from 'react';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback';
import { employeesRepository } from '@/repositories/employees.repository';
import type { Employee } from '@/types/domain/employee';
import { useAuth } from '@/contexts/AuthContext';

export default function RelatorioRhPage() {
  const { currentTenantId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    employeesRepository.findAll(currentTenantId)
      .then(setEmployees)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filtered = useMemo(() => {
    let data = employees;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((item) =>
        item.job_title?.toLowerCase().includes(term) ||
        item.department?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((item) => item.status === statusFilter);
    }
    return data;
  }, [employees, search, statusFilter]);

  const kpis = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'active').length;
    const inactive = employees.filter((e) => e.status !== 'active').length;
    return { total, active, inactive };
  }, [employees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Relatórios RH</h1>
          <p className="text-sm text-muted-foreground">Demonstrativos e análises do módulo de RH.</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Exportando relatório RH...')}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total de funcionários</p>
          <p className="text-lg font-semibold text-foreground">{kpis.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ativos</p>
          <p className="text-lg font-semibold text-green-700">{kpis.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Inativos</p>
          <p className="text-lg font-semibold text-muted-foreground">{kpis.inactive}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cargo ou departamento..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum registro" description="Não há dados para exibir no relatório." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Cargo</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Departamento</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="px-4 py-3 text-foreground">{item.job_title || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.department || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status === 'active' ? 'Ativo' : 'Inativo'}
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


