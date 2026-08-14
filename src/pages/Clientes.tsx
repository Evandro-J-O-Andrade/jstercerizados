import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { CLIENTS_LIST } from '@/mock/clients';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { Building2, Users, Phone } from 'lucide-react';

export default function Clientes() {
  const confirmedClients = CLIENTS_LIST.filter(
    (client) => client.name && client.logo,
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
              Clientes que confiam na J&S
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Empresas que escolheram nossas soluções para apoiar seus processos
              de Recursos Humanos, mão de obra e serviços especializados.
            </p>
          </motion.div>

          {confirmedClients.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
            >
              {confirmedClients.map((client) => (
                <motion.div
                  key={client.id}
                  variants={staggerItem('up')}
                  whileHover={{ scale: 1.05 }}
                  className="group bg-muted/50 border-border/50 relative overflow-hidden rounded-2xl border"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <SafeImage
                      src={client.logo!}
                      fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%232a2a2a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3EEmpresa%3C/text%3E%3C/svg%3E"
                      alt={client.name!}
                      className="h-full w-full object-cover grayscale-[40%] transition-all duration-300 group-hover:grayscale-0"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <span className="text-foreground text-xs font-semibold">
                      {client.name!}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <p className="text-muted-foreground">
                Os clientes desta seção são confirmados diretamente pela J&S.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 text-center"
          >
            <div className="bg-card border-border shadow-premium rounded-3xl border p-8 sm:p-12">
              <Users className="text-primary mx-auto mb-4 h-12 w-12" />
              <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
                Sua empresa também pode ser atendida pela J&S
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
                Converse com nosso time comercial e entenda como podemos apoiar
                sua operação com profissionais qualificados e soluções em RH.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/empresas">
                  <Button variant="primary" size="lg">
                    Conhecer soluções
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
                    Falar com consultor
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
