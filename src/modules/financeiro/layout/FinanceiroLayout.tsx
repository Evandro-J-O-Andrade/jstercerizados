/**
 * FinanceiroLayout — layout próprio da célula financeiro.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { DollarSign } from 'lucide-react';
import { Fragment } from 'react';
import { EmptyState } from '@/components/fallback';
import { useAuth } from '@/contexts/AuthContext';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface FinanceiroLayoutProps {
  children?: React.ReactNode;
}

export function FinanceiroLayout({ children }: FinanceiroLayoutProps) {
  const { currentTenantId } = useAuth();

  return (
    <ModuleLayout
      title="Financeiro"
      description="Contas a pagar, receber, fluxo de caixa e gestão financeira."
      icon={<DollarSign className="h-5 w-5" />}
      homeRoute="/dashboard/financeiro"
      moduleId="financeiro"
    >
      {currentTenantId ? (
        <Fragment key={currentTenantId}>{children}</Fragment>
      ) : (
        <EmptyState
          title="Selecione uma organização"
          description="Escolha um tenant autorizado para acessar o módulo financeiro."
        />
      )}
    </ModuleLayout>
  );
}
