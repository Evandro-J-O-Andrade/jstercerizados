import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { GraduationCap } from 'lucide-react';

export default function CandidatoFormacao() {
  return (
    <ModuleWorkspace
      title="Formação"
      description="Gerencie a formação acadêmica dos candidatos"
      icon={GraduationCap}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }, { label: 'Formação' }]}
    >
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Formação</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}