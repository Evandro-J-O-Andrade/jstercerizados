import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  Circle,
  FileText,
  Heart,
  MapPin,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useCandidate } from '@/contexts/CandidateContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileStateInfo } from '@/services/candidate-context';
import { SEO } from '@/components/ui/SEO';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchScoreBadge } from '@/components/candidate/MatchScoreBadge';
import { COMPANY } from '@/config';

const CONTRACT_LABELS: Record<string, string> = {
  clt: 'CLT',
  internship: 'Estágio',
  temporary: 'Temporário',
  freelance: 'Freelance',
  contracted: 'Contratado',
  cd: 'CD',
};

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: 'Presencial',
  hybrid: 'Híbrido',
  remote: 'Remoto',
};

function formatSalaryRange(
  min: number | null,
  max: number | null,
): string | null {
  if (!min && !max) return null;
  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  if (min && max) return `R$ ${fmt(min)} – R$ ${fmt(max)}`;
  if (min) return `R$ ${fmt(min)}+`;
  return `R$ ${fmt(max as number)}`;
}

interface ProfileStep {
  key: string;
  label: string;
  done: boolean;
  href: string;
}

function getProfileMessage(
  completion: number,
): { tone: 'danger' | 'warning' | 'success'; text: string } {
  if (completion >= 100) {
    return {
      tone: 'success',
      text: 'Perfil completo! Agora você está pronto para se candidatar às oportunidades da J&S.',
    };
  }
  if (completion >= 75) {
    return {
      tone: 'success',
      text: 'Seu perfil está quase completo! Adicione seu currículo em PDF para deixá-lo ainda mais competitivo.',
    };
  }
  if (completion >= 40) {
    return {
      tone: 'warning',
      text: 'Seu perfil ainda está incompleto. Adicione sua experiência profissional para aumentar suas chances de aparecer em processos seletivos.',
    };
  }
  return {
    tone: 'danger',
    text: 'Complete seu perfil para receber vagas recomendadas e aumentar suas chances de ser encontrado por recrutadores.',
  };
}

