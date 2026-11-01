/**
 * ContabilidadeLayout — layout próprio da célula contabilidade.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { BookOpen } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface ContabilidadeLayoutProps {
  children?: React.ReactNode;
}

export function ContabilidadeLayout({ children }: ContabilidadeLayoutProps) {
  return (
    <ModuleLayout
      title="Contabilidade"
      description="Plano de contas, lançamentos e fechamento contábil."
      icon={<BookOpen className="h-5 w-5" />}
      homeRoute="/dashboard/contabilidade"
      moduleId="contabilidade"
    >
      {children}
    </ModuleLayout>
  );
}
