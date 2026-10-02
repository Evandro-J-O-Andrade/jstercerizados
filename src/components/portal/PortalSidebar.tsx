import { useState, useMemo } from 'react';
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
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useModuleContext } from '@/contexts/ModuleContext';
import { formatRoleLabel } from '@/contexts/UserIdentity';
import {
  type ModuleFeature,
  getAvailableModuleFeatures,
  getAvailableFeatures,
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
    permissions,
    effectiveScopes,
  } = useAccount();
  const { currentModule, currentFeature, isModuleLauncher } =
    useModuleContext();

  const [collapsed, setCollapsed] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<string[]>([]);
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);

  const isInModule = !isModuleLauncher;

  // Determine navigation context:
  // - If at module launcher (/dashboard): show minimal
  // - If in a feature with sub-features: show sub-features
  // - If in a feature without sub-features: show feature itself + siblings
  // - If in a module without specific feature: show module features
  const { navItems, navTitle, navIcon } = useMemo(() => {
    if (isModuleLauncher || !currentModule) {
      return {
        navItems: [] as ModuleFeature[],
        navTitle: 'Portal SaaS',
        navIcon: 'home',
      };
    }

    // Helper to check if user has permission for a feature
    const hasFeaturePermission = (feature: ModuleFeature): boolean => {
      if (
        !feature.requiredPermissions ||
        feature.requiredPermissions.length === 0
      )
        return true;
      return feature.requiredPermissions.some((p) =>
        permissions.some((perm) => `${perm.resource}.${perm.action}` === p),
      );
    };

    // If we're in a specific feature (e.g., /dashboard/empresas)
    // But NOT if the feature route equals the module route (default feature)
    const isDefaultFeature =
      currentFeature && currentFeature.route === currentModule.route;
    if (currentFeature && !isDefaultFeature) {
      // If feature has sub-features, show those (filtered by permissions)
      if (currentFeature.features && currentFeature.features.length > 0) {
        const filteredSubFeatures =
          currentFeature.features.filter(hasFeaturePermission);
        return {
          navItems: filteredSubFeatures,
          navTitle: currentFeature.title,
          navIcon: currentFeature.icon || currentModule.icon,
        };
      }

      // Feature without sub-features: show siblings (other features of the same module)
      const siblingFeatures = getAvailableFeatures(
        permissions,
        currentModule,
        effectiveScopes,
      );
      return {
        navItems: siblingFeatures,
        navTitle: currentFeature.title,
        navIcon: currentFeature.icon || currentModule.icon,
      };
    }

    // In a module but no specific feature matched (e.g., /dashboard/crm)
    const moduleFeatures = getAvailableModuleFeatures(
      permissions,
      currentModule,
      effectiveScopes,
    );
    return {
      navItems: moduleFeatures,
      navTitle: currentModule.title,
      navIcon: currentModule.icon,
    };
  }, [
    currentModule,
    currentFeature,
    isModuleLauncher,
    permissions,
    effectiveScopes,
  ]);

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

  const isExactMatch = (route: string, pathname: string) => pathname === route;
  const isChildOf = (parentRoute: string, pathname: string) =>
    pathname !== parentRoute && pathname.startsWith(`${parentRoute}/`);

  const isFeatureSelected = (feature: ModuleFeature) =>
    isExactMatch(feature.route, location.pathname);

  const isFeatureRouteExpanded = (feature: ModuleFeature) => {
    if (isExactMatch(feature.route, location.pathname)) return true;
    return Boolean(
      feature.features?.some(
        (sub) =>
          isExactMatch(sub.route, location.pathname) ||
          isChildOf(sub.route, location.pathname),
      ) || isChildOf(feature.route, location.pathname),
    );
  };

  const isFeatureExpanded = (feature: ModuleFeature) =>
    !collapsedNodes.includes(feature.id) &&
    (isFeatureRouteExpanded(feature) || expandedFeatures.includes(feature.id));

  const toggleFeature = (featureId: string, routeExpanded: boolean) => {
    const currentlyExpanded =
      !collapsedNodes.includes(featureId) &&
      (routeExpanded || expandedFeatures.includes(featureId));
    if (currentlyExpanded) {
      setExpandedFeatures((prev) => prev.filter((id) => id !== featureId));
      setCollapsedNodes((prev) =>
        prev.includes(featureId) ? prev : [...prev, featureId],
      );
      return;
    }
    setExpandedFeatures([featureId]);
    setCollapsedNodes((prev) => prev.filter((id) => id !== featureId));
  };

  const handleNavigate = (href: string) => {
    setExpandedFeatures([]);
    setCollapsedNodes([]);
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
          'bg-card border-border fixed top-0 left-0 z-40 h-full transform border-r transition-all duration-200',
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
                    {isInModule ? navTitle : 'Portal SaaS'}
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
            aria-label={isInModule ? navTitle : 'Portal'}
          >
            {isModuleLauncher ? (
              // Module launcher view - minimal, just "Voltar para o site"
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('/')}
                  className={cn(
                    'text-muted-foreground hover:text-foreground w-full justify-start gap-2',
                    collapsed && 'justify-center',
                  )}
                >
                  <Globe className="h-4 w-4" />
                  {!collapsed && <span>Voltar para o site</span>}
                </Button>
              </div>
            ) : // Inside a module - show contextual features
            navItems.length > 0 ? (
              <div className="space-y-3">
                {/* "← Início do sistema" button at top of sidebar when in a module */}
                {!collapsed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/dashboard')}
                    className={cn(
                      'text-muted-foreground hover:text-foreground hover:bg-primary/10 w-full justify-start gap-2 rounded-lg px-3 py-2 transition-all duration-200',
                      'group',
                    )}
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:translate-x-[-2px]" />
                    <span className="font-medium">Início do sistema</span>
                  </Button>
                )}
                {collapsed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/dashboard')}
                    className={cn(
                      'text-muted-foreground hover:text-foreground hover:bg-primary/10 w-full justify-center gap-2 rounded-lg px-2 py-2 transition-all duration-200',
                      'group',
                    )}
                    title="Início do sistema"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:translate-x-[-2px]" />
                  </Button>
                )}

                {!collapsed && (
                  <div className="flex items-center gap-2 px-2 py-2">
                    <span className="bg-primary/10 text-primary rounded-lg p-1.5">
                      <ModuleIcon name={navIcon} className="h-4 w-4" />
                    </span>
                    <span className="text-muted-foreground flex-1 truncate text-xs font-semibold tracking-wider uppercase">
                      {navTitle}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {navItems.map((feature) => {
                    const featureSelected = isFeatureSelected(feature);
                    const featureExpanded = isFeatureExpanded(feature);
                    const hasSubFeatures = Boolean(feature.features?.length);

                    if (hasSubFeatures) {
                      return (
                        <div key={feature.id}>
                          <button
                            type="button"
                            onClick={() =>
                              toggleFeature(
                                feature.id,
                                isFeatureRouteExpanded(feature),
                              )
                            }
                            aria-expanded={featureExpanded}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              featureSelected
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                              collapsed && 'justify-center px-2',
                            )}
                          >
                            {!collapsed && (
                              <span className="flex-1 truncate text-left">
                                {feature.title}
                              </span>
                            )}
                            {!collapsed && (
                              <span className="text-xs">
                                {featureExpanded ? '▼' : '▶'}
                              </span>
                            )}
                          </button>
                          {featureExpanded && (
                            <div className="mt-1 ml-4 space-y-0.5 border-l pl-3">
                              {feature.features!.map((subFeature) => (
                                <NavLink
                                  key={subFeature.id}
                                  to={subFeature.route}
                                  end
                                  onClick={() =>
                                    handleNavigate(subFeature.route)
                                  }
                                  className={cn(
                                    'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                                    collapsed && 'px-2',
                                    isExactMatch(
                                      subFeature.route,
                                      location.pathname,
                                    )
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                  )}
                                >
                                  {!collapsed && subFeature.title}
                                </NavLink>
                              ))}
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
                        onClick={() => handleNavigate(feature.route)}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          collapsed && 'px-2 text-center',
                          featureSelected
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {!collapsed ? (
                          <>
                            <ModuleIcon
                              name={feature.icon ?? 'layout-dashboard'}
                              className="mr-3 shrink-0"
                            />
                            <span className="flex-1 truncate">
                              {feature.title}
                            </span>
                          </>
                        ) : (
                          <ModuleIcon
                            name={feature.icon ?? 'layout-dashboard'}
                          />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Module has no features - show back to portal
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('/dashboard')}
                  className={cn(
                    'text-muted-foreground hover:text-foreground w-full justify-start gap-2',
                    collapsed && 'justify-center',
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {!collapsed && <span>Voltar aos módulos</span>}
                </Button>
              </div>
            )}
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
                {!collapsed && <span>Voltar para o site</span>}
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
                    const role = roles.find((r) => r.id === membership.role_id);
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
