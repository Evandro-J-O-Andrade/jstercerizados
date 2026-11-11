import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveIcon } from '@/utils/navigation-icons';
import { cn } from '@/utils';
import { getPermissionKey } from '@/utils/rbac-normalize';
import type { NavigationItem } from '@/types/navigation';

interface CandidateQuickLink {
  key: string;
  label: string;
  href: string;
  icon: string;
  permission?: string;
}

const candidateQuickLinks: CandidateQuickLink[] = [
  { key: 'home', label: 'Home', href: '/candidato', icon: 'House' },
  {
    key: 'jobs',
    label: 'Vagas',
    href: '/candidato/vagas',
    icon: 'BriefcaseBusiness',
    permission: 'jobs.read',
  },
  {
    key: 'profile',
    label: 'Perfil',
    href: '/candidato/perfil',
    icon: 'UserRound',
    permission: 'candidates.self.read',
  },
  { key: 'site', label: 'Site', href: '/', icon: 'Globe' },
];

/**
 * Navegação móvel própria do candidato.
 *
 * Os destinos essenciais são rotas canônicas já montadas. Configurações de
 * navegação podem fornecer ícones, mas não concedem permissões nem substituem
 * o menu completo, que permanece disponível em "Mais".
 */
export function CandidatoBottomNavigation({
  items,
  onMore,
}: {
  items?: NavigationItem[];
  onMore: () => void;
}) {
  const { pathname } = useLocation();
  const { permissions } = useAuth();
  const permissionKeys = new Set(
    (permissions ?? []).map((permission) =>
      typeof permission === 'string'
        ? permission
        : getPermissionKey(permission),
    ),
  );

  const visibleLinks = candidateQuickLinks
    .filter((item) => !item.permission || permissionKeys.has(item.permission))
    .map((item) => {
      const configured = items?.find(
        (candidate) =>
          candidate.source === 'module' && candidate.href === item.href,
      );
      return { ...item, icon: configured?.icon || item.icon };
    });

  return (
    <nav
      aria-label="Navegação inferior do candidato"
      className="bg-card/95 border-border fixed right-0 bottom-0 left-0 z-40 border-t backdrop-blur-xl backdrop-saturate-150 lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
        {visibleLinks.map((item) => {
          const Icon = resolveIcon(item.icon);
          const isActive =
            pathname === item.href ||
            (item.href !== '/' &&
              item.href !== '/candidato' &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                'text-muted-foreground hover:bg-muted/50 hover:text-foreground relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-200',
                isActive && 'text-primary',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="candidateBottomNavIndicator"
                  className="bg-primary/20 absolute -top-1 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="h-6 w-6" />
              <span className="max-w-full truncate text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          aria-label="Mais opções do candidato"
          className="text-muted-foreground hover:bg-muted/50 hover:text-foreground relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-200"
        >
          <MoreHorizontal className="h-6 w-6" />
          <span className="text-[10px] font-medium tracking-tight">Mais</span>
        </button>
      </div>
    </nav>
  );
}
