'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { supportRepository } from '@/repositories/support.repository';
import type { SupportTicket } from '@/types/domain/support';
import { useAuth } from '@/contexts/AuthContext';

export default function Suporte() {
  const { currentTenantId } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    supportRepository.findTickets(currentTenantId)
      .then(setTickets)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar chamados'))
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filtered = useMemo(() => {
    let data = tickets;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((t) =>
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((t) => t.status === statusFilter);
    }
    return data;
  }, [tickets, search, statusFilter]);

  const kpis = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    const closed = tickets.filter((t) => t.status === 'closed').length;
    return { total, open, inProgress, resolved, closed };
  }, [tickets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Carregando chamados...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Suporte</h1>
          <p className="text-sm text-muted-foreground">Chamados e atendimentos.</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Exportar relatório de suporte...')}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold text-foreground">{kpis.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Abertos</p>
          <p className="text-lg font-semibold text-warning">{kpis.open}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Em andamento</p>
          <p className="text-lg font-semibold text-primary">{kpis.inProgress}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Resolvidos</p>
          <p className="text-lg font-semibold text-success">{kpis.resolved}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Fechados</p>
          <p className="text-lg font-semibold text-muted-foreground">{kpis.closed}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar chamados..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="open">Aberto</option>
          <option value="in_progress">Em andamento</option>
          <option value="resolved">Resolvido</option>
          <option value="closed">Fechado</option>
        </select>
        <Button onClick={() => alert('Formulário de novo chamado')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo chamado
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum chamado registrado"
          description="Quando houver chamados registrados, eles aparecerão aqui."
          actionLabel="Novo chamado"
          onAction={() => alert('Formulário de novo chamado')}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Assunto</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Prioridade</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Data abertura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-muted">
                  <td className="px-4 py-3 text-foreground">{ticket.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      ticket.priority === 'high' ? 'danger' :
                      ticket.priority === 'medium' ? 'warning' : 'secondary'
                    }>
                      {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      ticket.status === 'open' ? 'warning' :
                      ticket.status === 'in_progress' ? 'default' :
                      ticket.status === 'resolved' ? 'success' : 'secondary'
                    }>
                      {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em andamento' : ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
