import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Building2 } from 'lucide-react';

export default function TenantsPage() {
  return (
    <ModuleWorkspace
      title="Tenants"
      description="Empresas e tenants da plataforma."
      icon={Building2}
      breadcrumbItems={[{ label: 'Tenants', href: '/dashboard/tenants' }]}
      actions={<button className="text-sm">+ Novo tenant</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área permite gerenciar os tenants e empresas cadastradas na
          plataforma. Em breve você poderá visualizar a lista de tenants,
          statuses e provisionamento de cada um.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
