import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { FileText } from 'lucide-react';

export default function RecrutamentoDemandas() {
  return (
    <ModuleWorkspace
      title="Demandas de Recrutamento"
      description="Gerencie demandas de recrutamento"
      icon={FileText}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Demandas' }]}
    >
      <div className="py-12 text-center">
        <FileText className="text-muted-foreground/50 mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Demandas de Recrutamento</h2>
        <p className="text-muted-foreground mt-2">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}
