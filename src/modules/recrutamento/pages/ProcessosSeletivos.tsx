import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { GitBranch } from 'lucide-react';

export default function ProcessosSeletivos() {
  return (
    <ModuleWorkspace
      title="Processos Seletivos"
      description="Acompanhe processos e etapas"
      icon={GitBranch}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Processos Seletivos' }]}
    >
      <div className="text-center py-12">
        <GitBranch className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Processos Seletivos</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}