import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Languages } from 'lucide-react';

export default function CandidatoIdiomas() {
  return (
    <ModuleWorkspace
      title="Idiomas"
      description="Gerencie os idiomas dos candidatos"
      icon={Languages}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }, { label: 'Idiomas' }]}
    >
      <div className="text-center py-12">
        <Languages className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Idiomas</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}