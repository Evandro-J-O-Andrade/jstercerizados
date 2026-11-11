import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Play, CheckCircle, Users } from 'lucide-react';
import {
  DashboardCard,
  DashboardErrorState,
  DashboardMetricGrid,
  DashboardSkeleton,
  DashboardSection,
} from '@/components/dashboard';
import { EmptyState } from '@/components/fallback';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { operacoesRepository } from '@/modules/operacoes/repositories';
import { OPERACOES_PERMISSIONS } from '@/modules/operacoes/permissions';

export default function OperacoesDashboardPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canRead = hasAnyPermission([OPERACOES_PERMISSIONS.dashboardRead]);
  const canCreate = hasAnyPermission([OPERACOES_PERMISSIONS.orderCreate]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!currentTenantId || !canRead) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await operacoesRepository.findWorkOrders(currentTenantId);
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar ordens.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [currentTenantId, canRead]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const inProgress = orders.filter((o) => o.status === 'in_progress').length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [orders]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Dashboard de Operações
          </h1>
          <p className="text-muted-foreground mt-1">
            Ordens de trabalho, atribuições e status da operação do tenant ativo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Link to="/dashboard/operacoes/ordens/criar" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Nova Ordem
            </Link>
          )}
        </div>
      </div>

      <DashboardMetricGrid>
        <DashboardCard
          metric={{
            id: 'total',
            label: 'Total de Ordens',
            value: stats.total,
            description: 'Ordens de trabalho cadastradas',
            icon: ClipboardList,
            tone: 'primary',
            href: '/dashboard/operacoes/ordens',
            permission: OPERACOES_PERMISSIONS.dashboardRead,
            format: 'number',
          }}
        />
        <DashboardCard
          metric={{
            id: 'pending',
            label: 'Pendentes',
            value: stats.pending,
            description: 'Aguardando início',
            icon: Play,
            tone: 'warning',
            href: '/dashboard/operacoes/ordens',
            permission: OPERACOES_PERMISSIONS.dashboardRead,
            format: 'number',
          }}
        />
        <DashboardCard
          metric={{
            id: 'inProgress',
            label: 'Em Andamento',
            value: stats.inProgress,
            description: 'Execução em curso',
            icon: Play,
            tone: 'primary',
            href: '/dashboard/operacoes/ordens',
            permission: OPERACOES_PERMISSIONS.dashboardRead,
            format: 'number',
          }}
        />
        <DashboardCard
          metric={{
            id: 'completed',
            label: 'Concluídas',
            value: stats.completed,
            description: 'Ordens finalizadas',
            icon: CheckCircle,
            tone: 'success',
            href: '/dashboard/operacoes/ordens',
            permission: OPERACOES_PERMISSIONS.dashboardRead,
            format: 'number',
          }}
        />
      </DashboardMetricGrid>

      <DashboardSection
        title="Ordens Recentes"
        description="Últimas ordens de trabalho cadastradas"
        icon={Users}
      >
        <Card className="overflow-hidden">
          {orders.length === 0 ? (
            <EmptyState
              title="Nenhuma ordem de trabalho"
              description="Cadastre sua primeira ordem para começar a operar."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left p-3 font-medium">Título</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Prioridade</th>
                    <th className="text-left p-3 font-medium">Agendado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-foreground">{order.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-[10px] font-medium border">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {order.priority}
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px]">
                        {order.scheduled_at
                          ? new Date(order.scheduled_at).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </DashboardSection>
    </div>
  );
}
