/**
 * RecrutamentoLayout — layout próprio da célula recrutamento.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { Briefcase } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface RecrutamentoLayoutProps {
  children?: React.ReactNode;
}

export function RecrutamentoLayout({ children }: RecrutamentoLayoutProps) {
  return (
    <ModuleLayout
      title="Recrutamento"
      description="Vagas, candidatos e processos seletivos."
      icon={<Briefcase className="h-5 w-5" />}
      homeRoute="/dashboard/recrutamento"
      moduleId="recrutamento"
    >
      {children}
    </ModuleLayout>
  );
}
