import { motion } from 'framer-motion';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { Section } from '@/components/sections/Section';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';

export default function Servicos() {
  const { currentTenantId } = useAuth();
  const { services, isLoading, error } = useServices(currentTenantId);

  const rhServices = services.filter((s) => s.category === 'rh');
  const facilitiesServices = services.filter(
    (s) => s.category === 'facilities' || s.category === 'terceirizacao',
  );

  return (
    <>
      <SEO
        title={`Serviços — ${COMPANY.name}`}
        description="Assessoria em RH, recrutamento, mão de obra temporária e efetiva, terceirização, facilities, limpeza, jardinagem e portaria."
        keywords={[
          'serviços',
          'assessoria em RH',
          'recrutamento',
          'mão de obra temporária',
          'terceirização',
          'facilities',
          'limpeza',
          'jardinagem',
          'portaria',
        ]}
        type="WebSite"
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
            <motion.h1
              variants={revealUp}
              className="text-foreground text-4xl font-bold sm:text-5xl"
            >
              Nossos Serviços
            </motion.h1>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Soluções completas em Recursos Humanos e Facilities para apoiar o
              crescimento da sua empresa.
            </motion.p>
          </motion.div>

          {error && (
            <div className="border-destructive/50 bg-destructive/5 mb-6 rounded-xl border p-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {isLoading && services.length === 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-muted/50 border-border/50 rounded-2xl border p-6"
                >
                  <div className="bg-muted mb-4 h-12 w-12 animate-pulse rounded-xl" />
                  <div className="bg-muted mb-2 h-6 w-3/4 animate-pulse rounded" />
                  <div className="bg-muted mb-4 h-4 w-full animate-pulse rounded" />
                  <div className="bg-muted h-10 w-full animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerReveal(0.15)}
              >
                <motion.h2
                  variants={revealUp}
                  className="text-foreground text-2xl font-bold"
                >
                  Soluções em RH
                </motion.h2>
                <motion.p
                  variants={revealUp}
                  className="text-muted-foreground mt-2 mb-6 max-w-2xl text-sm"
                >
                  Soluções em recrutamento, seleção e gestão de pessoas para
                  encontrar o profissional certo para sua equipe.
                </motion.p>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerReveal(0.1)}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {rhServices.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={index}
                    />
                  ))}
                  {rhServices.length === 0 && !isLoading && (
                    <div className="text-muted-foreground col-span-full text-center">
                      Nenhum serviço de RH cadastrado.
                    </div>
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerReveal(0.15)}
                className="mt-16"
              >
                <motion.h2
                  variants={revealUp}
                  className="text-foreground text-2xl font-bold"
                >
                  Soluções Operacionais (Facilities)
                </motion.h2>
                <motion.p
                  variants={revealUp}
                  className="text-muted-foreground mt-2 mb-6 max-w-2xl text-sm"
                >
                  Como solução complementar, oferecemos terceirização de
                  serviços operacionais: limpeza, segurança, portaria e
                  zeladoria.
                </motion.p>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerReveal(0.1)}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {facilitiesServices.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={index}
                    />
                  ))}
                  {facilitiesServices.length === 0 && !isLoading && (
                    <div className="text-muted-foreground col-span-full text-center">
                      Nenhum serviço de facilities cadastrado.
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
