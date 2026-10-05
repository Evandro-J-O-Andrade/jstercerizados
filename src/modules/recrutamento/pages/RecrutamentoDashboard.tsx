import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Briefcase, Users, FileText, BarChart2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';

export default function RecrutamentoDashboard() {
  const { currentTenantId } = useAuth();
  const navigate = useNavigate();
  const { dashboardStats, isLoading, error, refetchDashboardStats } = useRecrutamento();

  if (!currentTenantId) {
    return (
      <ModuleWorkspace
        title="Recrutamento"
        description="Gerencie vagas, candidatos e processos seletivos"
        icon={Briefcase}
        breadcrumbItems={[{ label: 'Recrutamento' }]}
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Selecione um tenant para acessar o recrutamento</p>
        </div>
      </ModuleWorkspace>
    );
  }

  if (isLoading) {
    return (
      <ModuleWorkspace
        title="Recrutamento"
        description="Gerencie vagas, candidatos e processos seletivos"
        icon={Briefcase}
        breadcrumbItems={[{ label: 'Recrutamento' }]}
      >
        <div className="flex items-center justify-center h-64" role="status" aria-busy="true">
          <p className="text-muted-foreground">Carregando dashboard…</p>
        </div>
      </ModuleWorkspace>
    );
  }

  if (error) {
    return (
      <ModuleWorkspace
        title="Recrutamento"
        description="Gerencie vagas, candidatos e processos seletivos"
        icon={Briefcase}
        breadcrumbItems={[{ label: 'Recrutamento' }]}
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => refetchDashboardStats()}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </ModuleWorkspace>
    );
  }

  const stats = dashboardStats;

  return (
    <ModuleWorkspace
      title="Recrutamento"
      description="Gerencie vagas, candidatos e processos seletivos"
      icon={Briefcase}
      breadcrumbItems={[{ label: 'Recrutamento' }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
          onClick={() => navigate('vagas')}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Vagas</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.jobs?.total ?? 0} total • {stats?.jobs?.published ?? 0} publicadas
              </p>
            </div>
          </div>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
          onClick={() => navigate('candidatos')}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green/10">
              <Users className="h-6 w-6 text-green" />
            </div>
            <div>
              <h3 className="font-medium">Candidatos</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.candidates?.total ?? 0} total • {stats?.candidates?.active ?? 0} ativos
              </p>
            </div>
          </div>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
          onClick={() => navigate('matches')}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple/10">
              <FileText className="h-6 w-6 text-purple" />
            </div>
            <div>
              <h3 className="font-medium">Matches</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.matches?.total ?? 0} total • {stats?.matches?.high_score ?? 0} alta afinidade
              </p>
            </div>
          </div>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
          onClick={() => navigate('candidaturas')}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10">
              <BarChart2 className="h-6 w-6 text-orange" />
            </div>
            <div>
              <h3 className="font-medium">Candidaturas</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.applications?.total ?? 0} total • {stats?.applications?.new_today ?? 0} hoje
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ModuleWorkspace>
  );
}