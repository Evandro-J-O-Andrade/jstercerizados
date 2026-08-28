import { motion, useInView } from 'framer-motion';
import { Shield, Award, Users, Target } from 'lucide-react';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config';
import { HERO_ASSETS, SERVICE_IMAGES } from '@/content/assets';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { useRef, useState, useEffect } from 'react';

const valores = [
  {
    title: 'Excelência em Recrutamento',
    description:
      'Processos rigorosos de triagem e seleção para encontrar o profissional certo para cada vaga.',
    icon: Award,
  },
  {
    title: 'Inovação em RH',
    description:
      'Investimento constante em tecnologia e metodologias para otimizar o recrutamento.',
    icon: Shield,
  },
  {
    title: 'Foco no Resultado',
    description:
      'Alinhamento total com os objetivos da empresa: encontrar talentos e elevar padrões.',
    icon: Target,
  },
  {
    title: 'Equipe Qualificada',
    description:
      'Especialistas em recrutamento, seleção e gestão de pessoas com certificações reconhecidas.',
    icon: Users,
  },
];

type Chapter = {
  id: string;
  label: string;
  year: string;
  title: string;
  description: string;
  image: string;
  layout:
    | 'split-left'
    | 'split-right'
    | 'manga-left'
    | 'manga-right'
    | 'full-bleed'
    | 'hero';
  quote?: string;
};

const chapters: Chapter[] = [
  {
    id: 'origem',
    label: '01 — ORIGEM',
    year: '2011',
    title: 'Tudo começou aqui.',
    description:
      'Início das operações como uma agência focada em recrutamento e seleção de profissionais qualificados.',
    image: HERO_ASSETS.bannerjs,
    layout: 'hero',
    quote: '2011',
  },
  {
    id: 'primeiros-passos',
    label: '02 — PRIMEIROS PASSOS',
    year: '2015',
    title: 'Primeiros Passos',
    description:
      'Iniciamos os serviços complementares de zeladoria, limpeza e segurança, ampliando nossa atuação em RH.',
    image: SERVICE_IMAGES.facilities,
    layout: 'split-left',
  },
  {
    id: 'evolucao',
    label: '03 — EVOLUÇÃO',
    year: '2018',
    title: 'Evolução',
    description:
      'Implementamos sistemas de monitoramento e controle de acesso, integrando tecnologia aos nossos processos.',
    image: SERVICE_IMAGES.controleAcesso,
    layout: 'manga-right',
  },
  {
    id: 'expansao',
    label: '04 — EXPANSÃO',
    year: '2020',
    title: '200 Clientes',
    description:
      'Atingimos a marca de 200 clientes empresariais satisfeitos com nossas soluções de RH.',
    image: HERO_ASSETS.suporte,
    layout: 'full-bleed',
    quote: 'NOVOS DESAFIOS.\nNOVAS SOLUÇÕES.',
  },
  {
    id: 'plataforma',
    label: '05 — J&S HOJE',
    year: '2022',
    title: 'Plataforma Digital J&S',
    description:
      'Lançamento da plataforma digital para otimizar a gestão de vagas, candidatos e processos seletivos.',
    image: SERVICE_IMAGES.servicosReal,
    layout: 'split-right',
  },
  {
    id: 'cobertura',
    label: '06 — O FUTURO',
    year: '2024',
    title: '50 Cidades',
    description:
      'Expandimos nossa cobertura para 50 cidades do Brasil. A história ainda está sendo escrita.',
    image: HERO_ASSETS.trabalheConosco,
    layout: 'manga-left',
  },
];

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

function TimelineWebConnector() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 lg:block"
      aria-hidden="true"
    >
      <div className="from-primary/40 via-primary/20 to-primary/40 h-full w-full bg-gradient-to-b" />
      <div className="bg-primary absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
    </div>
  );
}

