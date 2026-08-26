import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Plug } from 'lucide-react';

export default function IntegracoesPage() {
  return (
    <ModuleWorkspace
      title="Integrações"
      description="Supabase, n8n, WhatsApp, e-mail."
      icon={Plug}
      breadcrumbItems={[
        { label: 'Integrações', href: '/dashboard/integracoes' },
      ]}
      actions={<button className="text-sm">+ Nova integração</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área gerencia as integrações com Supabase, n8n, WhatsApp, e-mail
          e outros serviços. Em breve você poderá configurar webhooks e conectar
          os provedores disponíveis.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
