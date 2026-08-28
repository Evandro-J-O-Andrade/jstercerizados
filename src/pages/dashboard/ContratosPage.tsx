'use client';

import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/fallback';

export default function ContratosPage() {
  return (
    <ModuleWorkspace
      title="Contratos"
      description="Contratos e termos comerciais."
      icon={FileText}
      breadcrumbItems={[{ label: 'Contratos' }]}
    >
      <Card className="p-6">
        <EmptyState
          title="Nenhum contrato cadastrado"
          description="Quando houver contratos registrados, eles aparecerão aqui."
        />
      </Card>
    </ModuleWorkspace>
  );
}
