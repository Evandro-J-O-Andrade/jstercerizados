import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { Building2, Users, Phone } from 'lucide-react';
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import type { CompanyPublic } from '@/types/domain/company';

function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('companies')
        .select('id, legal_name, status')
        .order('created_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data || []) as CompanyPublic[];
    },
  });
}

function useReducedMotion() {
  return false;
}

function ClientCase({
  client,
  index,
}: {
  client: {
    id: string;
    legal_name: string;
    status: string;
  };
  index: number;
}) {
  const isEven = index % 2 === 0;
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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
          <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-6xl font-bold">
            {client.legal_name
              ? client.legal_name.charAt(0).toUpperCase()
              : '?'}
          </div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-white drop-shadow-md sm:text-3xl">
            {client.legal_name}
          </h3>
        </div>
      </div>

      <div className={`${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="max-w-xl">
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            {client.legal_name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Clientes() {
  const { data: companies = [] } = useCompanies();
  const confirmedClients = companies.filter(
    (company) => company.status === 'active',
  );

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
              <ClientCase key={client.id} client={client} index={index} />
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
