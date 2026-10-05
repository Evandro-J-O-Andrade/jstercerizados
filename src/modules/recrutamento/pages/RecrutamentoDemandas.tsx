import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { FileText } from 'lucide-react';

export default function RecrutamentoDemandas() {
  return (
    <ModuleWorkspace
      title="Demandas de Recrutamento"
      description="Gerencie demandas de recrutamento"
      icon={FileText}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Demandas' }]}
    >
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Demandas de Recrutamento</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}