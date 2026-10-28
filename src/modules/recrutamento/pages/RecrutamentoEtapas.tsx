import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { FileText } from 'lucide-react';

export default function RecrutamentoEtapas() {
  return (
    <ModuleWorkspace
      title="Etapas"
      description="Gerencie etapas dos processos seletivos"
      icon={FileText}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Etapas' }]}
    >
      <div className="py-12 text-center">
        <FileText className="text-muted-foreground/50 mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Etapas</h2>
        <p className="text-muted-foreground mt-2">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}
