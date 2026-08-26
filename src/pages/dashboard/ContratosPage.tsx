import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { FileSignature } from 'lucide-react';

export default function ContratosPage() {
  return (
    <ModuleWorkspace
      title="Contratos"
      description="Contratos e termos comerciais."
      icon={FileSignature}
      breadcrumbItems={[{ label: 'Contratos', href: '/dashboard/contratos' }]}
      actions={<button className="text-sm">+ Novo contrato</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área gerencia os contratos e termos comerciais da plataforma. Em
          breve você poderá visualizar e controlar o ciclo de vida de cada
          contrato.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
