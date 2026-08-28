'use client';

import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Plus } from 'lucide-react';
import { EmptyState } from '@/components/fallback';

const settingsGroups = [
  {
    id: 'general',
    name: 'Geral',
    description: 'Dados da empresa, identidade e horários.',
  },
  {
    id: 'notifications',
    name: 'Notificações',
    description: 'Canais, templates e regras de envio.',
  },
  {
    id: 'security',
    name: 'Segurança',
    description: 'Senha, 2FA e sessões ativas.',
  },
];

export default function Configuracoes() {
  return (
    <ModuleWorkspace
      title="Configurações"
      description="Configurações do sistema."
      icon={Settings}
      breadcrumbItems={[{ label: 'Configurações' }]}
      actions={
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Nova configuração
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsGroups.map((item) => (
          <Card key={item.id} className="p-4">
            <div>
              <p className="text-foreground text-sm font-medium">{item.name}</p>
              <p className="text-muted-foreground text-xs">
                {item.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <EmptyState
          title="Nenhuma configuração adicional"
          description="Quando houver configurações personalizadas, elas aparecerão aqui."
        />
      </Card>
    </ModuleWorkspace>
  );
}
