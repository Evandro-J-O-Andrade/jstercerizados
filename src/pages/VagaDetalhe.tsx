import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { JobApplicationForm } from '@/components/forms/JobApplicationForm';
import { COMPANY } from '@/config';
import { ArrowLeft, MapPin, DollarSign, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';

const CONTRATO_LABELS: Record<string, string> = {
  clt: 'CLT',
  temporary: 'Temporário',
  internship: 'Estágio',
  freelance: 'Freela',
};

export default function VagaDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const { data: vaga, isLoading } = useQuery({
    queryKey: ['job', slug],
    queryFn: async () => {
      if (!slug) return null;
      const supabase = getSupabaseClient();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('jobs')
        .select(
          `
          id, title, description, status, employment_type, location, salary, benefits, requirements, published_at, created_at,
          company_id,
          companies (
            id,
            name,
            legal_name,
            status
          )
        `,
        )
        .eq('id', slug)
        .eq('tenant_id', 'd480af07-ab6b-4561-ac3a-2a0b0c1267b5')
        .maybeSingle();
      if (error) throw error;
      return (
        ((data ?? null) as typeof data & {
          companies: Array<{
            id: string;
            name: string;
            legal_name: string | null;
            status: string;
          }> | null;
        }) ?? null
      );
    },
    enabled: Boolean(slug),
  });

  const beneficiosList = useMemo(() => {
    if (!vaga?.benefits) return [];
    return vaga.benefits
      .split(';')
      .map((item: string) => item.trim())
      .filter(Boolean);
  }, [vaga?.benefits]);

  const employmentTypeLabel =
    vaga?.employment_type &&
    CONTRATO_LABELS[vaga.employment_type.toLowerCase()];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Section className="pt-20 md:pt-28">
          <Container>
            <div className="flex items-center justify-center py-20">
              <div className="border-primary/30 border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
            </div>
          </Container>
        </Section>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen">
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

  return (
    <div className="min-h-screen">
      <SEO
        title={`${vaga.title} — ${COMPANY.name}`}
        description={
          vaga.description ||
          `Oportunidade de ${vaga.title} na ${COMPANY.name}.`
        }
        keywords={[
          vaga.title,
          vaga.location || '',
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
                  {vaga.title}
                </h1>
                {employmentTypeLabel && (
                  <span
                    className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      employmentTypeLabel === 'CLT'
                        ? 'bg-success/10 text-success'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {employmentTypeLabel}
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
            >
              {vaga.companies?.[0]?.name && (
                <div className="flex items-center gap-3">
                  <Building2 className="text-primary h-5 w-5" />
                  <span className="text-sm">{vaga.companies[0].name}</span>
                </div>
              )}
              {vaga.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="text-primary h-5 w-5" />
                  <span className="text-sm">{vaga.location}</span>
                </div>
              )}
              {vaga.salary && (
                <div className="flex items-center gap-3">
                  <DollarSign className="text-primary h-5 w-5" />
                  <span className="text-sm">{vaga.salary}</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {vaga.description && (
                <div className="border-border mb-8 border-t pt-8">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Sobre a vaga
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {vaga.description}
                  </p>
                </div>
              )}

              {vaga.requirements && (
                <div className="border-border mb-8 border-t pt-8">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Requisitos e qualificações
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {vaga.requirements}
                  </p>
                </div>
              )}

              {beneficiosList.length > 0 && (
                <div className="border-border mb-8 border-t pt-8">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Benefícios
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {beneficiosList.map((beneficio: string) => (
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
              <JobApplicationForm jobTitle={vaga.title} />
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
