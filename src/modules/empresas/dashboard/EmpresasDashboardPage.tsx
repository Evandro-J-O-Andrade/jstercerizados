'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Building2,
  Download,
  Filter,
  Handshake,
  LayoutGrid,
  ListChecks,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback/EmptyState';
import { ErrorState } from '@/components/fallback/ErrorState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { companiesRepository } from '@/repositories/companies.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Company, CompanyStatus } from '@/types/domain/company';
import { cn } from '@/utils';

/**
 * Dashboard da célula Empresas ? reconstruído do zero (referências dashaboard/03_codigo_react + 11_empresas).
 * Fonte de dados: `companies` do tenant ativo via `companiesRepository` (Supabase/RLS).
 * Indicadores sem fonte contratual comprovada são exibidos como "Indisponível" (sem dado fictício).
 */
export default function EmpresasDashboardPage() {
  const { currentTenantId, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const canCreate = hasPermission('companies.create');
  const canRead = hasPermission('companies.read');

  const load = useCallback(async () => {
    const req = ++requestId.current;
    if (!currentTenantId) {
      setCompanies([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await companiesRepository.findAll(currentTenantId);
      if (req !== requestId.current) return;
      setCompanies(data ?? []);
    } catch (err) {
      if (req !== requestId.current) return;
      setCompanies([]);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados de empresas.',
      );
    } finally {
      if (req === requestId.current) setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const total = companies.length;
    const byStatus = (s: CompanyStatus) =>
      companies.filter((c) => c.status === s).length;
    const active = byStatus('active');
    const pending = byStatus('pending');
    const inactive = byStatus('inactive');
    const suspended = byStatus('suspended');
    const withContact = companies.filter((c) => c.email || c.phone).length;
    const withCnpj = companies.filter((c) => c.cnpj).length;
    const recent = [...companies]
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at || 0).getTime() -
          new Date(a.updated_at || a.created_at || 0).getTime(),
      )
      .slice(0, 6);
    return { total, active, pending, inactive, suspended, withContact, withCnpj, recent };
  }, [companies]);

  const statusDistribution = useMemo(() => {
    const items: Array<{ label: string; value: number; color: string }> = [
      { label: 'Ativas', value: stats.active, color: 'bg-emerald-500' },
      { label: 'Pendentes', value: stats.pending, color: 'bg-amber-500' },
      { label: 'Inativas', value: stats.inactive, color: 'bg-slate-400' },
      { label: 'Suspensas', value: stats.suspended, color: 'bg-rose-500' },
    ];
    const max = Math.max(1, ...items.map((i) => i.value));
    return items.map((i) => ({ ...i, pct: Math.round((i.value / max) * 100) }));
  }, [stats]);

  if (!currentTenantId) {
    return (
      <EmptyState
        title="Selecione um tenant"
        description="Escolha um tenant ativo para visualizar o painel de empresas com dados reais."
      />
    );
  }

  if (loading) return <RouteLoadingFallback />;

  if (error) {
    return (
      <ErrorState
        title="Não foi possível carregar o painel"
        message={error}
        onRetry={() => void load()}
        retryLabel="Tentar novamente"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho operacional */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Building2 className="h-4 w-4" aria-hidden />
            Relacionamento / Empresas
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Gestão de Empresas
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Clientes, parceiros, fornecedores e relacionamentos ? indicadores calculados a partir
            dos registros reais do tenant ativo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} aria-label="Atualizar dados">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Atualizar
          </Button>
          <Link to="/dashboard/empresas/lista">
            <Button variant="outline" size="sm">
              <ListChecks className="mr-2 h-4 w-4" aria-hidden />
              Ver listagem
            </Button>
          </Link>
          {canCreate && (
            <Link to="/dashboard/empresas/nova">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Nova empresa
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* KPIs reais + indicadores sem fonte comprovada */}
      <section aria-label="Indicadores principais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard icon={Building2} label="Empresas (total)" value={stats.total} tone="primary" hint="Registros no tenant" />
        <KpiCard icon={ShieldCheck} label="Ativas" value={stats.active} tone="success" hint="Status ativo" />
        <KpiCard icon={Users} label="Clientes" value={null} tone="info" hint="Fonte de relacionamento não confirmada" />
        <KpiCard icon={Handshake} label="Parceiros" value={null} tone="violet" hint="Fonte de relacionamento não confirmada" />
        <KpiCard icon={Briefcase} label="Vagas abertas" value={null} tone="amber" hint="Fonte jobs/vínculo não comprovada" />
        <KpiCard icon={Phone} label="Contatos" value={null} tone="sky" hint="Fonte company_contacts não integrada" />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Distribuição por situação (real) */}
        <Card className="xl:col-span-2 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
                Distribuição por situação
              </h2>
              <p className="text-xs text-muted-foreground">Calculado sobre as empresas carregadas do tenant</p>
            </div>
            <Badge variant="outline">{stats.total} registros</Badge>
          </div>
          {stats.total === 0 ? (
            <EmptyState
              title="Sem dados para distribuir"
              description="Cadastre empresas para visualizar a distribuição por situação."
              actionLabel={canCreate ? 'Nova empresa' : undefined}
              onAction={canCreate ? () => navigate('/dashboard/empresas/nova') : undefined}
            />
          ) : (
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="tabular-nums text-muted-foreground">{item.value}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-all', item.color)}
                      style={{ width: `${item.value === 0 ? 0 : Math.max(6, item.pct)}%` }}
                      aria-hidden
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Com CNPJ" value={stats.withCnpj} total={stats.total} />
                <MiniStat label="Com contato" value={stats.withContact} total={stats.total} />
                <MiniStat label="Pendentes" value={stats.pending} total={stats.total} />
                <MiniStat label="Susp./Inat." value={stats.inactive + stats.suspended} total={stats.total} />
              </div>
            </div>
          )}
        </Card>

        {/* Ações rápidas e indicadores operacionais */}
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
            <LayoutGrid className="h-5 w-5 text-primary" aria-hidden />
            Central de ações
          </h2>
          <div className="space-y-2">
            <QuickAction to="/dashboard/empresas/lista" icon={Search} title="Pesquisar e filtrar" desc="Busca, status e paginação na listagem" />
            {canCreate && (
              <QuickAction to="/dashboard/empresas/nova" icon={Plus} title="Cadastrar empresa" desc="Novo registro com validação" />
            )}
            <QuickAction to="/dashboard/empresas/lista" icon={Download} title="Exportar relação" desc="Exportação a partir da listagem carregada" />
            <QuickAction to="/dashboard/empresas/lista" icon={Filter} title="Analisar vínculos" desc="Segmentos/contatos: conforme contrato disponível" muted />
          </div>
          <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <Activity className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              Indicadores condicionados a contrato
            </p>
            <p className="mt-1">Clientes/Parceiros/Fornecedores, Vagas abertas e Contatos dependem de relacionamentos e tabelas/vínculos confirmados (DB/RLS). Exibidos como indisponíveis até reconciliação.</p>
          </div>
        </Card>
      </div>

      {/* Atividades recentes (derivadas de dados reais carregados) */}
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
              Atualizações recentes
            </h2>
            <p className="text-xs text-muted-foreground">Empresas com atualização/cadastro mais recente no conjunto carregado</p>
          </div>
          {canRead && (
            <Link to="/dashboard/empresas/lista" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Abrir listagem <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
        {stats.recent.length === 0 ? (
          <EmptyState title="Nenhuma empresa registrada" description="As atualizações recentes aparecerão aqui quando houver registros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Empresa</th>
                  <th className="px-3 py-2 font-medium">CNPJ</th>
                  <th className="px-3 py-2 font-medium">Situação</th>
                  <th className="px-3 py-2 font-medium">Contato</th>
                  <th className="px-3 py-2 font-medium">Atualização</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                    <td className="px-3 py-3">
                      <Link to={`/dashboard/empresas/${c.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                        {c.trading_name || c.legal_name || c.name || 'Empresa sem nome'}
                      </Link>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{c.cnpj || '?'}</td>
                    <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-3 py-3 text-muted-foreground">{c.email || c.phone || '?'}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(c.updated_at || c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | null;
  hint: string;
  tone: 'primary' | 'success' | 'info' | 'violet' | 'amber' | 'sky';
}) {
  const tones: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    info: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {value === null ? (
            <p className="mt-1 text-sm font-semibold text-muted-foreground">Indisponível</p>
          ) : (
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
          )}
          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', tones[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </Card>
  );
}

function MiniStat({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{pct}% do total</p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
  muted,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  muted?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent',
        muted && 'opacity-90',
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </Link>
  );
}

export function StatusBadge({ status }: { status: CompanyStatus | string | null | undefined }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativa', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    pending: { label: 'Pendente', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
    inactive: { label: 'Inativa', className: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30' },
    suspended: { label: 'Suspensa', className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  };
  const key = status ?? '';
  const item = map[key] ?? { label: key || '?', className: 'bg-muted text-muted-foreground border-border' };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', item.className)}>
      {item.label}
    </span>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '?';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '?';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
