import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  FileText,
  FileUp,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { applicationsRepository } from '@/repositories/applications.repository';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import type { Candidate } from '@/types/domain/candidate';
import type { Application } from '@/types/domain/application';
import type { ApplicationStatus } from '@/types/domain/application';

type DashboardState = {
  candidate: Candidate | null;
  applications: Application[];
  loading: boolean;
  error: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Enviada',
  screening: 'Triagem',
  interview: 'Entrevista',
  technical_interview: 'Técnica',
  presentation: 'Apresentação',
  reference_check: 'Referência',
  offer: 'Oferta',
  hired: 'Contratada',
  rejected: 'Rejeitada',
  withdrawn: 'Desistiu',
  on_hold: 'Em espera',
};

const STATUS_COLORS: Record<string, string> = {
  hired: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  withdrawn: 'bg-muted-foreground/10 text-muted-foreground',
  on_hold: 'bg-muted-foreground/10 text-muted-foreground',
  offer: 'bg-warning/10 text-warning',
};

function getStatusBadge(currentStage: ApplicationStatus) {
  const label = STATUS_LABELS[currentStage] ?? currentStage;
  const colorClass =
    STATUS_COLORS[currentStage] ?? 'bg-muted/10 text-muted-foreground';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}

export default function DashboardCandidato() {
  const { person, currentTenantId } = useAuth();
  const [state, setState] = useState<DashboardState>({
    candidate: null,
    applications: [],
    loading: true,
    error: null,
  });

  const tenantId = currentTenantId;

  useEffect(() => {
    if (!person || !tenantId) return;

    const loadData = async () => {
      try {
        const [candidates, applications] = await Promise.all([
          candidatesRepository.findAll(tenantId),
          applicationsRepository.findAll(tenantId, {
            search: person.id,
          }),
        ]);

        const myCandidate =
          candidates.find((c) => c.person_id === person.id) ?? null;

        const myApplications = applications.filter(
          (a) => a.candidate?.person_id === person.id,
        );

        setState({
          candidate: myCandidate,
          applications: myApplications,
          loading: false,
          error: null,
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          error:
            err instanceof Error
              ? err.message
              : 'Erro ao carregar dados do candidato',
          loading: false,
        }));
      }
    };

    loadData();
  }, [person, tenantId]);

  if (state.loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-muted h-8 w-48 rounded" />
          <div className="bg-muted h-4 w-64 rounded" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-muted h-24 rounded-xl" />
            <div className="bg-muted h-24 rounded-xl" />
            <div className="bg-muted h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{state.error}</span>
          </div>
        </div>
      </div>
    );
  }

  const firstName = person?.full_name?.split(' ')[0] || 'Candidato';
  const candidate = state.candidate;
  const applications = state.applications;

  return (
    <>
      <SEO
        title={`Área do Candidato — ${COMPANY.name}`}
        description="Painel do candidato para gerenciar candidaturas, currículo e vagas."
      />

      <div className="mx-auto max-w-7xl p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Área do Candidato</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Bem-vindo(a), {firstName}. Gerencie seu perfil, candidaturas e
              vagas.
            </p>
          </div>

          {!candidate && (
            <div className="border-border/40 bg-card shadow-glass mb-6 rounded-3xl border p-8">
              <div className="flex items-center gap-4">
                <div className="bg-warning/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <AlertCircle className="text-warning h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-foreground font-semibold">
                    Perfil não encontrado
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Seu cadastro de candidato ainda não foi criado.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/cadastro/candidato"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-medium"
                >
                  Completar cadastro de candidato
                </Link>
              </div>
            </div>
          )}

          {candidate && (
            <>
              <div className="border-border/40 bg-card shadow-glass mb-6 rounded-3xl border p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                    <User className="text-primary h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-foreground text-xl font-bold">
                          {person?.full_name || candidate.person?.full_name}
                        </h2>
                        {candidate.headline && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {candidate.headline}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            candidate.status === 'active'
                              ? 'bg-success/10 text-success'
                              : candidate.status === 'inactive'
                                ? 'bg-muted/10 text-muted-foreground'
                                : candidate.status === 'archived'
                                  ? 'bg-muted-foreground/10 text-muted-foreground'
                                  : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {candidate.status === 'active'
                            ? 'Ativo'
                            : candidate.status === 'inactive'
                              ? 'Inativo'
                              : candidate.status === 'archived'
                                ? 'Arquivado'
                                : candidate.status}
                        </span>
                      </div>
                    </div>

                    {person?.email && (
                      <p className="text-muted-foreground mt-2 text-sm">
                        {person.email}
                      </p>
                    )}

                    {candidate.experiences &&
                      candidate.experiences.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {candidate.experiences.slice(0, 2).map((exp) => (
                            <div
                              key={exp.id}
                              className="text-muted-foreground text-sm"
                            >
                              <span className="font-medium">
                                {exp.position}
                              </span>{' '}
                              · {exp.company}
                              {exp.start_date && (
                                <span className="text-xs">
                                  {' '}
                                  ·{' '}
                                  {new Date(exp.start_date).toLocaleDateString(
                                    'pt-BR',
                                    {
                                      year: 'numeric',
                                      month: 'short',
                                    },
                                  )}
                                </span>
                              )}
                            </div>
                          ))}
                          {candidate.experiences.length > 2 && (
                            <p className="text-muted-foreground text-xs">
                              +{candidate.experiences.length - 2} experiências
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
                  {candidate.skills && candidate.skills.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {candidate.skills.length} habilidades
                    </span>
                  )}
                  {candidate.education && candidate.education.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {candidate.education.length} formações
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Cadastrado em{' '}
                    {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    to="/dashboard/candidatos/habilidades"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
                  >
                    <FileUp className="h-4 w-4" />
                    Atualizar currículo
                  </Link>
                  <Link
                    to="/dashboard/candidatos/experiencias"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
                  >
                    Minhas experiências
                  </Link>
                  <Link
                    to="/dashboard/configuracoes/seguranca"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
                  >
                    Alterar senha
                  </Link>
                </div>
              </div>

              <div className="border-border/40 bg-card shadow-glass mb-6 rounded-3xl border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-semibold">
                    Suas candidaturas
                  </h2>
                  <Link
                    to="/dashboard/vagas"
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Ver vagas disponíveis
                  </Link>
                </div>

                {applications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Briefcase className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                    <p className="text-muted-foreground text-sm">
                      Você ainda não se candidatou a nenhuma vaga.
                    </p>
                    <Link
                      to="/dashboard/vagas"
                      className="text-primary hover:text-primary/80 mt-2 inline-block text-sm font-medium"
                    >
                      Explorar vagas
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-foreground font-medium">
                              {app.job?.title || 'Vaga sem título'}
                            </h3>
                            {app.job?.company_relationship_id && (
                              <p className="text-muted-foreground text-sm">
                                Relacionamento ID:{' '}
                                {app.job.company_relationship_id.slice(0, 8)}
                              </p>
                            )}
                          </div>
                          <div>{getStatusBadge(app.current_stage)}</div>
                        </div>
                        <div className="text-muted-foreground mt-2 text-xs">
                          Candidatou-se em{' '}
                          {new Date(app.applied_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}

                    {applications.length > 5 && (
                      <div className="pt-2 text-center">
                        <Link
                          to="/dashboard/candidaturas"
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          Ver todas ({applications.length})
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-6">
                <h2 className="text-foreground mb-4 text-lg font-semibold">
                  Ações rápidas
                </h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Link
                    to="/dashboard/candidatos/habilidades"
                    className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 text-center transition-colors"
                  >
                    <FileText className="text-primary mx-auto mb-1 h-5 w-5" />
                    <span className="block text-sm font-medium">
                      Habilidades
                    </span>
                  </Link>
                  <Link
                    to="/dashboard/candidatos/experiencias"
                    className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 text-center transition-colors"
                  >
                    <Calendar className="text-primary mx-auto mb-1 h-5 w-5" />
                    <span className="block text-sm font-medium">
                      Experiências
                    </span>
                  </Link>
                  <Link
                    to="/dashboard/candidatos/formacao"
                    className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 text-center transition-colors"
                  >
                    <User className="text-primary mx-auto mb-1 h-5 w-5" />
                    <span className="block text-sm font-medium">Formação</span>
                  </Link>
                  <Link
                    to="/dashboard/vagas"
                    className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 text-center transition-colors"
                  >
                    <Briefcase className="text-primary mx-auto mb-1 h-5 w-5" />
                    <span className="block text-sm font-medium">Vagas</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
