import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Briefcase } from 'lucide-react';

export default function CandidatoExperiencias() {
  return (
    <ModuleWorkspace
      title="Experiências"
      description="Gerencie as experiências profissionais dos candidatos"
      icon={Briefcase}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }, { label: 'Experiências' }]}
    >
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Experiências</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}