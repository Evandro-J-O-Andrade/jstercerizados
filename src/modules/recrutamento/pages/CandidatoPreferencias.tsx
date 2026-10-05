import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Sliders } from 'lucide-react';

export default function CandidatoPreferencias() {
  return (
    <ModuleWorkspace
      title="Preferências"
      description="Gerencie as preferências de matching dos candidatos"
      icon={Sliders}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }, { label: 'Preferências' }]}
    >
      <div className="text-center py-12">
        <Sliders className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Preferências</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}