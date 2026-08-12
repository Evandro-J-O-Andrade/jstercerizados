import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield,
  Search,
  Users,
  Building2,
  FileText,
  Briefcase,
  Zap,
  CheckCircle2,
  Heart,
  ArrowRight,
  MapPin,
  Phone,
  Quote,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { HeroSplit } from '@/components/sections/HeroSplit';
import { InactivityShowcase } from '@/components/sections/InactivityShowcase';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { mockGetVagas } from '@/services/mock/vagas';
import { PARTNERS_LOGOS } from '@/mock/partners';
import { CLIENT_TESTIMONIALS } from '@/mock/clients';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { HERO_SLIDES } from '@/content/homeHero';

const heroSlides = HERO_SLIDES.map((slide) => ({
  id: slide.id,
  image: slide.image,
  alt: slide.imageAlt,
  eyebrow: (
    <span className="flex items-center gap-2">
      <slide.eyebrowIcon className="h-4 w-4" />
      {slide.eyebrow}
    </span>
  ),
  title: slide.title,
  description: slide.description,
  cta: (
    <>
      <Link to={slide.primaryCta.href}>
        <Button
          variant="secondary"
          size="xl"
          className="shadow-glow-lg h-14 rounded-[18px] px-8 py-4 text-base motion-safe:duration-300"
        >
          {slide.primaryCta.label}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
      <Link to={slide.secondaryCta.href}>
        <Button
          variant="outline"
          size="xl"
          className="border-border/30 text-foreground hover:bg-muted h-14 rounded-[18px] px-8 py-4 text-base backdrop-blur motion-safe:duration-300"
        >
          {slide.secondaryCta.label}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
      <div className="text-muted-foreground mt-6 flex flex-col gap-3 text-sm">
        <span>Está procurando uma oportunidade?</span>
        <Link to={slide.candidateCta.href}>
          <Button variant="ghost" size="sm">
            {slide.candidateCta.label}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </>
  ),
}));

const steps = [
  {
    step: '01',
    title: 'Cadastre seu currículo',
    description: 'Preencha seus dados em poucos minutos.',
  },
  {
    step: '02',
    title: 'Candidate-se',
    description: 'Escolha as vagas que combinam com seu perfil.',
  },
  {
    step: '03',
    title: 'Processo Seletivo',
    description: 'Nossa equipe entra em contato quando houver compatibilidade.',
  },
  {
    step: '04',
    title: 'Contratação',
    description: 'Você inicia sua nova oportunidade.',
  },
];

const blogPosts = [
  {
    title: 'Como fazer um currículo vencedor',
    href: '/blog',
    category: 'Carreira',
    date: '2026-07-15',
  },
  {
    title: 'Como se preparar para entrevistas',
    href: '/blog',
    category: 'Entrevista',
    date: '2026-07-10',
  },
  {
    title: 'Tendências do mercado de trabalho',
    href: '/blog',
    category: 'Mercado',
    date: '2026-07-05',
  },
  {
    title: 'Dicas para conquistar seu primeiro emprego',
    href: '/blog',
    category: 'Carreira',
    date: '2026-06-28',
  },
];

const differentials = [
  {
    title: 'Atendimento rápido',
    description: 'Respostas ágeis para candidatos e empresas, sem burocracia.',
    icon: Zap,
  },
  {
    title: 'Empresas parceiras',
    description: 'Rede de empresas confiantes que contratam pela J&S.',
    icon: Building2,
  },
  {
    title: 'Equipe especializada em RH',
    description: 'Profissionais com experiência em recrutamento e seleção.',
    icon: Users,
  },
  {
    title: 'Processos seletivos eficientes',
    description:
      'Metodologia rápida e humanizada para reduzir o tempo de contratação.',
    icon: CheckCircle2,
  },
  {
    title: 'Atendimento humanizado',
    description: 'Acompanhamento próximo para candidatos e empresas.',
    icon: Heart,
  },
  {
    title: 'Experiência em terceirização e facilities',
    description: 'Soluções operacionais integradas com conformidade total.',
    icon: Briefcase,
  },
];

