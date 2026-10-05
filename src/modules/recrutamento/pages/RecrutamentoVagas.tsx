import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import {
  Briefcase,
  Search,
  Plus,
  Loader2,
  Flag,
  X,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import { useState } from 'react';
import type { JobListItem } from '@/modules/recrutamento/types';

function statusBadge(status: JobListItem['status']) {
  const config = {
    draft: {
      variant: 'secondary' as const,
      icon: <Clock className="h-3 w-3" />,
      label: 'Rascunho',
    },
    published: {
      variant: 'default' as const,
      icon: <Flag className="h-3 w-3" />,
      label: 'Publicada',
    },
    paused: {
      variant: 'outline' as const,
      icon: <Clock className="h-3 w-3" />,
      label: 'Pausada',
    },
    closed: {
      variant: 'danger' as const,
      icon: <X className="h-3 w-3" />,
      label: 'Fechada',
    },
    filled: {
      variant: 'success' as const,
      icon: <CheckCircle className="h-3 w-3" />,
      label: 'Preenchida',
    },
    cancelled: {
      variant: 'danger' as const,
      icon: <X className="h-3 w-3" />,
      label: 'Cancelada',
    },
  } as const;
  const { variant, icon, label } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      {icon} {label}
    </Badge>
  );
}

function JobCard({ job }: { job: JobListItem }) {
  return (
    <Card className="hover:bg-muted/50 p-4 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium">{job.title}</h4>
            {statusBadge(job.status)}
          </div>
          <p className="text-muted-foreground mt-1 truncate text-sm">
            {job.company_name ? `${job.company_name} • ` : ''}
            {job.city || 'Local não informado'}
            {job.state ? `/${job.state}` : ''} • {job.contract_type} •{' '}
            {job.work_mode}
          </p>
          {job.salary_min || job.salary_max ? (
            <p className="text-primary mt-1 text-sm font-medium">
              R$ {(job.salary_min || 0).toLocaleString('pt-BR')} – R${' '}
              {(job.salary_max || 0).toLocaleString('pt-BR')}
            </p>
          ) : (
            <p className="text-muted-foreground mt-1 text-sm">
              Salário a combinar
            </p>
          )}
          <p className="text-muted-foreground mt-1 text-xs">
            Criada:{' '}
            {job.created_at
              ? new Date(job.created_at).toLocaleDateString('pt-BR')
              : '—'}
            {job.published_at &&
              ` • Publicada: ${new Date(job.published_at).toLocaleDateString('pt-BR')}`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-muted-foreground text-sm">
            {job.applications_count || 0} candidaturas
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function RecrutamentoVagas() {
  const { jobsEnriched, isLoading, error, refetchJobs } = useRecrutamento();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredJobs = jobsEnriched.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.company_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <ModuleWorkspace
        title="Vagas"
        description="Gerencie vagas abertas e publicadas"
        icon={Briefcase}
        breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Vagas' }]}
      >
        <div
          className="flex h-64 items-center justify-center"
          role="status"
          aria-busy="true"
        >
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="sr-only">Carregando vagas…</span>
        </div>
      </ModuleWorkspace>
    );
  }

  if (error) {
    return (
      <ModuleWorkspace
        title="Vagas"
        description="Gerencie vagas abertas e publicadas"
        icon={Briefcase}
        breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Vagas' }]}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => refetchJobs()}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title="Vagas"
      description="Gerencie vagas abertas e publicadas"
      icon={Briefcase}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Vagas' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            Nova Vaga
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar vagas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-input bg-background focus-visible:ring-ring flex h-9 w-full max-w-xs items-center rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="published">Publicada</option>
          <option value="paused">Pausada</option>
          <option value="closed">Fechada</option>
          <option value="filled">Preenchida</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <Card className="py-12 text-center">
            <Briefcase className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-muted-foreground mt-2">
              {search || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Nenhuma vaga cadastrada neste tenant'}
            </p>
          </Card>
        ) : (
          filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>

      <div className="text-muted-foreground mt-4 text-center text-sm">
        {filteredJobs.length} de {jobsEnriched.length} vagas
      </div>
    </ModuleWorkspace>
  );
}
