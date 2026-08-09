import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { PARTNERS_LOGOS } from '@/mock/partners';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { Phone, Building2, Users, MapPin, CheckCircle2 } from 'lucide-react';

export default function Empresas() {
  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      <SEO
        title="Para Empresas — J&S Terceirizados"
        description="Soluções em recrutamento, seleção, mão de obra temporária e efetiva, terceirização e facilities para empresas."
        keywords={[
          'empresas',
          'recrutamento',
          'seleção',
          'mão de obra temporária',
          'terceirização',
          'facilities',
          'RH',
          'vagas',
        ]}
        type="WebSite"
      />
      <Section className="pt-20 md:pt-28">
        <Container>
          {/* Hero */}
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
              <span>Para Empresas Parceiras</span>
            </motion.div>

            <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
              Encontre profissionais qualificados para sua equipe
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Nossa assessoria em RH e soluções de terceirização conectam
              empresas aos melhores talentos do mercado através de recrutamento,
              seleção e banco de candidatos.
            </p>
          </motion.div>

          {/* CTA principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Link to="/trabalhe-conosco">
              <Button variant="primary" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Divulgar Vaga
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
                Falar com um consultor
              </Button>
            </motion.a>
          </motion.div>

          {/* Benefícios */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                title: 'Banco de Talentos',
                desc: 'Acesso a milhares de profissionais pré-qualificados.',
                icon: Users,
              },
              {
                title: 'Recrutamento Ágil',
                desc: 'Encontramos os profissionais certos em até 7 dias.',
                icon: MapPin,
              },
              {
                title: 'WhatsApp First',
                desc: 'Atendimento e acompanhamento via WhatsApp.',
                icon: Phone,
              },
              {
                title: 'Garantia de Qualidade',
                desc: 'Satisfação garantida ou substituímos o profissional.',
                icon: CheckCircle2,
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem('up')}
                className="text-center"
              >
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Estatísticas */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mt-16 grid grid-cols-2 gap-6 text-center md:grid-cols-4"
          >
            <motion.div variants={staggerItem('up')}>
              <div className="text-foreground text-3xl font-bold">
                +{COMPANY.professionals.toLocaleString('pt-BR')}
              </div>
              <p className="text-muted-foreground text-sm">
                Profissionais no banco
              </p>
            </motion.div>
            <motion.div variants={staggerItem('up')}>
              <div className="text-foreground text-3xl font-bold">
                +{COMPANY.clientsServed.toLocaleString('pt-BR')}
              </div>
              <p className="text-muted-foreground text-sm">
                Empresas atendidas
              </p>
            </motion.div>
            <motion.div variants={staggerItem('up')}>
              <div className="text-foreground text-3xl font-bold">
                +{COMPANY.citiesCovered}
              </div>
              <p className="text-muted-foreground text-sm">Cidades atendidas</p>
            </motion.div>
            <motion.div variants={staggerItem('up')}>
              <div className="text-foreground text-3xl font-bold">
                +{COMPANY.yearsOfExperience}
              </div>
              <p className="text-muted-foreground text-sm">
                Anos de experiência
              </p>
            </motion.div>
          </motion.div>

          {/* Empresas parceiras */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mt-16"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-center text-3xl font-bold sm:text-4xl"
            >
              Empresas Parceiras
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6"
            >
              {PARTNERS_LOGOS.map((partner) => (
                <motion.div
                  key={partner.name}
                  variants={staggerItem('up')}
                  whileHover={{ scale: 1.05 }}
                  className="group bg-muted/50 relative overflow-hidden rounded-2xl border border-white/5"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <SafeImage
                      src={partner.photo}
                      fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%232a2a2a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3EEmpresa%3C/text%3E%3C/svg%3E"
                      alt={partner.name}
                      className="h-full w-full object-cover grayscale-[40%] transition-all duration-300 group-hover:grayscale-0"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <span className="text-foreground text-xs font-semibold">
                      {partner.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
