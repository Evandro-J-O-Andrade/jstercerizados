import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import { resolveIcon } from '@/utils/navigation-icons';
import type { NavigationItem } from '@/types/navigation';
import { cn } from '@/utils';

function isExternal(href: string): boolean {
  return href.startsWith('#') || href.startsWith('http');
}

function runAction(
  item: NavigationItem,
  navigate: ReturnType<typeof useNavigate>,
  logout: () => Promise<void>,
): void {
  switch (item.action) {
    case 'logout':
      void logout();
      return;
    case 'accessibility':
      window.dispatchEvent(new CustomEvent('app:open-accessibility'));
      return;
    case 'chat':
      window.dispatchEvent(new CustomEvent('app:open-chat'));
      return;
    case 'site_home':
      navigate('/');
      return;
    default:
      if (isExternal(item.href)) {
        window.location.href = item.href;
      } else {
        navigate(item.href);
      }
  }
}

export function GlobalNavActions({
  variant = 'sidebar',
  className,
}: {
  variant?: 'sidebar' | 'inline';
  className?: string;
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { sidebarItems } = useNavigation();

  const onClick = useCallback(
    (item: NavigationItem) => () => runAction(item, navigate, logout),
    [navigate, logout],
  );

  const items = sidebarItems.filter(
    (i) => i.source === 'global' && i.action !== undefined,
  );

  if (items.length === 0) return null;

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {items.map((item) => {
          const Icon = resolveIcon(item.icon);
          return (
            <button
              key={item.key}
              type="button"
              onClick={onClick(item)}
              data-key={item.key}
              data-action={item.action}
              aria-label={item.label}
              title={item.label}
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('space-y-0.5', className)}>
      {items.map((item) => {
        const Icon = resolveIcon(item.icon);
        return (
          <button
            key={item.key}
            type="button"
            onClick={onClick(item)}
            data-key={item.key}
            data-action={item.action}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
