import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Briefcase } from 'lucide-react';

export default function Vagas() {
  return (
    <ModuleWorkspace
      title="Vagas"
      description="Gerencie vagas abertas e publicadas"
      icon={Briefcase}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Vagas' }]}
    >
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Vagas</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}