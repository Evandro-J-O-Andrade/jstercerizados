import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Shield, Award, Users, Target } from 'lucide-react';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY_TIMELINE, type TimelineItem } from '@/mock/company';
import { COMPANY } from '@/config';
import { IMAGES } from '@/config';
import { HERO_ASSETS } from '@/content/assets';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { useRef } from 'react';

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

function TimelineItemComponent({
  item,
  index,
}: {
  item: TimelineItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();
  const isEven = index % 2 === 0;

  const hidden = shouldReduceMotion
    ? { opacity: 1, x: 0, scale: 1 }
    : {
        opacity: 0,
        x: isEven ? -60 : 60,
        scale: 0.96,
      };

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : hidden}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }
      }
      className={`relative flex flex-col gap-4 sm:flex-row sm:items-center ${
        isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
      }`}
    >
      <div className={`flex-1 ${isEven ? 'sm:text-right' : 'sm:text-left'}`}>
        <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
          <span className="text-primary text-sm font-semibold">
            {item.year}
          </span>
          <h3 className="text-foreground mt-1 text-lg font-semibold">
            {item.event}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {item.description}
          </p>
          {item.image ? (
            <div className="mt-4 overflow-hidden rounded-xl">
              <SafeImage
                src={item.image}
                alt={item.event}
                className="h-48 w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-primary text-primary-foreground absolute left-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-md sm:left-1/2 sm:-translate-x-1/2">
        {item.year.slice(-2)}
      </div>

      <div className="hidden flex-1 sm:block" />
    </motion.div>
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
      <Section>
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
                  src={HERO_ASSETS.bannerjs}
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
                seleção e um banco de talentos sempre atualizado.
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

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mt-16"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground mb-8 text-center text-3xl font-bold"
            >
              Nossos Valores
            </motion.h2>
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

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.2)}
            className="mt-16"
          >
            <motion.h2
              variants={revealUp}
              className="text-foreground mb-12 text-center text-3xl font-bold"
            >
              Nossa Trajetória
            </motion.h2>
            <div className="relative">
              <div className="bg-border absolute top-0 left-4 h-full w-0.5 sm:left-1/2" />
              <div className="space-y-12">
                {COMPANY_TIMELINE.map((item, index) => (
                  <TimelineItemComponent
                    key={item.year}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
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
