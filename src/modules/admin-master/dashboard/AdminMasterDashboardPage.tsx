import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Building2,
  Cpu,
  Database,
  Layers,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import {
  DashboardCard,
  DashboardErrorState,
  DashboardMetricGrid,
  DashboardSection,
  DashboardSkeleton,
} from '@/components/dashboard';
import {
  filterDashboardMetrics,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';
import { useAccount } from '@/contexts/AccountContext';
import { useGlobalDashboardStats } from '@/hooks/useGlobalDashboardStats';

export default function AdminMasterDashboardPage() {
  const { activePermissions } = useAccount();
  const stats = useGlobalDashboardStats();

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'tenants',
        label: 'Tenants',
        value: stats.tenants,
        description: 'Ambientes configurados na plataforma',
        icon: Building2,
        tone: 'primary',
        href: '/dashboard/tenants',
        permission: 'tenants.read',
        format: 'number',
      },
      {
        id: 'people',
        label: 'Pessoas',
        value: stats.people,
        description: 'Usuarios com identidade na plataforma',
        icon: Users,
        tone: 'primary',
        href: '/dashboard/pessoas',
        permission: 'people.read',
        format: 'number',
      },
      {
        id: 'users-management',
        label: 'Gestao de Usuarios',
        value: 0,
        description: 'Administrar usuarios e permissoes',
        icon: ShieldCheck,
        tone: 'warning',
        href: '/dashboard/usuarios',
        permission: 'people.read',
        format: 'number',
      },
      {
        id: 'modules',
        label: 'Modulos e Celulas',
        value: 26,
        description: 'Celulas registradas no sistema',
        icon: Layers,
        tone: 'success',
        href: '/dashboard/admin-master',
        permission: 'tenants.read',
        format: 'number',
      },
      {
        id: 'system',
        label: 'Sistema',
        value: stats.loading ? 0 : 1,
        description: 'Estado geral da plataforma',
        icon: Cpu,
        tone: 'success',
        format: 'number',
      },
      {
        id: 'config',
        label: 'Configuracoes',
        value: 1,
        description: 'Governanca e configuracoes globais',
        icon: Settings,
        tone: 'neutral',
        href: '/dashboard/seguranca',
        permission: 'security_events.read',
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
            Administracao Global - Admin Master
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Governanca da plataforma, gestao de modulos, celulas, usuarios e
          configuracoes globais.
        </p>
      </header>
      <DashboardMetricGrid>
        {visibleMetrics.map((metric) => (
          <DashboardCard key={metric.id} metric={metric} />
        ))}
      </DashboardMetricGrid>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection
          title="Governanca Rapida"
          description="Acoes administrativas mais frequentes"
          icon={Wrench}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/dashboard/usuarios"
              className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Gestao de Usuarios</p>
                <p className="text-muted-foreground text-xs">
                  Usuarios, papeis e permissoes
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
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Seguranca</p>
                <p className="text-muted-foreground text-xs">
                  Eventos e auditoria
                </p>
              </div>
            </Link>
            <Link
              to="/dashboard/auditoria"
              className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Auditoria</p>
                <p className="text-muted-foreground text-xs">Logs do sistema</p>
              </div>
            </Link>
          </div>
        </DashboardSection>
        <DashboardSection
          title="Arquitetura"
          description="Modulos e celulas da plataforma"
          icon={Layers}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Database className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">CellRegistry</p>
                  <p className="text-muted-foreground text-xs">
                    26 celulas registradas
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600">
                Ativo
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Cpu className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Dispatcher Master</p>
                  <p className="text-muted-foreground text-xs">
                    Autoridade unica de despacho
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600">
                Operacional
              </span>
            </div>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
