import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { Database } from 'lucide-react';

export default function RecrutamentoTalentPool() {
  return (
    <ModuleWorkspace
      title="Banco de Talentos"
      description="Consulte e gerencie o banco de talentos"
      icon={Database}
      breadcrumbItems={[
        { label: 'Recrutamento' },
        { label: 'Banco de Talentos' },
      ]}
    >
      <div className="py-12 text-center">
        <Database className="text-muted-foreground/50 mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Banco de Talentos</h2>
        <p className="text-muted-foreground mt-2">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}
