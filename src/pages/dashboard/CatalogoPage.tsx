import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Package } from 'lucide-react';

export default function CatalogoPage() {
  return (
    <ModuleWorkspace
      title="Catálogo / Módulos"
      description="Módulos, planos, recursos e feature flags."
      icon={Package}
      breadcrumbItems={[
        { label: 'Catálogo / Módulos', href: '/dashboard/catalogo' },
      ]}
      actions={<button className="text-sm">+ Novo módulo</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área gerencia o catálogo de módulos, planos e recursos
          disponíveis na plataforma, incluindo feature flags. Em breve você
          poderá configurar o que cada plano oferece.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
