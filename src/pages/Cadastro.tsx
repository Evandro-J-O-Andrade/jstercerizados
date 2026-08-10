import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';

export default function Cadastro() {
  return (
    <div className="min-h-screen">
      <Section className="pt-24 md:pt-32">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
              Comece hoje
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg text-lg">
              Escolha como deseja se cadastrar na plataforma J&amp;S Empregos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border-border bg-card rounded-2xl border p-8 text-center"
            >
              <h3 className="text-foreground mb-2 text-xl font-bold">
                Sou Candidato
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Cadastre seu currículo e candidate-se às vagas.
              </p>
              <Link to="/cadastro/candidato">
                <Button variant="primary" className="w-full">
                  Cadastrar Currículo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border-border bg-card rounded-2xl border p-8 text-center"
            >
              <h3 className="text-foreground mb-2 text-xl font-bold">
                Sou Empresa
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Publique vagas e acesse nosso banco de talentos.
              </p>
              <Link to="/cadastro/empresa">
                <Button variant="primary" className="w-full">
                  Divulgar uma Vaga
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
