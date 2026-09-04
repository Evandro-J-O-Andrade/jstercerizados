import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { resolveIcon } from '@/utils/navigation-icons';
import { cn } from '@/utils';
import type { NavigationItem } from '@/types/navigation';

function handleItem(
  item: NavigationItem,
  navigate: ReturnType<typeof useNavigate>,
  onAccessibility: () => void,
  onHelp: () => void,
  logout: () => Promise<void>,
  onSiteHome: () => void,
): void {
  switch (item.action) {
    case 'logout':
      void logout();
      return;
    case 'accessibility':
      onAccessibility();
      return;
    case 'chat':
      onHelp();
      return;
    case 'site_home':
      onSiteHome();
      return;
    default:
      if (item.href.startsWith('#') || item.href.startsWith('http')) {
        window.location.href = item.href;
      } else {
        navigate(item.href);
      }
  }
}

export function CandidateBottomNavigation({
  items,
}: {
  items?: NavigationItem[];
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const onAccessibility = () =>
    window.dispatchEvent(new CustomEvent('app:open-accessibility'));
  const onHelp = () => window.dispatchEvent(new CustomEvent('app:open-chat'));
  const onSiteHome = () => navigate('/');

  const list =
    items && items.length > 0
      ? items
      : [
          {
            key: 'home',
            label: 'Início',
            href: '/candidato',
            icon: 'Home',
            permission_key: null,
            sort_order: 10,
            source: 'module' as const,
          },
          {
            key: 'jobs',
            label: 'Vagas',
            href: '/candidato/vagas',
            icon: 'Briefcase',
            permission_key: null,
            sort_order: 20,
            source: 'module' as const,
          },
          {
            key: 'resume',
            label: 'Currículo',
            href: '/candidato/curriculo',
            icon: 'FileText',
            permission_key: null,
            sort_order: 60,
            source: 'module' as const,
          },
        ];

  return (
    <nav className="bg-card border-border fixed right-0 bottom-0 left-0 z-30 border-t backdrop-blur-xl backdrop-saturate-150 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        {list.map((item) => {
          const Icon = resolveIcon(item.icon);
          const isModule = item.source === 'module';
          const isActive = isModule && pathname === item.href;
          const isHome = item.href === '/candidato';

          if (isModule) {
            return (
              <Link
                key={item.key}
                to={item.href}
                onClick={
                  isHome
                    ? () => window.scrollTo({ top: 0, behavior: 'smooth' })
                    : undefined
                }
                className={cn(
                  'text-muted-foreground hover:bg-muted/50 hover:text-foreground relative flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-200',
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
                <span className="text-[10px] font-medium tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                handleItem(
                  item,
                  navigate,
                  onAccessibility,
                  onHelp,
                  logout,
                  onSiteHome,
                )
              }
              className="text-muted-foreground hover:bg-muted/50 hover:text-foreground relative flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-200"
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
