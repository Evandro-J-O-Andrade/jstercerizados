/**
 * AdminMasterSidebar — Sidebar da célula admin-master (proprietário/admin do tenant).
 *
 * Primeiro item é sempre o dashboard da própria gestão.
 * Utiliza <Link> do react-router-dom para navegação sem recarregamento.
 * Largura reduzida para não ocupar espaço excessivo do conteúdo.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Headphones,
  LayoutDashboard,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserRoundSearch,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils';
import { hasPermission } from '@/utils/rbac';

interface AdminMasterSidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
  permission?: string;
}

export function AdminMasterSidebar({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, isAdminMaster, person } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const items: AdminMasterSidebarItem[] = [
    {
      label: 'Central 24H',
      path: '/dashboard/global',
      icon: <LayoutDashboard className="h-4 w-4" />,
      permission: 'tenants.read',
    },
    {
      label: 'Admin Master',
      path: '/dashboard/admin-master',
      icon: <ShieldCheck className="h-4 w-4" />,
      permission: 'tenants.read',
    },
    {
      label: 'Recrutamento',
      path: '/dashboard/recrutamento',
      icon: <BriefcaseBusiness className="h-4 w-4" />,
      permission: 'recruitment.read',
    },
    {
      label: 'Gestão de Candidatos',
      path: '/dashboard/recrutamento/candidatos',
      icon: <UserRoundSearch className="h-4 w-4" />,
      permission: 'candidates.read',
    },
    {
      label: 'Gestão de Usuários',
      path: '/dashboard/usuarios',
      icon: <Users className="h-4 w-4" />,
      permission: 'people.read',
    },
    {
      label: 'Tenants',
      path: '/dashboard/tenants',
      icon: <Building2 className="h-4 w-4" />,
      permission: 'tenants.read',
    },
    {
      label: 'Empresas',
      path: '/dashboard/empresas',
      icon: <Building2 className="h-4 w-4" />,
      permission: 'companies.read',
    },
    {
      label: 'Pessoas',
      path: '/dashboard/pessoas',
      icon: <Users className="h-4 w-4" />,
      permission: 'people.read',
    },
    {
      label: 'Vagas',
      path: '/dashboard/vagas',
      icon: <BriefcaseBusiness className="h-4 w-4" />,
      permission: 'jobs.read',
    },
    {
      label: 'Candidaturas',
      path: '/dashboard/candidaturas',
      icon: <ClipboardList className="h-4 w-4" />,
      permission: 'applications.read',
    },
    {
      label: 'Ordens de Serviço',
      path: '/dashboard/servicos',
      icon: <Wrench className="h-4 w-4" />,
      permission: 'service_orders.read',
    },
    {
      label: 'Suporte',
      path: '/dashboard/suporte',
      icon: <Headphones className="h-4 w-4" />,
      permission: 'support_tickets.read',
    },
    {
      label: 'Auditoria',
      path: '/dashboard/auditoria',
      icon: <Activity className="h-4 w-4" />,
      permission: 'audit.read',
    },
    {
      label: 'Segurança',
      path: '/dashboard/seguranca',
      icon: <Lock className="h-4 w-4" />,
      permission: 'security_events.read',
    },
  ];

  const visibleItems = isAdminMaster
    ? items.filter(
        (item) =>
          !item.permission || hasPermission(permissions, item.permission),
      )
    : [];

  const isActive = (path: string) => location.pathname === path;

  const sidebarWidth = collapsed ? 'w-14' : 'w-60';

  return (
    <aside
      className={cn(
        'bg-card border-border flex h-full shrink-0 transform flex-col border-r transition-all duration-200',
        sidebarWidth,
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary h-5 w-5" />
          {!collapsed && (
            <span className="text-foreground truncate text-sm font-semibold">
              Central 24H
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto p-1"
        aria-label="Navegação administrativa"
      >
        {visibleItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-1',
              )}
            >
              {collapsed ? (
                <div className="rounded-md p-1">{item.icon}</div>
              ) : (
                <>
                  {item.icon}
                  <span className="text-left">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <footer className="border-border/50 border-t p-2">
        <button
          type="button"
          onClick={() => {
            navigate('/minha-conta');
            onClose?.();
          }}
          className={cn(
            'text-muted-foreground hover:text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
            collapsed && 'justify-center px-1',
          )}
          title={collapsed ? `${person?.full_name || ''}` : undefined}
        >
          <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
            {(person?.full_name || person?.email || 'U')
              .charAt(0)
              .toUpperCase()}
          </div>
          <span className={cn('truncate', collapsed && 'hidden')}>
            {person?.full_name || person?.email || 'Minha Conta'}
          </span>
        </button>
      </footer>
    </aside>
  );
}
