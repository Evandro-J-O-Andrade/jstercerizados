'use client';

import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, Plus } from 'lucide-react';
import { EmptyState } from '@/components/fallback';

const automations = [
  {
    id: 'chat',
    name: 'Chat IA',
    description: 'Assistente para atendimento e suporte.',
    status: 'active',
  },
  {
    id: 'resume',
    name: 'Análise de currículo',
    description: 'Classificação e matching de candidatos.',
    status: 'pending',
  },
  {
    id: 'alerts',
    name: 'Alertas inteligentes',
    description: 'Notificações preditivas de SLA e métricas.',
    status: 'pending',
  },
];

export default function IaPage() {
  return (
    <ModuleWorkspace
      title="IA & Automação"
      description="Assistente IA, automações e integrações."
      icon={Sparkles}
      breadcrumbItems={[{ label: 'IA & Automação' }]}
      actions={
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Nova automação
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {automations.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground text-sm font-medium">
                  {item.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {item.description}
                </p>
              </div>
              <span
                className={`text-xs font-medium ${item.status === 'active' ? 'text-green-700' : 'text-warning'}`}
              >
                {item.status === 'active' ? 'Ativo' : 'Pendente'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <EmptyState
          title="Nenhuma automação adicional"
          description="Quando houver fluxos de IA configurados, eles aparecerão aqui."
        />
      </Card>
    </ModuleWorkspace>
  );
}
