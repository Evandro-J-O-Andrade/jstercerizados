/**
 * PosLayout — layout próprio da célula pos (ponto de venda).
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { CreditCard } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface PosLayoutProps {
  children?: React.ReactNode;
}

export function PosLayout({ children }: PosLayoutProps) {
  return (
    <ModuleLayout
      title="POS — Ponto de Venda"
      description="Ponto de venda, caixas e terminais."
      icon={<CreditCard className="h-5 w-5" />}
      homeRoute="/dashboard/pos"
      moduleId="pos"
    >
      {children}
    </ModuleLayout>
  );
}
