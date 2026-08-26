import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Folder } from 'lucide-react';

export default function DocumentosPage() {
  return (
    <ModuleWorkspace
      title="Documentos"
      description="Documentos e arquivos da plataforma."
      icon={Folder}
      breadcrumbItems={[{ label: 'Documentos', href: '/dashboard/documentos' }]}
      actions={<button className="text-sm">+ Novo documento</button>}
    >
      <Card className="p-6">
        <p className="text-muted-foreground">
          Esta área centraliza os documentos e arquivos da plataforma. Em breve
          você poderá navegar pelas pastas, visualizar e fazer upload de novos
          arquivos.
        </p>
      </Card>
    </ModuleWorkspace>
  );
}
