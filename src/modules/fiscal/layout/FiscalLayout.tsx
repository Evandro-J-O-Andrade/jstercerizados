/**
 * FiscalLayout — layout próprio da célula fiscal.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { FileText } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface FiscalLayoutProps {
  children?: React.ReactNode;
}

export function FiscalLayout({ children }: FiscalLayoutProps) {
  return (
    <ModuleLayout
      title="Fiscal"
      description="Notas fiscais, emissão e conformidade tributária."
      icon={<FileText className="h-5 w-5" />}
      homeRoute="/dashboard/fiscal"
      moduleId="fiscal"
    >
      {children}
    </ModuleLayout>
  );
}
