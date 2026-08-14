import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { COMPANY } from '@/config';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Página não encontrada"
        description={`A página que você procura não existe em ${COMPANY.name}.`}
        type="WebSite"
      />
      <Section className="pt-20 md:pt-28">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-foreground text-8xl font-extrabold sm:text-9xl"
            >
              404
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground mx-auto mt-6 max-w-lg text-xl"
            >
              A página que você procura não foi encontrada ou foi removida.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10"
            >
              <Link to="/">
                <Button variant="primary" size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Voltar para a página inicial
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
