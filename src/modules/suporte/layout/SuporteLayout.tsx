/**
 * SuporteLayout — layout próprio da célula suporte.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { Headphones } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface SuporteLayoutProps {
  children?: React.ReactNode;
}

export function SuporteLayout({ children }: SuporteLayoutProps) {
  return (
    <ModuleLayout
      title="Suporte"
      description="Chamados, FAQ e atendimento."
      icon={<Headphones className="h-5 w-5" />}
      homeRoute="/dashboard/suporte"
      moduleId="suporte"
    >
      {children}
    </ModuleLayout>
  );
}