export default function CandidateDashboard() {
  const { person } = useAuth();
  const {
    candidate,
    applications,
    matchResults,
    favorites,
    jobAlerts,
    isLoading,
    error,
    candidateContext,
  } = useCandidate();

  const firstName = person?.full_name?.split(' ')[0] || 'Candidato';
  const completion = candidateContext?.completionPercentage ?? 0;
  const profileState = candidateContext?.profileState ?? 'new';
  const profileStateInfo = getProfileStateInfo(profileState);

  const recentApps = applications.slice(0, 5);

  const profileSteps: ProfileStep[] = useMemo(() => {
    const hasResumeDoc = (candidate?.documents?.length ?? 0) > 0;
    const hasSkills = (candidate?.skills?.length ?? 0) > 0;
    const hasExperiences = (candidate?.experiences?.length ?? 0) > 0;
    const hasEducation = (candidate?.education?.length ?? 0) > 0;
    const hasLanguages = (candidate?.languages?.length ?? 0) > 0;
    const hasPreferences = Boolean(candidateContext?.hasPreferences);

    return [
      {
        key: 'personal',
        label: 'Dados pessoais',
        done: Boolean(person?.full_name && person?.email),
        href: '/candidato/perfil',
      },
      {
        key: 'contact',
        label: 'Informações de contato',
        done: Boolean(person?.phone),
        href: '/candidato/perfil',
      },
      {
        key: 'summary',
        label: 'Resumo profissional',
        done: Boolean(candidate?.headline?.trim()),
        href: '/candidato/perfil',
      },
      {
        key: 'experience',
        label: 'Experiência profissional',
        done: hasExperiences,
        href: '/candidato/curriculo',
      },
      {
        key: 'education',
        label: 'Formação',
        done: hasEducation,
        href: '/candidato/curriculo',
      },
      {
        key: 'courses',
        label: 'Cursos e qualificações',
        done: hasLanguages || hasSkills,
        href: '/candidato/curriculo',
      },
      {
        key: 'resume',
        label: 'Currículo em PDF',
        done: hasResumeDoc,
        href: '/candidato/curriculo',
      },
      {
        key: 'preferences',
        label: 'Preferências profissionais',
        done: hasPreferences,
        href: '/candidato/perfil',
      },
    ];
  }, [candidate, person, candidateContext]);

  const completedCount = profileSteps.filter((s) => s.done).length;
  const nextStep = profileSteps.find((s) => !s.done);

  const compatibility = useMemo(() => {
    const top5 = matchResults.slice(0, 5);
    if (top5.length === 0) {
      return { average: 0, compatibleCount: 0 };
    }
    const average = Math.round(
      top5.reduce((sum, m) => sum + m.match.score, 0) / top5.length,
    );
    const compatibleCount = matchResults.filter(
      (m) => m.match.score >= 60,
    ).length;
    return { average, compatibleCount };
  }, [matchResults]);

  const recommendedJobs = matchResults.slice(0, 3);

  const profileMessage = getProfileMessage(completion);

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
            Encontre novas oportunidades e mantenha seu perfil atualizado para
            aumentar suas chances.
          </p>
        </header>

        {!candidate && (
          <Card className="border-border/40 bg-card shadow-glass p-6">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <AlertCircle className="text-warning h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-foreground font-semibold">
                  Perfil não encontrado
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Seu cadastro de candidato ainda não foi criado.
                </p>
              </div>
              <Link to="/candidato/perfil">
                <Button variant="primary" size="sm">
                  Completar cadastro
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {candidate && (
          <>
            <Card className="border-border/40 bg-card shadow-glass p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                    <Sparkles className="h-4 w-4" />
                    Aumente suas chances de conseguir uma vaga
                  </div>
                  <h2 className="text-foreground mt-2 text-lg font-semibold">
                    Seu perfil está {completion}% completo
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Complete suas informações para que possamos encontrar
                    oportunidades mais compatíveis com seu perfil.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-foreground text-2xl font-bold">
                    {completion}%
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {completedCount} de {profileSteps.length} etapas
                  </div>
                </div>
              </div>

              <div className="bg-muted mt-4 h-2.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <div className="bg-muted-foreground/10 mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl p-4 text-sm sm:grid-cols-4">
                {profileSteps.map((step) => (
                  <Link
                    key={step.key}
                    to={step.href}
                    className="flex items-center gap-2"
                  >
                    {step.done ? (
                      <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
                    ) : (
                      <Circle className="text-muted-foreground h-4 w-4 shrink-0" />
                    )}
                    <span
                      className={
                        step.done
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {step.label}
                    </span>
                  </Link>
                ))}
              </div>

              <div
                className={`mt-4 rounded-xl border p-4 text-sm ${
                  profileMessage.tone === 'success'
                    ? 'border-success/30 bg-success/5 text-success'
                    : profileMessage.tone === 'warning'
                      ? 'border-warning/30 bg-warning/5 text-warning'
                      : 'border-destructive/30 bg-destructive/5 text-destructive'
                }`}
              >
                {profileMessage.text}
              </div>

              <div className="text-muted-foreground text-xs">
                Estado atual: {profileStateInfo?.label} —{' '}
                {profileStateInfo?.description}
              </div>

              {completion < 100 && nextStep && (
                <div className="mt-4">
                  <Link to={nextStep.href}>
                    <Button variant="primary" size="md">
                      Completar meu perfil
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card className="border-border/40 bg-card shadow-glass p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                    <TrendingUp className="h-4 w-4" />
                    Compatibilidade com vagas
                  </div>
                  <h2 className="text-foreground mt-2 text-lg font-semibold">
                    {compatibility.compatibleCount > 0
                      ? `${compatibility.compatibleCount} vaga${
                          compatibility.compatibleCount > 1 ? 's' : ''
                        } compatível${compatibility.compatibleCount > 1 ? 'is' : ''} encontrada${
                          compatibility.compatibleCount > 1 ? 's' : ''
                        }`
                      : 'Estamos buscando vagas compatíveis para você'}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {compatibility.average > 0
                      ? 'Quanto mais informações você compartilhar, mais preciso fica o match.'
                      : 'Complete seu perfil para que a J&S encontre vagas para você.'}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-foreground text-2xl font-bold">
                    {compatibility.average}%
                  </div>
                  <div className="text-muted-foreground text-xs">
                    compatibilidade média
                  </div>
                </div>
              </div>
              <div className="bg-muted mt-4 h-2.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-success h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${compatibility.average}%` }}
                />
              </div>
            </Card>

            <Card className="border-border/40 bg-card shadow-glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-foreground text-lg font-semibold">
                    Vagas recomendadas para você
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Encontramos oportunidades que podem combinar com seu
                    perfil.
                  </p>
                </div>
                <Link
                  to="/candidato/vagas"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Ver todas
                </Link>
              </div>

              {recommendedJobs.length === 0 ? (
                <div className="py-8 text-center">
                  <Briefcase className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
                  <p className="text-foreground font-medium">
                    Nenhuma vaga recomendada no momento
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Atualize suas preferências para receber recomendações mais
                    precisas.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {recommendedJobs.map(({ job: j, match }) => {
                    const salary = formatSalaryRange(
                      j.salary_min,
                      j.salary_max,
                    );
                    return (
                      <li key={j.id}>
                        <Link
                          to={`/vagas/${j.slug}`}
                          className="border-border/40 hover:bg-muted/5 flex items-start gap-4 rounded-xl border p-4 transition-colors"
                        >
                          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-foreground truncate text-base font-semibold">
                                {j.title}
                              </h3>
                              <MatchScoreBadge
                                score={match.score}
                                compact
                              />
                            </div>
                            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              {j.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {j.city}
                                  {j.state ? `/${j.state}` : ''}
                                </span>
                              )}
                              {j.contract_type && (
                                <span>
                                  {CONTRACT_LABELS[j.contract_type] ??
                                    j.contract_type}
                                </span>
                              )}
                              {j.work_mode && (
                                <span>
                                  {WORK_MODE_LABELS[j.work_mode] ??
                                    j.work_mode}
                                </span>
                              )}
                              {salary && (
                                <span className="text-foreground font-medium">
                                  {salary}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="text-muted-foreground mt-3 hidden h-4 w-4 shrink-0 sm:block" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-4">
                <Link to="/candidato/vagas">
                  <Button variant="outline" size="md" className="w-full">
                    Ver todas as vagas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="border-border/40 bg-card shadow-glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">
                  Minhas candidaturas
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
                      </div>
                      <div className="text-muted-foreground mt-2 text-xs">
                        Candidatou-se em{' '}
                        {new Date(app.applied_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="border-border/40 bg-card shadow-glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">
                  Vagas favoritas
                </h2>
                <Link
                  to="/candidato/favoritas"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Ver todas
                </Link>
              </div>

              {favorites.length === 0 ? (
                <div className="py-8 text-center">
                  <Heart className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
                  <p className="text-foreground font-medium">
                    Você ainda não favoritou nenhuma vaga
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Favorite vagas para acessá-las rapidamente depois.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {favorites.slice(0, 3).map((fav) => (
                    <li key={fav.id}>
                      <Link
                        to={`/vagas/${fav.job?.slug ?? ''}`}
                        className="border-border/40 hover:bg-muted/5 flex items-center gap-3 rounded-xl border p-3 transition-colors"
                      >
                        <Heart className="fill-destructive text-destructive h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-foreground truncate font-medium">
                            {fav.job?.title ?? 'Vaga'}
                          </div>
                          {fav.job?.city && (
                            <div className="text-muted-foreground text-xs">
                              {fav.job.city}
                              {fav.job.state ? `/${fav.job.state}` : ''}
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="border-border/40 bg-card shadow-glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-foreground text-lg font-semibold">
                    Alertas de vagas
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Receba notificações de oportunidades compatíveis com seus
                    critérios.
                  </p>
                </div>
                <Link
                  to="/candidato/alertas"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Gerenciar
                </Link>
              </div>

              {jobAlerts.length === 0 ? (
                <div className="py-6 text-center">
                  <Bell className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
                  <p className="text-foreground font-medium">
                    Você ainda não tem alertas
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Crie alertas para ser notificado quando novas vagas
                    compatíveis forem publicadas.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {jobAlerts.slice(0, 3).map((alert) => (
                    <li
                      key={alert.id}
                      className="border-border/40 flex items-center gap-3 rounded-xl border p-3"
                    >
                      <Bell
                        className={
                          alert.is_active
                            ? 'text-primary h-4 w-4 shrink-0'
                            : 'text-muted-foreground h-4 w-4 shrink-0'
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground truncate font-medium">
                          {alert.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {alert.is_active ? 'Ativo' : 'Pausado'} ·{' '}
                          {alert.frequency === 'instant'
                            ? 'Imediato'
                            : alert.frequency === 'daily'
                              ? 'Diário'
                              : 'Semanal'}
                        </div>
                      </div>
                    </li>
                  ))}
                  {jobAlerts.length > 3 && (
                    <Link
                      to="/candidato/alertas"
                      className="text-primary hover:text-primary/80 block pt-1 text-center text-sm font-medium"
                    >
                      Ver todos ({jobAlerts.length})
                    </Link>
                  )}
                </ul>
              )}
            </Card>

            <div>
              <h2 className="text-foreground mb-3 text-lg font-semibold">
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
                  <Briefcase className="text-primary mx-auto mb-1 h-5 w-5" />
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