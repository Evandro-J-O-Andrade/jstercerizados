import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { JobApplicationForm } from '@/components/forms/JobApplicationForm';
import { mockGetVagaBySlug } from '@/services/mock/vagas';
import { COMPANY } from '@/config';
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import type { Vaga } from '@/types/common';

const CONTRATO_LABELS: Record<Vaga['tipoContrato'], string> = {
  CLT: 'CLT',
  ESTAGIO: 'Estágio',
  TEMPORARIO: 'Temporário',
  FREELA: 'Freelance',
  TERCEIRIZADO: 'Terceirizado',
  CD: 'C/D',
};

const MODALIDADE_LABELS: Record<Vaga['modalidade'], string> = {
  PRESENCIAL: 'Presencial',
  HIBRIDO: 'Híbrido',
  REMOTO: 'Remoto',
};

export default function VagaDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const vaga = slug ? mockGetVagaBySlug(slug) : undefined;

  if (!vaga) {
    return (
      <div className="min-h-screen pt-16 lg:pt-20">
        <Section className="pt-20 md:pt-28">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-foreground text-4xl font-bold sm:text-5xl">
                Vaga não encontrada
              </h1>
              <p className="text-muted-foreground mx-auto mt-4 max-w-md text-lg">
                A vaga que você está procurando não existe ou foi preenchida.
              </p>
              <Link to="/vagas">
                <Button variant="secondary" size="lg" className="mt-8">
                  Ver todas as vagas
                </Button>
              </Link>
            </motion.div>
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

  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      <SEO
        title={`${vaga.titulo} — ${COMPANY.name}`}
        description={vaga.descricao}
        keywords={[
          vaga.titulo,
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
              <div>
                <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {vaga.titulo}
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  {vaga.empresa}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  vaga.tipoContrato === 'CLT'
                    ? 'bg-success/10 text-success'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {CONTRATO_LABELS[vaga.tipoContrato]}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
            >
              <div className="flex items-center gap-3">
                <MapPin className="text-primary h-5 w-5" />
                <span className="text-sm">
                  {vaga.cidade}, {vaga.estado}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-primary h-5 w-5" />
                <span className="text-sm">
                  {MODALIDADE_LABELS[vaga.modalidade]}
                </span>
              </div>
              {vaga.salarioMin && (
                <div className="flex items-center gap-3">
                  <DollarSign className="text-primary h-5 w-5" />
                  <span className="text-sm">
                    {formatCurrency(vaga.salarioMin)}
                    {vaga.salarioMax
                      ? ' – ' + formatCurrency(vaga.salarioMax)
                      : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Briefcase className="text-primary h-5 w-5" />
                <span className="text-sm">{vaga.vagas} vaga(s)</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="border-border mb-8 border-t pt-8">
                <h2 className="text-foreground mb-4 text-xl font-semibold">
                  Sobre a vaga
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {vaga.descricao}
                </p>
              </div>

              <div className="border-border mb-8 border-t pt-8">
                <h2 className="text-foreground mb-4 text-xl font-semibold">
                  Requisitos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {vaga.requisitos}
                </p>
              </div>

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
              <JobApplicationForm
                jobTitle={vaga.titulo}
                jobSlug={vaga.slug}
                vagaId={vaga.id}
              />
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
