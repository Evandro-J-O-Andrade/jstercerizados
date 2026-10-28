import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { GitBranch } from 'lucide-react';

export default function RecrutamentoProcessos() {
  return (
    <ModuleWorkspace
      title="Processos Seletivos"
      description="Acompanhe processos e etapas"
      icon={GitBranch}
      breadcrumbItems={[
        { label: 'Recrutamento' },
        { label: 'Processos Seletivos' },
      ]}
    >
      <div className="py-12 text-center">
        <GitBranch className="text-muted-foreground/50 mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Processos Seletivos</h2>
        <p className="text-muted-foreground mt-2">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}
