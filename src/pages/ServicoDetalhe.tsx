import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Shield,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { ServiceRequestForm } from '@/components/forms/ServiceRequestForm';
import { mockGetServiceBySlug } from '@/services/mock/services';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { SERVICE_IMAGES } from '@/content/assets';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';

const faqData = [
  {
    question: 'Qual a cobertura de atendimento?',
    answer:
      'Atendemos em mais de 50 cidades, com cobertura completa para garantir agilidade e presen�a onde voc� precisa.',
  },
  {
    question: 'Como funciona o processo de contrata��o?',
    answer:
      'Solicite um or�amento pelo site ou pelo WhatsApp. Nossa equipe analisa suas necessidades e elabora uma proposta personalizada.',
  },
  {
    question: 'Qual o prazo para in�cio do servi�o?',
    answer:
      'Ap�s a aprova��o da proposta, iniciamos a opera��o em at� 7 dias �teis, com profissionais treinados e equipados.',
  },
  {
    question: 'Os profissionais s�o treinados e certificados?',
    answer:
      'Sim. Nossa equipe � selecionada, certificada e continuamente treinada para cada segmento de servi�o.',
  },
  {
    question: 'Voc�s oferecem garantia de qualidade?',
    answer:
      'Sim. Trabalhamos com SLA, KPIs e compliance total das normas do setor, com gest�o de performance em tempo real.',
  },
];

