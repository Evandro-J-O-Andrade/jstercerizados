/**
 * CHECK BOULER 24H — ÚNICA sidebar do AppShell.
 * Home Master/Central: seletor global. Dentro da célula: apenas sua navegação.
 * Sem menu legado, sem páginas do domínio vizinho e sem segundo shell.
 */
import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowUpRight, ChevronRight, Grid2X2,
  PanelLeftClose, PanelLeftOpen, Search, ShieldCheck, X,
} from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { resolveIcon } from '@/utils/navigation-icons';
import { cn } from '@/utils';
import { getModuleName } from './cell-navigation-model';
import { useCellNavigation } from './useCellNavigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
  className?: string;
}

const NAV_LINK_STYLE =
  'group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400';

function SidebarLink({
  href, label, icon, collapsed, onNavigate, end,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  collapsed: boolean;
  onNavigate(): void;
  end?: boolean;
}) {
  return (
    <NavLink
      to={href}
      end={end}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={onNavigate}
      className={({ isActive }) => cn(
        NAV_LINK_STYLE,
        collapsed && 'justify-center px-2',
        isActive
          ? 'bg-blue-500/15 font-semibold text-white ring-1 ring-blue-400/20'
          : 'text-slate-300 hover:bg-white/10 hover:text-white',
      )}
    >
      <span className="flex size-[18px] shrink-0 items-center justify-center [&>svg]:size-[18px]">{icon}</span>
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {!collapsed && <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 opacity-35 group-hover:opacity-70" />}
    </NavLink>
  );
}

function SideSection({ title, collapsed, children }: { title: string; collapsed: boolean; children: ReactNode }) {
  return (
    <section className="mt-5" aria-label={title}>
      {!collapsed && <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{title}</h3>}
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export function ContextualCellSidebar({
  isOpen = false, onClose, onNavigate, className,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { identity } = useAccount();
  const { cells, activeCell, entries, isMaster, masterHome } = useCellNavigation();
  const close = () => { onNavigate?.(); onClose?.(); };
  const grouped = {
    overview: entries.filter((item) => item.group === 'overview'),
    resource: entries.filter((item) => item.group === 'resource'),
    action: entries.filter((item) => item.group === 'action'),
  };
  const filteredCells = cells.filter((cell) =>
    `${getModuleName(cell)} ${cell.description || ''}`.toLocaleLowerCase('pt-BR')
      .includes(query.trim().toLocaleLowerCase('pt-BR')),
  ).sort((a, b) => getModuleName(a).localeCompare(getModuleName(b), 'pt-BR'));

  return (
    <>
      {isOpen && (
        <button
          type="button" aria-label="Fechar menu" onClick={onClose}
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        data-testid="check-bouler-contextual-sidebar"
        aria-label={activeCell ? `Menu do módulo ${getModuleName(activeCell)}` : 'Navegação global'}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-[#111b30] text-slate-100 shadow-xl transition-[width,transform] duration-200 lg:relative lg:translate-x-0 lg:shadow-none',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        <header className="flex min-h-[74px] shrink-0 items-center justify-between gap-2 border-b border-slate-700/70 px-3">
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300"><ShieldCheck className="size-5" /></span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold tracking-wide text-white">CHECK BOULER 24H</div>
                <div className="truncate text-[10px] text-slate-400">J&S Empregos LTDA</div>
              </div>
            </div>
          )}
          <button
            type="button" onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          <button type="button" aria-label="Fechar" onClick={onClose} className="rounded-lg p-1 text-slate-300 lg:hidden">
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-5">
          {activeCell ? (
            <>
              <div className="mt-4 space-y-2">
                <Link
                  to="/dashboard/modulos" onClick={close}
                  title="Trocar de módulo"
                  className={cn(NAV_LINK_STYLE, 'bg-slate-800/70 text-blue-200 hover:bg-slate-800', collapsed && 'justify-center px-2')}
                >
                  <ArrowLeft className="size-[18px] shrink-0" />
                  {!collapsed && <span className="flex-1 truncate font-semibold">Todos os módulos</span>}
                </Link>
                <div className={cn('rounded-xl border border-slate-700/80 bg-gradient-to-br from-slate-800/90 to-slate-900/60 p-3', collapsed && 'p-2')}>
                  {(() => {
                    const Icon = resolveIcon(activeCell.navigation?.icon);
                    return <Icon className="size-6 text-blue-300" aria-hidden="true" />;
                  })()}
                  {!collapsed && (
                    <>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[.18em] text-blue-300">Ambiente ativo</p>
                      <p className="mt-1 text-base font-bold leading-tight text-white">{getModuleName(activeCell)}</p>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{activeCell.description || 'Gestão especializada da célula'}</p>
                    </>
                  )}
                </div>
              </div>
              <nav aria-label={`Recursos do ${getModuleName(activeCell)}`}>
                {grouped.overview.length > 0 && (
                  <SideSection title="Visão geral" collapsed={collapsed}>
                    {grouped.overview.map((entry) => {
                      const Icon = resolveIcon(entry.icon);
                      return <SidebarLink key={entry.path} href={entry.path} label={entry.label} end={true} icon={<Icon />} collapsed={collapsed} onNavigate={close} />;
                    })}
                  </SideSection>
                )}
                {grouped.resource.length > 0 && (
                  <SideSection title="Gestão e processos" collapsed={collapsed}>
                    {grouped.resource.map((entry) => {
                      const Icon = resolveIcon(entry.icon);
                      return <SidebarLink key={entry.path} href={entry.path} label={entry.label} icon={<Icon />} collapsed={collapsed} onNavigate={close} />;
                    })}
                  </SideSection>
                )}
                {grouped.action.length > 0 && (
                  <SideSection title="Ações autorizadas" collapsed={collapsed}>
                    {grouped.action.map((entry) => {
                      const Icon = resolveIcon(entry.icon);
                      return <SidebarLink key={entry.path} href={entry.path} label={entry.label} icon={<Icon />} collapsed={collapsed} onNavigate={close} />;
                    })}
                  </SideSection>
                )}
              </nav>
              {!collapsed && grouped.resource.length === 0 && grouped.action.length === 0 && (
                <p className="mt-6 rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-400">Nenhuma outra operação foi liberada pelo contrato deste módulo.</p>
              )}
            </>
          ) : (
            <>
              <div className="mt-4">
                {!collapsed && <p className="px-3 text-[10px] font-bold uppercase tracking-[.16em] text-blue-300">Home e ambientes</p>}
                <nav aria-label="Navegação central" className="mt-2 space-y-1">
                  <SidebarLink href="/dashboard/modulos" label="Todos os módulos" icon={<Grid2X2 />} collapsed={collapsed} onNavigate={close} end />
                  {isMaster && (
                    <>
                      <SidebarLink href="/dashboard/admin-master" label="Home Master" icon={<ShieldCheck />} collapsed={collapsed} onNavigate={close} end />
                      <SidebarLink href="/dashboard/global" label="Central 24H" icon={<Activity />} collapsed={collapsed} onNavigate={close} end />
                    </>
                  )}
                </nav>
                {!collapsed && <div className="relative mt-5">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar módulo..." aria-label="Buscar módulo"
                    className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/40 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>}
              </div>
              <nav aria-label="Módulos autorizados">
                <SideSection title="Módulos autorizados" collapsed={collapsed}>
                  {filteredCells.map((cell) => {
                    const Icon = resolveIcon(cell.navigation?.icon);
                    return <SidebarLink key={cell.id} href={cell.homeRoute!} label={getModuleName(cell)} icon={<Icon />} collapsed={collapsed} onNavigate={close} end />;
                  })}
                  {filteredCells.length === 0 && !collapsed && <p className="px-3 py-4 text-xs text-slate-400">Nenhum módulo encontrado neste contexto.</p>}
                </SideSection>
              </nav>
            </>
          )}
        </div>

        <footer className="shrink-0 border-t border-slate-700/80 p-3">
          {activeCell && isMaster && (
            <Link to={masterHome} onClick={close} className={cn('mb-2 flex min-h-10 items-center gap-2 rounded-xl bg-blue-500/10 px-3 text-xs font-semibold text-blue-200 hover:bg-blue-500/20', collapsed && 'justify-center px-2')} title="Voltar à Home Master">
              <ShieldCheck className="size-4 shrink-0" />{!collapsed && 'Home Master'}
              {!collapsed && <ArrowUpRight className="ml-auto size-3" />}
            </Link>
          )}
          <button type="button" onClick={() => { navigate('/minha-conta'); close(); }} title="Minha conta"
            className={cn('flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left hover:bg-white/10', collapsed && 'justify-center')}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-600/50 text-sm font-bold text-white">{identity.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
            {!collapsed && <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">{identity.displayName || 'Minha conta'}</span><span className="block truncate text-[11px] text-slate-400">{identity.roleLabel}</span></span>}
          </button>
        </footer>
      </aside>
    </>
  );
}

export default ContextualCellSidebar;
