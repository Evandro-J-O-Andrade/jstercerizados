import { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatRoleLabel } from '@/contexts/UserIdentity';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import type { CellContract } from '@/core/types';
import { COMPANY } from '@/config';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}

export function AdminSidebar({
  isOpen,
  onClose,
  onNavigate,
}: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles } = useAuth();
  const { identity, availableMemberships, activeTenantId, switchAccount } =
    useAccount();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [expandedCells, setExpandedCells] = useState<string[]>([]);

  const enabledCells = useMemo<CellContract[]>(() => {
    return cellRegistry.getEnabled().map((e) => e.cell);
  }, []);

  const now = new Date();
  const dateLabel = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeLabel = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const displayName = identity.displayName;
  const roleLabel = identity.roleLabel;

  const getCellBaseRoute = (cellId: string) => {
    return cellId === 'candidato'
      ? '/dashboard/recrutamento/candidatos'
      : `/dashboard/${cellId}`;
  };

  const getRoutePath = (cellId: string, routePath: string) => {
    const base = getCellBaseRoute(cellId);
    if (!routePath) return base;
    const cleanRoute = routePath.startsWith('/') ? routePath : `/${routePath}`;
    return `${base}${cleanRoute}`;
  };

  const isExactMatch = (targetPath: string, pathname: string) =>
    pathname === targetPath;

  const isCellSelected = (cell: CellContract) => {
    const base = getCellBaseRoute(cell.id);
    return location.pathname.startsWith(base);
  };

  const handleNavigate = (href: string) => {
    setExpandedCells([]);
    navigate(href);
    onNavigate?.();
    onClose();
  };

  const handleSwitchAccount = (tenantId: string) => {
    switchAccount(tenantId);
    setSwitchOpen(false);
    handleNavigate('/dashboard');
  };

  const sidebarWidth = collapsed ? 'w-16' : 'w-72';

  return (
    <>
      {isOpen && (
        <div
          className="bg-background/60 fixed inset-0 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'bg-card border-border fixed top-0 left-0 z-40 h-full shrink-0 transform border-r transition-all duration-200 lg:relative lg:top-auto lg:left-auto lg:z-auto lg:translate-x-0',
          sidebarWidth,
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b p-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Shield className="text-primary h-6 w-6" />
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {COMPANY.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {enabledCells.length} módulos ativos
                  </p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="mx-auto">
                <Shield className="text-primary h-6 w-6" />
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                className="hidden lg:flex"
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Fechar menu"
                className="lg:hidden"
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <nav
            className="flex-1 shrink-0 space-y-1 overflow-y-auto p-2"
            aria-label="Módulos"
          >
            {!collapsed && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className="bg-primary/10 text-primary rounded-lg p-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                  </span>
                  <span className="text-muted-foreground flex-1 truncate text-xs font-semibold tracking-wider uppercase">
                    Módulos
                  </span>
                </div>
                <div className="space-y-1">
                  {enabledCells.map((cell) => {
                    const cellSelected = isCellSelected(cell);
                    const cellExpanded = expandedCells.includes(cell.id);

                    return (
                      <div key={cell.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (collapsed) {
                              handleNavigate(getCellBaseRoute(cell.id));
                              return;
                            }
                            if (cellExpanded) {
                              setExpandedCells((prev) =>
                                prev.filter((id) => id !== cell.id),
                              );
                            } else {
                              setExpandedCells([cell.id]);
                            }
                          }}
                          aria-expanded={cellExpanded}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            cellSelected
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            collapsed && 'justify-center px-2',
                          )}
                        >
                          {!collapsed && (
                            <span className="flex-1 truncate text-left">
                              {cell.name}
                            </span>
                          )}
                          {!collapsed && (
                            <span className="text-xs">
                              {cellExpanded ? '▼' : '▶'}
                            </span>
                          )}
                        </button>
                        {cellExpanded && (
                          <div className="mt-1 ml-4 space-y-0.5 border-l pl-3">
                            {cell.routes.map((route) => {
                              const targetPath = getRoutePath(
                                cell.id,
                                route.path,
                              );
                              const active = isExactMatch(
                                targetPath,
                                location.pathname,
                              );

                              return (
                                <NavLink
                                  key={route.path}
                                  to={targetPath}
                                  end
                                  onClick={() => handleNavigate(targetPath)}
                                  className={cn(
                                    'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                                    collapsed && 'px-2',
                                    active
                                      ? 'bg-primary/10 text-primary font-medium'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                  )}
                                >
                                  {!collapsed && route.label}
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          <footer className="border-border/50 bg-background/50 shrink-0 border-t p-3 backdrop-blur">
            {!collapsed && (
              <div className="space-y-1.5">
                <div className="mb-1 flex items-center gap-3 px-2">
                  <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {roleLabel}
                    </p>
                  </div>
                </div>
                <div className="text-muted-foreground px-2 text-xs">
                  {dateLabel} • {timeLabel}
                </div>
              </div>
            )}
            <div className="space-y-0.5 px-2 pb-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('/')}
                className={cn(
                  'text-muted-foreground hover:text-foreground w-full items-center justify-start gap-2',
                )}
              >
                <Globe className="h-4 w-4" />
                <span>Voltar para o site</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={cn(
                  'text-muted-foreground hover:text-foreground w-full items-center justify-start gap-2',
                )}
              >
                {resolvedTheme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span>
                  {resolvedTheme === 'light' ? 'Tema escuro' : 'Tema claro'}
                </span>
              </Button>
            </div>
          </footer>
        </div>
      </aside>

      <AnimatePresence>
        {switchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/60 fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mx-4 w-full max-w-lg"
            >
              <Card variant="default" className="p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-semibold">
                    Escolha seu acesso
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSwitchOpen(false)}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mb-4 text-sm">
                  Selecione a conta com a qual deseja trabalhar. Sua sessão
                  permanece ativa.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availableMemberships.map((membership) => {
                    const role = roles.find(
                      (r) => r.id === membership.membership_role,
                    );
                    const roleName = formatRoleLabel(role?.name || 'Usuário');
                    const isActive = membership.tenant_id === activeTenantId;
                    return (
                      <button
                        key={membership.id}
                        type="button"
                        onClick={() =>
                          handleSwitchAccount(membership.tenant_id)
                        }
                        className={cn(
                          'border-border hover:border-primary/50 rounded-xl border p-4 text-left transition-all',
                          isActive && 'ring-primary/50 ring-2',
                        )}
                      >
                        <div className="mb-2 flex items-center gap-3">
                          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-foreground text-sm font-semibold">
                              Conta
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {roleName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            {isActive ? 'Ativo' : 'Selecionar'}
                          </span>
                          {isActive && (
                            <span className="text-primary text-xs font-medium">
                              Atual
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
