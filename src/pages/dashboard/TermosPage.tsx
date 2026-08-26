import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { BookOpen } from 'lucide-react';

export default function TermosPage() {
  return (
    <ModuleWorkspace
      title="Termos"
      description="Termos de uso e políticas."
      icon={BookOpen}
      breadcrumbItems={[{ label: 'Termos', href: '/dashboard/termos' }]}
      actions={<button className="text-sm">Editar termos</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área contém os documentos de termos de uso e políticas da
          plataforma. Você pode visualizar e gerenciar as versões publicadas
          aqui.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
