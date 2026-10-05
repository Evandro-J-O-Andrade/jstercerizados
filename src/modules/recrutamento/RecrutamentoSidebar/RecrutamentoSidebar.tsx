import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { COMPANY } from '@/config';
import { Briefcase, LogOut, Menu, Users, GitBranch, FileCheck, Link, BarChart2, Database, FileText, LayoutDashboard, Plus } from 'lucide-react';
import { useRecrutamentoNavigation } from '@/modules/recrutamento/navigation';

interface RecrutamentoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

const ICON_MAP: Record<string, typeof Briefcase> = {
  LayoutDashboard,
  Briefcase,
  Users,
  GitBranch,
  FileText,
  FileCheck,
  Link,
  BarChart2,
  Database,
  Plus,
};

function renderNavItem(item: { key: string; label: string; href: string; icon: string; children?: { key: string; label: string; href: string; icon: string }[] }, onNavigate: () => void) {
  const Icon = ICON_MAP[item.icon];
  return (
    <>
      <NavLink
        to={item.href}
        onClick={onNavigate}
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
      {item.children && item.children.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children.map((child) => {
            const ChildIcon = ICON_MAP[child.icon];
            return (
              <NavLink
                key={child.key}
                to={child.href}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')
                }
              >
                <ChildIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </>
  );
}

export function RecrutamentoSidebar({
  isOpen,
  onClose,
  onNavigate,
}: RecrutamentoSidebarProps) {
  const { person, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = useRecrutamentoNavigation();

  const displayName = person?.full_name?.split(' ')[0] || 'Recrutador';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={[
        'bg-card border-border fixed top-0 left-0 z-50 h-full transform border-r transition-all duration-200',
        'lg:static lg:translate-x-0 lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'w-72',
      ].join(' ')}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-foreground truncate text-sm font-semibold">
                {COMPANY.name}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                Recrutamento
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar menu"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto p-2"
          aria-label="Módulo Recrutamento"
        >
          {navItems.map((item) => (
            <div key={item.key}>
              {renderNavItem(item, onNavigate)}
            </div>
          ))}
        </nav>

        <div className="border-border border-t p-2">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium">
                {person?.full_name || 'Recrutador'}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                Recrutamento
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}
