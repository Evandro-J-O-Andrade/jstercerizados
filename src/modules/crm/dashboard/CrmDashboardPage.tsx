import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BriefcaseBusiness,
  ClipboardCheck,
  LayoutDashboard,
  RefreshCw,
  ShieldAlert,
  UserPlus,
  Users,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { EmptyState } from '@/components/fallback/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { crmRepository } from '@/modules/crm/repositories';
import type { Lead } from '@/modules/crm/repositories';

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

interface CrmStats {
  leads: Lead[];
  total: number;
  newLeads: number;
  contacted: number;
  proposals: number;
  won: number;
  lost: number;
  conversionRate: number;
  recent: Lead[];
  activities: ActivityItem[];
  alerts: AlertItem[];
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Novos',
  contacted: 'Contatados',
  proposal: 'Proposta',
  won: 'Ganhos',
  lost: 'Perdidos',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  proposal: '#8b5cf6',
  won: '#22c55e',
  lost: '#ef4444',
};

function buildStats(leads: Lead[]): CrmStats {
  const recent = [...leads].slice(0, 6);

  const activities: ActivityItem[] = recent.slice(0, 5).map((lead) => ({
    id: lead.id,
    title: lead.name,
    description: `Lead ${STATUS_LABELS[lead.status] || lead.status}`,
    occurredAt: lead.updated_at,
    tone:
      lead.status === 'won'
        ? 'emerald'
        : lead.status === 'lost'
          ? 'amber'
          : lead.status === 'proposal'
            ? 'violet'
            : 'blue',
  }));

  const alerts: AlertItem[] = [
    {
      label: 'Novos leads',
      description: 'Leads aguardando primeiro contato',
      count: leads.filter((l) => l.status === 'new').length,
      tone: 'warning',
    },
    {
      label: 'Propostas ativas',
      description: 'Oportunidades em fase de proposta',
      count: leads.filter((l) => l.status === 'proposal').length,
      tone: 'info',
    },
    {
      label: 'Perdidos',
      description: 'Oportunidades não convertidas',
      count: leads.filter((l) => l.status === 'lost').length,
      tone: 'danger',
    },
  ];

  const won = leads.filter((l) => l.status === 'won').length;
  const total = leads.length;
  const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;

  return {
    leads,
    total,
    newLeads: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    proposals: leads.filter((l) => l.status === 'proposal').length,
    won,
    lost: leads.filter((l) => l.status === 'lost').length,
    conversionRate,
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
      <Card padding="sm" className="hover:border-primary/30 h-full min-h-24 transition-colors">
        <div className="flex h-full items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground truncate text-xs font-medium">{label}</p>
            <p className="text-foreground mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString('pt-BR')}</p>
            <p className="text-muted-foreground mt-1 truncate text-[11px]">{hint}</p>
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
        <h2 className="text-foreground truncate text-sm font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-0.5 truncate text-[11px]">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatusDistribution({ stats }: { stats: CrmStats }) {
      const segments = useMemo(() => {
    let cursor = 0;
    return stats.leads.map((lead) => {
      const size = stats.total ? (lead.status === 'won' ? 1 : 0) / stats.total * 100 : 0;
      cursor += size;
      return `${STATUS_COLORS[lead.status] || '#6366f1'} ${cursor - size}% ${cursor}%`;
    });
  }, [stats.leads, stats.total]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    stats.leads.forEach((l) => map.set(l.status, (map.get(l.status) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [stats.leads]);

  return (
    <Card padding="none" className="overflow-hidden">
      <PanelTitle title="Oportunidades por status" description="Distribuição de leads no pipeline" action={<Users className="text-primary h-4 w-4" />} />
      {stats.total === 0 ? (
        <div className="p-5"><EmptyState icon={Users} title="Sem oportunidades" description="A distribuição será exibida após o primeiro cadastro." /></div>
      ) : (
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-5 p-5">
          <div className="relative mx-auto h-28 w-28 rounded-full" style={{ background: `conic-gradient(${segments.join(',')})` }} aria-label={`${stats.total} oportunidades`}>
            <div className="bg-card absolute inset-5 flex flex-col items-center justify-center rounded-full">
              <span className="text-foreground text-xl font-bold tabular-nums">{stats.total}</span>
              <span className="text-muted-foreground text-[10px]">Total</span>
            </div>
          </div>
          <div className="space-y-2">
            {byStatus.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-foreground flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] || '#6366f1' }} />
                  <span className="truncate capitalize">{STATUS_LABELS[key] || key}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function OperationalFlow({ stats }: { stats: CrmStats }) {
  const columns = [
    {
      label: 'Novos leads',
      value: stats.newLeads,
      tone: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200',
      icon: UserPlus,
      items: stats.leads.filter((l) => l.status === 'new'),
    },
    {
      label: 'Contatados',
      value: stats.contacted,
      tone: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
      icon: Activity,
      items: stats.leads.filter((l) => l.status === 'contacted'),
    },
    {
      label: 'Propostas',
      value: stats.proposals,
      tone: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200',
      icon: ClipboardCheck,
      items: stats.leads.filter((l) => l.status === 'proposal'),
    },
    {
      label: 'Ganhos',
      value: stats.won,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200',
      icon: BriefcaseBusiness,
      items: stats.leads.filter((l) => l.status === 'won'),
    },
    {
      label: 'Perdidos',
      value: stats.lost,
      tone: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200',
      icon: ShieldAlert,
      items: stats.leads.filter((l) => l.status === 'lost'),
    },
  ];

  return (
    <Card padding="none" className="overflow-hidden">
      <PanelTitle title="Fluxo do pipeline comercial" description="Leads por etapa do funil de vendas" action={<Button asChild variant="outline" size="sm"><Link to="/dashboard/crm/oportunidades">Ver oportunidades</Link></Button>} />
      <div className="grid gap-3 overflow-x-auto p-4 sm:grid-cols-2 xl:grid-cols-5">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <section key={column.label} className={`min-w-0 rounded-xl border p-3 ${column.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold"><Icon className="h-4 w-4" /> {column.label}</span>
                <span className="text-lg font-bold tabular-nums">{column.value}</span>
              </div>
              <div className="mt-3 space-y-2">
                {column.items.slice(0, 3).map((lead) => (
                  <Link key={lead.id} to={`/dashboard/crm/oportunidades/${lead.id}`} className="border-border/60 bg-card/80 hover:border-primary/40 block rounded-lg border px-2.5 py-2 transition-colors">
                    <span className="text-foreground block truncate text-xs font-medium">{lead.name}</span>
                    <span className="text-muted-foreground mt-0.5 block truncate text-[10px]">{lead.email}</span>
                  </Link>
                ))}
                {column.items.length === 0 ? (
                  <div className="bg-card/35 rounded-lg border border-dashed border-current/15 px-2.5 py-4 text-center text-[10px] opacity-75">Nenhum registro nesta etapa</div>
                ) : null}
              </div>
              <Link to="/dashboard/crm/oportunidades" className="mt-3 block text-center text-[10px] font-semibold hover:underline">Ver registros</Link>
            </section>
          );
        })}
      </div>
    </Card>
  );
}

export function CrmDashboardPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CrmStats | null>(null);
  const canRead = hasAnyPermission(['crm.read']);
  const canCreate = hasAnyPermission(['crm.create']);

  const load = useCallback(async () => {
    if (!currentTenantId) {
      setStats(null);
      setState('no-tenant');
      return;
    }
    if (!canRead) {
      setStats(null);
      setError('Você não possui permissão para consultar os indicadores do CRM.');
      setState('error');
      return;
    }
    setState('loading');
    setError(null);
    try {
      const leads = await crmRepository.findAll(currentTenantId);
      setStats(buildStats(leads));
      setState('ready');
    } catch (loadError) {
      setStats(null);
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os indicadores do CRM.');
      setState('error');
    }
  }, [canRead, currentTenantId]);

  useEffect(() => { void load(); }, [load]);

  const metrics = stats
    ? [
        { label: 'Oportunidades', value: stats.total, hint: 'pipeline comercial', icon: Users, href: '/dashboard/crm/oportunidades', tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300' },
        { label: 'Novos', value: stats.newLeads, hint: 'aguardando contato', icon: UserPlus, href: '/dashboard/crm/oportunidades', tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300' },
        { label: 'Contatados', value: stats.contacted, hint: 'em atendimento', icon: Activity, href: '/dashboard/crm/oportunidades', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
        { label: 'Propostas', value: stats.proposals, hint: 'em fase de proposta', icon: ClipboardCheck, href: '/dashboard/crm/oportunidades', tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' },
        { label: 'Ganhos', value: stats.won, hint: 'convertidos', icon: BriefcaseBusiness, href: '/dashboard/crm/oportunidades', tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
        { label: 'Conversão', value: stats.conversionRate, hint: 'taxa de fechamento', icon: ShieldAlert, href: '/dashboard/crm/oportunidades', tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
      ]
    : [];

  return (
    <ModuleWorkspace title="Central Comercial CRM" description="Leads, oportunidades, propostas e conversão do tenant ativo." icon={LayoutDashboard} breadcrumbItems={[{ label: 'CRM' }]} homeRoute="/dashboard/global" actions={
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => void load()} leftIcon={<RefreshCw className="h-4 w-4" />}>Atualizar</Button>
        {canCreate && (<Button asChild size="sm" leftIcon={<UserPlus className="h-4 w-4" />}><Link to="/dashboard/crm/oportunidades/novo">Nova oportunidade</Link></Button>)}
      </div>
    }>
      {state === 'no-tenant' && (<Card><EmptyState icon={BriefcaseBusiness} title="Tenant ativo não identificado" description="Selecione um tenant para consultar o CRM." /></Card>)}
      {state === 'error' && (
        <Card className="space-y-4">
          <div className="flex items-start gap-3" role="alert">
            <ShieldAlert className="text-destructive mt-0.5 h-5 w-5" />
            <div>
              <p className="text-foreground text-sm font-semibold">Não foi possível carregar o CRM</p>
              <p className="text-muted-foreground mt-1 text-sm">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>Tentar novamente</Button>
        </Card>
      )}
      {state === 'loading' && (
        <div className="space-y-4" aria-busy="true">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => (<Card key={i} className="h-24 animate-pulse"><span className="sr-only">Carregando indicador</span></Card>))}</div>
          <div className="grid gap-4 xl:grid-cols-3"><Card className="h-64 animate-pulse xl:col-span-2"><span className="sr-only">Carregando evolução</span></Card><Card className="h-64 animate-pulse"><span className="sr-only">Carregando distribuição</span></Card></div>
          <Card className="h-48 animate-pulse"><span className="sr-only">Carregando visão operacional</span></Card>
        </div>
      )}
      {state === 'ready' && stats && (
        <div className="space-y-4">
          {stats.total === 0 && (
            <Card className="border-primary/20 from-primary/10 via-card to-card overflow-hidden bg-gradient-to-r p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-lg">
                  <Badge variant="outline" className="text-[10px]">Primeiros passos</Badge>
                  <h2 className="text-foreground mt-2 text-lg font-semibold">Comece a organizar o pipeline comercial</h2>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">A base de oportunidades está vazia. Cadastre seu primeiro lead para ativar os indicadores.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:w-[620px]">
                  <Link to="/dashboard/crm/oportunidades/novo" className="border-border bg-card/85 hover:border-primary/40 rounded-lg border p-2.5 transition-colors">
                    <div className="flex items-center gap-2"><span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold">1</span><UserPlus className="text-primary h-3.5 w-3.5" /></div>
                    <p className="text-foreground mt-2 text-[11px] font-semibold">Cadastrar lead</p>
                    <p className="text-muted-foreground mt-0.5 text-[10px] leading-4">Informe empresa, contato e estágio</p>
                  </Link>
                </div>
              </div>
            </Card>
          )}
          <section aria-label="Indicadores do CRM" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {metrics.map((metric) => (<MetricCard key={metric.label} {...metric} />))}
          </section>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,1fr)]">
            <StatusDistribution stats={stats} />
            <OperationalFlow stats={stats} />
          </div>
        </div>
      )}
    </ModuleWorkspace>
  );
}
