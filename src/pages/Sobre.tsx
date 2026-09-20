import { motion, useInView } from 'framer-motion';
import {
  Award,
  BriefcaseBusiness,
  HeartHandshake,
  Leaf,
  Shield,
  Target,
  Users,
} from 'lucide-react';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { PageTemplateBanner } from '@/components/common/PageTemplateBanner';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config';
import { HERO_ASSETS, SERVICE_IMAGES } from '@/content/assets';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { useRef, useState, useEffect } from 'react';

const valores = [
  {
    title: 'Integridade e Honestidade',
    description:
      'Relacionamentos construídos com transparência, ética, responsabilidade e confiança em cada etapa.',
    icon: Shield,
  },
  {
    title: 'Excelência',
    description:
      'Busca contínua por qualidade, organização e melhoria dos processos para entregar soluções consistentes.',
    icon: Award,
  },
  {
    title: 'Equilíbrio',
    description:
      'Decisões responsáveis que consideram pessoas, empresas, resultados e a sustentabilidade das relações.',
    icon: Target,
  },
  {
    title: 'Foco no Cliente',
    description:
      'Entender necessidades reais para desenvolver soluções alinhadas aos desafios de cada empresa.',
    icon: HeartHandshake,
  },
  {
    title: 'Sabedoria',
    description:
      'Experiência, aprendizado contínuo e conhecimento aplicados à gestão de pessoas e aos processos de RH.',
    icon: Users,
  },
  {
    title: 'Preservação do Meio Ambiente',
    description:
      'Responsabilidade e consciência ambiental como parte de uma atuação profissional e sustentável.',
    icon: Leaf,
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
    id: 'pessoas',
    label: '01 — PESSOAS',
    year: '01',
    title: 'Conectamos pessoas a oportunidades.',
    description:
      'Nossa atuação parte de um princípio simples: encontrar e conectar profissionais aptos às oportunidades adequadas, aproximando candidatos e empresas com transparência e atenção às necessidades de cada processo.',
    image: HERO_ASSETS.bannerjs,
    layout: 'hero',
    quote: 'PESSOAS NO CENTRO.',
  },
  {
    id: 'recrutamento',
    label: '02 — RECRUTAMENTO E SELEÇÃO',
    year: '02',
    title: 'Processos pensados para encontrar o perfil certo.',
    description:
      'Recrutamento e seleção fazem parte do nosso trabalho para apoiar empresas na identificação de profissionais compatíveis com suas necessidades, ao mesmo tempo em que orientamos candidatos em sua jornada profissional.',
    image: SERVICE_IMAGES.servicosReal,
    layout: 'split-left',
  },
  {
    id: 'solucoes',
    label: '03 — SOLUÇÕES EM RH',
    year: '03',
    title: 'Da contratação à gestão de pessoas.',
    description:
      'Ampliamos nossa atuação com soluções como mão de obra temporária e efetiva, treinamento, projetos em RH e assessoria, criando uma abordagem integrada para diferentes necessidades organizacionais.',
    image: SERVICE_IMAGES.facilities,
    layout: 'manga-right',
  },
  {
    id: 'tecnologia',
    label: '04 — TECNOLOGIA',
    year: '04',
    title: 'Tecnologia para tornar os processos mais eficientes.',
    description:
      'A metodologia da J&S combina inovação tecnológica, software de gestão, organização de processos e desenvolvimento de pessoas para dar mais agilidade, controle e qualidade à operação.',
    image: HERO_ASSETS.suporte,
    layout: 'full-bleed',
    quote: 'TECNOLOGIA + PROCESSOS + PESSOAS.',
  },
  {
    id: 'qualidade',
    label: '05 — QUALIDADE',
    year: '05',
    title: 'Qualidade que começa nos detalhes.',
    description:
      'Trabalhamos com foco em qualidade, confiança e comprometimento. Cada etapa do atendimento é uma oportunidade para aprimorar processos, reduzir atritos e construir relações duradouras.',
    image: SERVICE_IMAGES.controleAcesso,
    layout: 'split-right',
  },
  {
    id: 'complementar',
    label: '06 — ATUAÇÃO COMPLEMENTAR',
    year: '06',
    title: 'Experiência também em soluções operacionais.',
    description:
      'Nossa experiência institucional inclui serviços de terceirização e facilities, como limpeza, portaria, zeladoria e outras soluções operacionais. Essas frentes complementam nossa atuação em gestão de pessoas sem perder o foco em RH.',
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
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Sobre', href: '/sobre' },
        ]}
        title={`Sobre a J&S Empregos — Assessoria em RH`}
        description="Conheça a J&S Empregos, empresa de assessoria em Recursos Humanos, recrutamento e seleção, mão de obra temporária e efetiva, treinamento e soluções complementares em terceirização."
        keywords={[
          'J&S Empregos',
          'sobre a J&S Empregos',
          'assessoria em RH',
          'recursos humanos',
          'recrutamento e seleção',
          'mão de obra temporária',
          'mão de obra efetiva',
          'treinamento',
          'projetos em RH',
          'terceirização',
          'facilities',
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
              Mais eficiência em RH. Mais resultados para sua empresa. Atuamos
              na conexão entre empresas e profissionais, com recrutamento,
              seleção, mão de obra, treinamento e soluções em gestão de
              pessoas.
            </motion.p>
            <div className="mx-auto mt-6 max-w-3xl">
              <PageTemplateBanner
                templateKey="sobre_greeting"
                fallback="Pessoas, oportunidades e empresas conectadas por soluções em RH."
              />
            </div>
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
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                Quem somos
              </span>
              <h2 className="text-foreground mt-3 mb-4 text-3xl font-bold">
                Gestão de pessoas com propósito, qualidade e confiança.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A J&S atua na gestão de soluções em Recursos Humanos,
                conectando profissionais a oportunidades de trabalho e
                empresas a pessoas alinhadas às suas necessidades.
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Nossa atuação combina recrutamento e seleção, mão de obra
                temporária e efetiva, treinamento, projetos em RH e tecnologia
                aplicada à gestão. O objetivo é simplificar processos,
                aproximar pessoas e contribuir para relações profissionais mais
                eficientes e transparentes.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  'Recrutamento e seleção',
                  'Mão de obra temporária e efetiva',
                  'Treinamento e desenvolvimento',
                  'Soluções e projetos em RH',
                ].map((item) => (
                  <div
                    key={item}
                    className="bg-muted/40 border-border/50 rounded-xl border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <BriefcaseBusiness className="text-primary h-5 w-5 shrink-0" />
                      <span className="text-foreground text-sm font-medium">
                        {item}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
            variants={staggerReveal(0.15)}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <motion.article
              variants={staggerItem('left')}
              className="bg-card border-border/50 shadow-glass rounded-3xl border p-8 sm:p-10"
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                Nossa missão
              </span>
              <h2 className="text-foreground mt-3 text-2xl font-bold">
                Conectar profissionais e oportunidades adequadas.
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Otimizar a gestão de soluções eficientes em recrutamento e
                seleção e em serviços de RH, oferecendo qualidade e confiança,
                encontrando e conectando profissionais aptos a oportunidades
                adequadas e contribuindo para o sucesso de clientes e
                candidatos com mais transparência e resultados.
              </p>
            </motion.article>

            <motion.article
              variants={staggerItem('right')}
              className="bg-card border-border/50 shadow-glass rounded-3xl border p-8 sm:p-10"
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                Nossa visão
              </span>
              <h2 className="text-foreground mt-3 text-2xl font-bold">
                Construir relações duradouras com empresas e profissionais.
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Ser reconhecida como parceira estratégica em soluções de
                Recursos Humanos, destacando-nos pela qualidade, confiabilidade
                e compromisso com a excelência em tudo o que fazemos.
              </p>
            </motion.article>
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
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              Nossos princípios
            </span>
            <motion.h2
              variants={revealUp}
              className="text-foreground mt-3 text-3xl font-bold sm:text-4xl"
            >
              Valores que orientam nosso trabalho
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Princípios institucionais que orientam nossa forma de trabalhar,
              atender e construir relacionamentos.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {valores.map((valor) => (
              <motion.div
                key={valor.title}
                variants={staggerItem('up')}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-card border-border shadow-premium rounded-2xl border p-6 transition-all"
              >
                <div className="bg-primary/10 text-primary mb-5 flex h-12 w-12 items-center justify-center rounded-full">
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
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              Nossa forma de trabalhar
            </span>
            <motion.h2
              variants={revealUp}
              className="text-foreground mt-3 text-3xl font-bold sm:text-4xl"
            >
              Metodologia, tecnologia e pessoas
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: 'Metodologia',
                text: 'Processos organizados para compreender necessidades, selecionar perfis e acompanhar cada etapa com clareza.',
              },
              {
                icon: Shield,
                title: 'Tecnologia',
                text: 'Ferramentas e software de gestão apoiam a organização das informações e a eficiência operacional.',
              },
              {
                icon: Users,
                title: 'Desenvolvimento',
                text: 'Treinamento, aprendizado e atenção às pessoas fazem parte da construção de soluções sustentáveis.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <motion.article
                key={title}
                variants={staggerItem('up')}
                className="bg-muted/30 border-border/50 rounded-2xl border p-7"
              >
                <Icon className="text-primary h-7 w-7" />
                <h3 className="text-foreground mt-5 text-xl font-semibold">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  {text}
                </p>
              </motion.article>
            ))}
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
            className="mb-12 text-center"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              Nossa equipe
            </span>
            <motion.h2
              variants={revealUp}
              className="text-foreground mt-3 text-3xl font-bold sm:text-4xl"
            >
              Pessoas que cuidam dos detalhes
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-3xl text-lg leading-relaxed"
            >
              Nossa equipe é formada por profissionais comprometidos com
              qualidade, confiança e responsabilidade. Mais do que selecionar
              candidatos, buscamos cuidar de pessoas e construir conexões que
              façam sentido para cada oportunidade.
            </motion.p>
          </motion.div>
        </Container>
      </Section>

      <Section className="mt-8">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mb-12 text-center"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              Nossa trajetória
            </span>
            <motion.h2
              variants={revealUp}
              className="text-foreground mt-3 text-3xl font-bold sm:text-4xl"
            >
              Uma atuação construída por etapas
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Mantivemos a experiência visual da trajetória, agora organizada
              em pilares institucionais e sem publicar números históricos não
              confirmados.
            </motion.p>
          </motion.div>

          <div className="relative">
            {chapters.map((chapter, index) => (
              <div key={chapter.id} className="relative">
                {index > 0 && <TimelineWebConnector />}
                <CinematicChapter chapter={chapter} index={index} />
              </div>
            ))}
          </div>
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
                  alt="Soluções da J&S Empregos"
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
              </div>
            </motion.div>

            <motion.div variants={staggerItem('right')}>
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                Atuação complementar
              </span>
              <h2 className="text-foreground mt-3 mb-5 text-3xl font-bold">
                Soluções que ampliam nossa capacidade de atender empresas.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A experiência institucional da J&S também contempla terceirização
                e facilities, com frentes como limpeza, portaria, zeladoria,
                segurança e outras necessidades operacionais. Essas soluções
                complementam nossa experiência em gestão de pessoas e podem ser
                estruturadas de acordo com a necessidade de cada cliente.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  'Limpeza',
                  'Portaria',
                  'Zeladoria',
                  'Segurança',
                  'Facilities',
                ].map((item) => (
                  <span
                    key={item}
                    className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      <Section className="mt-24 pb-28">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="bg-card border-border/50 shadow-glass rounded-3xl border p-8 text-center sm:p-12"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              Vamos conversar
            </span>
            <motion.h2
              variants={revealUp}
              className="text-foreground mt-3 text-3xl font-bold sm:text-4xl"
            >
              Encontre a solução certa para sua necessidade.
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Empresas podem contar com a J&S para apoiar seus processos de
              contratação e gestão de pessoas. Candidatos podem conhecer as
              oportunidades disponíveis e cadastrar seu currículo.
            </motion.p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/empresas"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold transition-colors"
              >
                Soluções para empresas
              </a>
              <a
                href="/vagas"
                className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold transition-colors"
              >
                Ver vagas
              </a>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
