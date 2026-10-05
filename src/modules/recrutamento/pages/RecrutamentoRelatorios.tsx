import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { BarChart2 } from 'lucide-react';

export default function RecrutamentoRelatorios() {
  return (
    <ModuleWorkspace
      title="Relatórios"
      description="Relatórios do módulo de recrutamento"
      icon={BarChart2}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Relatórios' }]}
    >
      <div className="text-center py-12">
        <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Relatórios</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}