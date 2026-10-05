import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ListOrdered } from 'lucide-react';

export default function Etapas() {
  return (
    <ModuleWorkspace
      title="Etapas"
      description="Gerencie etapas dos processos seletivos"
      icon={ListOrdered}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Etapas' }]}
    >
      <div className="text-center py-12">
        <ListOrdered className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Etapas</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}