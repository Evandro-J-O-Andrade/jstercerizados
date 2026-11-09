import { type ReactNode } from 'react';
import { cn } from '@/utils';

interface ModuleLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  homeRoute?: string;
  moduleId?: string;
  sidebarItems?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Wrapper neutro para compatibilidade com páginas que ainda usam ModuleLayout.
 * O shell único (AdminShell) já fornece sidebar/header/footer; páginas dentro do body
 * NÃO devem montar sidebar/header/main duplicados. A navegação contextual é do shell.
 */
export function ModuleLayout({ className, children }: ModuleLayoutProps) {
  return <div className={cn('min-h-0 min-w-0 flex-1', className)}>{children}</div>;
}
