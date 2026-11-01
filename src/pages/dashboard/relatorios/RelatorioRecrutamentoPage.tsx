'use client';

import { useEffect, useState, useMemo } from 'react';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback';
import { jobsRepository } from '@/modules/recrutamento/repositories/jobs.repository';
import type { JobListItem, JobStatus } from '@/modules/recrutamento/types';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicada',
  paused: 'Pausada',
  closed: 'Fechada',
  filled: 'Preenchida',
  cancelled: 'Cancelada',
};

const STATUS_OPTIONS: { value: JobStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicada' },
  { value: 'paused', label: 'Pausada' },
  { value: 'closed', label: 'Fechada' },
  { value: 'filled', label: 'Preenchida' },
  { value: 'cancelled', label: 'Cancelada' },
];

export default function RelatorioRecrutamentoPage() {
  const { currentTenantId } = useAuth();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setJobs([]);
      setError(null);
      if (!currentTenantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await jobsRepository.list({
          tenant_id: currentTenantId,
        });
        if (result.error) throw result.error;
        if (!cancelled) setJobs(result.data || []);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Erro ao carregar relatório de recrutamento.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadJobs();
    return () => {
      cancelled = true;
    };
  }, [currentTenantId, reloadToken]);

  const handleExport = () => {
    const escapeCsv = (value: string | null | undefined) =>
      `"${(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Título', 'Cidade', 'Estado', 'Status'],
      ...filtered.map((job) => [
        job.title,
        job.city,
        job.state,
        STATUS_LABELS[job.status] || job.status,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(';')).join('\r\n')}`;
    const downloadUrl = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = `relatorio-recrutamento-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const filtered = useMemo(() => {
    let data = jobs;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((item) =>
        item.title?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((item) => item.status === statusFilter);
    }
    return data;
  }, [jobs, search, statusFilter]);

  const kpis = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((j) => j.status === 'published').length;
    const closed = jobs.filter((j) => j.status === 'closed' || j.status === 'filled' || j.status === 'cancelled').length;
    return { total, open, closed };
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-foreground">
          Relatórios de Recrutamento
        </h1>
        <Card className="p-6">
          <p role="alert" className="text-destructive">
            {error}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setReloadToken((token) => token + 1)}
          >
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Relatórios de Recrutamento</h1>
          <p className="text-sm text-muted-foreground">Demonstrativos e análises do módulo de recrutamento.</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleExport}
          disabled={filtered.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total de vagas</p>
          <p className="text-lg font-semibold text-foreground">{kpis.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Vagas abertas</p>
          <p className="text-lg font-semibold text-green-700">{kpis.open}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Vagas encerradas</p>
          <p className="text-lg font-semibold text-muted-foreground">{kpis.closed}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum registro" description="Não há dados para exibir no relatório." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Título</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Local</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="px-4 py-3 text-foreground">{item.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.city || '—'} / {item.state || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                      {STATUS_LABELS[item.status] || item.status}
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