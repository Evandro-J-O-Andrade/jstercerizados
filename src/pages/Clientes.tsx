import { motion, useInView } from 'framer-motion';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY } from '@/config';
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import { staggerReveal, revealUp } from '@/animations/scroll';

function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('company_relationships')
        .select(
          `
          id,
          relationship_type,
          status,
          started_at,
          ended_at,
          created_at,
          companies (
            id,
            name,
            legal_name,
            status
          )
        `,
        )
        .eq('relationship_type', 'customer')
        .eq('status', 'active')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        relationship_type: string;
        status: string;
        started_at: string | null;
        ended_at: string | null;
        created_at: string;
        companies: Array<{
          id: string;
          name: string;
          legal_name: string | null;
          status: string;
        }> | null;
      }>;
    },
  });
}

function ClientCase({
  client,
  index,
}: {
  client: {
    id: string;
    relationship_type: string;
    status: string;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
    companies: Array<{
      id: string;
      name: string;
      legal_name: string | null;
      status: string;
    }> | null;
  };
  index: number;
}) {
  const isEven = index % 2 === 0;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const displayName =
    client.companies?.[0]?.name ||
    client.companies?.[0]?.legal_name ||
    'Sem nome';
  const legalName = client.companies?.[0]?.legal_name;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -80 : 80 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.9,
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
          whileInView={{ scale: 1.05 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="absolute inset-0"
        >
          <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-6xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-white drop-shadow-md sm:text-3xl">
            {displayName}
          </h3>
          {legalName && (
            <p className="mt-1 text-sm text-white/80">{legalName}</p>
          )}
        </div>
      </div>

      <div className={`${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="max-w-xl">
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            {displayName}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Clientes() {
  const { data: customers = [] } = useCustomers();
  const confirmedClients = customers.filter(
    (client) => client.status === 'active',
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
      />
      <Section className="pt-20 md:pt-28">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Clientes que Confiam na J&S
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Conheça algumas das empresas que escolheram nossas soluções.
            </motion.p>
          </motion.div>

          <div className="space-y-24">
            {confirmedClients.map((client, index) => (
              <ClientCase key={client.id} client={client} index={index} />
            ))}
          </div>

          {confirmedClients.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-20 text-center"
            >
              <p className="text-muted-foreground text-lg">
                Nenhum cliente encontrado no momento.
              </p>
            </motion.div>
          )}
        </Container>
      </Section>
    </div>
  );
}
