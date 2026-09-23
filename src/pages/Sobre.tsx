import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Award,
  Users,
  Target,
  Briefcase,
  CheckCircle,
  Calendar,
  Globe,
  Phone,
  MapPin,
} from 'lucide-react';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { PageTemplateBanner } from '@/components/common/PageTemplateBanner';
import { SafeImage } from '@/components/ui/SafeImage';
import { PremiumCard, SectionReveal } from '@/components/ui';
import { COMPANY_TIMELINE } from '@/mock/company';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config';
import { HERO_ASSETS, SERVICE_IMAGES } from '@/content/assets';
import { revealUp, revealLeft, revealRight } from '@/animations/scroll';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const MotionLink = motion(Link);

const valores = [
  {
    title: 'Integridade e Honestidade',
    description:
      'Agimos com transparência e ética em todas as nossas interações, mantendo a confiança dos nossos clientes, profissionais e parceiros.',
    icon: Shield,
  },
  {
    title: 'Excelência',
    description:
      'Buscamos a excelência em todas as nossas operações e nos esforçamos para superar as expectativas dos nossos clientes em termos de qualidade e desempenho.',
    icon: Award,
  },
  {
    title: 'Equilíbrio',
    description:
      'A base para o sucesso de uma organização em equilíbrio saudável.',
    icon: Users,
  },
  {
    title: 'Cliente',
    description:
      'Colocamos os interesses e necessidades dos nossos clientes em primeiro lugar, oferecendo soluções personalizadas e um serviço excepcional em todos os momentos.',
    icon: Target,
  },
  {
    title: 'Sabedoria',
    description:
      'Sensatez para enfrentar as adversidades com clareza e direção estratégica.',
    icon: Briefcase,
  },
  {
    title: 'Preservação do Meio Ambiente',
    description:
      'Comprometidos com práticas sustentáveis e responsáveis para a conservação do nosso planeta.',
    icon: Globe,
  },
];

const servicos = [
  {
    title: 'Recrutamento e Seleção',
    description:
      'Os principais benefícios que oferecemos na terceirização do recrutamento e seleção de novos funcionários são nosso conhecimento aprofundado no mercado de trabalho e acesso a uma ampla rede de candidatos qualificados. Além disso, essa prática permite que a empresa contratante foque em suas atividades principais, economizando tempo e recursos internos.',
    image: SERVICE_IMAGES.recrutamento,
    icon: Users,
  },
  {
    title: 'Mão de Obra Temporária e Efetiva',
    description:
      'A Mão de Obra Temporária apresenta-se como uma estratégia eficaz para empresas que buscam flexibilidade, assertividade e rapidez nas contratações. Possibilita ajustar o quadro de funcionários conforme a demanda, sem perder qualidade e eficiência.',
    image: SERVICE_IMAGES.maoDeObraTemporaria,
    icon: Briefcase,
  },
  {
    title: 'Treinamento',
    description:
      'Capacitação do seu time alinhada aos processos, cultura e desenvolvimento de habilidades, formando uma equipe estratégica, competitiva e de alta performance.',
    image: SERVICE_IMAGES.processoRh,
    icon: Award,
  },
  {
    title: 'Departamento Pessoal',
    description:
      'Administração da folha de pagamento, contratação, demissão e outras tarefas relacionadas à gestão de pessoas.',
    image: SERVICE_IMAGES.timeRh,
    icon: Target,
  },
  {
    title: 'Outros Serviços de RH',
    description:
      'Pesquisa de clima, mapeamento de cargos e salários, treinamentos e consultoria para potencializar sua equipe.',
    image: SERVICE_IMAGES.assessoriaRh,
    icon: Shield,
  },
  {
    title: 'Tecnologia e Metodologia',
    description:
      'Software de gestão, inovação tecnológica e metodologias avançadas para otimizar processos e garantir eficiência operacional.',
    image: SERVICE_IMAGES.bancoTalentoReal,
    icon: Award,
  },
];

