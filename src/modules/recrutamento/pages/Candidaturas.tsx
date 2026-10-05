import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { FileCheck } from 'lucide-react';

export default function Candidaturas() {
  return (
    <ModuleWorkspace
      title="Candidaturas"
      description="Acompanhe candidaturas e status"
      icon={FileCheck}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidaturas' }]}
    >
      <div className="text-center py-12">
        <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Candidaturas</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}