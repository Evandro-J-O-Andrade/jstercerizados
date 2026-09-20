import { motion } from 'framer-motion';
import {
  Shield,
  Award,
  Users,
  Target,
  BriefcaseBusiness,
  HeartHandshake,
  Leaf,
  Lightbulb,
  Cpu,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  FileText,
  Search,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { PageTemplateBanner } from '@/components/common/PageTemplateBanner';
import { SafeImage } from '@/components/ui/SafeImage';
import { COMPANY, IMAGES } from '@/config';
import { HERO_ASSETS, SERVICE_IMAGES } from '@/content/assets';
import { staggerReveal, revealUp } from '@/animations/scroll';

const valores = [
  {
    title: 'Integridade e Honestidade',
    description:
      'Atuamos com transparência, ética e respeito em todas as relações.',
    icon: Shield,
  },
  {
    title: 'Excelência',
    description:
      'Buscamos qualidade e melhoria contínua em tudo o que fazemos.',
    icon: Award,
  },
  {
    title: 'Equilíbrio',
    description:
      'Tomamos decisões considerando pessoas, empresas e resultados.',
    icon: HeartHandshake,
  },
  {
    title: 'Foco no Cliente',
    description:
      'Entendemos necessidades para oferecer soluções adequadas e assertivas.',
    icon: Target,
  },
  {
    title: 'Sabedoria',
    description:
      'Valorizamos conhecimento, experiência e decisões responsáveis.',
    icon: Lightbulb,
  },
  {
    title: 'Preservação do Meio Ambiente',
    description: 'Buscamos atuar com responsabilidade e consciência ambiental.',
    icon: Leaf,
  },
];

const pilares = [
  {
    title: 'Pessoas',
    description:
      'Conectamos profissionais a oportunidades e empresas a talentos compatíveis.',
    icon: Users,
  },
  {
    title: 'Recrutamento e Seleção',
    description:
      'Processos estruturados para identificar perfis e competências alinhadas.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Soluções em RH',
    description: 'Apoiamos empresas na gestão e desenvolvimento de pessoas.',
    icon: HeartHandshake,
  },
  {
    title: 'Tecnologia',
    description:
      'Recursos digitais que tornam processos mais organizados e eficientes.',
    icon: Cpu,
  },
  {
    title: 'Desenvolvimento',
    description:
      'Investimos em treinamento, conhecimento e evolução profissional.',
    icon: GraduationCap,
  },
  {
    title: 'Qualidade',
    description:
      'Cuidamos dos detalhes porque excelência é construída em cada etapa.',
    icon: CheckCircle2,
  },
];

const etapas = [
  {
    number: '01',
    title: 'Origem e Experiência',
    description:
      'Início da atuação com foco em soluções eficientes para empresas e profissionais, com qualidade, confiança e gestão.',
    image: HERO_ASSETS.bannerjs,
  },
  {
    number: '02',
    title: 'J&S Terceirizados',
    description:
      'Consolidação da atuação em terceirização de mão de obra e Facilities: limpeza, recepção, jardinagem, zeladoria, controle de acesso e serviços operacionais.',
    image: SERVICE_IMAGES.facilities,
  },
  {
    number: '03',
    title: 'Recrutamento e Seleção',
    description:
      'Ampliação na identificação, recrutamento e seleção de profissionais, conectando talentos às oportunidades adequadas.',
    image: SERVICE_IMAGES.recrutamento,
  },
  {
    number: '04',
    title: 'Mão de Obra Temporária e Efetiva',
    description:
      'Atuação no fornecimento de profissionais para diferentes necessidades de contratação.',
    image: SERVICE_IMAGES.maoDeObraTemporaria,
  },
  {
    number: '05',
    title: 'RH, Desenvolvimento e Tecnologia',
    description:
      'Integração de metodologia, tecnologia, gestão, treinamento e desenvolvimento para maior eficiência.',
    image: SERVICE_IMAGES.servicosReal,
  },
  {
    number: '06',
    title: 'J&S Empregos',
    description:
      'Fortalecimento da frente voltada a empregos e Recursos Humanos, conectando candidatos e empresas.',
    image: SERVICE_IMAGES.timeRh,
  },
  {
    number: '07',
    title: 'Duas frentes, uma essência',
    description:
      'J&S Empregos e J&S Terceirizados atuam de forma complementar, conectando pessoas, oportunidades e soluções.',
    image: HERO_ASSETS.bannerjs,
  },
];

const atuacaoComplementar = [
  'Mão de obra temporária',
  'Mão de obra efetiva',
  'Terceirização de serviços',
  'Facilities',
  'Limpeza e conservação',
  'Portaria e controle de acesso',
  'Zeladoria',
  'Segurança patrimonial',
  'Jardinagem e paisagismo',
];

const servicosDetalhados = [
  {
    title: 'Recrutamento e Seleção',
    description:
      'Processos estruturados que combinam conhecimento de mercado, banco de talentos e tecnologia para identificar e selecionar os profissionais ideais para cada posição, reduzindo tempo e custo de contratação.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Mão de Obra Temporária e Efetiva',
    description:
      'Fornecimento de profissionais qualificados para atender picos de demanda, substituições ou contratações de longo prazo. Flexibilidade, assertividade e agilidade na entrega da força de trabalho adequada.',
    icon: Users,
  },
  {
    title: 'Treinamento e Desenvolvimento',
    description:
      'Programas de capacitação alinhados aos processos e cultura da empresa, promovendo a qualificação dos colaboradores e elevando o desempenho de cada equipe.',
    icon: GraduationCap,
  },
  {
    title: 'Soluções em RH',
    description:
      'Apoio completo à gestão de pessoas: seleção, onboarding, avaliações de desempenho, mapeamento de cargos e carreiras, e programas de retenção de talentos.',
    icon: HeartHandshake,
  },
  {
    title: 'Departamento Pessoal',
    description:
      'Gestão de folha de pagamento, admissões, desligamentos, benefícios, pgtos e demais trâmites administrativos com total conformidade.',
    icon: FileText,
  },
  {
    title: 'Consultoria em RH',
    description:
      'Análise e reorganização de processos, pesquisa de clima, auditoria de cargos e recomendações estratégicas para elevar a maturidade da área de pessoas.',
    icon: Search,
  },
];

const politicaQualidadeItens = [
  {
    title: 'Atendimento às demandas',
    description:
      'Entendemos e atendemos as necessidades de clientes e candidatos com prontidão e eficiência.',
  },
  {
    title: 'Melhoria contínua',
    description:
      'Avaliamos e aprimoramos continuamente nossos processos, serviços e resultados.',
  },
  {
    title: 'Qualidade',
    description:
      'Mantemos padrões elevados em cada etapa, da triagem ao acompanhamento pós-contratação.',
  },
  {
    title: 'Meio ambiente',
    description:
      'Promovemos práticas sustentáveis e responsáveis em todas as nossas atividades.',
  },
  {
    title: 'Saúde e segurança',
    description:
      'Garantimos o bem-estar de colaboradores e clientes em todas as operações.',
  },
  {
    title: 'Capacitação',
    description:
      'Investimos no desenvolvimento contínuo da nossa equipe e dos profissionais parceiros.',
  },
  {
    title: 'Recursos profissionais',
    description:
      'Contamos com equipe qualificada e experiente, alinhada às melhores práticas do mercado.',
  },
  {
    title: 'Recursos tecnológicos',
    description:
      'Utilizamos ferramentas e sistemas avançados que tornam nossos processos mais ágeis e precisos.',
  },
  {
    title: 'Excelência operacional',
    description:
      'Buscamos a excelência em todas as operações, entregando valor consistente e confiável.',
  },
];

function FadeIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-120px' }}
      variants={revealUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Sobre() {
  return (
    <>
      <SEO
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Sobre', href: '/sobre' },
        ]}
        title={`Sobre a ${COMPANY.brand} | Assessoria em RH`}
        description={`Conheça a ${COMPANY.name}: assessoria em RH, recrutamento e seleção, mão de obra temporária e efetiva. Conectamos pessoas, oportunidades e empresas.`}
        keywords={[
          'J&S Empregos',
          'sobre nós',
          'assessoria em RH',
          'recrutamento e seleção',
          'mão de obra temporária',
          'mão de obra efetiva',
          'recursos humanos',
          'oportunidades de trabalho',
          'terceirização',
          'facilities',
        ]}
        type="Organization"
      />

      <div className="pt-20">
        <Section className="pb-0">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.15)}
              className="mb-16 text-center"
            >
              <motion.h1
                variants={revealUp}
                className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Sobre a {COMPANY.brand}
              </motion.h1>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-3xl text-lg"
              >
                Assessoria em RH, recrutamento e seleção que conecta pessoas,
                oportunidades e empresas.
              </motion.p>
              <motion.div variants={revealUp}>
                <div className="mt-6">
                  <PageTemplateBanner
                    templateKey="sobre_greeting"
                    fallback="Bem-vindo a J&S Empregos LTDA."
                  />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={revealUp}
            >
              <SafeImage
                src={HERO_ASSETS.bannerjs}
                fallbackSrc={IMAGES.hero.sobre.fallback}
                alt={`Banner institucional da ${COMPANY.brand}`}
                className="shadow-premium border-border relative aspect-[21/9] w-full overflow-hidden rounded-3xl border"
              >
                <div className="from-background/60 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
              </SafeImage>
            </motion.div>
          </Container>
        </Section>

        <Section>
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.15)}
              className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
            >
              <motion.div variants={revealUp}>
                <SafeImage
                  src={SERVICE_IMAGES.recrutamento}
                  fallbackSrc={IMAGES.hero.sobre.fallback}
                  alt={`Equipe ${COMPANY.tradingName} em atividade`}
                  className="shadow-premium border-border relative aspect-[4/3] w-full overflow-hidden rounded-3xl border"
                >
                  <div className="from-background/40 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                </SafeImage>
              </motion.div>

              <motion.div variants={revealUp}>
                <span className="text-primary mb-4 block text-sm font-semibold tracking-[0.18em] uppercase">
                  Quem Somos
                </span>
                <h2 className="text-foreground mb-5 text-3xl font-bold sm:text-4xl">
                  Conectando pessoas, oportunidades e empresas.
                </h2>
                <div className="text-muted-foreground space-y-5 text-base leading-8">
                  <p>
                    A{' '}
                    <strong className="text-foreground">{COMPANY.brand}</strong>{' '}
                    atua conectando profissionais e empresas, oferecendo
                    soluções em Recursos Humanos com foco em recrutamento,
                    seleção, mão de obra temporária e efetiva, além de soluções
                    complementares.
                  </p>
                  <p>
                    Combinamos pessoas, experiência, metodologia e tecnologia
                    para tornar os processos de contratação mais organizados e
                    eficientes. Mais do que preencher posições, buscamos
                    compreender o contexto de cada oportunidade e conectar
                    profissionais aptos às necessidades de cada empresa.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </Container>
        </Section>

        <section className="border-border bg-muted/40 border-y">
          <Container className="py-20 lg:py-24">
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
                Missão e Visão
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Princípios que guiam nosso trabalho em favor de pessoas,
                empresas e resultados.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="grid gap-6 lg:grid-cols-2"
            >
              <motion.article
                variants={revealUp}
                className="border-border bg-card rounded-3xl border p-8 shadow-sm lg:p-10"
              >
                <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="text-foreground text-2xl font-bold">
                  Nossa Missão
                </h3>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Otimizar a gestão de soluções eficientes em recrutamento,
                  seleção e serviços relacionados à RH, proporcionando serviços
                  de qualidade e confiança, encontrando e conectando
                  profissionais aptos às oportunidades adequadas, contribuindo
                  para o sucesso de clientes e candidatos com transparência e
                  resultados.
                </p>
              </motion.article>

              <motion.article
                variants={revealUp}
                className="border-border bg-card rounded-3xl border p-8 shadow-sm lg:p-10"
              >
                <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Award className="h-7 w-7" />
                </div>
                <h3 className="text-foreground text-2xl font-bold">
                  Nossa Visão
                </h3>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Ser reconhecida como parceira estratégica em Recursos Humanos
                  e fornecimento de profissionais, destacando-se pela qualidade,
                  confiabilidade e compromisso com a excelência.
                </p>
              </motion.article>
            </motion.div>
          </Container>
        </section>

        <Section className="bg-muted/30">
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
                Nossos Valores
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Princípios que guiam cada decisão e cada entrega.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {valores.map((valor) => {
                const Icon = valor.icon;
                return (
                  <motion.div
                    key={valor.title}
                    variants={revealUp}
                    className="group border-border bg-card hover:border-primary/30 rounded-2xl border p-7 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      {valor.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {valor.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Container>
        </Section>

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
                Nossa Forma de Trabalhar
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Combinamos pessoas, processo, tecnologia e conhecimento em cada
                etapa do nosso trabalho.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {pilares.map((pilar) => {
                const Icon = pilar.icon;
                return (
                  <motion.div
                    key={pilar.title}
                    variants={revealUp}
                    className="border-border bg-card rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-foreground text-lg font-bold">
                      {pilar.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {pilar.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Container>
        </Section>

        <Section className="bg-muted/40">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.15)}
              className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
            >
              <motion.div variants={revealUp}>
                <span className="text-primary mb-4 block text-sm font-semibold tracking-[0.18em] uppercase">
                  Tecnologia e Metodologia
                </span>
                <h2 className="text-foreground mb-5 text-3xl font-bold sm:text-4xl">
                  Pessoas, processos e tecnologia trabalhando juntas.
                </h2>
                <div className="text-muted-foreground space-y-5 text-base leading-8">
                  <p>
                    A J&S combina metodologia de trabalho, inovação tecnológica,
                    software de gestão, treinamento e desenvolvimento dos
                    colaboradores e recrutamento e seleção assertivos.
                  </p>
                  <p>
                    Essa integração permite que cada etapa do processo seja
                    conduzida com mais organização, agilidade e atenção, gerando
                    soluções que trazem qualidade, confiança e resultados para
                    nossos clientes.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={revealUp}>
                <SafeImage
                  src={SERVICE_IMAGES.recrutamento}
                  fallbackSrc={IMAGES.hero.sobre.fallback}
                  alt="Processo de recrutamento e seleção da J&S Empregos"
                  className="shadow-premium border-border aspect-[4/3] w-full rounded-3xl border"
                />
              </motion.div>
            </motion.div>
          </Container>
        </Section>

        <Section>
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.15)}
              className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
            >
              <motion.div variants={revealUp}>
                <SafeImage
                  src="/images/sobre/equipe/nossaequipe.jpg"
                  fallbackSrc={IMAGES.hero.sobre.fallback}
                  alt={`Equipe ${COMPANY.tradingName} em atividade`}
                  className="shadow-premium border-border relative aspect-[4/3] w-full overflow-hidden rounded-3xl border"
                >
                  <div className="from-background/50 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                </SafeImage>
              </motion.div>

              <motion.div variants={revealUp}>
                <span className="text-primary mb-4 block text-sm font-semibold tracking-[0.18em] uppercase">
                  Nossa Equipe
                </span>
                <h2 className="text-foreground mb-5 text-3xl font-bold sm:text-4xl">
                  Profissionais dedicados a conectar pessoas e soluções.
                </h2>
                <div className="text-muted-foreground space-y-5 text-base leading-8">
                  <p>
                    Nossa equipe é formada por profissionais experientes e
                    dedicados, movidos pela conexão entre pessoas, empresas e
                    resultados. Cada gesto é pensado para garantir qualidade,
                    confiança e eficiência em cada etapa do nosso trabalho.
                  </p>
                  <p>
                    Mais do que preencher posições, construímos conexões que
                    transformam trajetórias profissionais e impulsionam o
                    crescimento das empresas que atendemos.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </Container>
        </Section>

        <Section className="bg-muted/30">
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
                Nossos Serviços
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Soluções completas para gestão de pessoas e operações
                corporativas.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {servicosDetalhados.map((servico) => {
                const Icon = servico.icon;
                return (
                  <motion.div
                    key={servico.title}
                    variants={revealUp}
                    className="border-border bg-card hover:border-primary/30 group flex flex-col rounded-2xl border p-7 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-foreground group mb-2 text-lg font-semibold">
                      {servico.title}
                    </h3>
                    <p className="text-muted-foreground mt-auto text-sm leading-relaxed">
                      {servico.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Container>
        </Section>

        <section className="border-border bg-muted/40 border-y">
          <Container className="py-20 lg:py-24">
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
                Nossa Trajetória
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Nossa evolução é construída em etapas que unem pessoas,
                tecnologia e resultados.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="space-y-8"
            >
              {etapas.map((etapa, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={etapa.number}
                    variants={revealUp}
                    className="bg-card border-border relative overflow-hidden rounded-3xl border shadow-sm"
                  >
                    <div
                      className={`flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 ${
                        isEven
                          ? 'lg:grid-cols-[1fr_1.1fr]'
                          : 'lg:grid-cols-[1.1fr_1fr]'
                      }`}
                    >
                      <div
                        className={`relative overflow-hidden rounded-3xl ${
                          isEven ? 'lg:order-1' : 'lg:order-2'
                        }`}
                      >
                        <SafeImage
                          src={etapa.image || IMAGES.hero.sobre.fallback}
                          fallbackSrc={IMAGES.hero.sobre.fallback}
                          alt={etapa.title}
                          className="aspect-[16/10] h-full w-full object-cover"
                        />
                        <div className="from-background/80 via-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="text-primary bg-background/80 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                            {etapa.number}
                          </span>
                        </div>
                      </div>
                      <div className="relative p-8 lg:p-0">
                        <span className="text-primary text-sm font-semibold tracking-widest uppercase">
                          Passo {etapa.number}
                        </span>
                        <h3 className="text-foreground mb-3 text-2xl font-bold sm:text-3xl">
                          {etapa.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {etapa.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </Container>
        </section>

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
                Duas frentes, uma essência
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                J&S Empregos e J&S Terceirizados atuam de forma complementar,
                unindo recursos humanos, recrutamento e soluções operacionais.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="grid gap-6 lg:grid-cols-2"
            >
              <motion.div
                variants={revealUp}
                className="border-border bg-card rounded-3xl border p-8 shadow-sm lg:p-10"
              >
                <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-foreground text-2xl font-bold">
                  J&S Empregos
                </h3>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Focada em Recursos Humanos, recrutamento, seleção, mão de obra
                  temporária e efetiva e conexão entre profissionais e empresas.
                  É a frente principal deste site.
                </p>
              </motion.div>

              <motion.div
                variants={revealUp}
                className="border-border bg-card rounded-3xl border p-8 shadow-sm lg:p-10"
              >
                <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Shield className="h-7 w-7" />
                </div>
                <h3 className="text-foreground text-2xl font-bold">
                  J&S Terceirizados
                </h3>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Atua em terceirização de mão de obra, Facilities e serviços
                  operacionais (limpeza, portaria, zeladoria, jardinagem,
                  segurança), complementando a atuação em RH com soluções para
                  operação das empresas.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={revealUp}
              className="border-border bg-background mt-10 rounded-3xl border p-6 text-center shadow-sm"
            >
              <p className="text-muted-foreground leading-relaxed">
                A experiência acumulada pela J&S Terceirizados em Facilities e
                terceirização de serviços estrutura e enriquece a atuação da J&S
                Empregos em Recursos Humanos. Ambas as frentes compartilham o
                mesmo compromisso com qualidade, confiança e resultados.
              </p>
            </motion.div>
          </Container>
        </Section>

        <Section className="bg-muted/30">
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
                Política da Qualidade
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="mx-auto max-w-4xl"
            >
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mb-8 text-center leading-relaxed"
              >
                Qualidade faz parte de cada etapa do nosso trabalho. Com
                metodologia de trabalho, inovação tecnológica, software de
                gestão, treinamento e desenvolvimento dos colaboradores,
                recrutamento e seleção assertivos, proporcionamos soluções que
                geram confiança, qualidade e resultados para nossos clientes e
                candidatos.
              </motion.p>

              <motion.div
                variants={staggerReveal(0.08)}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {politicaQualidadeItens.map((item) => (
                  <motion.div
                    key={item.title}
                    variants={revealUp}
                    className="border-border bg-card rounded-xl border p-5 text-center shadow-sm"
                  >
                    <h4 className="text-foreground mb-1 text-sm font-semibold">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </Container>
        </Section>

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
                Atuação Complementar
              </motion.h2>
              <motion.p
                variants={revealUp}
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
              >
                Além da atuação em recrutamento, seleção e Recursos Humanos, a{' '}
                {COMPANY.brand} também oferece soluções complementares para
                fortalecer ainda mais a operação das empresas.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.1)}
              className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
            >
              <motion.div variants={revealUp}>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {atuacaoComplementar.map((item) => (
                    <div
                      key={item}
                      className="border-border bg-card flex items-center gap-3 rounded-xl border p-4"
                    >
                      <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                      <span className="text-foreground text-sm font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={revealUp}>
                <SafeImage
                  src={SERVICE_IMAGES.facilities}
                  fallbackSrc={IMAGES.hero.sobre.fallback}
                  alt="Serviços operacionais e facilities da J&S Empregos"
                  className="shadow-premium border-border aspect-[4/3] w-full rounded-3xl border"
                />
              </motion.div>
            </motion.div>
          </Container>
        </Section>

        <Section className="bg-primary text-primary-foreground">
          <Container className="py-20 lg:py-24">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerReveal(0.15)}
              className="mx-auto max-w-4xl text-center"
            >
              <motion.span
                variants={revealUp}
                className="text-sm font-semibold tracking-[0.18em] uppercase opacity-75"
              >
                Nosso Compromisso
              </motion.span>
              <motion.blockquote
                variants={revealUp}
                className="mt-6 text-2xl leading-relaxed font-semibold sm:text-3xl lg:text-4xl"
              >
                Com metodologia de trabalho, inovação tecnológica, software de
                gestão, treinamento e desenvolvimento dos colaboradores,
                recrutamento e seleção assertivos, a {COMPANY.brand} é capaz de
                proporcionar soluções que geram qualidade, confiança e
                resultados para nossos clientes.
              </motion.blockquote>
            </motion.div>
          </Container>
        </Section>

        <Section>
          <Container>
            <FadeIn className="border-border bg-muted/50 relative overflow-hidden rounded-3xl border px-7 py-12 text-center sm:px-12 lg:px-20 lg:py-16">
              <div className="bg-primary/10 absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl" />
              <div className="bg-primary/10 absolute -bottom-24 -left-24 h-56 w-56 rounded-full blur-3xl" />

              <div className="relative mx-auto max-w-3xl">
                <span className="text-primary text-sm font-semibold tracking-[0.18em] uppercase">
                  Está em busca de novas oportunidades ou de profissionais?
                </span>
                <h2 className="text-foreground mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Conectamos pessoas, oportunidades e empresas.
                </h2>
                <p className="text-muted-foreground mx-auto mt-5 max-w-2xl leading-7">
                  Se você está em busca de uma oportunidade ou precisa
                  fortalecer sua equipe, a {COMPANY.brand} está pronta para
                  ajudar.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    to="/vagas"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold transition-transform hover:-translate-y-0.5"
                  >
                    Buscar uma vaga
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/empresas"
                    className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 font-semibold transition-colors"
                  >
                    Soluções para empresas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </Container>
        </Section>
      </div>
    </>
  );
}
