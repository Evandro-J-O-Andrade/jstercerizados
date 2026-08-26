import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { CreditCard } from 'lucide-react';

export default function AssinaturasPage() {
  return (
    <ModuleWorkspace
      title="Assinaturas"
      description="Planos, assinaturas e renovações."
      icon={CreditCard}
      breadcrumbItems={[
        { label: 'Assinaturas', href: '/dashboard/assinaturas' },
      ]}
      actions={<button className="text-sm">+ Nova assinatura</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área gerencia os planos, assinaturas e renovações dos tenants. Em
          breve você poderá visualizar e controlar os ciclos de pagamento.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
