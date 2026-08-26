import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Rocket } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <ModuleWorkspace
      title="Onboarding"
      description="Provisionamento e ativação de clientes."
      icon={Rocket}
      breadcrumbItems={[{ label: 'Onboarding', href: '/dashboard/onboarding' }]}
      actions={<button className="text-sm">+ Nova ativação</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área gerencia o provisionamento e ativação de novos clientes na
          plataforma. Em breve você poderá acompanhar o andamento de cada
          onboardamento.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
