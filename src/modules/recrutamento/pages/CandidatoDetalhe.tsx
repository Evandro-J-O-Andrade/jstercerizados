import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { User } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function CandidatoDetalhe() {
  const { id } = useParams();
  return (
    <ModuleWorkspace
      title="Detalhe do Candidato"
      description="Visualize e gerencie o perfil do candidato"
      icon={User}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }, { label: `ID: ${id}` }]}
    >
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Detalhe do Candidato</h2>
        <p className="mt-2 text-muted-foreground">ID: {id}</p>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}