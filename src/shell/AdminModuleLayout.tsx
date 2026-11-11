/**
 * Conteúdo do módulo SEM sidebar/shell próprios.
 * Único sidebar e header pertencem ao AdminShell.
 * O dashboard ou CRUD da célula é dono de seu cabeçalho operacional.
 */
import type { ReactNode } from 'react';
import type { ModuleDefinition } from '@/platform/modules';
import { cn } from '@/utils';

interface Props {
  module: ModuleDefinition;
  children: ReactNode;
  className?: string;
}

export function AdminModuleLayout({ module, children, className }: Props) {
  return (
    <section
      data-testid="module-content-boundary"
      data-module-owner={module.id}
      className={cn('flex min-w-0 flex-1 flex-col', className)}
    >
      {children}
    </section>
  );
}
