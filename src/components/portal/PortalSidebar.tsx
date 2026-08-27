import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  BarChart3,
  Package,
  Headphones,
  Cpu,
  Settings,
  Shield,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  FileText,
  Plug,
  Activity,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import {
  type ModuleCategory,
  type ModuleDefinition,
  type ModuleFeature,
} from './ModuleRegistry';
import { COMPANY } from '@/config';

interface PortalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}

export const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  home: Home,
  users: Users,
  briefcase: Briefcase,
  'dollar-sign': DollarSign,
  'bar-chart': BarChart3,
  'bar-chart-2': BarChart3,
  'bar-chart-3': BarChart3,
  package: Package,
  headphones: Headphones,
  cpu: Cpu,
  settings: Settings,
  building2: Building2,
  rocket: Home,
  'credit-card': DollarSign,
  'file-text': FileText,
  'file-check': FileText,
  'book-open': FileText,
  folder: Package,
  'file-signature': FileText,
  wrench: Settings,
  activity: Activity,
  plug: Plug,
  shield: Shield,
  sliders: SlidersHorizontal,
  lock: Lock,
  user: Users,
};

export function ModuleIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] || Home;
  return <Icon className={cn('h-5 w-5 shrink-0', className)} />;
}

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  inicio: 'INÍCIO',
  plataforma: 'PLATAFORMA',
  negocio: 'OPERAÇÃO',
  ia: 'IA & AUTOMAÇÃO',
  seguranca: 'SEGURANÇA',
  documentos: 'DOCUMENTOS',
  conta: 'CONTA',
};

