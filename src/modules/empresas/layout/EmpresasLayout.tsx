/**
 * EmpresasLayout — layout próprio da célula empresas.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { Building2 } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface EmpresasLayoutProps {
  children?: React.ReactNode;
}

export function EmpresasLayout({ children }: EmpresasLayoutProps) {
  return (
    <ModuleLayout
      title="Empresas"
      description="Cadastro e gestão de empresas clientes."
      icon={<Building2 className="h-5 w-5" />}
      homeRoute="/dashboard/empresas"
      moduleId="empresas"
    >
      {children}
    </ModuleLayout>
  );
}