export default function ServicoDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const service = mockGetServiceBySlug(slug ?? '');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!service) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Servi�o n�o encontrado
          </h2>
          <Link to="/servicos">
            <Button variant="primary">Voltar aos Servi�os</Button>
          </Link>
        </div>
      </div>
    );
  }

  const heroImage =
    service.image && !service.image.includes('fallbacks')
      ? service.image
      : (SERVICE_IMAGES[service.slug as keyof typeof SERVICE_IMAGES] ??
        SERVICE_IMAGES.facilitiesFallback);

  return (
    <div>
      <SEO
        title={`${service.title} � ${COMPANY.name}`}
        description={service.shortDescription}
        keywords={[
          service.title,
          'servi�os',
          COMPANY.name,
          'RH',
          'terceiriza��o',
          'facilities',
          'limpeza',
          'jardinagem',
          'portaria',
        ]}
        type="Service"
      />
      {/* Premium Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden pt-16 lg:pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsla(215,35%,25%,0.3),transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="absolute inset-0"
        >
          <SafeImage
            src={heroImage}
            alt={service.title}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <img
            src="/images/hero/hero-overlay.svg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-65"
            aria-hidden="true"
          />
        </motion.div>

        <div className="from-background/95 via-background/70 absolute inset-0 bg-gradient-to-r to-transparent" />
        <div className="from-background via-background/30 to-background/10 absolute inset-0 bg-gradient-to-t" />

        <img
          src="/images/backgrounds/hero-grid.svg"
          alt=""
          className="absolute inset-0 h-full w-full opacity-80"
          aria-hidden="true"
        />

        <img
          src="/images/brand/watermark-logo.svg"
          alt=""
          className="absolute right-0 bottom-0 h-[400px] w-[400px] opacity-[0.03] blur-[1px]"
          aria-hidden="true"
        />

        <motion.div
          className="bg-primary/10 animate-pulse-glow absolute top-1/4 left-1/4 hidden h-2 w-2 rounded-full md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <motion.div
          className="bg-primary/10 animate-pulse-glow absolute top-1/3 right-1/4 hidden h-3 w-3 rounded-full md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        />
        <motion.div
          className="bg-primary/15 animate-float-slow absolute right-1/3 bottom-1/3 hidden h-5 w-5 rounded-full opacity-70 md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <Link
              to="/servicos"
              className="text-primary hover:text-primary/80 mb-6 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Todos os Servi�os
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              <div className="bg-primary/10 text-primary border-primary/20 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur">
                <Shield className="h-4 w-4" />
                <span>{service.title}</span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                className="text-foreground text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
              >
                {service.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed"
              >
                {service.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <motion.a
                  href={getWhatsAppUrl(
                    COMPANY.whatsapp,
                    WHATSAPP_MESSAGES.services,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="secondary" size="lg">
                    <Phone className="mr-2 h-5 w-5" />
                    Solicitar Or�amento
                  </Button>
                </motion.a>
                <Link to="/contato">
                  <Button variant="outline" size="lg">
                    Fale Conosco
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="bg-card/30 border-border relative aspect-[4/3] overflow-hidden rounded-3xl border backdrop-blur-sm">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover opacity-80"
                    loading="lazy"
                    width={600}
                    height={450}
                  />
                  <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                </div>
              </motion.div>

              <motion.div
                className="bg-card/40 shadow-glass animate-float-fast border-border/20 absolute -bottom-6 -left-6 rounded-2xl border p-5 backdrop-blur"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary shadow-glow flex h-11 w-11 items-center justify-center rounded-full">
                    <Zap className="text-primary-foreground h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      Excel�ncia Operacional
                    </p>
                    <p className="text-muted-foreground text-xs">
                      SLA + KPIs + Compliance
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <span className="text-muted-foreground mb-2 text-xs font-medium">
            Role para descer
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="text-muted-foreground h-5 w-5 rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {[
              {
                label: 'Profissionais',
                value: COMPANY.professionals,
                icon: Shield,
              },
              {
                label: 'Anos de Experi�ncia',
                value: `${COMPANY.yearsOfExperience}+`,
                icon: Clock,
              },
              {
                label: 'Clientes Atendidos',
                value: COMPANY.clientsServed,
                icon: Zap,
              },
              {
                label: 'Cidades',
                value: COMPANY.citiesCovered,
                icon: MapPin,
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerItem('up')}
                className="text-center"
              >
                <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-foreground text-3xl font-bold">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* About */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Sobre o Servi�o
              </div>
              <h2 className="text-foreground mb-6 text-3xl font-bold sm:text-4xl">
                {service.title} com Excel�ncia
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nossa equipe de profissionais � altamente treinada e certificada
                para entregar resultados excepcionais em{' '}
                {service.title.toLowerCase()}. Utilizamos tecnologia de ponta e
                processos rigorosos de gest�o de qualidade para garantir a
                seguran�a e a satisfa��o dos nossos clientes.
              </p>

              <div className="mt-8 space-y-4">
                {service.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <motion.a
                  href={getWhatsAppUrl(
                    COMPANY.whatsapp,
                    WHATSAPP_MESSAGES.services,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="secondary" size="lg">
                    <Phone className="mr-2 h-5 w-5" />
                    Solicitar Or�amento
                  </Button>
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card shadow-premium rounded-3xl p-8"
            >
              <h3 className="text-foreground mb-6 text-xl font-semibold">
                Informa��es de Contato
              </h3>
              <div className="space-y-4">
                <div className="text-muted-foreground flex items-center gap-3">
                  <Phone className="text-primary h-5 w-5" />
                  <span>{COMPANY.phone}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-3">
                  <Mail className="text-primary h-5 w-5" />
                  <span>{COMPANY.email}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-3">
                  <Clock className="text-primary h-5 w-5" />
                  <span>Segunda a Sexta, 08h �s 18h</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-3">
                  <MapPin className="text-primary h-5 w-5" />
                  <span>
                    {COMPANY.address.city}, {COMPANY.address.state} � Brasil
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Process Timeline */}
      <Section className="bg-surface-alt">
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
              Como Trabalhamos
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Um processo estruturado para garantir a qualidade e a agilidade na
              presta��o do servi�o.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Solicita��o',
                description:
                  'Entre em contato pelo site ou WhatsApp com suas necessidades.',
              },
              {
                step: '02',
                title: 'An�lise',
                description:
                  'Nossa equipe avalia o perfil e prepara uma proposta personalizada.',
              },
              {
                step: '03',
                title: 'Proposta',
                description:
                  'Apresentamos a solu��o ideal com custos e prazos detalhados.',
              },
              {
                step: '04',
                title: 'Execu��o',
                description:
                  'Iniciamos a opera��o com profissionais treinados e equipados.',
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative text-center"
              >
                {index < 3 && (
                  <div className="bg-border absolute top-8 right-[-2rem] left-[calc(50%+2rem)] hidden h-0.5 md:block" />
                )}
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    {step.step}
                  </motion.span>
                </div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.1 }}
                  className="text-foreground mb-2 text-lg font-semibold"
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.15 }}
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Benefits */}
      <Section>
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
              Por que escolher {service.title}?
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Nossos diferenciais garantem a melhor experi�ncia para o seu
              neg�cio.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {[
              {
                title: 'Profissionais Certificados',
                description:
                  'Equipe selecionada, treinada e certificada para cada segmento.',
                icon: Shield,
              },
              {
                title: 'Tecnologia Integrada',
                description:
                  'Monitoramento e gest�o em tempo real para total controle.',
                icon: Zap,
              },
              {
                title: 'Suporte 24/7',
                description:
                  'Atendimento cont�nuo para garantir a opera��o sem interrup��es.',
                icon: Clock,
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem('up')}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-card shadow-premium group relative rounded-3xl p-8 pt-14 text-center transition-all duration-300"
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground absolute -top-8 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full transition-all duration-300">
                  <item.icon className="h-8 w-8 transition-transform group-hover:scale-110" />
                </div>
                <div className="mt-8">
                  <h3 className="text-foreground group-hover:text-primary mb-3 text-xl font-semibold transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Gallery */}
      <Section className="bg-surface-alt">
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
              Galeria
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Confira alguns momentos do nosso trabalho em{' '}
              {service.title.toLowerCase()}.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              '/images/servicos/gallery-01.svg',
              '/images/servicos/gallery-02.svg',
              '/images/servicos/gallery-03.svg',
              '/images/servicos/gallery-04.svg',
            ].map((img, index) => (
              <motion.div
                key={index}
                variants={staggerItem('up')}
                whileHover={{ scale: 1.03 }}
                className="relative aspect-square overflow-hidden rounded-2xl"
              >
                <img
                  src={img}
                  alt={`${service.title} - Imagem ${index + 1}`}
                  className="h-full w-full object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
                  loading="lazy"
                />
                <div className="from-background/60 absolute inset-0 bg-gradient-to-t to-transparent" />
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
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
              Perguntas Frequentes
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Respostas para as d�vidas mais comuns sobre nossos servi�os.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="mx-auto max-w-3xl space-y-4"
          >
            {faqData.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-card shadow-premium overflow-hidden rounded-2xl"
              >
                <button
                  className="flex w-full items-center justify-between p-6 text-left"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-foreground text-sm font-medium">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`text-primary h-5 w-5 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === index ? 'auto' : 0,
                    opacity: openFaq === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-muted-foreground px-6 pb-6 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section className="bg-muted">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative overflow-hidden rounded-3xl p-8 text-center sm:p-12"
          >
            <div className="animate-pulse-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsla(var(--primary),0.15),transparent_60%)]" />
            <div className="bg-primary/5 animate-float-slow absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" />
            <div className="bg-primary/5 animate-float-medium absolute -bottom-20 -left-20 h-60 w-60 rounded-full blur-3xl" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <h2 className="text-foreground text-3xl font-bold sm:text-4xl">
                Pronto para contratar {service.title}?
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Solicite uma proposta gratuita e descubra como podemos elevar o
                padr�o dos seus servi�os.
              </p>

              <div className="mt-8">
                <ServiceRequestForm
                  serviceSlug={service.slug}
                  serviceName={service.title}
                />
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
