import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY } from '@/config';

const articles = [
  {
    slug: 'como-fazer-um-curriculo-que-se-destaque',
    title: 'Como fazer um currículo que se destaca dos demais',
    excerpt:
      'Um currículo bem estruturado pode ser a diferença entre ser chamado para entrevista ou ter seu perfil arquivado. Veja práticas que realmente funcionam.',
    date: '2026-08-10',
    readTime: '6 min',
    category: 'Carreira',
  },
  {
    slug: 'como-se-preparar-para-entrevista',
    title: 'Como se preparar para uma entrevista de emprego',
    excerpt:
      'Pesquisa sobre a empresa, exemplo prático com método STAR e perguntas estratégicas: um roteiro direto para reduzir ansiedade e aumentar suas chances.',
    date: '2026-08-08',
    readTime: '7 min',
    category: 'Entrevista',
  },
  {
    slug: 'recrutamento-e-selecao-como-funciona',
    title: 'Recrutamento e Seleção: como funciona na prática',
    excerpt:
      'Entenda cada etapa do processo seletivo, desde a abertura da vaga até a escolha do candidato, e como se comportar em cada fase.',
    date: '2026-08-05',
    readTime: '8 min',
    category: 'RH',
  },
  {
    slug: 'mao-de-obra-temporaria-ou-efetiva',
    title: 'Mão de obra temporária ou efetiva: qual escolher?',
    excerpt:
      'Cada modelo tem impacto direto sobre custos, flexibilidade e gestão. Saiba quando cada opção faz sentido para sua operação.',
    date: '2026-08-02',
    readTime: '6 min',
    category: 'Empresas',
  },
  {
    slug: 'como-reduzir-tempo-de-contratacao',
    title: 'Como empresas podem reduzir o tempo de contratação',
    excerpt:
      'Processos seletivos longos geram custos e riscos. Veja como estruturar etapas, usar filtros claros e acelerar decisões sem perder qualidade.',
    date: '2026-07-30',
    readTime: '7 min',
    category: 'Empresas',
  },
  {
    slug: 'tendencias-de-rh-2026',
    title: 'Tendências de RH que estão moldando 2026',
    excerpt:
      'Inteligência artificial no recrutamento, avaliações baseadas em competências, flexibilidade e transparência: os temas que vão definir o mercado.',
    date: '2026-07-28',
    readTime: '9 min',
    category: 'Tendências',
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen">
      <SEO
        title={`Blog — ${COMPANY.name}`}
        description="Dicas de carreira, recrutamento, seleção, tendências de RH e orientação profissional."
        keywords={[
          'blog',
          'RH',
          'recrutamento',
          'seleção',
          'carreira',
          'currículo',
          'entrevista',
          'gestão de pessoas',
          COMPANY.name,
        ]}
        type="Article"
      />
      <Section className="pt-24 md:pt-32">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
              Blog de RH
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Conteúdo prático sobre carreira, recrutamento, seleção e gestão de
              pessoas para candidatos e empresas.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {articles.map((article) => (
              <motion.article
                key={article.slug}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-card border-border hover:border-primary/30 rounded-3xl border p-6 transition-all duration-300"
              >
                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(article.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-foreground mt-4 text-xl font-bold">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="mt-6">
                  <span className="text-primary text-sm font-medium">
                    Em breve
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 flex justify-center"
          >
            <Link to="/contato">
              <Button variant="secondary" size="lg">
                Sugerir tema
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
