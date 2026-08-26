import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { FileCheck } from 'lucide-react';

export default function LgpdPage() {
  return (
    <ModuleWorkspace
      title="LGPD"
      description="Consentimentos e retenção de dados."
      icon={FileCheck}
      breadcrumbItems={[{ label: 'LGPD', href: '/dashboard/lgpd' }]}
      actions={<button className="text-sm">+ Nova solicitação</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área gerencia os consentimentos e a retenção de dados pessoais de
          acordo com a Lei Geral de Proteção de Dados (LGPD). Em breve você
          poderá acompanhar as solicitações e o ciclo de vida dos
          consentimentos.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
