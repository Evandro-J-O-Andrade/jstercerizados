import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Briefcase,
  ArrowRight,
  MapPin,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { Section } from '@/components/sections/Section';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { HeroSplit } from '@/components/sections/HeroSplit';
import { CinematicShowcase } from '@/components/sections/CinematicIntro';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { mockServices } from '@/services/mock/services';
import { mockGetVagas } from '@/services/mock/vagas';
import { PARTNERS_LOGOS } from '@/mock/partners';
import { COMPANY } from '@/config';
import type { Service } from '@/types/common';

const SHOWCASE_KEY = 'js-showcase-dismissed';

const heroSlides = [
  {
    id: 'assessoria-rh',
    image: '/images/services/assessoria-rh.png',
    alt: 'Assessoria em Recursos Humanos',
    eyebrow: (
      <span className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Assessoria em RH
      </span>
    ),
    title: (
      <>
        <span className="text-primary">Mais eficiência</span> em RH.
        <br />
        Mais resultados para sua empresa.
      </>
    ),
    subtitle:
      'Conectamos empresas a profissionais qualificados. Encontramos o profissional certo para sua empresa e ajudamos candidatos a conquistar novas oportunidades.',
    cta: (
      <>
        <Link to="/empresas">
          <Button
            variant="secondary"
            size="xl"
            className="shadow-glow-lg h-14 rounded-[18px] px-8 py-4 text-base"
          >
            Contratar Funcionários
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/vagas">
          <Button
            variant="outline"
            size="xl"
            className="border-border/30 text-foreground hover:bg-muted h-14 rounded-[18px] px-8 py-4 text-base backdrop-blur"
          >
            Quero uma Vaga
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </>
    ),
  },
  {
    id: 'facilities',
    image: '/images/services/facilities-jardinagem.webp',
    alt: 'Facilities e soluções operacionais',
    eyebrow: (
      <span className="flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Facilities
      </span>
    ),
    title: (
      <>
        Ambientes mais eficientes,
        <br />
        equipes mais preparadas.
      </>
    ),
    subtitle:
      'Limpeza, conservação, jardinagem e portaria para sua operação funcionar com excelência.',
    cta: (
      <Link to="/servicos">
        <Button
          variant="secondary"
          size="xl"
          className="shadow-glow-lg h-14 rounded-[18px] px-8 py-4 text-base"
        >
          Conheça Facilities
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    ),
  },
  {
    id: 'mao-de-obra',
    image: '/images/services/mao-de-obra.webp',
    alt: 'Mão de obra temporária e efetiva',
    eyebrow: (
      <span className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Mão de Obra
      </span>
    ),
    title: (
      <>
        Profissionais preparados
        <br />
        para sua necessidade.
      </>
    ),
    subtitle:
      'Mão de obra temporária e efetiva com seleção rigorosa e gestão especializada.',
    cta: (
      <Link to="/servicos/mao-de-obra-temporaria">
        <Button
          variant="secondary"
          size="xl"
          className="shadow-glow-lg h-14 rounded-[18px] px-8 py-4 text-base"
        >
          Solicitar Profissionais
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    ),
  },
];

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
  },
  {
    title: 'Como se preparar para entrevistas',
    href: '/blog',
  },
  {
    title: 'Tendências do mercado de trabalho',
    href: '/blog',
  },
  {
    title: 'Dicas para conquistar seu primeiro emprego',
    href: '/blog',
  },
];

const differentials = [
  {
    title: 'Banco de talentos atualizado',
    description:
      'Base de currículos qualificados pronta para atender sua vaga com agilidade.',
  },
  {
    title: 'Atendimento rápido',
    description: 'Respostas ágeis para candidatos e empresas, sem burocracia.',
  },
  {
    title: 'Empresas parceiras',
    description: 'Rede de empresas confiantes que contratam pela J&S.',
  },
  {
    title: 'Equipe especializada em RH',
    description: 'Profissionais com experiência em recrutamento e seleção.',
  },
  {
    title: 'Processos seletivos eficientes',
    description:
      'Metodologia rápida e humanizada para reduzir o tempo de contratação.',
  },
  {
    title: 'Atendimento humanizado',
    description: 'Acompanhamento próximo para candidatos e empresas.',
  },
];

