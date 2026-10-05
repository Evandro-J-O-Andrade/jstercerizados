import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import {
  FileCheck,
  Search,
  Loader2,
  Clock,
  UserCheck,
  XCircle,
  CheckCircle2,
  Briefcase,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import { useState } from 'react';
import type { ApplicationListItem } from '@/modules/recrutamento/types';

function statusConfig(status: ApplicationListItem['status']) {
  const map = {
    applied: {
      variant: 'secondary' as const,
      icon: <Clock className="h-3 w-3" />,
      label: 'Candidatou-se',
    },
    screening: {
      variant: 'default' as const,
      icon: <User className="h-3 w-3" />,
      label: 'Triagem',
    },
    interview_scheduled: {
      variant: 'outline' as const,
      icon: <UserCheck className="h-3 w-3" />,
      label: 'Entrevista agendada',
    },
    interviewed: {
      variant: 'outline' as const,
      icon: <UserCheck className="h-3 w-3" />,
      label: 'Entrevistado',
    },
    offer_sent: {
      variant: 'default' as const,
      icon: <Briefcase className="h-3 w-3" />,
      label: 'Proposta enviada',
    },
    hired: {
      variant: 'success' as const,
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: 'Contratado',
    },
    rejected: {
      variant: 'danger' as const,
      icon: <XCircle className="h-3 w-3" />,
      label: 'Rejeitado',
    },
    withdrawn: {
      variant: 'secondary' as const,
      icon: <XCircle className="h-3 w-3" />,
      label: 'Desistiu',
    },
  } as const;
  return map[status];
}

function ApplicationCard({ app }: { app: ApplicationListItem }) {
  const { variant, icon, label } = statusConfig(app.status);
  return (
    <Card className="hover:bg-muted/50 p-4 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium">{app.candidate_name}</h4>
            <Badge variant={variant} className="gap-1">
              {icon} {label}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 truncate text-sm">
            Vaga: {app.job_title}
          </p>
          <p className="text-muted-foreground text-sm">
            Aplicado em:{' '}
            {app.applied_at
              ? new Date(app.applied_at).toLocaleDateString('pt-BR')
              : '—'}
            {app.stage_name && ` • Etapa: ${app.stage_name}`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {app.screening_score !== null &&
            app.screening_score !== undefined && (
              <p className="text-primary text-sm font-medium">
                Score: {app.screening_score}%
              </p>
            )}
        </div>
      </div>
    </Card>
  );
}

export default function RecrutamentoCandidaturas() {
  const { applicationsEnriched, isLoading, error, refetchApplications } =
    useRecrutamento();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredApplications = applicationsEnriched.filter((a) => {
    const matchesSearch =
      a.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title.toLowerCase().includes(search.toLowerCase()) ||
      a.candidate_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <ModuleWorkspace
        title="Candidaturas"
        description="Acompanhe candidaturas e status"
        icon={FileCheck}
        breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidaturas' }]}
      >
        <div
          className="flex h-64 items-center justify-center"
          role="status"
          aria-busy="true"
        >
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="sr-only">Carregando candidaturas…</span>
        </div>
      </ModuleWorkspace>
    );
  }

  if (error) {
    return (
      <ModuleWorkspace
        title="Candidaturas"
        description="Acompanhe candidaturas e status"
        icon={FileCheck}
        breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidaturas' }]}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => refetchApplications()}
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
      title="Candidaturas"
      description="Acompanhe candidaturas e status"
      icon={FileCheck}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidaturas' }]}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar candidaturas..."
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
          <option value="applied">Candidatou-se</option>
          <option value="screening">Triagem</option>
          <option value="interview_scheduled">Entrevista agendada</option>
          <option value="interviewed">Entrevistado</option>
          <option value="offer_sent">Proposta enviada</option>
          <option value="hired">Contratado</option>
          <option value="rejected">Rejeitado</option>
          <option value="withdrawn">Desistiu</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <Card className="py-12 text-center">
            <FileCheck className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">
              Nenhuma candidatura encontrada
            </h3>
            <p className="text-muted-foreground mt-2">
              {search || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Nenhuma candidatura neste tenant'}
            </p>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))
        )}
      </div>

      <div className="text-muted-foreground mt-4 text-center text-sm">
        {filteredApplications.length} de {applicationsEnriched.length}{' '}
        candidaturas
      </div>
    </ModuleWorkspace>
  );
}
