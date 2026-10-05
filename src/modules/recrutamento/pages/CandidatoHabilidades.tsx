import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Brain } from 'lucide-react';

export default function CandidatoHabilidades() {
  return (
    <ModuleWorkspace
      title="Habilidades"
      description="Gerencie habilidades dos candidatos"
      icon={Brain}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }, { label: 'Habilidades' }]}
    >
      <div className="text-center py-12">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Habilidades</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}