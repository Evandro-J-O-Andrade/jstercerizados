import { Button } from '@/components/ui/Button';
import { Menu, Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';
import { useNavigate } from 'react-router-dom';

interface RecrutamentoHeaderProps {
  onMenuClick: () => void;
}

export function RecrutamentoHeader({
  onMenuClick,
}: RecrutamentoHeaderProps) {
  const { person, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="border-border bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            aria-label="Abrir menu"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
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
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground">
              {person?.full_name || 'Recrutador'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
