/**
 * EstoqueLayout — layout próprio da célula estoque.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { Package } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface EstoqueLayoutProps {
  children?: React.ReactNode;
}

export function EstoqueLayout({ children }: EstoqueLayoutProps) {
  return (
    <ModuleLayout
      title="Estoque"
      description="Produtos, materiais e movimentações."
      icon={<Package className="h-5 w-5" />}
      homeRoute="/dashboard/estoque"
      moduleId="estoque"
    >
      {children}
    </ModuleLayout>
  );
}
