import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { JobApplicationForm } from '@/components/forms/JobApplicationForm';
import { NotFoundState } from '@/components/fallback/NotFoundState';
import { usePublicJobBySlugAsVaga } from '@/hooks/useJobs';
import { COMPANY } from '@/config';
import { SafeImage } from '@/components/ui/SafeImage';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  CalendarDays,
  Hourglass,
} from 'lucide-react';

const CONTRATO_LABELS: Record<string, string> = {
  CLT: 'CLT',
  ESTAGIO: 'Estágio',
  TEMPORARIO: 'Temporário',
  FREELA: 'Freelance',
  TERCEIRIZADO: 'Terceirizado',
  CD: 'C/D',
};

const MODALIDADE_LABELS: Record<string, string> = {
  PRESENCIAL: 'Presencial',
  HIBRIDO: 'Híbrido',
  REMOTO: 'Remoto',
};

const NIVEL_LABELS: Record<string, string> = {
  ESTAGIO: 'Estágio',
  JUNIOR: 'Júnior',
  PLENO: 'Pleno',
  SENIOR: 'Sênior',
  MASTER: 'Master',
  LIDERANCA: 'Liderança',
};

function formatDate(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function VagaDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { job: vaga, isLoading, isNotFound } = usePublicJobBySlugAsVaga(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <p className="text-muted-foreground">Carregando vaga...</p>
      </div>
    );
  }

  if (!vaga || isNotFound) {
    return (
      <div className="min-h-screen">
        <Section className="pt-20 md:pt-28">
          <Container>
            <NotFoundState
              title="Vaga não encontrada"
              message="A vaga que você está procurando não existe ou foi preenchida."
              backLabel="Ver todas as vagas"
              onBack={() => navigate('/vagas')}
            />
          </Container>
        </Section>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const publishedAtLabel = formatDate(vaga.dataPublicacao);
  const expiresAtLabel = formatDate(vaga.expiresAt);
  const qtyVagas =
    typeof vaga.vagas === 'number' && vaga.vagas > 1
      ? `${vaga.vagas} vagas`
      : null;
  const nivelLabel = vaga.nivel ? NIVEL_LABELS[vaga.nivel] : null;
  const salaryDisplay =
    vaga.salarioMin != null
      ? `${formatCurrency(vaga.salarioMin)}${
          vaga.salarioTipo === 'hora' ? ' / hora' : ''
        }${
          vaga.salarioTipo !== 'hora' && vaga.salarioMax
            ? ' – ' + formatCurrency(vaga.salarioMax)
            : ''
        }`
      : (vaga.salarioTexto ?? null);

  return (
    <div className="min-h-screen">
      <SEO
        title={`${vaga.titulo} — ${COMPANY.name}`}
        description={
          vaga.descricao || `Oportunidade de ${vaga.titulo} na ${COMPANY.name}.`
        }
        keywords={[
          vaga.titulo,
          vaga.area || '',
          'vaga',
          'emprego',
          'trabalho',
          COMPANY.name,
          'RH',
          'recrutamento',
          'seleção',
        ]}
        type="WebSite"
      />
      <Section className="pt-20 md:pt-32">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/vagas"
              className="text-muted-foreground hover:text-primary mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para vagas
            </Link>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-8 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {vaga.empresaLogo && (
                  <div className="bg-card border-border flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                    <SafeImage
                      src={vaga.empresaLogo}
                      alt={vaga.empresa ?? 'Logo da empresa'}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
                    {vaga.titulo}
                  </h1>
                  {vaga.empresa && (
                    <p className="text-muted-foreground mt-2 text-lg">
                      {vaga.empresa}
                    </p>
                  )}
                  <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {nivelLabel && <span>• {nivelLabel}</span>}
                    {qtyVagas && <span>• {qtyVagas}</span>}
                    {publishedAtLabel && (
                      <span className="inline-flex items-center gap-1">
                        • <CalendarDays className="h-3 w-3" /> Publicada em{' '}
                        {publishedAtLabel}
                      </span>
                    )}
                    {expiresAtLabel && (
                      <span className="inline-flex items-center gap-1">
                        • <Hourglass className="h-3 w-3" /> Expira em{' '}
                        {expiresAtLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {vaga.tipoContrato && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    vaga.tipoContrato === 'CLT'
                      ? 'bg-success/10 text-success'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {CONTRATO_LABELS[vaga.tipoContrato]}
                </span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
            >
              {vaga.area && (
                <div className="flex items-center gap-3">
                  <Briefcase className="text-primary h-5 w-5" />
                  <span className="text-sm">{vaga.area}</span>
                </div>
              )}
              {vaga.cidade && vaga.estado && (
                <div className="flex items-center gap-3">
                  <MapPin className="text-primary h-5 w-5" />
                  <span className="text-sm">
                    {vaga.cidade}, {vaga.estado}
                  </span>
                </div>
              )}
              {vaga.workSchedule && (
                <div className="flex items-center gap-3">
                  <Clock className="text-primary h-5 w-5" />
                  <span className="text-sm">{vaga.workSchedule}</span>
                </div>
              )}
              {vaga.modalidade && (
                <div className="flex items-center gap-3">
                  <Briefcase className="text-primary h-5 w-5" />
                  <span className="text-sm">
                    {MODALIDADE_LABELS[vaga.modalidade]}
                  </span>
                </div>
              )}
              {salaryDisplay && (
                <div className="flex items-center gap-3">
                  <DollarSign className="text-primary h-5 w-5" />
                  <span className="text-sm">{salaryDisplay}</span>
                </div>
              )}
              {vaga.workload && (
                <div className="flex items-center gap-3">
                  <Clock className="text-primary h-5 w-5" />
                  <span className="text-sm">{vaga.workload}</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {vaga.descricao && (
                <div className="border-border mb-8 border-t pt-8">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Sobre a vaga
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {vaga.descricao}
                  </p>
                </div>
              )}

              {vaga.responsibilities && (
                <div className="border-border mb-8 border-t pt-8">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Responsabilidades e atribuições
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {vaga.responsibilities}
                  </p>
                </div>
              )}

              {vaga.requisitos && (
                <div className="border-border mb-8 border-t pt-8">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Requisitos e qualificações
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {vaga.requisitos}
                  </p>
                </div>
              )}

              {vaga.beneficios && vaga.beneficios.length > 0 && (
                <div className="border-border mb-8 border-t pt-8">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Benefícios
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {vaga.beneficios.map((beneficio) => (
                      <span
                        key={beneficio}
                        className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium"
                      >
                        {beneficio}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <JobApplicationForm jobTitle={vaga.titulo} />
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
