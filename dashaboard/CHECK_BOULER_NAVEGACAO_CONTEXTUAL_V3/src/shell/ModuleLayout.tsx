/**
 * ModuleLayout é apenas fronteira de conteúdo da célula autenticada.
 * Sidebar, header, main e footer pertencem EXCLUSIVAMENTE ao AdminShell.
 * Mantém a assinatura existente para não quebrar wrappers fiscal/financeiro/etc.
 * Não contém links globais, importações legacy ou um segundo shell.
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface ModuleLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  homeRoute?: string;
  moduleId?: string;
  sidebarItems?: ReactNode; // legado de API, intencionalmente não renderizado
  className?: string;
  children?: ReactNode;
}

export function ModuleLayout({ moduleId, className, children }: ModuleLayoutProps) {
  return (
    <section
      data-testid="module-layout-content"
      data-module-owner={moduleId}
      className={cn('flex min-w-0 flex-1 flex-col', className)}
    >
      {children}
    </section>
  );
}