const empresaSolutions = [
  {
    title: 'Mão de Obra Temporária',
    description:
      'Profissionais qualificados para demandas sazonais ou projetos específicos.',
    href: '/servicos/mao-de-obra-temporaria',
    icon: Users,
    highlight: true,
  },
  {
    title: 'Mão de Obra Efetiva',
    description:
      'Contratação de profissionais permanentes com seleção completa e acompanhamento.',
    href: '/servicos/mao-de-obra-efetiva',
    icon: Users,
    highlight: true,
  },
  {
    title: 'Assessoria em RH',
    description:
      'Profissional de RH dedicado para recrutamento, gestão e consultoria estratégica.',
    href: '/servicos/assessoria-rh',
    icon: Shield,
  },
  {
    title: 'Recrutamento e Seleção',
    description:
      'Encontramos o profissional certo para sua empresa com agilidade e assertividade.',
    href: '/servicos/recrutamento-selecao',
    icon: Search,
  },
  {
    title: 'Processo de RH',
    description:
      'Estruturamos todo o processo de recrutamento e seleção da sua empresa.',
    href: '/servicos/processo-de-rh',
    icon: Shield,
  },
  {
    title: 'Banco de Talentos',
    description:
      'Cadastre seu currículo e seja encontrado por empresas parceiras.',
    href: '/trabalhe-conosco',
    icon: Users,
  },
];

const facilitiesSolutions = [
  {
    title: 'Limpeza',
    description:
      'Limpeza profissional com produtos ecológicos e equipe treinada para sua empresa.',
    href: '/servicos/limpeza',
    icon: FileText,
  },
  {
    title: 'Faxina diarista',
    description:
      'Serviço de faxina residencial e comercial com limpeza profunda e organização.',
    href: '/servicos/faxina-diarista',
    icon: FileText,
  },
  {
    title: 'Controlador de acesso',
    description:
      'Portaria 24h, recepção e controle de fluxo de pessoas para sua empresa ou condomínio.',
    href: '/servicos/controle-acesso',
    icon: Shield,
  },
  {
    title: 'Portaria',
    description:
      'Equipe qualificada para recepção, portaria e segurança do seu local.',
    href: '/servicos/portaria',
    icon: Users,
  },
  {
    title: 'Zeladoria',
    description:
      'Manutenção preventiva e conservação de instalações para condomínios e empresas.',
    href: '/servicos/zeladoria-manutencao',
    icon: Wrench,
  },
  {
    title: 'Jardinagem',
    description:
      'Manutenção e conservação de áreas verdes com qualidade e profissionalismo.',
    href: '/servicos/jardinagem',
    icon: Heart,
  },
  {
    title: 'Recepção',
    description:
      'Equipe qualificada para recepção, atendimento e segurança do seu local.',
    href: '/servicos/portaria',
    icon: Users,
  },
];

