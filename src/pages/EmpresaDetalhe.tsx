import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
  Music2,
} from 'lucide-react';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { TimeoutState } from '@/components/fallback/TimeoutState';
import { ErrorState } from '@/components/fallback/ErrorState';
import { NotFoundState } from '@/components/fallback/NotFoundState';
import { useCompanyPublic } from '@/hooks/useCompanies';
import { COMPANY, getWhatsAppUrl } from '@/config';
import type { Company, CompanySocials } from '@/types/domain/company';

const SOCIAL_ICONS: Record<keyof CompanySocials, typeof Linkedin> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music2,
  twitter: Twitter,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
};

const SOCIAL_LABELS: Record<keyof CompanySocials, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitter: 'X (Twitter)',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  website: 'Site oficial',
};

const SOCIAL_ORDER: (keyof CompanySocials)[] = [
  'website',
  'linkedin',
  'instagram',
  'facebook',
  'youtube',
  'tiktok',
  'twitter',
  'whatsapp',
  'email',
];

export default function EmpresaDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { company, isLoading, isTimeout, isError, isNotFound, refetch } =
    useCompanyPublic(slug);

  if (isNotFound) {
    return (
      <Section className="pt-20 md:pt-28">
        <Container>
          <NotFoundState
            title="Empresa não encontrada"
            message="A empresa que você procura não está disponível ou foi removida."
            onBack={() => navigate('/empresas')}
          />
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/empresas')}
              className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver todas as empresas
            </button>
          </div>
        </Container>
      </Section>
    );
  }

  if (isLoading) {
    return (
      <Section className="pt-20 md:pt-28">
        <Container>
          <SectionLoader message="Carregando informações da empresa..." />
        </Container>
      </Section>
    );
  }

  if (isTimeout) {
    return (
      <Section className="pt-20 md:pt-28">
        <Container>
          <TimeoutState onRetry={() => refetch()} />
        </Container>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section className="pt-20 md:pt-28">
        <Container>
          <ErrorState onRetry={() => refetch()} onBack={() => navigate(-1)} />
        </Container>
      </Section>
    );
  }

  if (!company) {
    return (
      <Section className="pt-20 md:pt-28">
        <Container>
          <NotFoundState
            title="Empresa não encontrada"
            message="A empresa que você procura não está disponível."
            onBack={() => navigate('/empresas')}
          />
        </Container>
      </Section>
    );
  }

  return <CompanyContent company={company} onBack={() => navigate(-1)} />;
}

interface CompanyContentProps {
  company: Company;
  onBack: () => void;
}

