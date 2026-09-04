import { type ReactNode, useState, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import { resolveIcon } from '@/utils/navigation-icons';
import { CandidateBottomNavigation } from '@/components/layout/CandidateBottomNavigation';
import { RoleBasedFooter } from '@/components/layout/RoleBasedFooter';
import { Button } from '@/components/ui/Button';
import { COMPANY } from '@/config';
import type { GlobalNavAction, NavigationItem } from '@/types/navigation';

interface CandidateShellProps {
  children?: ReactNode;
}

function isExternal(href: string): boolean {
  return href.startsWith('#') || href.startsWith('http');
}

function handleAction(
  action: GlobalNavAction | undefined,
  href: string,
  navigate: ReturnType<typeof useNavigate>,
  onAccessibility: () => void,
  onHelp: () => void,
  logout: () => Promise<void>,
  onSiteHome: () => void,
): void {
  switch (action) {
    case 'logout':
      void logout();
      return;
    case 'accessibility':
      onAccessibility();
      return;
    case 'chat':
      onHelp();
      return;
    case 'site_home':
      onSiteHome();
      return;
    default:
      if (isExternal(href)) {
        window.location.href = href;
      } else {
        navigate(href);
      }
  }
}

function ModuleNavLink({
  item,
  isHome,
  onClick,
}: {
  item: NavigationItem;
  isHome: boolean;
  onClick?: () => void;
}) {
  const Icon = resolveIcon(item.icon);
  return (
    <NavLink
      to={item.href}
      end={isHome}
      onClick={onClick}
      data-key={item.key}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        ].join(' ')
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1">{item.label}</span>
    </NavLink>
  );
}

function GlobalNavButton({
  item,
  onClick,
  idx,
}: {
  item: NavigationItem;
  onClick: () => void;
  idx: number;
}) {
  const Icon = resolveIcon(item.icon);
  return (
    <button
      type="button"
      onClick={onClick}
      data-key={item.key}
      data-action={item.action ?? 'link'}
      data-idx={idx}
      className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1 text-left">{item.label}</span>
    </button>
  );
}

export function CandidateShell({ children }: CandidateShellProps) {
  const navigate = useNavigate();
  const { person, logout } = useAuth();
  const { sidebarItems, bottomNavItems, loading } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = person?.full_name?.split(' ')[0] || 'Candidato';

  const onAccessibility = useCallback(() => {
    window.dispatchEvent(new CustomEvent('app:open-accessibility'));
    setSidebarOpen(false);
  }, []);

  const onHelp = useCallback(() => {
    window.dispatchEvent(new CustomEvent('app:open-chat'));
    setSidebarOpen(false);
  }, []);

  const onSiteHome = useCallback(() => {
    navigate('/');
    setSidebarOpen(false);
  }, [navigate]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const runItem = useCallback(
    (item: NavigationItem) => {
      handleAction(
        item.action,
        item.href,
        navigate,
        onAccessibility,
        onHelp,
        logout,
        onSiteHome,
      );
    },
    [navigate, onAccessibility, onHelp, logout, onSiteHome],
  );

  return (
    <div className="bg-muted/30 flex h-screen w-full overflow-hidden">
      {sidebarOpen && (
        <div
          className="bg-background/60 fixed inset-0 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={[
          'bg-card border-border fixed top-0 left-0 z-50 h-full transform border-r transition-all duration-200 lg:static lg:z-0 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'w-72',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                {(() => {
                  const Icon = resolveIcon('Briefcase');
                  return <Icon className="h-5 w-5" />;
                })()}
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-semibold">
                  {COMPANY.name}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Área do Candidato
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              aria-label="Fechar menu"
              className="lg:hidden"
            >
              ✕
            </Button>
          </div>

          <nav
            className="flex-1 space-y-1 overflow-y-auto p-2"
            aria-label="Portal do Candidato"
          >
            {loading ? (
              <p className="text-muted-foreground px-3 py-2 text-xs">
                Carregando menu…
              </p>
            ) : (
              sidebarItems.map((item, idx) =>
                item.source === 'module' ? (
                  <ModuleNavLink
                    key={item.key}
                    item={item}
                    isHome={item.key === 'home'}
                    onClick={closeSidebar}
                  />
                ) : (
                  <GlobalNavButton
                    key={item.key}
                    item={item}
                    onClick={() => runItem(item)}
                    idx={idx}
                  />
                ),
              )
            )}
          </nav>

          <div className="border-border border-t p-2">
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {person?.full_name || 'Candidato'}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Candidato
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="bg-card border-border flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </Button>
          <span className="text-sm font-medium">Área do Candidato</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto h-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            {children ?? <Outlet />}
          </div>
          <RoleBasedFooter />
        </main>
      </div>

      <CandidateBottomNavigation items={bottomNavItems} />
    </div>
  );
}
