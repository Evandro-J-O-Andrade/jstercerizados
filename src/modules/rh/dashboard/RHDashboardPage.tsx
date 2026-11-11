/**
 * Dashboard canônico da célula RH.
 * Usa somente dados tenant-scoped dos repositórios autorizados.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  ClipboardCheck,
  FileCheck2,
  FileWarning,
  LayoutDashboard,
  RefreshCw,
  ShieldAlert,
  UserMinus,
  UserPlus,
  Users,
  UserRoundSearch,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { EmptyState } from '@/components/fallback/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { employeesRepository } from '@/repositories/employees.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';
import type { Employee } from '@/types/domain/employee';

type LoadState = 'loading' | 'ready' | 'error' | 'no-tenant';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  tone: 'blue' | 'emerald' | 'amber' | 'violet';
}

interface AlertItem {
  label: string;
  description: string;
  count: number;
  tone: 'danger' | 'warning' | 'info';
}

interface RhStats {
  employees: Employee[];
  total: number;
  active: number;
  admissions30d: number;
  onLeave: number;
  terminated: number;
  contracts: number;
  documents: number;
  missingContracts: number;
  missingDocuments: number;
  expiringDocuments: number;
  situations: Array<{
    key: string;
    label: string;
    value: number;
    color: string;
  }>;
  admissionsByMonth: Array<{ key: string; label: string; value: number }>;
  recent: Employee[];
  activities: ActivityItem[];
  alerts: AlertItem[];
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativos',
  inactive: 'Inativos',
  on_leave: 'Afastados',
  terminated: 'Desligados',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  inactive: '#94a3b8',
  on_leave: '#f59e0b',
  terminated: '#ef4444',
};

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '');
}

function formatDate(value?: string | null) {
  if (!value) return 'Não informada';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Não informada'
    : date.toLocaleDateString('pt-BR');
}

function employeeName(employee: Employee) {
  return (
    employee.person?.full_name ||
    employee.employee_code ||
    `Colaborador ${employee.id.slice(0, 8)}`
  );
}

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'danger' | 'success' {
  if (status === 'active') return 'success';
  if (status === 'terminated') return 'danger';
  return 'secondary';
}

function buildStats(employees: Employee[]): RhStats {
  const now = new Date();
  const limit30 = daysAgo(30);
  const limit45 = new Date(now);
  limit45.setDate(limit45.getDate() + 45);

  const months: string[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push(monthKey(date));
  }

  const admissions = new Map(months.map((month) => [month, 0]));
  const counts = new Map<string, number>();

  employees.forEach((employee) => {
    const status = employee.status || 'unknown';
    counts.set(status, (counts.get(status) || 0) + 1);

    const hireDate = new Date(employee.hire_date);
    if (!Number.isNaN(hireDate.getTime())) {
      const key = monthKey(hireDate);
      if (admissions.has(key)) {
        admissions.set(key, (admissions.get(key) || 0) + 1);
      }
    }
  });

  const recent = [...employees]
    .sort(
      (left, right) =>
        new Date(right.hire_date || right.created_at).getTime() -
        new Date(left.hire_date || left.created_at).getTime(),
    )
    .slice(0, 6);

  const activities: ActivityItem[] = recent.slice(0, 5).map((employee) => ({
    id: employee.id,
    title: employeeName(employee),
    description:
      employee.status === 'terminated'
        ? 'Desligamento registrado'
        : 'Cadastro funcional atualizado',
    occurredAt: employee.updated_at || employee.created_at,
    tone:
      employee.status === 'terminated'
        ? 'amber'
        : employee.status === 'active'
          ? 'emerald'
          : 'blue',
  }));

  const missingContracts = employees.filter(
    (employee) => (employee.contracts?.length || 0) === 0,
  ).length;
  const missingDocuments = employees.filter(
    (employee) => (employee.documents?.length || 0) === 0,
  ).length;
  const expiringDocuments = employees.reduce((total, employee) => {
    const expiring = (employee.documents || []).filter((document) => {
      if (!document.expiry_date) return false;
      const expiry = new Date(document.expiry_date);
      return (
        !Number.isNaN(expiry.getTime()) && expiry >= now && expiry <= limit45
      );
    }).length;
    return total + expiring;
  }, 0);

  const alerts: AlertItem[] = [
    {
      label: 'Sem contrato vinculado',
      description: 'Colaboradores que exigem revisão contratual',
      count: missingContracts,
      tone: 'danger',
    },
    {
      label: 'Sem documentos vinculados',
      description: 'Cadastros sem documentação funcional',
      count: missingDocuments,
      tone: 'warning',
    },
    {
      label: 'Documentos a vencer',
      description: 'Vencimento previsto nos próximos 45 dias',
      count: expiringDocuments,
      tone: 'info',
    },
  ];

  return {
    employees,
    total: employees.length,
    active: employees.filter((employee) => employee.status === 'active').length,
    admissions30d: employees.filter((employee) => {
      const date = new Date(employee.hire_date);
      return !Number.isNaN(date.getTime()) && date >= limit30;
    }).length,
    onLeave: employees.filter((employee) => employee.status === 'on_leave')
      .length,
    terminated: employees.filter((employee) => employee.status === 'terminated')
      .length,
    contracts: employees.reduce(
      (total, employee) => total + (employee.contracts?.length || 0),
      0,
    ),
    documents: employees.reduce(
      (total, employee) => total + (employee.documents?.length || 0),
      0,
    ),
    missingContracts,
    missingDocuments,
    expiringDocuments,
    situations: Array.from(counts.entries())
      .map(([key, value]) => ({
        key,
        label: STATUS_LABELS[key] || key.replace(/_/g, ' '),
        value,
        color: STATUS_COLORS[key] || '#6366f1',
      }))
      .sort((left, right) => right.value - left.value),
    admissionsByMonth: months.map((key) => ({
      key,
      label: monthLabel(key),
      value: admissions.get(key) || 0,
    })),
    recent,
    activities,
    alerts,
  };
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  tone: string;
}) {
  return (
    <Link
      to={href}
      className="focus-visible:ring-primary rounded-xl focus:outline-none focus-visible:ring-2"
    >
      <Card
        padding="sm"
        className="hover:border-primary/30 h-full min-h-24 transition-colors"
      >
        <div className="flex h-full items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground truncate text-xs font-medium">
              {label}
            </p>
            <p className="text-foreground mt-1 text-2xl font-bold tabular-nums">
              {value.toLocaleString('pt-BR')}
            </p>
            <p className="text-muted-foreground mt-1 truncate text-[11px]">
              {hint}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function PanelTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-border flex min-h-16 items-center justify-between gap-4 border-b px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-foreground truncate text-sm font-semibold">
          {title}
        </h2>
        <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function AdmissionsBarChart({ stats }: { stats: RhStats }) {
  const values = stats.admissionsByMonth.map((item) => item.value);
  const maximum = Math.max(1, ...values);

  return (
    <Card padding="none" className="overflow-hidden">
      <PanelTitle
        title="Admissões por período"
        description="Volume real de admissões nos últimos seis meses"
        action={<Activity className="text-primary h-4 w-4" />}
      />
      <div className="px-4 pt-3 pb-4">
        <div className="flex h-44 items-end gap-2">
          {stats.admissionsByMonth.map((item) => {
            const height = (item.value / maximum) * 100;
            return (
              <div key={item.key} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-foreground text-xs font-semibold tabular-nums">
                  {item.value}
                </span>
                <div
                  className="bg-primary/80 w-full rounded-t-md transition-all"
                  style={{ height: `${Math.max(4, height)}%` }}
                />
                <span className="text-muted-foreground text-[10px] uppercase">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function StatusDistribution({ stats }: { stats: RhStats }) {
  const segments = useMemo(() => {
    let cursor = 0;
    return stats.situations.map((item) => {
      const start = cursor;
      const size = stats.total ? (item.value / stats.total) * 100 : 0;
      cursor += size;
      return `${item.color} ${start}% ${cursor}%`;
    });
  }, [stats.situations, stats.total]);

  return (
    <Card padding="none" className="overflow-hidden">
      <PanelTitle
        title="Colaboradores por situação"
        description="Distribuição cadastral no tenant ativo"
        action={<Users className="text-primary h-4 w-4" />}
      />
      {stats.total === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={Users}
            title="Sem colaboradores"
            description="A distribuição será exibida após o primeiro cadastro."
          />
        </div>
      ) : (
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-5 p-5">
          <div
            className="relative mx-auto h-28 w-28 rounded-full"
            style={{ background: `conic-gradient(${segments.join(',')})` }}
            aria-label={`${stats.total} colaboradores`}
          >
            <div className="bg-card absolute inset-5 flex flex-col items-center justify-center rounded-full">
              <span className="text-foreground text-xl font-bold tabular-nums">
                {stats.total}
              </span>
              <span className="text-muted-foreground text-[10px]">Total</span>
            </div>
          </div>
          <div className="space-y-2">
            {stats.situations.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-foreground flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate capitalize">{item.label}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function OperationalFlow({ stats }: { stats: RhStats }) {
  const columns = [
    {
      label: 'Sem documentação',
      value: stats.missingDocuments,
      tone: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200',
      icon: FileWarning,
      employees: stats.employees.filter(
        (employee) => (employee.documents?.length || 0) === 0,
      ),
    },
    {
      label: 'Sem contrato',
      value: stats.missingContracts,
      tone: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200',
      icon: BriefcaseBusiness,
      employees: stats.employees.filter(
        (employee) => (employee.contracts?.length || 0) === 0,
      ),
    },
    {
      label: 'Ativos',
      value: stats.active,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200',
      icon: ClipboardCheck,
      employees: stats.employees.filter(
        (employee) => employee.status === 'active',
      ),
    },
    {
      label: 'Afastados',
      value: stats.onLeave,
      tone: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
      icon: CalendarCheck2,
      employees: stats.employees.filter(
        (employee) => employee.status === 'on_leave',
      ),
    },
    {
      label: 'Desligados',
      value: stats.terminated,
      tone: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200',
      icon: UserMinus,
      employees: stats.employees.filter(
        (employee) => employee.status === 'terminated',
      ),
    },
  ];

  return (
    <Card padding="none" className="overflow-hidden">
      <PanelTitle
        title="Visão operacional da base"
        description="Pendências e situações derivadas dos registros atuais"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/rh/colaboradores">Ver colaboradores</Link>
          </Button>
        }
      />
      <div className="grid gap-3 overflow-x-auto p-4 sm:grid-cols-2 xl:grid-cols-5">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <section
              key={column.label}
              className={`min-w-0 rounded-xl border p-3 ${column.tone}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <Icon className="h-4 w-4" />
                  {column.label}
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {column.value}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {column.employees.slice(0, 3).map((employee) => (
                  <Link
                    key={employee.id}
                    to={`/dashboard/rh/colaboradores/${employee.id}`}
                    className="border-border/60 bg-card/80 hover:border-primary/40 block rounded-lg border px-2.5 py-2 transition-colors"
                  >
                    <span className="text-foreground block truncate text-xs font-medium">
                      {employeeName(employee)}
                    </span>
                    <span className="text-muted-foreground mt-0.5 block truncate text-[10px]">
                      {employee.employee_code || 'Sem código funcional'}
                    </span>
                  </Link>
                ))}
                {column.employees.length === 0 ? (
                  <div className="bg-card/35 rounded-lg border border-dashed border-current/15 px-2.5 py-4 text-center text-[10px] opacity-75">
                    Nenhum registro nesta etapa
                  </div>
                ) : null}
              </div>
              <Link
                to="/dashboard/rh/colaboradores"
                className="mt-3 block text-center text-[10px] font-semibold hover:underline"
              >
                Ver registros
              </Link>
            </section>
          );
        })}
      </div>
    </Card>
  );
}

function EmptyRhOnboarding({ canCreate }: { canCreate: boolean }) {
  const steps = [
    {
      title: 'Cadastre o colaborador',
      description: 'Selecione uma pessoa e informe os dados funcionais.',
      icon: UserPlus,
      href: '/dashboard/rh/colaboradores/novo',
    },
    {
      title: 'Complete o vínculo',
      description: 'Registre cargo, contrato e situação autorizados.',
      icon: BriefcaseBusiness,
      href: '/dashboard/rh/colaboradores',
    },
    {
      title: 'Acompanhe pendências',
      description: 'Documentos e alertas aparecerão após o cadastro.',
      icon: ClipboardCheck,
      href: '/dashboard/rh/colaboradores',
    },
  ].filter((_, index) => canCreate || index > 0);

  return (
    <Card className="border-primary/20 from-primary/10 via-card to-card overflow-hidden bg-gradient-to-r p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-lg">
          <Badge variant="outline" className="text-[10px]">
            Primeiros passos
          </Badge>
          <h2 className="text-foreground mt-2 text-lg font-semibold">
            Comece a organizar a gestão de pessoas
          </h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            A base de colaboradores está vazia. Siga esta jornada para ativar os
            indicadores sem usar dados de demonstração.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:w-[620px]">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.title}
                to={step.href}
                className="border-border bg-card/85 hover:border-primary/40 rounded-lg border p-2.5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold">
                    {index + 1}
                  </span>
                  <Icon className="text-primary h-3.5 w-3.5" />
                </div>
                <p className="text-foreground mt-2 text-[11px] font-semibold">
                  {step.title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[10px] leading-4">
                  {step.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export function RHDashboardPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RhStats | null>(null);
  const canReadPeople = hasAnyPermission([RH_PERMISSIONS.peopleRead]);
  const canCreatePeople = hasAnyPermission([RH_PERMISSIONS.peopleCreate]);

  const load = useCallback(async () => {
    if (!currentTenantId) {
      setStats(null);
      setState('no-tenant');
      return;
    }
    if (!canReadPeople) {
      setStats(null);
      setError(
        'Você não possui permissão para consultar os indicadores de RH.',
      );
      setState('error');
      return;
    }

    setState('loading');
    setError(null);
    try {
      const employees = await employeesRepository.findAll(currentTenantId);
      setStats(buildStats(employees));
      setState('ready');
    } catch (loadError) {
      setStats(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar os indicadores de RH.',
      );
      setState('error');
    }
  }, [canReadPeople, currentTenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = stats
    ? [
        {
          label: 'Colaboradores',
          value: stats.total,
          hint: 'base funcional do tenant',
          icon: Users,
          href: '/dashboard/rh/colaboradores',
          tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
        },
        {
          label: 'Ativos',
          value: stats.active,
          hint: 'vínculos em atividade',
          icon: ClipboardCheck,
          href: '/dashboard/rh/colaboradores',
          tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        },
        {
          label: 'Admissões (30d)',
          value: stats.admissions30d,
          hint: 'por data de admissão',
          icon: UserPlus,
          href: '/dashboard/rh/colaboradores',
          tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
        },
        {
          label: 'Afastados',
          value: stats.onLeave,
          hint: 'situação on_leave',
          icon: CalendarCheck2,
          href: '/dashboard/rh/colaboradores',
          tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        },
        {
          label: 'Contratos',
          value: stats.contracts,
          hint: 'vínculos contratuais',
          icon: BriefcaseBusiness,
          href: '/dashboard/rh/colaboradores',
          tone: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
        },
        {
          label: 'Documentos',
          value: stats.documents,
          hint: 'documentos funcionais',
          icon: FileCheck2,
          href: '/dashboard/rh/colaboradores',
          tone: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
        },
      ]
    : [];

  return (
    <ModuleWorkspace
      title="Central de Gestão RH"
      description="Pessoas, vínculos e documentação funcional do tenant ativo."
      icon={LayoutDashboard}
      breadcrumbItems={[{ label: 'Recursos Humanos' }]}
      homeRoute="/dashboard/global"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Atualizar
          </Button>
          {canCreatePeople ? (
            <Button
              asChild
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              <Link to="/dashboard/rh/colaboradores/novo">
                Novo colaborador
              </Link>
            </Button>
          ) : null}
        </div>
      }
    >
      {state === 'no-tenant' ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="Tenant ativo não identificado"
            description="Selecione um tenant para consultar a base de RH."
          />
        </Card>
      ) : null}

      {state === 'error' ? (
        <Card className="space-y-4">
          <div className="flex items-start gap-3" role="alert">
            <ShieldAlert className="text-destructive mt-0.5 h-5 w-5" />
            <div>
              <p className="text-foreground text-sm font-semibold">
                Não foi possível carregar o RH
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </Card>
      ) : null}

      {state === 'loading' ? (
        <div className="space-y-4" aria-busy="true">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-24 animate-pulse">
                <span className="sr-only">Carregando indicador</span>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="h-64 animate-pulse xl:col-span-2">
              <span className="sr-only">Carregando evolução</span>
            </Card>
            <Card className="h-64 animate-pulse">
              <span className="sr-only">Carregando distribuição</span>
            </Card>
          </div>
          <Card className="h-48 animate-pulse">
            <span className="sr-only">Carregando visão operacional</span>
          </Card>
        </div>
      ) : null}

      {state === 'ready' && stats ? (
        <div className="space-y-4">
          {stats.total === 0 ? (
            <EmptyRhOnboarding canCreate={canCreatePeople} />
          ) : null}
          <section
            aria-label="Indicadores de RH"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
          >
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
            <AdmissionsBarChart stats={stats} />
            <StatusDistribution stats={stats} />
          </div>

          <OperationalFlow stats={stats} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)_minmax(250px,0.7fr)]">
            <Card padding="none" className="overflow-hidden">
              <PanelTitle
                title="Colaboradores recentes"
                description="Últimos cadastros e admissões"
                action={
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/dashboard/rh/colaboradores">Ver todos</Link>
                  </Button>
                }
              />
              {stats.recent.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={Users}
                    title="A base de colaboradores está vazia"
                    description="Cadastre uma pessoa elegível para iniciar a gestão funcional."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Colaborador</th>
                        <th className="px-4 py-2.5 font-medium">Código</th>
                        <th className="px-4 py-2.5 font-medium">Admissão</th>
                        <th className="px-4 py-2.5 font-medium">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {stats.recent.map((employee) => (
                        <tr key={employee.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <Link
                              to={`/dashboard/rh/colaboradores/${employee.id}`}
                              className="text-foreground font-medium hover:underline"
                            >
                              {employeeName(employee)}
                            </Link>
                          </td>
                          <td className="text-muted-foreground px-4 py-3">
                            {employee.employee_code}
                          </td>
                          <td className="text-muted-foreground px-4 py-3">
                            {formatDate(employee.hire_date)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusVariant(employee.status)}>
                              {STATUS_LABELS[employee.status] ||
                                employee.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card padding="none" className="overflow-hidden">
              <PanelTitle
                title="Alertas e pendências"
                description="Regras derivadas da base funcional"
                action={<AlertTriangle className="h-4 w-4 text-amber-500" />}
              />
              <div className="space-y-2 p-4">
                {stats.alerts.map((alert) => {
                  const classes = {
                    danger:
                      'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200',
                    warning:
                      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
                    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200',
                  };
                  return (
                    <div
                      key={alert.label}
                      className={`rounded-lg border px-3 py-2.5 ${classes[alert.tone]}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold">
                          {alert.label}
                        </span>
                        <span className="text-sm font-bold tabular-nums">
                          {alert.count}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] opacity-80">
                        {alert.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card padding="none" className="overflow-hidden">
              <PanelTitle
                title="Ações rápidas"
                description="Operações autorizadas da célula"
              />
              <div className="grid grid-cols-2 gap-2 p-4">
                {canCreatePeople ? (
                  <Button asChild variant="outline" className="h-20 flex-col">
                    <Link to="/dashboard/rh/colaboradores/novo">
                      <UserPlus className="mb-1 h-5 w-5" />
                      <span className="text-xs">Cadastrar</span>
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link to="/dashboard/rh/colaboradores">
                    <Users className="mb-1 h-5 w-5" />
                    <span className="text-xs">Colaboradores</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link to="/dashboard/rh/candidatos">
                    <UserRoundSearch className="mb-1 h-5 w-5" />
                    <span className="text-xs">Candidatos</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link to="/dashboard/rh/vagas">
                    <BriefcaseBusiness className="mb-1 h-5 w-5" />
                    <span className="text-xs">Vagas</span>
                  </Link>
                </Button>
              </div>
            </Card>
          </div>

          <Card padding="none" className="overflow-hidden">
            <PanelTitle
              title="Atividades recentes"
              description="Eventos reais derivados dos registros funcionais"
            />
            {stats.activities.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={Activity}
                  title="Nenhuma atividade funcional"
                  description="As atividades aparecerão quando houver registros no RH."
                />
              </div>
            ) : (
              <div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-5">
                {stats.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-border bg-muted/20 rounded-lg border p-3"
                  >
                    <p className="text-foreground truncate text-xs font-semibold">
                      {activity.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {activity.description}
                    </p>
                    <p className="text-muted-foreground mt-3 text-[10px]">
                      {formatDate(activity.occurredAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </ModuleWorkspace>
  );
}
