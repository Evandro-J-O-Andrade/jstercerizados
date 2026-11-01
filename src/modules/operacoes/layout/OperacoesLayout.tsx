/**
 * OperacoesLayout — layout próprio da célula operacoes.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { LayoutDashboard } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface OperacoesLayoutProps {
  children?: React.ReactNode;
}

export function OperacoesLayout({ children }: OperacoesLayoutProps) {
  return (
    <ModuleLayout
      title="Operações"
      description="Ordens de trabalho, checklists e materiais."
      icon={<LayoutDashboard className="h-5 w-5" />}
      homeRoute="/dashboard/operacoes"
      moduleId="operacoes"
    >
      {children}
    </ModuleLayout>
  );
}