function CompanyContent({ company, onBack }: CompanyContentProps) {
  const segment = company.company_segment || company.industry;
  const description = company.description || company.short_description;
  const hasSocials = company.socials
    ? SOCIAL_ORDER.some((key) => Boolean(company.socials?.[key]))
    : false;

  const whatsappNumber = company.socials?.whatsapp
    ? company.socials.whatsapp.replace(/\D/g, '')
    : COMPANY.whatsapp;
  const whatsappMessage = `Olá! Visitei a página da empresa ${company.name} no site da ${COMPANY.tradingName} e gostaria de mais informações.`;

  return (
    <div className="min-h-screen">
      <SEO
        title={`${company.name} — ${COMPANY.name}`}
        description={
          description ??
          `Conheça a ${company.name}, empresa atendida pela ${COMPANY.name}.`
        }
        keywords={[
          company.name,
          ...(segment ? [segment] : []),
          'empresa',
          'cliente',
          COMPANY.name,
        ]}
        type="WebSite"
      />

      <section className="relative flex items-center overflow-hidden pt-16 pb-16 lg:pt-20 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsla(215,35%,25%,0.2),transparent_70%)]" />

        <img
          src="/images/backgrounds/hero-grid.svg"
          alt=""
          className="absolute inset-0 h-full w-full opacity-60"
          aria-hidden="true"
        />

        <img
          src="/images/brand/watermark-logo.svg"
          alt=""
          className="absolute right-0 bottom-0 h-[320px] w-[320px] opacity-[0.03] blur-[1px]"
          aria-hidden="true"
        />

        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              type="button"
              onClick={onBack}
              className="text-muted-foreground hover:text-primary mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </motion.div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[auto_1fr]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
              className="bg-card border-border shadow-premium mx-auto flex aspect-square w-40 items-center justify-center overflow-hidden rounded-3xl border p-6 sm:w-48 lg:mx-0"
            >
              <SafeImage
                src={company.logo_url ?? undefined}
                alt={`Logo da ${company.name}`}
                fallbackType="empresas"
                className="h-full w-full"
                objectFit="contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-center lg:text-left"
            >
              {segment && (
                <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                  <Building2 className="h-4 w-4" />
                  <span>{segment}</span>
                </div>
              )}

              <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
                {company.name}
              </h1>

              {description && (
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed lg:mx-0">
                  {description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium transition-colors"
                  >
                    Visitar site
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <a
                  href={getWhatsAppUrl(whatsappNumber, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border bg-transparent px-6 py-3 text-base font-medium transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Entrar em contato
                </a>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {description && description.length > 0 && (
        <Section className="bg-surface-alt">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl"
            >
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Sobre a empresa
              </div>
              <h2 className="text-foreground mb-6 text-3xl font-bold sm:text-4xl">
                Quem é {company.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>
            </motion.div>
          </Container>
        </Section>
      )}

      {(company.size || company.industry || company.cnpj) && (
        <Section>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl"
            >
              <div className="bg-card border-border shadow-premium rounded-2xl border p-8">
                <h3 className="text-foreground mb-6 text-xl font-semibold">
                  Informações institucionais
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {company.industry && (
                    <div>
                      <p className="text-muted-foreground text-sm">Setor</p>
                      <p className="text-foreground font-medium">
                        {company.industry}
                      </p>
                    </div>
                  )}
                  {company.size && (
                    <div>
                      <p className="text-muted-foreground text-sm">Porte</p>
                      <p className="text-foreground font-medium">
                        {company.size}
                      </p>
                    </div>
                  )}
                  {company.cnpj && (
                    <div>
                      <p className="text-muted-foreground text-sm">CNPJ</p>
                      <p className="text-foreground font-medium">
                        {company.cnpj}
                      </p>
                    </div>
                  )}
                  {company.address && (
                    <div>
                      <p className="text-muted-foreground text-sm">Sede</p>
                      <p className="text-foreground font-medium">
                        {formatAddress(company.address)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </Container>
        </Section>
      )}

      {hasSocials && (
        <Section className="bg-surface-alt">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl"
            >
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Globe className="h-4 w-4" />
                Presença digital
              </div>
              <h2 className="text-foreground mb-6 text-3xl font-bold sm:text-4xl">
                Encontre {company.name} nas redes
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SOCIAL_ORDER.filter((key) =>
                  Boolean(company.socials?.[key]),
                ).map((key) => {
                  const url = company.socials?.[key];
                  if (!url) return null;
                  const Icon = SOCIAL_ICONS[key];
                  const label = SOCIAL_LABELS[key];
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-card border-border hover:border-primary/40 group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300"
                    >
                      <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-11 w-11 items-center justify-center rounded-full transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-semibold">
                          {label}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {url}
                        </p>
                      </div>
                      <ExternalLink className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </Container>
        </Section>
      )}

      <Section>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border-border shadow-premium mx-auto max-w-3xl rounded-3xl border p-8 text-center sm:p-12"
          >
            <CheckCircle2 className="text-primary mx-auto mb-4 h-10 w-10" />
            <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
              Quer saber mais sobre {company.name}?
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base">
              Entre em contato com nosso time comercial e descubra como a{' '}
              {COMPANY.name} apoia a operação de empresas como a {company.name}.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {company.phone && (
                <a
                  href={`tel:${company.phone.replace(/\D/g, '')}`}
                  className="border-border text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border bg-transparent px-6 py-3 text-base font-medium transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {company.phone}
                </a>
              )}
              <a
                href={getWhatsAppUrl(whatsappNumber, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Falar pelo WhatsApp
              </a>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}

function formatAddress(address: Record<string, unknown>): string {
  const parts: string[] = [];
  const street = typeof address.street === 'string' ? address.street : null;
  const number = typeof address.number === 'string' ? address.number : null;
  const city = typeof address.city === 'string' ? address.city : null;
  const state = typeof address.state === 'string' ? address.state : null;
  if (street) {
    parts.push(number ? `${street}, ${number}` : street);
  }
  if (city) {
    parts.push(state ? `${city} / ${state}` : city);
  }
  return parts.length ? parts.join(' — ') : 'Não informada';
}
