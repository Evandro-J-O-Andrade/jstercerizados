import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  User,
  Shield,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { person, roles, logout, isAdminMaster } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const primaryRole = roles[0];
  const roleLabel = primaryRole?.display_name || primaryRole?.name || 'Usuário';
  const displayName = person?.full_name?.trim() || 'Usuário';
  const firstName = displayName.split(' ')[0];
  const greeting = firstName === displayName ? displayName : `${firstName}`;

  const contextLabel = isAdminMaster
    ? 'Painel Administrativo'
    : 'Área do Usuário';

  return (
    <header
      className={cn(
        'bg-background/80 border-border/60 sticky top-0 z-30 border-b backdrop-blur-xl',
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
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
            <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {contextLabel}
            </div>
            <h1 className="text-foreground text-lg font-semibold">
              {person?.full_name ? `Bem-vindo, ${greeting} 👋` : 'Bem-vindo 👋'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'hidden items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors md:flex',
              searchFocused
                ? 'border-primary/50 bg-background'
                : 'border-border bg-muted/50',
            )}
          >
            <Search className="text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="placeholder:text-muted-foreground bg-transparent text-sm outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="text-muted-foreground hidden text-xs lg:inline-block">
              ⌘K
            </kbd>
          </div>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Notificações"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="bg-primary absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2"
            >
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-foreground text-sm leading-tight font-medium">
                  {displayName}
                </p>
                <p className="text-muted-foreground text-xs leading-tight">
                  {roleLabel}
                </p>
              </div>
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            </Button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="border-border bg-background/95 absolute right-0 z-50 mt-2 w-64 rounded-xl border p-1 shadow-xl backdrop-blur-xl"
                >
                  <div className="border-border/60 border-b px-3 py-2">
                    <p className="text-foreground text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="text-muted-foreground text-xs">{roleLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/dashboard/configuracoes');
                    }}
                    className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Meu perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/dashboard/configuracoes');
                    }}
                    className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Segurança
                  </button>
                  <div className="border-border/60 border-t pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-destructive hover:text-destructive flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
