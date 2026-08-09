import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY } from '@/config';

export default function Blog() {
  return (
    <div className="min-h-screen">
      <SEO
        title={`Blog — ${COMPANY.name}`}
        description="Dicas de carreira, tendências de recrutamento, gestão de pessoas e muito mais."
        keywords={[
          'blog',
          'RH',
          'recrutamento',
          'seleção',
          'carreira',
          'currículo',
          'entrevista',
          'gestão de pessoas',
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
              Dicas de carreira, tendências de recrutamento, gestão de pessoas e
              muito mais.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-muted/50 mt-12 rounded-3xl border border-dashed border-white/10 p-12 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Área do blog em desenvolvimento — Em breve artigos sobre
              recrutamento, seleção e carreira.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex justify-center"
          >
            <Link to="/contato">
              <Button variant="primary">Sugestão de tema</Button>
            </Link>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
