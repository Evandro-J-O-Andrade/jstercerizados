import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { FileText } from 'lucide-react';

export default function CandidatoDocumentos() {
  return (
    <ModuleWorkspace
      title="Documentos"
      description="Gerencie os documentos dos candidatos"
      icon={FileText}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }, { label: 'Documentos' }]}
    >
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Documentos</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}