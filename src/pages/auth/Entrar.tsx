import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Briefcase, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

interface EntryOption {
  key: 'admin' | 'candidato' | 'empresa';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  accent: string;
}

const options: EntryOption[] = [
  {
    key: 'admin',
    label: 'Administrativo',
    description:
      'Acesso para equipes internas, gestores, RH, financeiro, operações e administração da plataforma.',
    icon: Shield,
    route: '/entrar/admin',
    accent: 'primary',
  },
  {
    key: 'candidato',
    label: 'Candidatos',
    description:
      'Acesse seu currículo, candidaturas, vagas favoritas e alertas para acompanhar suas oportunidades.',
    icon: Briefcase,
    route: '/entrar/candidato',
    accent: 'primary',
  },
  {
    key: 'empresa',
    label: 'Empresas',
    description:
      'Acesso exclusivo para empresas parceiras. Publique vagas e acompanhe processos seletivos.',
    icon: Building2,
    route: '/entrar/empresa',
    accent: 'primary',
  },
];

export default function EntrarHub() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <SEO
        title={`Entrar — ${COMPANY.name}`}
        description="Selecione o contexto de acesso: Administrativo, Candidatos ou Empresas."
        keywords={['login', 'acesso', 'entrar', COMPANY.name]}
        noindex
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="mb-12 text-center">
          <p className="text-muted-foreground mb-2 text-sm font-medium tracking-[0.2em] uppercase">
            Central de Acesso
          </p>
          <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
            Selecione seu contexto de acesso
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base">
            Cada contexto leva ao formulário de entrada apropriado. Seu acesso é
            determinado pelo RBAC da plataforma, não pela entrada escolhida.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="border-border/40 bg-card shadow-glass rounded-3xl border p-8"
                data-entry={option.key}
              >
                <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-foreground mb-3 text-2xl font-bold">
                  {option.label}
                </h2>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                  {option.description}
                </p>
                <Link to={option.route}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Entrar
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="text-muted-foreground/80 mt-10 text-center text-xs">
          Ainda não possui cadastro?{' '}
          <Link
            to="/cadastro"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Saiba como se cadastrar
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
