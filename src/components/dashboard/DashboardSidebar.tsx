import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  FileText,
  Users2,
  Truck,
  Settings2,
  UserCog,
  GitCompare,
  Wrench,
  DollarSign,
  Package,
  Headphones,
  BarChart3,
  X,
  User,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils';
import { hasPermission } from '@/utils/rbac';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions?: string[];
  exact?: boolean;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const dashboardNavGroups: NavGroup[] = [
  {
    items: [
      {
        label: 'Visão Geral',
        href: '/dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: 'Recrutamento & RH',
    items: [
      {
        label: 'Vagas',
        href: '/dashboard/vagas',
        icon: Briefcase,
        permissions: ['jobs.read'],
      },
      {
        label: 'Candidatos',
        href: '/dashboard/candidatos',
        icon: Users,
        permissions: ['candidates.read'],
      },
      {
        label: 'Processos Seletivos',
        href: '/dashboard/processos-seletivos',
        icon: GitCompare,
        permissions: ['recruitment.read'],
      },
    ],
  },
  {
    title: 'Empresas & Clientes',
    items: [
      {
        label: 'Empresas',
        href: '/dashboard/empresas',
        icon: Building2,
        permissions: ['companies.read'],
      },
      {
        label: 'Clientes',
        href: '/dashboard/clientes',
        icon: FileText,
        permissions: ['companies.read'],
      },
      {
        label: 'Parceiros',
        href: '/dashboard/parceiros',
        icon: Users2,
        permissions: ['companies.read'],
      },
      {
        label: 'Fornecedores',
        href: '/dashboard/fornecedores',
        icon: Truck,
        permissions: ['companies.read'],
      },
    ],
  },
  {
    title: 'Serviços',
    items: [
      {
        label: 'Serviços',
        href: '/dashboard/servicos',
        icon: Wrench,
        permissions: ['service_orders.read'],
      },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        label: 'Financeiro',
        href: '/dashboard/financeiro',
        icon: DollarSign,
        permissions: ['purchase_orders.read'],
      },
    ],
  },
  {
    title: 'Operacional',
    items: [
      {
        label: 'Estoque',
        href: '/dashboard/estoque',
        icon: Package,
        permissions: ['stock_movements.read'],
      },
    ],
  },
  {
    title: 'Suporte',
    items: [
      {
        label: 'Suporte',
        href: '/dashboard/suporte',
        icon: Headphones,
        permissions: ['support_tickets.read'],
      },
    ],
  },
  {
    title: 'Relatórios',
    items: [
      {
        label: 'Relatórios',
        href: '/dashboard/relatorios',
        icon: BarChart3,
        permissions: ['reports.read'],
      },
    ],
  },
  {
    title: 'Administração',
    items: [
      {
        label: 'Usuários',
        href: '/dashboard/usuarios',
        icon: UserCog,
        permissions: ['people.read'],
      },
      {
        label: 'Configurações',
        href: '/dashboard/configuracoes',
        icon: Settings2,
        permissions: ['tenants.read', 'roles.read'],
      },
    ],
  },
];

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
  const { person, roles, logout, permissions, isAdminMaster } = useAuth();

  const roleLabel = roles[0]?.name || roles[0]?.name || 'Usuário';
  const displayName = person?.full_name?.trim() || 'Usuário';

  const filteredGroups = dashboardNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (isAdminMaster) return true;
        if (!item.permissions || item.permissions.length === 0) return true;
        return item.permissions.some((perm) =>
          hasPermission(permissions, perm),
        );
      }),
    }))
    .filter((group) => group.items.length > 0);

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
            {filteredGroups.map((group) => (
              <div key={group.title || 'main'} className="mb-4">
                {group.title && (
                  <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                    {group.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.exact
                      ? location.pathname === item.href
                      : location.pathname.startsWith(item.href);

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.exact}
                        onClick={() => handleNavigate(item.href)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.label}
                        {isActive && (
                          <ChevronRight className="text-primary ml-auto h-4 w-4" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
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
