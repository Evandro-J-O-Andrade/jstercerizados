import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Briefcase, Users, GitBranch, FileCheck, Link, Database } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardRecrutamento() {
  const { jobs, candidates, applications, processes, talentPool, demands, isLoading } = useRecrutamento();
  const navigate = useNavigate();

  const stats = [
    { label: 'Vagas', count: jobs.length, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-100', route: 'vagas' },
    { label: 'Candidatos', count: candidates.length, icon: Users, color: 'text-green-500', bg: 'bg-green-100', route: 'candidatos' },
    { label: 'Processos', count: processes.length, icon: GitBranch, color: 'text-purple-500', bg: 'bg-purple-100', route: 'processos' },
    { label: 'Candidaturas', count: applications.length, icon: FileCheck, color: 'text-orange-500', bg: 'bg-orange-100', route: 'candidaturas' },
    { label: 'Matches', count: talentPool.length, icon: Link, color: 'text-pink-500', bg: 'bg-pink-100', route: 'matches' },
    { label: 'Demandas', count: demands.length, icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-100', route: 'demandas' },
  ];

  if (isLoading) {
    return (
      <ModuleWorkspace
        title="Recrutamento"
        description="Gerencie vagas, candidatos e processos seletivos"
        icon={Briefcase}
        breadcrumbItems={[{ label: 'Recrutamento' }]}
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title="Recrutamento"
      description="Gerencie vagas, candidatos e processos seletivos"
      icon={Briefcase}
      breadcrumbItems={[{ label: 'Recrutamento' }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
            onClick={() => navigate(stat.route)}
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all" onClick={() => navigate('vagas')}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Vagas</h3>
              <p className="text-sm text-muted-foreground">Gerencie vagas abertas e publicadas</p>
            </div>
          </div>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all" onClick={() => navigate('candidatos')}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium">Candidatos</h3>
              <p className="text-sm text-muted-foreground">Banco de talentos e currículos</p>
            </div>
          </div>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all" onClick={() => navigate('processos')}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <GitBranch className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium">Processos Seletivos</h3>
              <p className="text-sm text-muted-foreground">Acompanhe processos e etapas</p>
            </div>
          </div>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all" onClick={() => navigate('candidaturas')}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <FileCheck className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-medium">Candidaturas</h3>
              <p className="text-sm text-muted-foreground">Acompanhe candidaturas e status</p>
            </div>
          </div>
        </Card>
      </div>
    </ModuleWorkspace>
  );
}