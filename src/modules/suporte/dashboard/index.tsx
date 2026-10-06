import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock3, LifeBuoy } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardMetricGrid } from '@/components/dashboard/DashboardMetricGrid';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeError } from '@/lib/error-normalizer';
import { supportRepository } from '@/repositories/support.repository';
import type { SupportTicket } from '@/types/domain/support';

const ACTIVE_STATUSES = new Set(['open', 'in_progress']);

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Aberto',
    in_progress: 'Em atendimento',
    resolved: 'Resolvido',
    closed: 'Fechado',
  };
  return labels[status] ?? status;
}

function priorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
  };
  return labels[priority] ?? priority;
}

function isOverdue(ticket: SupportTicket, now: number): boolean {
  return Boolean(
    ticket.sla_due_at &&
    ACTIVE_STATUSES.has(ticket.status) &&
    Date.parse(ticket.sla_due_at) < now,
  );
}

export function SuporteDashboardPage() {
  const { currentTenantId } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    if (!currentTenantId) {
      setTickets([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setTickets(await supportRepository.findTickets(currentTenantId));
    } catch (loadError) {
      setError(normalizeError(loadError).userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const open = tickets.filter((ticket) => ticket.status === 'open').length;
    const inProgress = tickets.filter(
      (ticket) => ticket.status === 'in_progress',
    ).length;
    const overdue = tickets.filter((ticket) => isOverdue(ticket, now)).length;
    const resolved = tickets.filter((ticket) =>
      ['resolved', 'closed'].includes(ticket.status),
    ).length;

    return [
      {
        id: 'open',
        label: 'Abertos',
        value: open,
        description: 'Aguardando atendimento',
        icon: LifeBuoy,
        tone: 'primary' as const,
        href: '/dashboard/suporte/tickets',
        permission: 'support_tickets.read',
        format: 'number' as const,
        testId: 'support-metric-open',
      },
      {
        id: 'in-progress',
        label: 'Em atendimento',
        value: inProgress,
        description: 'Em acompanhamento pela equipe',
        icon: Clock3,
        tone: 'warning' as const,
        href: '/dashboard/suporte/tickets',
        permission: 'support_tickets.read',
        format: 'number' as const,
        testId: 'support-metric-in-progress',
      },
      {
        id: 'overdue',
        label: 'SLA vencido',
        value: overdue,
        description: 'Chamados ativos fora do prazo',
        icon: AlertTriangle,
        tone: 'danger' as const,
        href: '/dashboard/suporte/tickets',
        permission: 'support_tickets.read',
        format: 'number' as const,
        testId: 'support-metric-overdue',
      },
      {
        id: 'resolved',
        label: 'Resolvidos',
        value: resolved,
        description: 'Resolvidos ou fechados',
        icon: CheckCircle2,
        tone: 'success' as const,
        href: '/dashboard/suporte/tickets',
        permission: 'support_tickets.read',
        format: 'number' as const,
        testId: 'support-metric-resolved',
      },
    ];
  }, [tickets]);

  const recentTickets = tickets.slice(0, 8);
  const state = error
    ? 'error'
    : isLoading
      ? 'loading'
      : tickets.length === 0
        ? 'empty'
        : 'success';

  return (
    <ModuleWorkspace
      title="Suporte"
      description="Acompanhe chamados, prioridades e prazos de atendimento."
      icon={LifeBuoy}
      breadcrumbItems={[]}
    >
      <ContentBoundary
        status={state}
        error={error}
        onRetry={() => void loadTickets()}
        homeRoute="/dashboard/suporte"
        emptyTitle={
          currentTenantId
            ? 'Nenhum chamado registrado'
            : 'Tenant não selecionado'
        }
        emptyDescription={
          currentTenantId
            ? 'Os chamados deste tenant aparecerão aqui quando forem registrados.'
            : 'Selecione um tenant para consultar os chamados de suporte.'
        }
        className="w-full min-w-0 space-y-7"
      >
        <DashboardMetricGrid>
          {metrics.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} />
          ))}
        </DashboardMetricGrid>

        <DashboardSection
          title="Chamados recentes"
          description="Registros mais recentes do tenant selecionado."
          icon={LifeBuoy}
          actions={
            <Link to="/dashboard/suporte/tickets">
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </Link>
          }
        >
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  {['Chamado', 'Prioridade', 'Status', 'SLA', 'Criado em'].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted/30">
                    <td className="text-foreground max-w-sm px-4 py-3 text-sm font-medium">
                      <span className="block truncate">{ticket.title}</span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {priorityLabel(ticket.priority)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          ticket.status === 'resolved' ||
                          ticket.status === 'closed'
                            ? 'success'
                            : ticket.status === 'in_progress'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {statusLabel(ticket.status)}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm whitespace-nowrap">
                      {ticket.sla_due_at
                        ? new Date(ticket.sla_due_at).toLocaleString('pt-BR')
                        : 'Sem prazo'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      </ContentBoundary>
    </ModuleWorkspace>
  );
}

export default SuporteDashboardPage;
