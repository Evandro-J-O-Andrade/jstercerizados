import { type ReactNode, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  FileText,
  User,
  Heart,
  Bell,
  Settings,
  LogOut,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';

interface CandidateShellProps {
  children?: ReactNode;
}

const NAV_ITEMS = [
  { to: '/candidato', label: 'Início', icon: Home, end: true },
  { to: '/candidato/vagas', label: 'Vagas', icon: Briefcase },
  {
    to: '/candidato/candidaturas',
    label: 'Minhas candidaturas',
    icon: FileText,
  },
  { to: '/candidato/favoritas', label: 'Vagas favoritas', icon: Heart },
  { to: '/candidato/curriculo', label: 'Meu currículo', icon: Mail },
  { to: '/candidato/perfil', label: 'Meu perfil', icon: User },
  { to: '/candidato/notificacoes', label: 'Notificações', icon: Bell },
  { to: '/candidato/configuracoes', label: 'Configurações', icon: Settings },
];

export function CandidateShell({ children }: CandidateShellProps) {
  const location = useLocation();
  const { person, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = person?.full_name?.split(' ')[0] || 'Candidato';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-muted/30 flex h-screen w-full overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="bg-background/60 fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'bg-card border-border fixed top-0 left-0 z-50 h-full transform border-r transition-all duration-200 lg:static lg:z-0 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'w-72',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-semibold">
                  {COMPANY.name}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Área do Candidato
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
              className="lg:hidden"
            >
              ✕
            </Button>
          </div>

          <nav
            className="flex-1 space-y-1 overflow-y-auto p-2"
            aria-label="Portal do Candidato"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname === item.to ||
                  location.pathname.startsWith(`${item.to}/`);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-border border-t p-2">
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {person?.full_name || 'Candidato'}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Candidato
                </p>
              </div>
            </div>
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-muted-foreground hover:text-foreground flex w-full items-center justify-start gap-2"
              >
                <Home className="h-4 w-4" />
                <span>Site público</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground flex w-full items-center justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="bg-card border-border flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </Button>
          <span className="text-sm font-medium">Área do Candidato</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto h-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