const qualityPolicies = [
  {
    label: '01',
    title: 'Satisfação do Cliente',
    description:
      'Atender as demandas para satisfazer as expectativas de seus clientes, entregando sempre valor e qualidade.',
  },
  {
    label: '02',
    title: 'Melhoria Contínua',
    description:
      'Promover a melhoria contínua da qualidade, meio ambiente e saúde em todas as nossas operações.',
  },
  {
    label: '03',
    title: 'Desenvolvimento de Pessoas',
    description:
      'Capacitar os colaboradores e investir em recursos profissionais e tecnológicos para o crescimento sustentável.',
  },
  {
    label: '04',
    title: 'Excelência Operacional',
    description:
      'Excelência operacional em todos os processos, garantindo eficiência, padrões elevados e resultados consistentes.',
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

function useShouldReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduce;
}

interface ParticleSpec {
  id: string;
  size: number;
  startPct: { x: number; y: number };
  blur: string;
  glowIntensity: [number, number, number];
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
  colorClass: string;
  depth: 'background' | 'mid' | 'foreground';
  isHighlight?: boolean;
}

function generateParticles(count = 90): ParticleSpec[] {
  const particles: ParticleSpec[] = [];

  const warmColors = [
    'from-amber-300/24 to-yellow-400/12',
    'from-yellow-400/28 to-amber-500/16',
    'from-amber-400/26 to-yellow-300/14',
    'from-yellow-300/32 to-amber-400/18',
    'from-amber-300/36 to-yellow-400/20',
    'from-yellow-400/34 to-amber-500/22',
  ];

  for (let i = 0; i < count; i++) {
    const seed = (i * 9773437) % 1000;
    const seed2 = (i * 3133777) % 1000;
    const seed3 = (i * 7919) % 1000;

    const y = 5 + seed * 0.088;
    const x = 5 + seed2 * 0.086;

    let size: number;
    let blur: string;
    let depth: 'background' | 'mid' | 'foreground';
    let glowBase: number;
    let isHighlight = false;

    if (seed < 620) {
      size = 1.5 + (seed % 5) * 0.4;
      blur = 'blur-[0.5px]';
      depth = 'background';
      glowBase = 0.05 + (seed % 10) * 0.015;
    } else if (seed < 880) {
      size = 3.5 + (seed % 6) * 0.5;
      blur = 'blur-[1.5px]';
      depth = 'mid';
      glowBase = 0.14 + (seed % 8) * 0.03;
    } else if (seed < 970) {
      size = 7 + (seed % 5) * 0.6;
      blur = 'blur-[2.5px]';
      depth = 'foreground';
      glowBase = 0.24 + (seed % 6) * 0.05;
    } else {
      size = 14 + (seed % 6) * 0.8;
      blur = 'blur-[5px]';
      depth = 'foreground';
      isHighlight = true;
      glowBase = 0.5 + (seed % 4) * 0.08;
    }

    const duration = 16 + (seed % 26);
    const delay = (seed2 % 22) * 0.4;
    const moveX = -18 + (seed % 32);
    const moveY = -16 + (seed2 % 28);
    const colorClass = warmColors[seed3 % warmColors.length];

    particles.push({
      id: `firefly-${i}`,
      size,
      startPct: { x, y },
      blur,
      glowIntensity: [glowBase * 0.3, glowBase, glowBase * 0.15],
      duration,
      delay,
      moveX,
      moveY,
      colorClass,
      depth,
      isHighlight,
    });
  }

  return particles;
}

interface AmbientLightProps {
  particle: ParticleSpec;
}

const AmbientLight: React.FC<AmbientLightProps> = ({ particle }) => {
  const shouldReduce = useShouldReduceMotion();
  if (shouldReduce) return null;

  const depthBlur = {
    background: 'blur-[1px]',
    mid: 'blur-[2px]',
    foreground: 'blur-[3px]',
  }[particle.depth];

  const depthScale = {
    background: 0.8,
    mid: 1,
    foreground: 1.15,
  }[particle.depth];

  const zIndexValue = {
    background: 0,
    mid: 1,
    foreground: 2,
  }[particle.depth];

  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full bg-gradient-to-br ${particle.colorClass} ${depthBlur}`}
      style={{
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        left: `${particle.startPct.x}%`,
        top: `${particle.startPct.y}%`,
        zIndex: zIndexValue,
      }}
      aria-hidden="true"
      animate={{
        x: [0, particle.moveX, 0],
        y: [0, particle.moveY, 0],
        opacity: particle.glowIntensity,
        scale: [depthScale * 0.8, depthScale, depthScale * 0.8],
      }}
      transition={{
        x: {
          duration: particle.duration,
          delay: particle.delay,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        },
        y: {
          duration: particle.duration,
          delay: particle.delay,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        },
        opacity: {
          duration: particle.duration * 0.6,
          delay: particle.delay * 0.5,
          ease: [0.35, 0, 0.25, 1],
          repeat: Infinity,
          repeatType: 'mirror',
        },
        scale: {
          duration: particle.duration * 0.8,
          delay: particle.delay * 0.3,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        },
      }}
    />
  );
};

const NightSky = ({
  children,
  withLights = true,
  particleCount = 70,
}: {
  children: React.ReactNode;
  withLights?: boolean;
  particleCount?: number;
}) => {
  const shouldReduce = useShouldReduceMotion();
  const particles = useMemo(() => {
    if (shouldReduce || !withLights) return [];
    const all = generateParticles(particleCount);

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 768px)').matches
    ) {
      return all.filter(
        (p) => !p.isHighlight && p.size <= 8 && p.depth !== 'foreground',
      );
    }

    return all;
  }, [shouldReduce, withLights, particleCount]);

  return (
    <div className="relative isolate">
      {particles.map((particle) => (
        <AmbientLight key={particle.id} particle={particle} />
      ))}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default function Sobre() {
  return (
    <NightSky>
      <div className="pt-20">
        <SEO
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Sobre', href: '/sobre' },
          ]}
          title={`Sobre a J&S Empregos | Assessoria em RH, Terceirização e Facilities`}
          description={
            'Conheça a J&S Empregos LTDA: 15+ anos conectando talentos e empresas. ' +
            'Assessoria em RH, recrutamento e seleção, mão de obra temporária e efetiva, ' +
            'terceirização de serviços e facilities (limpeza, portaria, jardinagem, zeladoria). ' +
            'Atendemos empresas, condomínios, indústrias, hospitais, escolas e comércio em 50 cidades.'
          }
          keywords={[
            'J&S Empregos',
            'J&S Terceirizados',
            'assessoria em RH',
            'recrutamento e seleção',
            'mão de obra temporária',
            'mão de obra efetiva',
            'terceirização de mão de obra',
            'terceirização de serviços',
            'facilities',
            'limpeza profissional',
            'portaria e recepção',
            'jardinagem e paisagismo',
            'zeladoria',
            'segurança patrimonial',
            'empresa de RH',
            'agência de empregos',
            'vagas de emprego',
            'contratação de profissionais',
          ]}
          type="Organization"
          image="/images/brand/og-image.svg"
        />

        <Section className="pb-0">
          <Container>
            <SectionReveal staggerDelay={0.2} className="mb-16 text-center">
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
                Somos uma empresa de assessoria em RH, recrutamento, mão de
                obra, terceirização e facilities que transforma talentos em
                oportunidades.
              </motion.p>
              <div className="mx-auto mt-6 max-w-3xl">
                <PageTemplateBanner
                  templateKey="sobre_greeting"
                  fallback="Bem-vindo a J&amp;S Empregos LTDA."
                />
              </div>
            </SectionReveal>

            <SectionReveal
              staggerDelay={0.2}
              className="relative mb-8 overflow-hidden rounded-3xl"
            >
              <SafeImage
                src="/images/sobre/bannersobre.jpg"
                fallbackSrc={IMAGES.hero.sobre.fallback}
                alt={`Equipe ${COMPANY.tradingName}`}
                objectFit="contain"
                className="w-full opacity-80"
              />
              <div className="from-background/70 via-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
              <div className="absolute right-0 bottom-0 left-0 p-8 sm:p-12 lg:p-16">
                <SectionReveal staggerDelay={0.2}>
                  <motion.span
                    variants={revealUp}
                    className="text-primary text-xs font-semibold tracking-widest uppercase"
                  >
                    Institucional
                  </motion.span>
                  <motion.h2
                    variants={revealUp}
                    className="text-foreground mt-2 text-3xl font-bold sm:text-4xl lg:text-5xl"
                  >
                    Conectando pessoas e oportunidades desde 2011
                  </motion.h2>
                </SectionReveal>
              </div>
            </SectionReveal>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionReveal staggerDelay={0.2} className="mb-12 text-center">
              <motion.h2
                variants={revealUp}
                className="text-foreground text-3xl font-bold sm:text-4xl"
              >
                Quem Somos
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Uma trajetória construída com dedicação, inovação e parcerias.
              </motion.p>
            </SectionReveal>

            <SectionReveal
              staggerDelay={0.2}
              className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
            >
              <motion.div variants={revealLeft}>
                <div className="space-y-6">
                  <motion.p
                    variants={revealUp}
                    className="text-muted-foreground text-lg leading-relaxed"
                  >
                    A J&amp;S Empregos é uma empresa com o foco em otimizar a
                    gestão de soluções eficientes na terceirização de mão de
                    obras temporárias, efetiva e facilities, dedicada a oferecer
                    serviços de alta qualidade.
                  </motion.p>
                  <motion.p
                    variants={revealUp}
                    className="text-muted-foreground text-lg leading-relaxed"
                  >
                    O nosso objetivo é promover melhorias para a qualidade de
                    vida das pessoas e de sua produtividade no local de
                    trabalho, através da terceirização e gestão de facilities de
                    diversos serviços e atividades necessárias para o bom
                    funcionamento de uma empresa, condomínios e galpões,
                    planejando e administrando de forma adequada os serviços de
                    limpeza, materiais de condomínios, indústrias, recepção,
                    jardinagem, entrega de correspondências, entre outros.
                  </motion.p>
                  <motion.p
                    variants={revealUp}
                    className="text-muted-foreground text-lg leading-relaxed"
                  >
                    Aprimoramos os principais processos de suporte à corporação,
                    garantindo assim a satisfação total de nossos clientes que
                    passam a ter mais tempo para as atividades finais de suas
                    empresas.
                  </motion.p>
                </div>
              </motion.div>

              <motion.div variants={revealRight}>
                <div className="relative aspect-[11/6] w-full overflow-hidden rounded-2xl">
                  <SafeImage
                    src={HERO_ASSETS.bannerjs}
                    fallbackSrc={IMAGES.hero.sobre.fallback}
                    alt={`Instalações ${COMPANY.tradingName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>
            </SectionReveal>
          </Container>
        </Section>

        <Section className="bg-surface-alt/30">
          <Container>
            <SectionReveal
              staggerDelay={0.2}
              className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
            >
              <motion.div
                variants={revealLeft}
                className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl"
              >
                <SafeImage
                  src="/images/sobre/ceo.png"
                  fallbackSrc={IMAGES.hero.sobre.fallback}
                  alt="José — CEO"
                  className="h-full w-full object-cover"
                />
              </motion.div>

              <motion.div variants={revealRight} className="space-y-6">
                <motion.div variants={revealUp}>
                  <motion.span
                    variants={revealUp}
                    className="text-primary text-xs font-semibold tracking-widest uppercase"
                  >
                    Palavra do CEO
                  </motion.span>
                  <motion.h2
                    variants={revealUp}
                    className="text-foreground mt-2 text-3xl font-bold sm:text-4xl"
                  >
                    José
                  </motion.h2>
                  <motion.p
                    variants={revealUp}
                    className="text-muted-foreground mt-1 text-sm"
                  >
                    CEO — J&amp;S Empregos LTDA
                  </motion.p>
                </motion.div>

                <motion.blockquote
                  variants={revealUp}
                  className="border-primary/20 border-l-4 pl-6"
                >
                  <motion.p
                    variants={revealUp}
                    className="text-foreground text-xl leading-relaxed italic"
                  >
                    Com a implementação de uma metodologia de trabalho, inovação
                    tecnológica, software em gestão, treinamento e
                    desenvolvimento dos colaboradores, recrutamento e seleção
                    assertivos, a J&amp;S Empregos LTDA é capaz de proporcionar
                    um serviço de Facilities que oferece boas práticas aos
                    nossos clientes.
                  </motion.p>
                </motion.blockquote>
              </motion.div>
            </SectionReveal>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionReveal
              staggerDelay={0.15}
              className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
            >
              <motion.div variants={revealLeft}>
                <motion.div className="border-border/40 shadow-glass relative overflow-hidden rounded-3xl border">
                  <SafeImage
                    src={SERVICE_IMAGES.controleAcesso}
                    fallbackSrc={IMAGES.hero.sobre.fallback}
                    alt={`Missão ${COMPANY.tradingName}`}
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                </motion.div>
              </motion.div>

              <motion.div variants={revealRight} className="space-y-12">
                <motion.div variants={revealUp}>
                  <h2 className="text-foreground mb-4 text-2xl font-bold">
                    Nossa Missão
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Otimizar a gestão de soluções eficientes na terceirização de
                    recrutamento e seleção e serviços de facilities,
                    proporcionando serviços de alta qualidade e confiança,
                    encontrando e conectando profissionais aptos com
                    oportunidades de trabalho adequadas, alavancando o sucesso
                    de nossos clientes e candidatos ao oferecer mais
                    transparência e resultados.
                  </p>
                </motion.div>

                <motion.div variants={revealUp}>
                  <h3 className="text-foreground mb-4 text-2xl font-bold">
                    Nossa Visão
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ser reconhecida como parceira estratégica no fornecimento de
                    serviços de Facilities e terceirização de mão de obra
                    temporária, destacando-nos pela qualidade, confiabilidade e
                    comprometendo-nos com a excelência em tudo o que fazemos.
                  </p>
                </motion.div>
              </motion.div>
            </SectionReveal>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionReveal staggerDelay={0.2} className="mb-12 text-center">
              <motion.h2
                variants={revealUp}
                className="text-foreground text-3xl font-bold sm:text-4xl"
              >
                Nossos Valores
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Princípios que guiam cada decisão e cada entrega.
              </motion.p>
            </SectionReveal>

            <SectionReveal
              staggerDelay={0.1}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {valores.map((valor) => (
                <motion.div
                  key={valor.title}
                  variants={revealUp}
                  className="group/card h-full"
                >
                  <PremiumCard
                    rounded="2xl"
                    hover
                    interactable
                    goldGlow
                    className="relative flex h-full min-h-[280px] flex-col p-8"
                  >
                    <div className="bg-primary/10 group-hover/card:bg-primary/20 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 group-hover/card:scale-110">
                      <valor.icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-foreground group-hover/card:text-primary mb-3 text-lg font-semibold transition-colors">
                      {valor.title}
                    </h3>
                    <p className="text-muted-foreground mt-auto text-sm leading-relaxed">
                      {valor.description}
                    </p>
                  </PremiumCard>
                </motion.div>
              ))}
            </SectionReveal>
          </Container>
        </Section>

        <Section className="bg-surface-alt/30">
          <Container>
            <SectionReveal
              staggerDelay={0.2}
              className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2"
            >
              <motion.div variants={revealLeft} className="space-y-6">
                <motion.span
                  variants={revealUp}
                  className="text-primary text-xs font-semibold tracking-widest uppercase"
                >
                  Nossa Equipe
                </motion.span>
                <motion.h2
                  variants={revealUp}
                  className="text-foreground text-3xl font-bold sm:text-4xl"
                >
                  Equipe que Cuida de Pessoas
                </motion.h2>
                <motion.p
                  variants={revealUp}
                  className="text-muted-foreground text-lg leading-relaxed"
                >
                  Nossa equipe é formada por profissionais que pegam nos
                  detalhes, porque sabemos que é neles que mora a excelência.
                  Somos movidos por qualidade, confiança e comprometimento.
                </motion.p>
                <motion.p
                  variants={revealUp}
                  className="text-muted-foreground text-lg leading-relaxed"
                >
                  Mais do que selecionar candidatos, nós cuidamos de pessoas, e
                  esse cuidado se reflete em cada serviço prestado, em cada
                  parceria construída e em cada cliente satisfeito.
                </motion.p>

                <motion.div
                  variants={revealUp}
                  className="flex items-center gap-4 pt-4"
                >
                  <div className="flex -space-x-2">
                    <div className="ring-background overflow-hidden rounded-full ring-2">
                      <SafeImage
                        src="/images/sobre/equipe/ricardo-santos.svg"
                        alt="Ricardo Santos"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="ring-background overflow-hidden rounded-full ring-2">
                      <SafeImage
                        src="/images/sobre/equipe/fernanda-oliveira.svg"
                        alt="Fernanda Oliveira"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="ring-background overflow-hidden rounded-full ring-2">
                      <SafeImage
                        src="/images/sobre/equipe/thiago-mendes.svg"
                        alt="Thiago Mendes"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <motion.span
                    variants={revealUp}
                    className="text-muted-foreground text-sm"
                  >
                    +500 profissionais
                  </motion.span>
                </motion.div>
              </motion.div>

              <motion.div variants={revealRight}>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <SafeImage
                    src={SERVICE_IMAGES.timeRh}
                    alt="Equipe em ação"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </motion.div>
            </SectionReveal>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionReveal staggerDelay={0.2} className="mb-16 text-center">
              <motion.span
                variants={revealUp}
                className="text-primary text-xs font-semibold tracking-widest uppercase"
              >
                Soluções
              </motion.span>
              <motion.h2
                variants={revealUp}
                className="text-foreground mt-2 text-3xl font-bold sm:text-4xl"
              >
                Nossos Serviços
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Soluções completas para sua gestão de pessoas e operações.
              </motion.p>
            </SectionReveal>

            <SectionReveal staggerDelay={0.1} className="space-y-8">
              {servicos.map((servico, index) => (
                <motion.div
                  key={servico.title}
                  variants={revealUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  <PremiumCard
                    rounded="xl"
                    hover
                    interactable
                    className="group relative grid h-full grid-cols-1 items-center gap-8 p-8 md:grid-cols-2"
                  >
                    <div className={`${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                      <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                        <servico.icon
                          className="text-primary h-6 w-6"
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 className="text-foreground mb-3 text-xl font-semibold">
                        {servico.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {servico.description}
                      </p>
                    </div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                      <SafeImage
                        src={servico.image}
                        alt={servico.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </SectionReveal>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionReveal staggerDelay={0.2} className="mb-12 text-center">
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
            </SectionReveal>

            <div className="relative">
              {COMPANY_TIMELINE.map((_item, index) => {
                const chapter = chapters[index];
                if (!chapter) return null;

                return (
                  <div key={chapter.id} className="relative">
                    {index > 0 && <TimelineWebConnector />}
                    <CinematicChapter chapter={chapter} index={index} />
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>

        <Section className="bg-surface-alt/30">
          <Container>
            <SectionReveal staggerDelay={0.2} className="mb-16 text-center">
              <motion.h2
                variants={revealUp}
                className="text-foreground text-3xl font-bold sm:text-4xl"
              >
                Duas Frentes, Uma Essência
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Juntos, acertamos cada detalhe para conectar pessoas e negócios.
              </motion.p>
            </SectionReveal>

            <SectionReveal
              staggerDelay={0.2}
              className="grid grid-cols-1 gap-8 lg:grid-cols-2"
            >
              <motion.div variants={revealLeft}>
                <PremiumCard
                  rounded="2xl"
                  hover
                  interactable
                  className="group relative flex h-full flex-col items-center p-10 text-center"
                >
                  <div className="mb-6">
                    <SafeImage
                      src={IMAGES.logo.principal}
                      alt={COMPANY.name}
                      className="h-16 w-auto"
                    />
                  </div>
                  <h3 className="text-foreground mb-4 text-2xl font-bold">
                    J&amp;S Empregos LTDA
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Foco principal em empregos, vagas, candidatos, recrutamento,
                    seleção e RH — conectando empresas aos profissionais certos.
                  </p>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <MapPin
                        className="text-primary h-4 w-4"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm">São Paulo, SP</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone
                        className="text-primary h-4 w-4"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm">{COMPANY.phone}</span>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>

              <motion.div variants={revealRight}>
                <PremiumCard
                  rounded="2xl"
                  hover
                  interactable
                  className="group relative flex h-full flex-col items-center p-10 text-center"
                >
                  <div className="mb-6">
                    <SafeImage
                      src="/images/sobre/bannerjrtercerizado.png"
                      alt="J&amp;S Empregos LTDA"
                      className="h-16 w-auto"
                    />
                  </div>
                  <h3 className="text-foreground mb-4 text-2xl font-bold">
                    J&amp;S Tercerizados LTDA
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Frente complementar especializada em facilities,
                    terceirização de mão de obra temporária e efetiva, limpeza,
                    jardinagem, portaria, segurança e zeladoria.
                  </p>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Globe
                        className="text-primary h-4 w-4"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm">Atuação nacional</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar
                        className="text-primary h-4 w-4"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm">Ativa desde 2011</span>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            </SectionReveal>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionReveal staggerDelay={0.2} className="mb-16 text-center">
              <motion.h2
                variants={revealUp}
                className="text-foreground text-3xl font-bold sm:text-4xl"
              >
                Política da Qualidade
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Compromisso contínuo com a excelência e melhoria.
              </motion.p>
            </SectionReveal>

            <div className="relative mx-auto max-w-7xl">
              <SectionReveal
                staggerDelay={0.1}
                className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {qualityPolicies.map((policy) => (
                  <motion.div
                    key={policy.label}
                    variants={revealUp}
                    className="group/card h-full"
                  >
                    <PremiumCard
                      rounded="2xl"
                      hover
                      interactable
                      className="flex h-full flex-col p-6 text-center"
                    >
                      <div className="bg-primary/10 text-primary group-hover/card:bg-primary/20 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 group-hover/card:scale-110">
                        <CheckCircle className="h-7 w-7" strokeWidth={1.5} />
                      </div>
                      <span className="text-primary text-xs font-semibold tracking-widest uppercase">
                        {policy.label}
                      </span>
                      <h3 className="text-foreground group-hover/card:text-primary my-3 text-lg font-semibold transition-colors">
                        {policy.title}
                      </h3>
                      <p className="text-muted-foreground mt-auto text-sm leading-relaxed">
                        {policy.description}
                      </p>
                    </PremiumCard>
                  </motion.div>
                ))}
              </SectionReveal>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionReveal
              staggerDelay={0.15}
              className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
            >
              <motion.div variants={revealLeft}>
                <div className="bg-card shadow-glass border-border/40 relative overflow-hidden rounded-3xl border">
                  <SafeImage
                    src={SERVICE_IMAGES.facilities}
                    fallbackSrc={IMAGES.hero.sobre.fallback}
                    alt="Cobertura Regional"
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                </div>
              </motion.div>

              <motion.div variants={revealRight}>
                <h2 className="text-foreground mb-6 text-3xl font-bold">
                  Cobertura Regional
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Atendemos empresas e candidatos em múltiplas cidades, com
                  cobertura completa para garantir agilidade e presença onde
                  você precisa.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield
                      className="text-primary h-5 w-5"
                      strokeWidth={1.5}
                    />
                    <span className="text-foreground font-medium">
                      Cobertura nacional
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="text-primary h-5 w-5" strokeWidth={1.5} />
                    <span className="text-foreground font-medium">
                      Equipe 24/7
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin
                      className="text-primary h-5 w-5"
                      strokeWidth={1.5}
                    />
                    <span className="text-foreground font-medium">
                      {COMPANY.citiesCovered} cidades atendidas
                    </span>
                  </div>
                </div>
              </motion.div>
            </SectionReveal>
          </Container>
        </Section>

        <Section className="bg-primary">
          <Container>
            <SectionReveal staggerDelay={0.2} className="text-center">
              <motion.h2
                variants={revealUp}
                className="text-primary-foreground text-3xl font-bold sm:text-4xl"
              >
                Pronto para elevar sua equipe?
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-primary-foreground/80 mx-auto mt-4 max-w-2xl text-lg"
              >
                Conectamos empresas e talentos com expertise em recrutamento,
                seleção e facilities.
              </motion.p>
              <motion.div
                variants={revealUp}
                className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
              >
                <MotionLink
                  to="/contato"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 30px hsla(43, 74%, 40%, 0.5)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary text-primary-foreground inline-flex items-center justify-center rounded-xl px-8 py-3 text-sm font-semibold shadow-lg transition-all duration-300"
                >
                  Fale conosco
                </MotionLink>
                <MotionLink
                  to="/vagas"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 20px hsla(43, 74%, 40%, 0.3)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="border-primary-foreground/30 text-primary-foreground inline-flex items-center justify-center rounded-xl border bg-transparent px-8 py-3 text-sm font-semibold transition-all duration-300"
                >
                  Ver vagas
                </MotionLink>
              </motion.div>
            </SectionReveal>
          </Container>
        </Section>
      </div>
    </NightSky>
  );
}
