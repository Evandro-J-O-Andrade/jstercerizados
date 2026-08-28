'use client';

import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plug, Plus } from 'lucide-react';
import { EmptyState } from '@/components/fallback';

const integrations = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Autenticação, banco de dados e storage.',
    status: 'active',
  },
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Automação de fluxos e integrações.',
    status: 'pending',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Canal de atendimento e notificações.',
    status: 'pending',
  },
  {
    id: 'email',
    name: 'E-mail',
    description: 'SMTP/API para transacionais e marketing.',
    status: 'pending',
  },
];

export default function IntegracoesPage() {
  return (
    <ModuleWorkspace
      title="Integrações"
      description="Supabase, n8n, WhatsApp, e-mail."
      icon={Plug}
      breadcrumbItems={[{ label: 'Integrações' }]}
      actions={
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Nova integração
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((item) => (
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
          title="Nenhuma integração adicional"
          description="Quando houver integrações configuradas, elas aparecerão aqui."
        />
      </Card>
    </ModuleWorkspace>
  );
}
