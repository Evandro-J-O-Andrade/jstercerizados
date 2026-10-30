import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Activity,
  Lock,
  Monitor,
  CreditCard,
  Settings,
  PlugZap,
  ShieldAlert,
  Share2,
  Bell,
} from 'lucide-react';

interface AdminSidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export function AdminSidebar({ className }: { className?: string }) {

  const items: AdminSidebarItem[] = [
    { label: 'Dashboard', path: '/dashboard/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Tenants', path: '/dashboard/admin/tenants', icon: <Building2 className="h-4 w-4" /> },
    { label: 'Roles e Permissões', path: '/dashboard/admin/roles-permissoes', icon: <ShieldCheck className="h-4 w-4" /> },
    { label: 'Auditoria', path: '/dashboard/admin/auditoria', icon: <Activity className="h-4 w-4" /> },
    { label: 'Segurança', path: '/dashboard/admin/seguranca', icon: <Lock className="h-4 w-4" /> },
    { label: 'Sessões', path: '/dashboard/admin/sessoes', icon: <Monitor className="h-4 w-4" /> },
    { label: 'Assinaturas', path: '/dashboard/admin/assinaturas', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'Gestão SaaS', path: '/dashboard/admin/gestao-saas', icon: <Settings className="h-4 w-4" /> },
    { label: 'Integrações', path: '/dashboard/admin/integracoes', icon: <PlugZap className="h-4 w-4" /> },
    { label: 'Auditoria RBAC', path: '/dashboard/admin/rbac-auditoria', icon: <ShieldAlert className="h-4 w-4" /> },
    { label: 'Relacionamentos', path: '/dashboard/admin/relacionamentos', icon: <Share2 className="h-4 w-4" /> },
    { label: 'Notificações', path: '/dashboard/admin/notificacoes', icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <aside className={className}>
      <nav>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {item.icon}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
