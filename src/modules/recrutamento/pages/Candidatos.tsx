import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Users } from 'lucide-react';

export default function Candidatos() {
  return (
    <ModuleWorkspace
      title="Candidatos"
      description="Banco de talentos e currículos"
      icon={Users}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }]}
    >
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Candidatos</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}