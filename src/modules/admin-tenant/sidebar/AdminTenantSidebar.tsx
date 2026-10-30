/**
 * AdminTenantSidebar — Sidebar da célula admin-tenant (proprietário).
 *
 * Primeiro item é sempre o dashboard do proprietário.
 * Utiliza <Link> do react-router-dom para navegação sem recarregamento.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  UserPlus,
  Wrench,
  Activity,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Globe,
  Database,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils';

interface AdminTenantSidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
  permission?: string;
}

export function AdminTenantSidebar({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const items: AdminTenantSidebarItem[] = [
    {
      label: 'Dashboard do Proprietário',
      path: '/dashboard/owner',
      icon: <ShieldCheck className="h-4 w-4" />,
      permission: 'owner.dashboard.read',
    },
    {
      label: 'Tenants',
      path: '/dashboard/owner/tenants',
      icon: <Building2 className="h-4 w-4" />,
      permission: 'owner.tenants.read',
    },
    {
      label: 'Sistemas',
      path: '/dashboard/owner/sistemas',
      icon: <Database className="h-4 w-4" />,
      permission: 'owner.systems.read',
    },
    {
      label: 'Unidades',
      path: '/dashboard/owner/unidades',
      icon: <MapPin className="h-4 w-4" />,
      permission: 'owner.units.read',
    },
    {
      label: 'Administradores',
      path: '/dashboard/owner/administradores',
      icon: <UserPlus className="h-4 w-4" />,
      permission: 'owner.administrators.read',
    },
    {
      label: 'Gestões',
      path: '/dashboard/owner/gestao',
      icon: <Wrench className="h-4 w-4" />,
      permission: 'owner.management.read',
    },
    {
      label: 'Segurança',
      path: '/dashboard/owner/seguranca',
      icon: <Lock className="h-4 w-4" />,
      permission: 'owner.security.read',
    },
    {
      label: 'Auditoria',
      path: '/dashboard/owner/auditoria',
      icon: <Activity className="h-4 w-4" />,
      permission: 'owner.audit.read',
    },
    {
      label: 'Configurações',
      path: '/dashboard/owner/configuracoes',
      icon: <SettingsIcon className="h-4 w-4" />,
      permission: 'owner.settings.read',
    },
  ];

  const visibleItems = items.filter(
    (item) =>
      !item.permission ||
      permissions.some((p: { name: string }) => p.name === item.permission),
  );

  const isActive = (path: string) => location.pathname === path;

  const sidebarWidth = collapsed ? 'w-14' : 'w-60';

  return (
    <aside
      className={cn(
        'bg-card border-border shrink-0 transform border-r transition-all duration-200 flex h-full flex-col',
        sidebarWidth,
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary h-5 w-5" />
          {!collapsed && (
            <span className="text-foreground font-semibold text-sm truncate">
              Proprietário
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto p-1 space-y-0.5"
        aria-label="Navegação do proprietário"
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
                <div className="p-1 rounded-md">{item.icon}</div>
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

      <footer className="border-t border-border/50 p-2">
        <button
          type="button"
          onClick={() => {
            navigate('/');
            onClose?.();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className={cn(collapsed && 'hidden')}>Voltar para o site</span>
        </button>
      </footer>
    </aside>
  );
}

// Componente auxiliar para Settings (não exportado do lucide)
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={className ? '24' : '24'}
      height={className ? '24' : '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 5 19a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
