/**
 * AdminLayout — layout próprio da célula admin (administração de tenant).
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { ShieldCheck } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ModuleLayout
      title="Administração"
      description="Gestão de tenants, roles, permissões, auditoria e configurações do sistema."
      icon={<ShieldCheck className="h-5 w-5" />}
      homeRoute="/dashboard/admin"
      moduleId="admin"
    >
      {children}
    </ModuleLayout>
  );
}
