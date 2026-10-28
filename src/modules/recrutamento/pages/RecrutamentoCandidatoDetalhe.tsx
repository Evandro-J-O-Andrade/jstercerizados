import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { User } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function RecrutamentoCandidatoDetalhe() {
  const { id } = useParams();
  return (
    <ModuleWorkspace
      title="Detalhe do Candidato"
      description="Visualize e gerencie o perfil do candidato"
      icon={User}
      breadcrumbItems={[
        { label: 'Recrutamento' },
        { label: 'Candidatos' },
        { label: `ID: ${id}` },
      ]}
    >
      <div className="py-12 text-center">
        <User className="text-muted-foreground/50 mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Detalhe do Candidato</h2>
        <p className="text-muted-foreground mt-2">ID: {id}</p>
        <p className="text-muted-foreground mt-2">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}
