import { NavLink, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/utils';
import { hasPermission } from '@/utils/rbac';
import type { Permission } from '@/types/auth';
import { Button } from '@/components/ui/Button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions?: string[];
  exact?: boolean;
}

const dashboardNavItems: NavItem[] = [
  {
    label: 'Visão Geral',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
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
  {
    label: 'Usuários',
    href: '/dashboard/usuarios',
    icon: UserCog,
    permissions: ['people.read'],
  },
  {
    label: 'Processos Seletivos',
    href: '/dashboard/processos-seletivos',
    icon: GitCompare,
    permissions: ['recruitment.read'],
  },
  {
    label: 'Serviços',
    href: '/dashboard/servicos',
    icon: Wrench,
    permissions: ['service_orders.read'],
  },
  {
    label: 'Financeiro',
    href: '/dashboard/financeiro',
    icon: DollarSign,
    permissions: ['purchase_orders.read'],
  },
  {
    label: 'Estoque',
    href: '/dashboard/estoque',
    icon: Package,
    permissions: ['stock_movements.read'],
  },
  {
    label: 'Suporte',
    href: '/dashboard/suporte',
    icon: Headphones,
    permissions: ['support_tickets.read'],
  },
  {
    label: 'Relatórios',
    href: '/dashboard/relatorios',
    icon: BarChart3,
    permissions: ['reports.read'],
  },
  {
    label: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings2,
    permissions: ['tenants.read', 'roles.read'],
  },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userPermissions: Permission[];
  isAdminMaster: boolean;
}

export function DashboardSidebar({
  isOpen,
  onClose,
  userPermissions,
  isAdminMaster,
}: DashboardSidebarProps) {
  const location = useLocation();

  const filteredNavItems = dashboardNavItems.filter((item) => {
    if (isAdminMaster) return true;
    if (!item.permissions || item.permissions.length === 0) return true;
    return item.permissions.some((perm) =>
      hasPermission(userPermissions, perm),
    );
  });

  return (
    <>
      {isOpen && (
        <div
          className="bg-background/80 fixed inset-0 z-40 lg:hidden"
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
          <span className="text-foreground font-semibold">Menu</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-1 p-4" aria-label="Dashboard">
          {filteredNavItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.exact}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