export default function Home() {
  const destaques = mockGetVagas().slice(0, 4);

  return (
    <div>
      <SEO
        title={`${COMPANY.name} — Assessoria em RH, Recrutamento, Seleção e Banco de Talentos`}
        description={
          COMPANY.tagline +
          ' Assessoria em RH, recrutamento, mão de obra temporária e efetiva, seleção, banco de talentos e facilities.'
        }
        keywords={[
          'assessoria em RH',
          'recrutamento',
          'seleção de pessoas',
          'mão de obra temporária',
          'mão de obra efetiva',
          'banco de talentos',
          'processo de RH',
          'terceirização',
          'facilities',
          'limpeza',
          'jardinagem',
          'portaria',
          'vagas de emprego',
          COMPANY.name,
        ]}
        type="WebSite"
      />

      <InactivityShowcase />

      {/* 1. HERO */}
      <HeroSplit slides={heroSlides} interval={6000} />

      {/* 2. PARA EMPRESAS */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Soluções para sua empresa
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Assessoria em RH, recrutamento, mão de obra temporária,
              terceirização e facilities para sua empresa.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {empresaSolutions.map((solution) => (
              <motion.div
                key={solution.title}
                variants={staggerItem('up')}
                className="bg-card border-border hover:border-primary/30 rounded-2xl border p-6 transition-all duration-300"
              >
                <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <solution.icon className="h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {solution.description}
                </p>
                <Link to={solution.href}>
                  <Button variant="outline" size="sm" className="w-full">
                    Saiba mais
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link to="/empresas">
              <Button variant="secondary" size="lg">
                Solicitar Orçamento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Section>

      {/* 3. SOLUÇÕES EM FACILITIES */}
      <Section>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Soluções em Facilities
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Limpeza, controle de acesso, jardinagem e recepção. Serviços
              operacionais integrados para sua empresa.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {facilitiesSolutions.map((solution) => (
              <motion.div
                key={solution.title}
                variants={staggerItem('up')}
                className="bg-card border-border hover:border-primary/30 rounded-2xl border p-6 text-center transition-all duration-300"
              >
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <solution.icon className="h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {solution.description}
                </p>
                <Link to={solution.href}>
                  <Button variant="outline" size="sm" className="w-full">
                    Saiba mais
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link to="/servicos">
              <Button variant="secondary" size="lg">
                Conheça nossas soluções
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Section>

      {/* 4. PARA CANDIDATOS */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Para Candidatos
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Encontre oportunidades, acompanhe suas candidaturas e mantenha seu
              currículo atualizado.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <motion.div
              variants={staggerItem('up')}
              className="bg-card border-border hover:border-primary/30 rounded-2xl border p-8 transition-all duration-300"
            >
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Já é candidato?
              </h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Faça seu login e acompanhe suas oportunidades. Receba novas
                vagas, acompanhe candidaturas e mantenha seu currículo sempre
                atualizado.
              </p>
              <Link to="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Fazer login
                </Button>
              </Link>
            </motion.div>
            <motion.div
              variants={staggerItem('up')}
              className="bg-card border-border hover:border-primary/30 rounded-2xl border p-8 transition-all duration-300"
            >
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Ainda não tem cadastro?
              </h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Cadastre seu currículo gratuitamente e seja visto pelas melhores
                empresas. É rápido, gratuito e você só precisa preencher uma
                vez.
              </p>
              <Link to="/trabalhe-conosco">
                <Button variant="secondary" size="lg" className="w-full">
                  Cadastrar currículo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* 5. VAGAS EM DESTAQUE */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mb-12 flex items-end justify-between"
          >
            <motion.div variants={revealUp}>
              <motion.h2
                variants={revealUp}
                className="text-foreground text-3xl font-bold sm:text-4xl"
              >
                Vagas em Destaque
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mt-4 max-w-2xl text-lg"
              >
                Confira as oportunidades disponíveis no momento.
              </motion.p>
            </motion.div>
            <Link to="/vagas">
              <Button variant="outline" size="sm">
                Ver todas as vagas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {destaques.map((vaga) => (
              <motion.div
                key={vaga.id}
                variants={staggerItem('up')}
                className="bg-card shadow-premium group relative flex flex-col rounded-2xl p-6 transition-all duration-300"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors">
                      {vaga.titulo}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {vaga.empresa}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
                    {vaga.tipoContrato}
                  </span>
                </div>

                <div className="text-muted-foreground mb-4 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {vaga.cidade}, {vaga.estado}
                    </span>
                  </div>
                  <span className="inline-block text-xs">
                    {vaga.modalidade === 'PRESENCIAL'
                      ? 'Presencial'
                      : vaga.modalidade === 'HIBRIDO'
                        ? 'Híbrido'
                        : 'Remoto'}
                  </span>
                </div>

                <div className="mt-auto flex gap-2">
                  <Link to={`/vagas/${vaga.slug}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Ver vaga
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* 5. COMO FUNCIONA */}
      <Section>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Como Funciona
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Cadastre seu currículo, candidate-se às vagas e conquiste sua nova
              oportunidade.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative text-center"
              >
                {index < steps.length - 1 && (
                  <div className="bg-border absolute top-8 right-[-3rem] left-[calc(50%+3rem)] hidden h-0.5 md:block" />
                )}
                <div className="bg-muted text-foreground mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                    }}
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
                  className="text-muted-foreground text-sm"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 6. POR QUE ESCOLHER A J&S */}
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
              Por que escolher a J&amp;S
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Atendimento especializado em RH com foco em resultados para
              empresas e candidatos.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {differentials.map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem('up')}
                className="bg-card border-border hover:border-primary/30 rounded-2xl border p-6 transition-all duration-300"
              >
                <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* 8. CLIENTES E PARCEIROS */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Clientes e Parceiros
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Empresas que confiam nosso trabalho.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.08)}
            className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          >
            {PARTNERS_LOGOS.map((partner) => (
              <motion.div
                key={partner.name}
                variants={staggerItem('up')}
                className="bg-card border-border flex h-24 items-center justify-center rounded-xl border p-4 opacity-70 grayscale grayscale-[0.8] transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 max-w-full object-contain"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* 9. DEPOIMENTOS */}
      <Section>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              O que dizem nossos clientes
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Depoimentos de empresas e candidatos que fizeram parte da J&S.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          >
            {CLIENT_TESTIMONIALS.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={staggerItem('up')}
                className="bg-card border-border shadow-premium rounded-2xl border p-8"
              >
                <Quote className="text-primary/20 h-10 w-10" />
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <span className="text-primary text-xl font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      {testimonial.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role} — {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* 10. NÚMEROS */}
      <Section className="bg-surface-alt">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Resultados que comprovam nossa experiência
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Mais de uma década conectando empresas e profissionais.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-2 gap-6 sm:grid-cols-4"
          >
            <motion.div
              variants={staggerItem('up')}
              className="bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center"
            >
              <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <span className="text-2xl font-bold">15+</span>
              </div>
              <p className="text-foreground font-semibold">
                Anos de experiência
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem('up')}
              className="bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center"
            >
              <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <span className="text-2xl font-bold">
                  {COMPANY.clientsServed}+
                </span>
              </div>
              <p className="text-foreground font-semibold">
                Clientes atendidos
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem('up')}
              className="bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center"
            >
              <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <span className="text-2xl font-bold">
                  {COMPANY.professionals}+
                </span>
              </div>
              <p className="text-foreground font-semibold">
                Profissionais colocados
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem('up')}
              className="bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center"
            >
              <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <span className="text-2xl font-bold">
                  {COMPANY.citiesCovered}+
                </span>
              </div>
              <p className="text-foreground font-semibold">Cidades atendidas</p>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* 11. PARA EMPRESAS — seção comercial forte */}
      <Section>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground text-3xl font-bold sm:text-4xl"
            >
              Precisa contratar?
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Encontramos profissionais qualificados para sua necessidade.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl p-8 text-center sm:p-12"
          >
            <div className="bg-primary/5 animate-float-slow absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" />
            <div className="bg-primary/5 animate-float-medium absolute -bottom-20 -left-20 h-60 w-60 rounded-full blur-3xl" />

            <div className="relative">
              <h3 className="text-foreground text-2xl font-bold sm:text-3xl">
                Solicite um orçamento sem compromisso
              </h3>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Nossa equipe comercial entende sua necessidade e envia uma
                proposta personalizada em até 24 horas.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/clientes">
                  <Button variant="secondary" size="lg">
                    Solicitar Orçamento
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a
                  href={getWhatsAppUrl(
                    COMPANY.whatsapp,
                    WHATSAPP_MESSAGES.comercial,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    <Phone className="mr-2 h-5 w-5" />
                    Falar no WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* 12. BLOG */}
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
              Blog
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Últimos artigos sobre currículo, entrevistas, mercado de trabalho
              e carreira.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {blogPosts.map((post) => (
              <motion.div
                key={post.title}
                variants={staggerItem('up')}
                className="bg-card shadow-premium rounded-2xl p-6 transition-all duration-300"
              >
                <div className="text-primary mb-4 flex items-center justify-between text-xs font-medium">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="text-foreground mb-2 text-base font-semibold">
                  {post.title}
                </h3>
                <Link
                  to={post.href}
                  className="text-primary text-sm font-medium"
                >
                  Ler artigo <ArrowRight className="ml-1 inline h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link to="/blog">
              <Button variant="outline" size="lg">
                Ver todos os artigos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Section>

      {/* 13. CTA FINAL */}
      <Section>
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
                Pronto para dar o próximo passo?
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Encontre sua próxima oportunidade ou encontre os profissionais
                certos para sua empresa.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link to="/vagas">
                  <Button variant="secondary" size="lg" className="w-full">
                    Está procurando uma nova oportunidade?
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/empresas">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border/30 text-foreground hover:bg-muted w-full"
                  >
                    Precisa de profissionais para sua empresa?
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
