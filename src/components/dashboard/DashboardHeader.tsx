import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  className?: string;
}

export function DashboardHeader({
  onMenuClick,
  className,
}: DashboardHeaderProps) {
  const { person, logout, isAdminMaster } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'bg-card border-border border-b px-4 py-3 lg:px-8',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-foreground text-lg font-semibold">
              {isAdminMaster ? 'Painel Administrativo' : 'Área do Usuário'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {person?.full_name || 'Usuário'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Notificações"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="bg-primary absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
