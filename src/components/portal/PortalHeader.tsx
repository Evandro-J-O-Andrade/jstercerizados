import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  User,
  Shield,
  Search,
  Globe,
  Sun,
  Moon,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useTheme } from '@/hooks/useTheme';
import { COMPANY } from '@/config';
import { cn } from '@/utils';
import { normalizeRoleScope } from '@/utils/rbac-normalize';

interface PortalHeaderProps {
  onMenuClick: () => void;
  moduleTitle?: string;
  className?: string;
}

export function PortalHeader({
  onMenuClick,
  moduleTitle,
  className,
}: PortalHeaderProps) {
  const { person, roles, logout } = useAuth();
  const { activeTenantId, availableMemberships, switchAccount, activeRole } =
    useAccount();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/entrar');
  };

  const primaryRole = roles[0];
  const roleLabel = primaryRole?.name || primaryRole?.name || 'Usuário';
  const displayName = person?.full_name?.trim() || 'Usuário';

  const contextLabel = activeRole
    ? normalizeRoleScope(activeRole.scope) === 'platform'
      ? 'Painel Administrativo'
      : 'Área do Usuário'
    : 'Área do Usuário';

  const currentMembership = availableMemberships.find(
    (m) => m.tenant_id === activeTenantId,
  );
  const tenantLabel = currentMembership
    ? 'Tenant selecionado'
    : activeRole
      ? normalizeRoleScope(activeRole.scope) === 'platform'
        ? 'Plataforma'
        : ''
      : '';

  const now = new Date();
  const dateLabel = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeLabel = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header
      className={cn(
        'bg-background/95 border-border flex h-16 items-center justify-between border-b backdrop-blur-xl lg:h-20',
        className,
      )}
    >
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
        <div className="hidden lg:block">
          <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {moduleTitle ? `${contextLabel} / ${moduleTitle}` : contextLabel}
          </div>
          <h1 className="text-foreground text-lg font-semibold">
            Seja bem-vindo, {displayName}
          </h1>
          <p className="text-muted-foreground text-xs">
            {tenantLabel || roleLabel} • {dateLabel} • {timeLabel}
          </p>
        </div>
        <div className="lg:hidden">
          <div className="text-foreground text-base font-semibold">
            {COMPANY.name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="hidden items-center gap-2 md:flex"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm">Voltar para o site</span>
        </Button>

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
          className="relative hidden sm:flex"
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
                {tenantLabel || roleLabel}
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
                  <p className="text-muted-foreground text-xs">
                    {tenantLabel || contextLabel}
                  </p>
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
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setSwitchOpen(true);
                  }}
                  className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  Trocar conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    toggleTheme();
                  }}
                  className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  {theme === 'light' ? 'Tema escuro' : 'Tema claro'}
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

      <AnimatePresence>
        {switchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/60 fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm"
            onClick={() => setSwitchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card border-border mx-4 w-full max-w-lg rounded-xl border p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">
                  Escolha seu acesso
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSwitchOpen(false)}
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                Selecione a conta com a qual deseja trabalhar. Sua sessão
                permanece ativa.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {availableMemberships.map((membership) => {
                  const membershipRoles = roles.filter(
                    (r) => r.id === membership.role_id,
                  );
                  const roleName =
                    membershipRoles[0]?.name ||
                    membershipRoles[0]?.name ||
                    'Usuário';
                  const isActive = membership.tenant_id === activeTenantId;

                  return (
                    <button
                      key={membership.id}
                      type="button"
                      onClick={() => {
                        switchAccount(membership.tenant_id);
                        setSwitchOpen(false);
                        navigate('/dashboard');
                      }}
                      className={cn(
                        'border-border hover:border-primary/50 rounded-xl border p-4 text-left transition-all',
                        isActive && 'ring-primary/50 ring-2',
                      )}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-semibold">
                            Conta
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {roleName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          {isActive ? 'Ativo' : 'Selecionar'}
                        </span>
                        {isActive && (
                          <span className="text-primary text-xs font-medium">
                            Atual
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
