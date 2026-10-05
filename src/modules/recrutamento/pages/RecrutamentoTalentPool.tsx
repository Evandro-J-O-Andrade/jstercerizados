import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Database } from 'lucide-react';

export default function RecrutamentoTalentPool() {
  return (
    <ModuleWorkspace
      title="Banco de Talentos"
      description="Consulte e gerencie o banco de talentos"
      icon={Database}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Banco de Talentos' }]}
    >
      <div className="text-center py-12">
        <Database className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Banco de Talentos</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}