function CinematicChapter({
  chapter,
  index,
}: {
  chapter: Chapter;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-120px' });
  const shouldReduceMotion = useReducedMotion();
  const isEven = index % 2 === 0;

  const imageHidden = shouldReduceMotion
    ? { opacity: 1, x: 0, scale: 1 }
    : { opacity: 0, x: isEven ? -110 : 110, scale: 1.05 };

  const textHidden = shouldReduceMotion
    ? { opacity: 1, x: 0, y: 0 }
    : { opacity: 0, x: isEven ? 80 : -80, y: 40 };

  const yearHidden = shouldReduceMotion
    ? { opacity: 1, scale: 1 }
    : { opacity: 0, scale: 1.6 };

  const panelHidden = shouldReduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 120 };

  return (
    <motion.section
      ref={ref}
      className={`relative w-full ${index > 0 ? 'mt-12' : ''}`}
    >
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
        <motion.div
          initial={imageHidden}
          animate={isInView ? { opacity: 1, x: 0, scale: 1 } : imageHidden}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 1.1, ease: [0.25, 0.4, 0.25, 1], delay: 0.1 }
          }
          className={`relative aspect-[16/10] w-full overflow-hidden rounded-3xl lg:w-1/2 ${
            chapter.layout.includes('right') ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          <SafeImage
            src={chapter.image}
            alt={chapter.title}
            className="h-full w-full object-cover"
          />
          <div className="from-background/70 via-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </motion.div>

        <motion.div
          initial={textHidden}
          animate={isInView ? { opacity: 1, x: 0, y: 0 } : textHidden}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 1, ease: [0.25, 0.4, 0.25, 1], delay: 0.25 }
          }
          className={`w-full lg:w-1/2 ${
            chapter.layout.includes('right') ? 'lg:order-1' : 'lg:order-2'
          }`}
        >
          <div className="max-w-xl">
            <motion.span
              initial={yearHidden}
              animate={isInView ? { opacity: 1, scale: 1 } : yearHidden}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.9, ease: [0.25, 0.4, 0.25, 1], delay: 0.35 }
              }
              className="text-primary text-sm font-semibold tracking-widest"
            >
              {chapter.year}
            </motion.span>
            <motion.h3
              initial={panelHidden}
              animate={isInView ? { opacity: 1, y: 0 } : panelHidden}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.9, ease: [0.25, 0.4, 0.25, 1], delay: 0.45 }
              }
              className="text-foreground mt-2 text-3xl font-bold sm:text-4xl"
            >
              {chapter.title}
            </motion.h3>
            <motion.p
              initial={panelHidden}
              animate={isInView ? { opacity: 1, y: 0 } : panelHidden}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.9, ease: [0.25, 0.4, 0.25, 1], delay: 0.55 }
              }
              className="text-muted-foreground mt-4 text-lg leading-relaxed"
            >
              {chapter.description}
            </motion.p>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none relative hidden h-24 w-full lg:block">
        <div className="bg-primary/50 absolute inset-x-0 top-0 h-full w-px" />
        <div className="bg-primary absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.7)]" />
      </div>
    </motion.section>
  );
}

export default function Sobre() {
  return (
    <div className="pt-20">
      <SEO
        title={`Sobre — ${COMPANY.name}`}
        description={`Conheça a ${COMPANY.name}: assessoria em RH, recrutamento, mão de obra e facilities com excelência.`}
        keywords={[
          'sobre',
          COMPANY.name,
          'RH',
          'recrutamento',
          'seleção',
          'terceirização',
          'facilities',
          'limpeza',
          'jardinagem',
          'portaria',
        ]}
        type="Organization"
      />

      <Section className="pb-0">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-16 text-center"
          >
            <motion.h1
              variants={revealUp}
              className="text-foreground text-4xl font-bold sm:text-5xl"
            >
              Sobre a {COMPANY.tradingName}
            </motion.h1>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-3xl text-lg"
            >
              Somos uma empresa de assessoria em RH, recrutamento, mão de obra,
              terceirização e facilities que transforma talentos em
              oportunidades.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
          >
            <motion.div variants={staggerItem('left')}>
              <div className="bg-card shadow-glass border-border/40 relative overflow-hidden rounded-3xl border">
                <SafeImage
                  src="/images/sobre/bannersobre.jpg"
                  fallbackSrc={IMAGES.hero.sobre.fallback}
                  alt={`Equipe ${COMPANY.tradingName}`}
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
              </div>
            </motion.div>

            <motion.div variants={staggerItem('right')}>
              <h2 className="text-foreground mb-4 text-2xl font-bold">
                Nossa Missão
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Conectar empresas aos profissionais certos e ajudar candidatos a
                conquistarem novas oportunidades, por meio de recrutamento,
                seleção, mão de obra temporária e efetiva e assessoria completa
                em RH.
              </p>

              <h3 className="text-foreground mt-8 mb-4 text-2xl font-bold">
                Nossa Visão
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Ser referência em assessoria em RH, recrutamento, mão de obra,
                terceirização e facilities, reconhecida pela excelência no
                recrutamento e pela conexão humanizada entre empresas e
                talentos.
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      <Section className="mt-24">
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
              Nossa Trajetória
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Uma história construída com dedicação, inovação e parcerias.
            </motion.p>
          </motion.div>

          <div className="relative">
            {chapters.map((chapter, index) => {
              if (index > 0) return <TimelineWebConnector key={chapter.id} />;
              return (
                <CinematicChapter
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                />
              );
            })}
          </div>
        </Container>
      </Section>

      <Section className="mt-24">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="text-center"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground mb-4 text-3xl font-bold sm:text-4xl"
            >
              Nossos Valores
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg"
            >
              Princípios que guiam cada decisão e cada entrega.
            </motion.p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {valores.map((valor) => (
                <motion.div
                  key={valor.title}
                  variants={staggerItem('up')}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="bg-card border-border shadow-premium rounded-2xl border p-6 text-center transition-all"
                >
                  <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <valor.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {valor.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {valor.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </Section>

      <Section className="mt-24">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
          >
            <motion.div variants={staggerItem('left')}>
              <div className="bg-card shadow-glass border-border/40 relative overflow-hidden rounded-3xl border">
                <SafeImage
                  src={HERO_ASSETS.bannerjs}
                  fallbackSrc={IMAGES.hero.sobre.fallback}
                  alt={`Missão ${COMPANY.tradingName}`}
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
              </div>
            </motion.div>

            <motion.div variants={staggerItem('right')}>
              <h2 className="text-foreground mb-6 text-3xl font-bold">
                Cobertura Regional
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Atendemos empresas e candidatos em múltiplas cidades, com
                cobertura completa para garantir agilidade e presença onde você
                precisa.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="text-primary h-5 w-5" />
                  <span className="text-foreground font-medium">
                    Cobertura nacional
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="text-primary h-5 w-5" />
                  <span className="text-foreground font-medium">
                    Equipe 24/7
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
