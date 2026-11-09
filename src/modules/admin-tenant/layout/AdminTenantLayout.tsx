import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/utils';

export interface AdminTenantLayoutProps { children?: ReactNode; className?: string; }

/**
 * Wrapper neutro (Fatia 2): AdminShell já fornece sidebar/header/footer únicos.
 * Layout local com sidebar/header/main/footer duplicados foi removido para evitar
 * duplicação no body. Rotas/permissões do admin-tenant permanecem no ModuleRouter.
 */
export function AdminTenantLayout({ children, className }: AdminTenantLayoutProps) {
  return <div className={cn('min-h-0 min-w-0 flex-1', className)}>{children ?? <Outlet />}</div>;
}
