'use client';

import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { DashboardSection } from '@/components/dashboard';
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
      <DashboardSection
        title="Automações disponíveis"
        description="Assistentes e fluxos inteligentes disponíveis para a operação."
        icon={Sparkles}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automations.map((item) => (
            <div
              key={item.id}
              className="border-border bg-card rounded-xl border p-4 shadow-sm"
            >
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
                  className={`text-xs font-medium ${item.status === 'active' ? 'text-success' : 'text-warning'}`}
                >
                  {item.status === 'active' ? 'Ativo' : 'Pendente'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-border mt-4 rounded-xl border border-dashed p-6">
          <EmptyState
            title="Nenhuma automação adicional"
            description="Quando houver fluxos de IA configurados, eles aparecerão aqui."
          />
        </div>
      </DashboardSection>
    </ModuleWorkspace>
  );
}
