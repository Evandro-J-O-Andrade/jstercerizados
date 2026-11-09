/**
 * Central de ambientes — não altera o destino pós-login do DispatcherMaster.
 * É acessada pela sidebar; não confundir com /dashboard/global (Central 24H).
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, ChevronRight, Grid2X2, Search, ShieldCheck, Sparkles,
} from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { resolveIcon } from '@/utils/navigation-icons';
import { getModuleName } from './cell-navigation-model';
import { useCellNavigation } from './useCellNavigation';

const GROUP_NAMES: Record<string, string> = {
  rh: 'Gestão de pessoas', recrutamento: 'Talentos e recrutamento',
  financeiro: 'Financeiro', governance: 'Governança', plataforma: 'Plataforma',
  admin: 'Administração', operacoes: 'Operações', conteudo: 'Conteúdo',
};

export default function ModuleHubPage() {
  const { cells, isMaster } = useCellNavigation();
  const { identity } = useAccount();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => cells.filter((cell) =>
    `${getModuleName(cell)} ${cell.description || ''} ${cell.category || ''}`.toLocaleLowerCase('pt-BR')
      .includes(search.trim().toLocaleLowerCase('pt-BR')),
  ).sort((a, b) => getModuleName(a).localeCompare(getModuleName(b), 'pt-BR')), [cells, search]);

  const groups = useMemo(() => {
    const list = new Map<string, typeof filtered>();
    for (const cell of filtered) {
      const category = cell.category || 'outros';
      const value = list.get(category) || [];
      value.push(cell);
      list.set(category, value);
    }
    return [...list.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [filtered]);

  return (
    <div data-testid="module-hub" className="min-w-0 space-y-7">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl space-y-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-primary"><Grid2X2 className="size-4" /> CHECK BOULER 24H · Ambientes</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">{isMaster ? 'Central de módulos · Home Master' : 'Seus ambientes de trabalho'}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Escolha um sistema para entrar em seu dashboard. Lá você terá a navegação própria da célula, suas operações e os dados autorizados do seu contexto.</p>
            <p className="text-sm font-medium text-foreground">{identity.displayName || 'Usuário'} · {identity.tenantLabel || 'Contexto ativo'}</p>
          </div>
          {isMaster && <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/admin-master" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted"><ShieldCheck className="size-4" /> Home Master</Link>
            <Link to="/dashboard/global" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"><Activity className="size-4" /> Central 24H</Link>
          </div>}
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Módulos liberados</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{filtered.length} de {cells.length} ambientes visíveis conforme seus vínculos e permissões. Não representa saúde operacional.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Pesquisar módulo ou domínio" aria-label="Pesquisar módulos"
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Search className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">Nenhum ambiente disponível</h2>
          <p className="mt-1 text-sm text-muted-foreground">Revise a pesquisa ou suas permissões efetivas. Não foi criado nenhum módulo fictício.</p>
        </div>
      ) : groups.map(([group, modules]) => (
        <section aria-label={GROUP_NAMES[group] || group} key={group} className="space-y-3">
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /><h3 className="text-xs font-bold uppercase tracking-[.13em] text-muted-foreground">{GROUP_NAMES[group] || group.replace(/[-_]/g, ' ')}</h3><span className="text-xs text-muted-foreground">({modules.length})</span></div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {modules.map((cell) => {
              const Icon = resolveIcon(cell.navigation?.icon);
              return <Link key={cell.id} to={cell.homeRoute!} className="group relative flex min-h-[166px] flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <div className="flex items-center justify-between gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" /></span><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div>
                <h4 className="mt-3 text-base font-bold text-foreground">{getModuleName(cell)}</h4>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{cell.description || 'Acessar área de gestão especializada'}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4"><span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Sparkles className="size-3" /> Ambiente da célula</span><span className="flex items-center gap-1 text-[11px] font-semibold text-primary">Acessar módulo <ChevronRight className="size-3" /></span></div>
              </Link>;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
