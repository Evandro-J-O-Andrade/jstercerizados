/**
 * Admin Tenant continua dono do contexto, services e permissões da célula.
 * O layout VISUAL (sidebar/header/main/footer) fica no AdminShell único.
 * Não altera o footer institucional do AdminShell.
 */
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/utils';

interface AdminTenantLayoutProps {
  children?: ReactNode;
  className?: string;
}

export function AdminTenantLayout({ children, className }: AdminTenantLayoutProps) {
  return (
    <section data-module-owner="admin-tenant" className={cn('flex min-w-0 flex-1 flex-col', className)}>
      {children ?? <Outlet />}
    </section>
  );
}
