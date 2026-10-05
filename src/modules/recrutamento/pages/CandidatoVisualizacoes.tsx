import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Eye } from 'lucide-react';

export default function CandidatoVisualizacoes() {
  return (
    <ModuleWorkspace
      title="Visualizações"
      description="Acompanhe as visualizações de perfil dos candidatos"
      icon={Eye}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }, { label: 'Visualizações' }]}
    >
      <div className="text-center py-12">
        <Eye className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Visualizações</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}