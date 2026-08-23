import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { CLIENTS_LIST } from '@/mock/clients';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl, APP_ENV } from '@/config';
import {
  Building2,
  Users,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useCompanies } from '@/hooks';
import { mapCompanyToClient } from '@/mappers/companies';

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

function ClientCase({
  client,
  index,
  total,
}: {
  client: {
    id: string;
    name: string;
    logo: string | null;
    image?: string | null;
    website?: string | null;
    description?: string | null;
    socials?: { linkedin?: string; instagram?: string } | null;
  };
  index: number;
  total: number;
}) {
  const isEven = index % 2 === 0;
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);

  const showImage = client.image && imageLoaded;
  const primaryMedia = showImage ? client.image! : client.logo!;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -80 : 80 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: prefersReducedMotion ? 0.3 : 0.9,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16 ${index % 2 === 1 ? 'direction-rtl' : ''}`}
      style={{ direction: 'ltr' }}
      onMouseEnter={() => setShowIndicators(true)}
      onMouseLeave={() => setShowIndicators(false)}
    >
      <div
        className={`relative aspect-[16/10] overflow-hidden rounded-3xl ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}
      >
        <motion.div
          initial={{ scale: 1 }}
          whileInView={prefersReducedMotion ? {} : { scale: 1.05 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="absolute inset-0"
        >
          <SafeImage
            src={primaryMedia}
            alt={client.name}
            className="h-full w-full object-cover transition-all duration-700"
            onLoad={() => setImageLoaded(true)}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-6 sm:p-8">
          {client.logo && (
            <div className="mb-4 h-12 w-auto">
              <SafeImage
                src={client.logo}
                alt={client.name}
                className="h-full w-auto object-contain drop-shadow-lg"
              />
            </div>
          )}
          <h3 className="text-2xl font-bold text-white drop-shadow-md sm:text-3xl">
            {client.name}
          </h3>
        </div>
        {showIndicators && !prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 flex flex-col gap-2"
          >
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {index < total - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </motion.div>
        )}
      </div>

      <div className={`${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="max-w-xl">
          {client.description && (
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              {client.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              >
                Conhecer empresa
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {client.socials?.linkedin && (
              <a
                href={client.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
            )}
            {client.socials?.instagram && (
              <a
                href={client.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Clientes() {
  const tenantId = APP_ENV.defaultTenantId || null;
  const { companies, isLoading } = useCompanies(tenantId);

  const realClients = useMemo(() => {
    return companies.map(mapCompanyToClient);
  }, [companies]);

  const confirmedClients = useMemo(() => {
    if (tenantId && realClients.length > 0) {
      return realClients.filter((client) => client.name);
    }
    return CLIENTS_LIST.filter((client) => client.name && client.logo);
  }, [tenantId, realClients]);

  if (isLoading && tenantId) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <p className="text-muted-foreground">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={`Clientes — ${COMPANY.name}`}
        description="Empresas que confiam nas soluções de RH, recrutamento, mão de obra e facilities da J&S Empregos."
        keywords={[
          'clientes',
          'empresas',
          'recrutamento',
          'seleção',
          'RH',
          'terceirização',
          'facilities',
        ]}
        type="WebSite"
      />

      <Section className="pt-20 md:pt-28">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            >
              <Building2 className="h-4 w-4" />
              <span>Relacionamentos J&S</span>
            </motion.div>

            <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
              Relacionamentos que constroem confiança
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              A J&S Empregos LTDA conecta empresas e profissionais com soluções
              em Recursos Humanos, recrutamento, terceirização e facilities.
              Cada parceiro faz parte da nossa história.
            </p>
          </motion.div>
        </Container>
      </Section>

      <Section className="pb-0">
        <Container>
          <div className="mt-20 space-y-20">
            {confirmedClients.map((client, index) => (
              <ClientCase
                key={client.id}
                client={client}
                index={index}
                total={confirmedClients.length}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="mt-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-card border-border shadow-premium rounded-3xl border p-8 sm:p-12">
              <Users className="text-primary mx-auto mb-4 h-12 w-12" />
              <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
                Grandes empresas possuem grandes desafios.
                <br />
                <span className="text-primary">
                  A J&S trabalha para que pessoas e processos estejam à altura
                  deles.
                </span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
                Converse com nosso time comercial e entenda como podemos apoiar
                sua operação com profissionais qualificados e soluções em RH.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/empresas">
                  <Button variant="primary" size="lg">
                    Falar com a J&S
                  </Button>
                </Link>
                <motion.a
                  href={getWhatsAppUrl(
                    COMPANY.whatsapp,
                    WHATSAPP_MESSAGES.comercial,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="outline" size="lg">
                    <Phone className="mr-2 h-5 w-5" />
                    WhatsApp comercial
                  </Button>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
