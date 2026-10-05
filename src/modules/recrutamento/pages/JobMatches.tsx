import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Link } from 'lucide-react';

export default function JobMatches() {
  return (
    <ModuleWorkspace
      title="Matches"
      description="Gerencie os matches entre candidatos e vagas"
      icon={Link}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Matches' }]}
    >
      <div className="text-center py-12">
        <Link className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Matches</h2>
        <p className="mt-2 text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </ModuleWorkspace>
  );
}