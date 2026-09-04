import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  FileText,
  FileUp,
  Calendar,
  Clock,
  AlertCircle,
  Heart,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCandidate } from '@/contexts/CandidateContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileStateInfo } from '@/services/candidate-context';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Enviada',
  screening: 'Triagem',
  interview: 'Entrevista',
  technical_interview: 'Técnica',
  presentation: 'Apresentação',
  reference_check: 'Referência',
  offer: 'Proposta',
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

function getStatusBadge(currentStage: string) {
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

export default function CandidateDashboard() {
  const { person } = useAuth();
  const { candidate, applications, isLoading, error, candidateContext } =
    useCandidate();

  const firstName = person?.full_name?.split(' ')[0] || 'Candidato';
  const completion = candidateContext?.completionPercentage ?? 0;
  const profileState = candidateContext?.profileState ?? 'new';
  const profileStateInfo = getProfileStateInfo(profileState);

  const recentApps = applications.slice(0, 5);

  const hasResumeDoc = (candidate?.documents?.length ?? 0) > 0;
  const hasSkills = (candidate?.skills?.length ?? 0) > 0;
  const hasExperiences = (candidate?.experiences?.length ?? 0) > 0;
  const hasEducation = (candidate?.education?.length ?? 0) > 0;

  const profileSteps = [
    {
      label: 'Dados pessoais',
      done: Boolean(person?.full_name && person?.email),
      href: '/candidato/perfil',
    },
    {
      label: 'Contato',
      done: Boolean(person?.phone),
      href: '/candidato/perfil',
    },
    {
      label: 'Headline profissional',
      done: Boolean(candidate?.headline),
      href: '/candidato/perfil',
    },
    {
      label: 'Experiências',
      done: hasExperiences,
      href: '/candidato/curriculo',
    },
    { label: 'Formação', done: hasEducation, href: '/candidato/curriculo' },
    { label: 'Habilidades', done: hasSkills, href: '/candidato/curriculo' },
    { label: 'Documentos', done: hasResumeDoc, href: '/candidato/curriculo' },
  ];

  if (isLoading) {
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`Área do Candidato — ${COMPANY.name}`}
        description="Painel do candidato"
        noindex
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Olá, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe suas candidaturas, favorite vagas e gerencie seu
            currículo.
          </p>
        </header>

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
                to="/candidato/perfil"
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
                <div className="bg-primary/10 text-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
                  <User className="h-8 w-8" />
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
                            <span className="font-medium">{exp.position}</span>{' '}
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
                      {new Date(candidate.created_at).toLocaleDateString(
                        'pt-BR',
                      )}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      to="/candidato/curriculo"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <FileUp className="h-4 w-4" />
                      Atualizar currículo
                    </Link>
                    <Link
                      to="/candidato/perfil"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
                    >
                      Minhas experiências
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border/40 bg-card shadow-glass mb-6 rounded-3xl border p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-foreground text-lg font-semibold">
                      Complete seu perfil
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      {profileStateInfo?.label ?? 'Novo'} —{' '}
                      {profileStateInfo?.description ?? ''}
                    </p>
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {completion}%
                  </span>
                </div>
                <div className="bg-muted mt-2 h-2 w-full rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>

              <div className="text-muted-foreground mt-3 text-sm">
                {completion >= 90 && (
                  <p>
                    🎉 Seu perfil está quase completo! Envie seu currículo para
                    aumentar suas chances ainda mais.
                  </p>
                )}
                {completion >= 50 && completion < 90 && (
                  <p>
                    🚀 Seu perfil está em progresso. Adicione mais informações
                    para receber recomendações personalizadas de vagas.
                  </p>
                )}
                {completion < 50 && (
                  <p>
                    ⚠️ Complete seu perfil para receber vagas recomendadas e
                    aumentar suas chances de ser encontrado por recrutadores.
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                {profileSteps.map((step) => (
                  <Link
                    key={step.label}
                    to={step.href}
                    className="flex items-center gap-1.5"
                  >
                    {step.done ? (
                      <CheckCircle2 className="text-success h-3 w-3" />
                    ) : (
                      <Circle className="text-muted-foreground h-3 w-3" />
                    )}
                    <span
                      className={
                        step.done ? 'text-foreground' : 'text-muted-foreground'
                      }
                    >
                      {step.label}
                    </span>
                  </Link>
                ))}
              </div>

              {completion < 100 && (
                <Link
                  to={
                    profileSteps.find((s) => !s.done)?.href ??
                    '/candidato/perfil'
                  }
                  className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium"
                >
                  Completar perfil
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="border-border/40 bg-card shadow-glass mb-6 rounded-3xl border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">
                  Suas candidaturas
                </h2>
                <Link
                  to="/candidato/candidaturas"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Ver todas
                </Link>
              </div>

              {recentApps.length === 0 ? (
                <div className="py-8 text-center">
                  <Briefcase className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    Você ainda não se candidatou a nenhuma vaga.
                  </p>
                  <Link
                    to="/candidato/vagas"
                    className="text-primary hover:text-primary/80 mt-2 inline-block text-sm font-medium"
                  >
                    Explorar vagas
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApps.map((app) => (
                    <div
                      key={app.id}
                      className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-foreground font-medium">
                            {app.job?.title || 'Vaga sem título'}
                          </h3>
                          {app.job?.city && (
                            <p className="text-muted-foreground text-sm">
                              {app.job.city}
                              {app.job.state ? `/${app.job.state}` : ''}
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
                </div>
              )}
            </div>

            <div className="border-border/40 bg-card shadow-glass rounded-3xl border p-6">
              <h2 className="text-foreground mb-4 text-lg font-semibold">
                Ações rápidas
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Link
                  to="/candidato/vagas"
                  className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 text-center transition-colors"
                >
                  <Briefcase className="text-primary mx-auto mb-1 h-5 w-5" />
                  <span className="block text-sm font-medium">Vagas</span>
                </Link>
                <Link
                  to="/candidato/curriculo"
                  className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 text-center transition-colors"
                >
                  <FileText className="text-primary mx-auto mb-1 h-5 w-5" />
                  <span className="block text-sm font-medium">Currículo</span>
                </Link>
                <Link
                  to="/candidato/candidaturas"
                  className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 text-center transition-colors"
                >
                  <FileUp className="text-primary mx-auto mb-1 h-5 w-5" />
                  <span className="block text-sm font-medium">
                    Candidaturas
                  </span>
                </Link>
                <Link
                  to="/candidato/favoritas"
                  className="border-border/40 hover:bg-muted/5 rounded-xl border p-4 text-center transition-colors"
                >
                  <Heart className="text-primary mx-auto mb-1 h-5 w-5" />
                  <span className="block text-sm font-medium">Favoritos</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
