/**
 * ModuleLayout — layout reutilizável para células operacionais.
 *
 * Cada célula operacional (fiscal, estoque, financeiro, etc.) usa este layout
 * em vez de herdar AdminModuleLayout do ModuleRouter. Oferece:
 * - Sidebar colapsável (ícones apenas quando colapsado)
 * - Header fixo no topo
 * - Footer fixo no rodapé da página
 * - Área de conteúdo com rolagem independente
 *
 * Ao usar skipLayout no ModuleRouter, este layout envolve o conteúdo
 * sem sobreposição de layouts aninhados.
 */

import { type ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/utils';
import { COMPANY } from '@/config';
import { useAccount } from '@/platform/context';
import { getAvailableFeatures } from '@/platform/modules';
import { getAvailableModulesFromCellRegistry } from '@/core/cells/cell-to-module-definition';

interface ModuleLayoutProps {
  /** Título do módulo (exibido no header e sidebar) */
  title: string;
  /** Descrição curta do módulo */
  description?: string;
  /** Ícone do módulo (lucide-react component ou SVG) */
  icon?: ReactNode;
  /** Rota home para o breadcrumb/Navegação */
  homeRoute?: string;
  /** ID da célula para gerar a navegação conforme rotas e permissões registradas */
  moduleId?: string;
  /** Itens customizados da sidebar (opcional) */
  sidebarItems?: ReactNode;
  /** Classes adicionais no container raiz */
  className?: string;
  children?: ReactNode;
}

export function ModuleLayout({
  title,
  description,
  icon: Icon,
  homeRoute,
  moduleId,
  sidebarItems,
  className,
  children,
}: ModuleLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarWidth = sidebarOpen ? 'w-60' : 'w-14';

  return (
    <div className={`flex h-dvh w-full flex-row ${className ?? ''}`}>
      <aside
        className={cn(
          'bg-card border-border shrink-0 transform border-r transition-all duration-200 flex h-full flex-col',
          sidebarWidth,
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            {Icon ? (
              <div className="text-primary h-5 w-5">{Icon}</div>
            ) : (
              <LayoutDashboard className="text-primary h-5 w-5" />
            )}
            {!sidebarOpen && (
              <span className="text-foreground font-semibold text-sm truncate">
                {title}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Expandir menu' : 'Recolher menu'}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            {sidebarOpen ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto p-1 space-y-0.5"
          aria-label={`Navegação do ${title}`}
        >
          {sidebarItems ??
            (moduleId ? (
              <ModuleLayoutNavigation
                moduleId={moduleId}
                homeRoute={homeRoute}
                expanded={sidebarOpen}
              />
            ) : null)}
        </nav>

        <footer className="border-t border-border/50 p-2">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span className={cn(sidebarOpen && 'flex', sidebarOpen === false && 'hidden')}>
              Voltar para o site
            </span>
          </button>
        </footer>
      </aside>

      <div className="flex-1 flex-col h-full min-w-0">
        <header
          className={`
            border-border bg-background sticky top-0 z-40 flex items-center justify-between border-b shadow-sm backdrop-blur-md h-16
          `}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="aria-label=Abrir menu p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted lg:hidden"
              aria-expanded={sidebarOpen}
            >
              <span className="sr-only">Abrir menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              {Icon ? (
                <div className="h-4 w-4">{Icon}</div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              )}
            </div>
            <div className="hidden text-right lg:block">
              <p className="text-foreground text-sm font-semibold">{title}</p>
              {description && (
                <p className="text-muted-foreground text-xs">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8">
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-foreground hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:flex"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
              <span>Voltar para o site</span>
            </NavLink>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto relative">
          <main className="flex min-h-0 flex-col">
            <div className="mx-auto flex min-h-0 max-w-[1920px] flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
              {children}
            </div>
          </main>

          <footer
            className="sticky bottom-0 z-10 border-t border-border/50 bg-background/90 backdrop-blur-sm px-4 py-4 sm:px-6 lg:px-8 xl:px-10"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {COMPANY.name} — {title}
              </span>
              <span>
                Governança · Tenant isolado
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function ModuleLayoutNavigation({
  moduleId,
  homeRoute,
  expanded,
}: {
  moduleId: string;
  homeRoute?: string;
  expanded: boolean;
}) {
  const { activePermissions, effectiveScopes } = useAccount();
  const location = useLocation();
  const module = getAvailableModulesFromCellRegistry(effectiveScopes).find(
    (availableModule) => availableModule.id === moduleId,
  );

  if (!module) return null;

  const features = getAvailableFeatures(
    activePermissions,
    module,
    effectiveScopes,
  ).filter(
    (feature) =>
      !feature.route.includes(':') && !feature.route.includes('*'),
  );

  return (
    <>
      {homeRoute && (
        <NavLink
          to={homeRoute}
          end
          title="Dashboard"
          aria-label="Dashboard"
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors',
              expanded ? 'gap-2' : 'justify-center',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          <span className={cn(!expanded && 'sr-only')}>Dashboard</span>
        </NavLink>
      )}
      {features.map((feature) => {
        const isActive =
          location.pathname === feature.route ||
          location.pathname.startsWith(`${feature.route}/`);

        return (
          <NavLink
            key={feature.id}
            to={feature.route}
            title={feature.title}
            aria-label={feature.title}
            className={cn(
              'flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors',
              expanded ? 'gap-2' : 'justify-center',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Briefcase className="h-4 w-4 shrink-0" />
            <span className={cn('truncate', !expanded && 'sr-only')}>
              {feature.title}
            </span>
          </NavLink>
        );
      })}
    </>
  );
}
