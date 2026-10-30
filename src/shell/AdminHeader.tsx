import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Shield,
  Globe,
  Sun,
  Moon,
  Users,
  Monitor,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useTheme } from '@/contexts/ThemeContext';
import { COMPANY } from '@/config';
import { cn } from '@/utils';
import { formatRoleLabel } from '@/contexts/UserIdentity';

interface AdminHeaderProps {
  onMenuClick: () => void;
  moduleTitle?: string;
  className?: string;
}

function AccountSwitcherModal({
  isOpen,
  onClose,
  availableMemberships,
  roles,
  activeTenantId,
  switchAccount,
  navigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  availableMemberships: {
    id: string;
    tenant_id: string;
    membership_role: string;
    status: string;
  }[];
  roles: { id: string; name: string; is_global: boolean }[];
  activeTenantId: string | null;
  switchAccount: (tenantId: string) => Promise<void>;
  navigate: (to: string) => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-background/60 fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mx-4 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant="default" className="p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              Escolha seu acesso
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Globe className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            Selecione a conta com a qual deseja trabalhar. Sua sessão permanece
            ativa.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableMemberships.map((membership) => {
              const membershipRoles = roles.filter(
                (r) => r.id === membership.membership_role,
              );
              const roleName = membershipRoles[0]?.name ?? 'Usuário';
              const isActive = membership.tenant_id === activeTenantId;

              return (
                <button
                  key={membership.id}
                  type="button"
                  onClick={() => {
                    switchAccount(membership.tenant_id);
                    onClose();
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
                        {membershipRoles[0]
                          ? formatRoleLabel(membershipRoles[0].name)
                          : roleName}
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
        </Card>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function AdminHeader({
  onMenuClick,
  moduleTitle,
  className,
}: AdminHeaderProps) {
  const { logout, roles } = useAuth();
  const {
    identity,
    userIdentity,
    activeTenantId,
    availableMemberships,
    switchAccount,
  } = useAccount();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = identity.displayName;
  const roleLabel = userIdentity.roleLabel;
  const tenantLabel = userIdentity.tenantLabel;
  const contextLabel = identity.contextLabel;

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
        'border-border bg-background sticky top-0 z-40 flex items-center justify-between border-b shadow-sm backdrop-blur-md h-16',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="aria-label=Abrir menu lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden items-center gap-3 lg:flex">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Shield className="h-4 w-4" />
          </div>
          <div className="hidden text-right lg:block">
            <p className="text-foreground text-sm font-semibold">
              {moduleTitle ? `${contextLabel} / ${moduleTitle}` : contextLabel}
            </p>
            <p className="text-muted-foreground text-xs">{tenantLabel}</p>
          </div>
        </div>
        <div className="lg:hidden">
          <div className="text-foreground text-base font-semibold">
            {COMPANY.name}
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-1 px-4 lg:flex">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {dateLabel} • {timeLabel}
          </span>
        </div>
        <div className="bg-border/50 h-4 w-px" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:flex"
        >
          <Globe className="h-4 w-4" />
          <span>Voltar para o site</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Notificações"
          className="text-muted-foreground hover:text-foreground relative hidden items-center justify-center rounded-lg px-2.5 py-2 sm:flex"
        >
          <Bell className="h-5 w-5" />
          <span className="bg-destructive absolute top-1 right-1 h-2 w-2 rounded-full" />
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors"
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
                className="border-border bg-background/95 shadow-elevated absolute right-0 z-50 mt-2 w-64 rounded-xl border p-1 backdrop-blur-xl"
              >
                <div className="border-border/60 border-b px-3 py-2">
                  <p className="text-foreground text-sm font-medium">
                    {displayName}
                  </p>
                  <p className="text-muted-foreground text-xs">{roleLabel}</p>
                  <p className="text-muted-foreground text-xs">{tenantLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/dashboard/usuarios');
                  }}
                  className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Usuários do sistema
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/dashboard/sessoes');
                  }}
                  className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <Monitor className="h-4 w-4" />
                  Minhas sessões ativas
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
                  <Globe className="h-4 w-4" />
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
                  {resolvedTheme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  {resolvedTheme === 'light' ? 'Tema escuro' : 'Tema claro'}
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

      <AccountSwitcherModal
        isOpen={switchOpen}
        onClose={() => setSwitchOpen(false)}
        availableMemberships={availableMemberships}
        roles={roles}
        activeTenantId={activeTenantId}
        switchAccount={switchAccount}
        navigate={navigate}
      />
    </header>
  );
}
