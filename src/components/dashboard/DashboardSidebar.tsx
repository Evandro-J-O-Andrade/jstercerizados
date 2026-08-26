import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { X, User, LogOut, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';
import { useAccount } from '@/contexts/AccountContext';
import { ModuleIcon } from '@/components/portal/PortalSidebar';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}

export function DashboardSidebar({
  isOpen,
  onClose,
  onNavigate,
}: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, person, roles, isAdminMaster, permissions } = useAuth();
  const { availableModules } = useAccount();

  const roleLabel = roles[0]?.name || roles[0]?.name || 'Usuário';
  const displayName = person?.full_name?.trim() || 'Usuário';

  const filteredModules = availableModules.filter((module) => {
    if (isAdminMaster) return true;
    if (!module.requiredPermissions || module.requiredPermissions.length === 0)
      return true;
    return module.requiredPermissions.some((perm) => {
      const [resource, action] = perm.split('.');
      return permissions.some(
        (p) => p.resource === resource && p.action === action,
      );
    });
  });

  const grouped = filteredModules.reduce<
    Record<string, typeof filteredModules>
  >((acc, module) => {
    const key = module.category || 'outro';
    if (!acc[key]) acc[key] = [];
    acc[key].push(module);
    return acc;
  }, {});

  const categoryOrder = [
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
          'bg-card border-border fixed top-0 left-0 z-50 h-full w-64 transform border-r transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b p-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Shield className="text-primary h-6 w-6" />
            <span className="text-foreground font-semibold">
              {COMPANY.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-full flex-col">
          <nav
            className="flex-1 space-y-1 overflow-y-auto p-4"
            aria-label="Dashboard"
          >
            {categoryOrder.map((category) => {
              const modules = grouped[category];
              if (!modules || modules.length === 0) return null;

              return (
                <div key={category} className="mb-4">
                  <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                    {category}
                  </p>
                  <div className="space-y-0.5">
                    {modules.map((module) => {
                      const isActive =
                        location.pathname === module.route ||
                        location.pathname.startsWith(`${module.route}/`);

                      return (
                        <NavLink
                          key={module.id}
                          to={module.route}
                          end
                          onClick={() => handleNavigate(module.route)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        >
                          <ModuleIcon name={module.icon} />
                          <span className="flex-1 text-left">
                            {module.title}
                          </span>
                          {isActive && (
                            <ChevronRight className="text-primary ml-auto h-4 w-4" />
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="border-border border-t p-4">
            <div className="mb-3 flex items-center gap-3">
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
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleNavigate('/dashboard/configuracoes')}
                className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                <User className="h-4 w-4" />
                Meu perfil
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