export function PortalSidebar({
  isOpen,
  onClose,
  onNavigate,
}: PortalSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles } = useAuth();
  const {
    identity,
    availableMemberships,
    activeTenantId,
    switchAccount,
    availableModules,
  } = useAccount();

  const [collapsed, setCollapsed] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

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
  const roleLabel = identity.roleName;

  const grouped = availableModules.reduce<
    Record<ModuleCategory, typeof availableModules>
  >(
    (acc, module) => {
      const key = module.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(module);
      return acc;
    },
    {} as Record<ModuleCategory, typeof availableModules>,
  );

  const categoryOrder: ModuleCategory[] = [
    'inicio',
    'plataforma',
    'negocio',
    'ia',
    'seguranca',
    'documentos',
    'conta',
  ];

  const handleNavigate = (href: string) => {
    navigate(href);
    onNavigate?.();
    onClose();
  };

  const handleSwitchAccount = (tenantId: string) => {
    switchAccount(tenantId);
    setSwitchOpen(false);
    handleNavigate('/dashboard');
  };

  const isExactMatch = (route: string, pathname: string) => {
    return pathname === route;
  };

  const isChildOf = (parentRoute: string, pathname: string) => {
    return pathname !== parentRoute && pathname.startsWith(`${parentRoute}/`);
  };

  const isModuleSelected = (module: ModuleDefinition) => {
    return isExactMatch(module.route, location.pathname);
  };

  const isModuleExpanded = (module: ModuleDefinition) => {
    if (isExactMatch(module.route, location.pathname)) return true;
    if (module.features) {
      return module.features.some((feature) => {
        if (isExactMatch(feature.route, location.pathname)) return true;
        if (feature.features) {
          return feature.features.some(
            (sub) =>
              isExactMatch(sub.route, location.pathname) ||
              isChildOf(sub.route, location.pathname),
          );
        }
        return isChildOf(feature.route, location.pathname);
      });
    }
    return isChildOf(module.route, location.pathname);
  };

  const isFeatureSelected = (feature: ModuleFeature) => {
    return isExactMatch(feature.route, location.pathname);
  };

  const isFeatureExpanded = (feature: ModuleFeature) => {
    if (isExactMatch(feature.route, location.pathname)) return true;
    if (feature.features) {
      return feature.features.some(
        (sub) =>
          isExactMatch(sub.route, location.pathname) ||
          isChildOf(sub.route, location.pathname),
      );
    }
    return isChildOf(feature.route, location.pathname);
  };

  const sidebarWidth = collapsed ? 'w-16' : 'w-72';

  return (
    <>
      {isOpen && (
        <div
          className="bg-background/60 fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'bg-card border-border fixed top-0 left-0 z-50 h-full transform border-r transition-all duration-200 lg:static lg:z-0 lg:translate-x-0',
          sidebarWidth,
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Shield className="text-primary h-6 w-6" />
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {COMPANY.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    Portal SaaS
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
            className="flex-1 space-y-1 overflow-y-auto p-2"
            aria-label="Portal"
          >
            {categoryOrder.map((category) => {
              const modules = grouped[category];
              if (!modules || modules.length === 0) return null;
              const label = CATEGORY_LABELS[category];

              return (
                <div key={category} className="mb-3">
                  {!collapsed && (
                    <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                      {label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {modules.map((module) => {
                      const moduleSelected = isModuleSelected(module);
                      const moduleExpanded =
                        isModuleExpanded(module) ||
                        expandedModules.includes(module.id);
                      const hasFeatures =
                        module.features && module.features.length > 0;

                      if (collapsed) {
                        return (
                          <NavLink
                            key={module.id}
                            to={module.route}
                            end
                            onClick={() => handleNavigate(module.route)}
                            className={cn(
                              'flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                              moduleSelected
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                            title={module.title}
                          >
                            <ModuleIcon name={module.icon} />
                          </NavLink>
                        );
                      }

                      return (
                        <div key={module.id}>
                          <div className="flex items-center gap-1">
                            <NavLink
                              to={hasFeatures ? '#' : module.route}
                              end
                              onClick={() => {
                                if (hasFeatures) {
                                  toggleModule(module.id);
                                } else {
                                  handleNavigate(module.route);
                                }
                              }}
                              className={cn(
                                'flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                moduleSelected
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                              )}
                            >
                              <ModuleIcon name={module.icon} />
                              <span className="flex-1 text-left">
                                {module.title}
                              </span>
                            </NavLink>
                          </div>
                          {hasFeatures && moduleExpanded && (
                            <div className="mt-1 ml-4 space-y-0.5 border-l pl-3">
                              {module.features!.map((feature) => {
                                const featureSelected =
                                  isFeatureSelected(feature);
                                const featureExpanded =
                                  isFeatureExpanded(feature) ||
                                  expandedModules.includes(feature.id);
                                const hasSubFeatures =
                                  feature.features &&
                                  feature.features.length > 0;

                                if (hasSubFeatures) {
                                  return (
                                    <div key={feature.id}>
                                      <button
                                        type="button"
                                        onClick={() => toggleModule(feature.id)}
                                        className={cn(
                                          'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                                          featureSelected
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground',
                                        )}
                                      >
                                        <span className="flex-1 text-left">
                                          {feature.title}
                                        </span>
                                        <span className="text-xs">
                                          {featureExpanded ? '▼' : '▶'}
                                        </span>
                                      </button>
                                      {featureExpanded && (
                                        <div className="mt-1 ml-4 space-y-0.5 border-l pl-3">
                                          {feature.features!.map(
                                            (subFeature) => {
                                              const subFeatureSelected =
                                                isExactMatch(
                                                  subFeature.route,
                                                  location.pathname,
                                                );
                                              return (
                                                <NavLink
                                                  key={subFeature.id}
                                                  to={subFeature.route}
                                                  end
                                                  onClick={() =>
                                                    handleNavigate(
                                                      subFeature.route,
                                                    )
                                                  }
                                                  className={cn(
                                                    'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                                                    subFeatureSelected
                                                      ? 'bg-primary/10 text-primary'
                                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                  )}
                                                >
                                                  {subFeature.title}
                                                </NavLink>
                                              );
                                            },
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                return (
                                  <NavLink
                                    key={feature.id}
                                    to={feature.route}
                                    end
                                    onClick={() =>
                                      handleNavigate(feature.route)
                                    }
                                    className={cn(
                                      'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                                      featureSelected
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                  >
                                    {feature.title}
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
              );
            })}
          </nav>

          <div className="border-border border-t p-2">
            {!collapsed ? (
              <div className="mb-3 flex items-center gap-3 px-2">
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
            ) : (
              <div className="mb-3 flex justify-center">
                <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {!collapsed && (
              <div className="text-muted-foreground mb-3 px-2 text-xs">
                {dateLabel} • {timeLabel}
              </div>
            )}

            <div className="space-y-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('/')}
                className={cn(
                  'text-muted-foreground hover:text-foreground',
                  collapsed
                    ? 'flex w-full items-center justify-center'
                    : 'flex w-full items-center justify-start gap-2',
                )}
              >
                <Globe className="h-4 w-4" />
                {!collapsed && <span>Site público</span>}
              </Button>
            </div>
          </div>
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
              className="bg-card border-border mx-4 w-full max-w-lg rounded-xl border p-6 shadow-xl"
            >
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
                  const role = roles.find((r) => r.id === membership.role_id);
                  const roleName = role?.name || 'Usuário';
                  const isActive = membership.tenant_id === activeTenantId;

                  return (
                    <button
                      key={membership.id}
                      type="button"
                      onClick={() => handleSwitchAccount(membership.tenant_id)}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
