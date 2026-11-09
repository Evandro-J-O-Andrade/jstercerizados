import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Building2,
  Database,
  LayoutDashboard,
  Lock,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import {
  DashboardErrorState,
  DashboardMetricGrid,
  DashboardSection,
  DashboardSkeleton,
} from '@/components/dashboard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import {
  filterDashboardMetrics,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';
import { EmptyState } from '@/components/fallback';
import { Card } from '@/components/ui/Card';
import { useAccount } from '@/contexts/AccountContext';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import { useGlobalDashboardStats } from '@/hooks/useGlobalDashboardStats';

export default function AdminMasterDashboardPage() {
  const { activePermissions } = useAccount();
  const stats = useGlobalDashboardStats();

  const registrySummary = useMemo(() => {
    try {
      const all = cellRegistry.getAll();
      return {
        total: all.length,
        enabled: all.filter((entry) => entry.cell.enabled).length,
        available: true,
        error: null as string | null,
      };
    } catch (error) {
      return {
        total: 0,
        enabled: 0,
        available: false,
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao ler CellRegistry local.',
      };
    }
  }, []);

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'tenants',
        label: 'Tenants',
        value: stats.tenants,
        description:
          stats.kpiErrors?.tenants != null
            ? `Fonte indisponível: ${stats.kpiErrors.tenants}`
            : 'Contagem por fonte autorizada (RBAC/RLS).',
        icon: Building2,
        tone: stats.kpiErrors?.tenants != null ? 'warning' : 'primary',
        href: '/dashboard/tenants',
        permission: 'tenants.read',
        format: 'number',
      },
      {
        id: 'people',
        label: 'Pessoas',
        value: stats.people,
        description:
          stats.kpiErrors?.people != null
            ? `Fonte indisponível: ${stats.kpiErrors.people}`
            : 'Contagem por fonte autorizada (RBAC/RLS).',
        icon: Users,
        tone: stats.kpiErrors?.people != null ? 'warning' : 'primary',
        href: '/dashboard/pessoas',
        permission: 'people.read',
        format: 'number',
      },
    ],
    [stats],
  );

  const visibleMetrics = useMemo(
    () => filterDashboardMetrics(metrics, activePermissions),
    [activePermissions, metrics],
  );

  if (stats.loading) return <DashboardSkeleton />;
  if (stats.error) return <DashboardErrorState message={stats.error} />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary h-6 w-6" />
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Governança Admin Master
          </h1>
        </div>
        <p className="text-muted-foreground max-w-3xl text-sm">
          Governança da plataforma, tenants, pessoas e configurações globais. A
          saúde operacional das células é observada na Central 24H; esta página
          não duplica observabilidade nem usa contadores fixos de sistema.
        </p>
      </header>

      {visibleMetrics.length > 0 ? (
        <DashboardMetricGrid>
          {visibleMetrics.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} />
          ))}
        </DashboardMetricGrid>
      ) : (
        <EmptyState
          title="Nenhum indicador autorizado"
          description="Sem indicadores liberados por RBAC para este contexto."
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection
          title="Governança rápida"
          description="Ações administrativas autorizadas"
          icon={Wrench}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/dashboard/global"
              className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Central 24H</p>
                <p className="text-muted-foreground text-xs">
                  Observabilidade local e diagnóstico por evidência
                </p>
              </div>
            </Link>
            <Link
              to="/dashboard/usuarios"
              className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Gestão de usuários</p>
                <p className="text-muted-foreground text-xs">
                  Usuários, papéis e permissões
                </p>
              </div>
            </Link>
            <Link
              to="/dashboard/tenants"
              className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tenants</p>
                <p className="text-muted-foreground text-xs">
                  Ambientes da plataforma
                </p>
              </div>
            </Link>
            <Link
              to="/dashboard/seguranca"
              className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <Lock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Segurança</p>
                <p className="text-muted-foreground text-xs">
                  Eventos e auditoria
                </p>
              </div>
            </Link>
            <Link
              to="/dashboard/auditoria"
              className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:col-span-2"
            >
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Auditoria</p>
                <p className="text-muted-foreground text-xs">
                  Logs do sistema e rastreabilidade
                </p>
              </div>
            </Link>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Catálogo e instrumentação"
          description="Evidência local disponível nesta execução; sem telemetria remota inventada"
          icon={Settings}
        >
          <div className="space-y-3">
            <Card variant="outline" padding="sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Database className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">CellRegistry (memória local)</p>
                    <p className="text-muted-foreground text-xs">
                      {!registrySummary.available
                        ? `Indisponível: ${registrySummary.error}`
                        : `Células no catálogo: ${registrySummary.total} · habilitadas no contrato: ${registrySummary.enabled}. Registro local não comprova saúde funcional/remota.`}
                    </p>
                  </div>
                </div>
                <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-1 text-xs">
                  {!registrySummary.available ? 'erro local' : 'sem telemetria'}
                </span>
              </div>
            </Card>
            <Card variant="outline" padding="sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Dispatcher Master</p>
                    <p className="text-muted-foreground text-xs">
                      Estado operacional remoto/telemetria não instrumentados
                      nesta página. Não exibir status fixo como comprovado.
                    </p>
                  </div>
                </div>
                <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-1 text-xs">
                  sem instrumentação
                </span>
              </div>
            </Card>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
