import { type ReactNode } from 'react';
import { cn } from '@/utils';
import type { ModuleDefinition } from '@/platform/modules';

interface AdminModuleLayoutProps {
  module: ModuleDefinition;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper neutro para renderização de módulo dentro do shell único (AdminShell).
 * AdminShell/AdminSidebar já fornecem a navegação contextual; páginas dentro do
 * body NÃO devem montar sidebar/header/main duplicados (Fatia 2).
 */
export function AdminModuleLayout({ children, className }: AdminModuleLayoutProps) {
  return <div className={cn('min-h-0 min-w-0 flex-1', className)}>{children}</div>;
}
