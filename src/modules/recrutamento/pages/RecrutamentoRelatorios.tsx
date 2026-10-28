import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { BarChart2 } from 'lucide-react';

export default function RecrutamentoRelatorios() {
  return (
    <ModuleWorkspace
      title="Relatórios"
      description="Relatórios do módulo de recrutamento"
      icon={BarChart2}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Relatórios' }]}
    >
      <div className="py-12 text-center">
        <BarChart2 className="text-muted-foreground/50 mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Relatórios</h2>
        <p className="text-muted-foreground mt-2">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}
