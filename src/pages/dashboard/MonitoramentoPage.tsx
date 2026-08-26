import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Activity } from 'lucide-react';

export default function MonitoramentoPage() {
  return (
    <ModuleWorkspace
      title="Monitoramento"
      description="Saúde e desempenho da plataforma."
      icon={Activity}
      breadcrumbItems={[
        { label: 'Monitoramento', href: '/dashboard/monitoramento' },
      ]}
      actions={<button className="text-sm">Ver detalhes</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área monitora a saúde e o desempenho da plataforma em tempo real.
          Em breve você poderá visualizar métricas de disponibilidade, latência
          e alertas operacionais.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