export default function Home() {
  const [showcaseFinished, setShowcaseFinished] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(SHOWCASE_KEY) === '1';
    }
    return false;
  });

  const handleShowcaseFinish = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SHOWCASE_KEY, '1');
    }
    setShowcaseFinished(true);
  }, []);

  const destaques = mockGetVagas().slice(0, 4);

  return (
    <div>
      <SEO
        title={`${COMPANY.name} — Assessoria em RH, Recrutamento, Mão de Obra e Facilities`}
        description={COMPANY.description}
        keywords={[
          'recrutamento',
          'seleção de pessoas',
          'banco de talentos',
          'mão de obra temporária',
          'mão de obra efetiva',
          'terceirização',
          'facilities',
          'limpeza',
          'jardinagem',
          'portaria',
          'assessoria em RH',
          'RH',
          'vagas de emprego',
        ]}
        type="WebSite"
      />
      {!showcaseFinished && (
        <CinematicShowcase onFinish={handleShowcaseFinish} />
      )}

      {/* Hero */}
      <HeroSplit slides={heroSlides} />

      {/* Dois caminhos */}
      <Section>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <Link to="/trabalhe-conosco">
              <motion.div
                variants={revealUp}
                className="group bg-card border-border hover:border-primary/30 shadow-premium relative flex flex-col items-center rounded-2xl p-10 text-center transition-all duration-300"
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl transition-all duration-300">
                  <Users className="text-primary h-10 w-10" />
                </div>
                <h3 className="text-foreground group-hover:text-primary mb-3 text-2xl font-bold transition-colors">
                  Encontre sua próxima oportunidade
                </h3>
                <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                  Cadastre seu currículo, encontre vagas compatíveis e participe
                  dos nossos processos seletivos.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="mt-auto rounded-[14px] px-6"
                >
                  Quero uma Vaga
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/empresas">
              <motion.div
                variants={revealUp}
                className="group bg-card border-border hover:border-primary/30 shadow-premium relative flex flex-col items-center rounded-2xl p-10 text-center transition-all duration-300"
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl transition-all duration-300">
                  <Briefcase className="text-primary h-10 w-10" />
                </div>
                <h3 className="text-foreground group-hover:text-primary mb-3 text-2xl font-bold transition-colors">
                  Preciso contratar
                </h3>
                <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                  Encontre os profissionais certos para sua empresa. Soluções de
                  recrutamento e seleção.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="mt-auto rounded-[14px] px-6"
                >
                  Contratar Funcionários
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </Container>
      </Section>

      {/* Nossa atuação */}
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
              Nossa atuação
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Assessoria em RH, recrutamento, mão de obra e facilities para
              empresas que precisam de resultados.
            </motion.p>
          </motion.div>

          {(() => {
            const grouped = mockServices.reduce<Record<string, Service[]>>(
              (acc, service) => {
                acc[service.category] = acc[service.category] || [];
                acc[service.category].push(service);
                return acc;
              },
              {},
            );

            const categoryLabels: Record<string, string> = {
              rh: 'Assessoria em RH',
              facilities: 'Facilities',
              terceirizacao: 'Terceirização',
              candidato: 'Para Candidatos',
            };

            const categoryOrder = [
              'rh',
              'facilities',
              'terceirizacao',
              'candidato',
            ];

            return categoryOrder
              .filter((key) => grouped[key]?.length)
              .map((category) => {
                const services = grouped[category];
                const label = categoryLabels[category] || category;

                return (
                  <div key={category} className="mb-16 last:mb-0">
                    <motion.h3
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-80px' }}
                      variants={revealUp}
                      className="text-foreground mb-8 text-center text-2xl font-bold sm:text-3xl"
                    >
                      {label}
                    </motion.h3>
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={staggerReveal(0.1)}
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    >
                      {services.map((service, index) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          index={index}
                        />
                      ))}
                    </motion.div>
                  </div>
                );
              });
          })()}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link to="/servicos">
              <Button variant="secondary" size="lg">
                Conheça nossos serviços
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Section>

      {/* Vagas em Destaque */}
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
                  {vaga.salarioMin && (
                    <div className="flex items-center gap-2">
                      <span>R$</span>
                      <span>
                        {vaga.salarioMin.toLocaleString('pt-BR')}
                        {vaga.salarioMax
                          ? ' – ' + vaga.salarioMax.toLocaleString('pt-BR')
                          : ' a combinar'}
                      </span>
                    </div>
                  )}
                  <span className="inline-block text-xs">
                    {vaga.modalidade === 'PRESENCIAL'
                      ? 'Presencial'
                      : vaga.modalidade === 'HIBRIDO'
                        ? 'Híbrido'
                        : 'Remoto'}
                  </span>
                </div>

                {vaga.beneficios && vaga.beneficios.length > 0 && (
                  <div className="mb-4">
                    <p className="text-muted-foreground mb-2 text-xs font-medium">
                      Benefícios
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {vaga.beneficios.slice(0, 3).map((beneficio) => (
                        <span
                          key={beneficio}
                          className="bg-muted rounded-full px-2 py-0.5 text-xs"
                        >
                          {beneficio}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto flex gap-2">
                  <Link to={`/vagas/${vaga.slug}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Ver vaga
                    </Button>
                  </Link>
                  <Link to="/trabalhe-conosco" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Candidatar-se
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Como Funciona */}
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
                  className="text-muted-foreground text-sm"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Diferenciais */}
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
              Nossos diferenciais
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

      {/* Empresas / Clientes */}
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
              Empresas que confiam em nossas soluções
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Empresas de diversos segmentos confiam em nossas soluções de RH e
              facilities.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            variants={staggerReveal(0.1)}
          >
            {PARTNERS_LOGOS.map((partner) => (
              <motion.div
                key={partner.name}
                variants={staggerItem('up')}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="group bg-muted/50 relative overflow-hidden rounded-2xl border border-white/5"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <SafeImage
                    src={partner.photo}
                    fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23111'%3E%3Crect width='400' height='300' fill='%232a2a2a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3EEmpresa%3C/text%3E%3C/svg%3E"
                    alt={partner.name}
                    className="h-full w-full object-cover contrast-125 grayscale-[40%] transition-all duration-500 group-hover:contrast-100 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(5,9,20,0.6)_100%)]" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
                      <span className="text-primary text-xs font-semibold">
                        Ver
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <span className="text-foreground group-hover:text-primary text-xs font-semibold transition-colors">
                    {partner.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Blog */}
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
              Blog
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Últimos artigos.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {blogPosts.map((post) => (
              <motion.div
                key={post.title}
                variants={staggerItem('up')}
                className="bg-card shadow-premium rounded-2xl p-6 transition-all duration-300"
              >
                <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl">
                  <FileText className="h-5 w-5" />
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
        </Container>
      </Section>

      {/* CTA Final */}
      <Section className="bg-surface-alt">
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
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/vagas">
                  <Button variant="secondary" size="lg">
                    Encontrar uma vaga
                  </Button>
                </Link>
                <Link to="/empresas">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border/30 text-foreground hover:bg-muted"
                  >
                    Contratar profissionais
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
