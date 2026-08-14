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
  Wrench,
  Handshake,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { HeroSplit } from '@/components/sections/HeroSplit';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { mockGetVagas } from '@/services/mock/vagas';
import { COMPANY } from '@/config';
import { HERO_SLIDES } from '@/content/homeHero';
import { CLIENTS_LIST } from '@/mock/clients';
import { SafeImage } from '@/components/ui/SafeImage';

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

      {/* 1. CINEMATIC HERO */}
      <HeroSplit slides={heroSlides} interval={6000} />

      {/* 2. CONSULTORIA EM RH / SOLUÇÕES PARA EMPRESAS */}
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
              Consultoria em RH e soluções para empresas
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

      {/* 3. FACILITIES */}
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
      <Section>
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

      {/* 6. DIFERENCIAIS J&S */}
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

      {/* 7. RELACIONAMENTOS */}
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
              Relacionamentos que fazem parte da nossa história
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Clientes, parceiros e fornecedores que caminham ao nosso lado.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="bg-card border-border hover:border-primary/30 rounded-2xl border p-6 text-center transition-all duration-300"
            >
              <Building2 className="text-primary mx-auto mb-4 h-10 w-10" />
              <h3 className="text-foreground text-lg font-semibold">
                Clientes
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Abarca Móveis, Vector, Mistral Vidros e outros que confiam na
                J&S.
              </p>
              <Link
                to="/clientes"
                className="text-primary hover:text-primary/80 mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
              >
                Conheça nossos clientes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="bg-card border-border hover:border-primary/30 rounded-2xl border p-6 text-center transition-all duration-300"
            >
              <Handshake className="text-primary mx-auto mb-4 h-10 w-10" />
              <h3 className="text-foreground text-lg font-semibold">
                Parceiros
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Rede estratégica que amplia nossas soluções e eficiência.
              </p>
              <Link
                to="/parceiros"
                className="text-primary hover:text-primary/80 mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
              >
                Seja nosso parceiro
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="bg-card border-border hover:border-primary/30 rounded-2xl border p-6 text-center transition-all duration-300"
            >
              <Briefcase className="text-primary mx-auto mb-4 h-10 w-10" />
              <h3 className="text-foreground text-lg font-semibold">
                Fornecedores
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Uma operação forte depende de bons fornecedores.
              </p>
              <Link
                to="/fornecedores"
                className="text-primary hover:text-primary/80 mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
              >
                Seja nosso fornecedor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="bg-card border-border hover:border-primary/30 rounded-2xl border p-6 text-center transition-all duration-300"
            >
              <Phone className="text-primary mx-auto mb-4 h-10 w-10" />
              <h3 className="text-foreground text-lg font-semibold">
                Empresas
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Sua empresa quer fazer parte dessa rede?
              </p>
              <Link
                to="/empresas"
                className="text-primary hover:text-primary/80 mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
              >
                Falar com a J&S
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* 8. CLIENTES REAIS */}
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
              Empresas que já fazem parte dessa história
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Conheça alguns dos clientes que confiam na J&S.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
          >
            {CLIENTS_LIST.filter((client) => client.name && client.logo).map(
              (client) => (
                <motion.div
                  key={client.id}
                  variants={staggerItem('up')}
                  className="bg-card border-border hover:border-primary/30 flex flex-col items-center justify-center rounded-2xl border p-6 transition-all duration-300"
                >
                  <div className="h-16 w-auto">
                    <SafeImage
                      src={client.logo!}
                      alt={client.name!}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <span className="text-foreground mt-3 text-center text-sm font-medium">
                    {client.name!}
                  </span>
                </motion.div>
              ),
            )}
          </motion.div>
        </Container>
      </Section>

      {/* 9. CTA COMERCIAL FINAL */}
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

            <div className="relative">
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
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
