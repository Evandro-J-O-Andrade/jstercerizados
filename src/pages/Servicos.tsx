import { motion } from 'framer-motion';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { Section } from '@/components/sections/Section';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockServices } from '@/services/mock/services';
import { COMPANY } from '@/config';

export default function Servicos() {
  const rhServices = mockServices.filter((s) => s.category === 'rh');
  const facilitiesServices = mockServices.filter(
    (s) => s.category === 'facilities' || s.category === 'terceirizacao',
  );

  return (
    <div className="pt-16 lg:pt-20">
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

          {/* Soluções em RH */}
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
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {rhServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </motion.div>
          </motion.div>

          {/* Soluções Operacionais (Facilities) */}
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
              Como solução complementar, oferecemos terceirização de serviços
              operacionais: limpeza, segurança, portaria e zeladoria.
            </motion.p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {facilitiesServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
